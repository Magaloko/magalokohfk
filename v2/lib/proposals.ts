import { db } from "./supabase-server";
import { genId } from "./cockpit-write";
import { voteScore, isReady, type Proposal, type ProposalType, type ProposalStatus, type AiReview, type Comment, type PublicProposal } from "./werkstatt-meta";

export * from "./werkstatt-meta";

// Wandelt einen Vorschlag in eine client-sichere Ansicht (ohne rohe user_keys/Telegram-IDs).
export function toPublic(p: Proposal, viewer: string): PublicProposal {
  return {
    id: p.id, type: p.type, title: p.title, content: p.content, status: p.status,
    ai_review: p.ai_review, score: voteScore(p), myVote: Number(p.votes?.[viewer]) || 0,
    ready: isReady(p), decided: p.status !== "discussion",
    comments: p.comments.map((c) => ({ id: c.id, body: c.body, at: c.at, mine: c.user_key === viewer })),
    commentsCount: p.comments.length, createdAt: p.created_at,
  };
}

function norm(row: Record<string, unknown>): Proposal {
  return {
    id: String(row.id),
    author_key: String(row.author_key || ""),
    author_name: String(row.author_name || "Mitarbeiter"),
    type: (row.type as ProposalType) || "idee",
    title: String(row.title || ""),
    content: String(row.content || ""),
    target: (row.target as string) ?? null,
    status: (row.status as ProposalStatus) || "discussion",
    ai_review: (row.ai_review && typeof row.ai_review === "object" ? row.ai_review : {}) as AiReview,
    votes: (row.votes && typeof row.votes === "object" ? row.votes : {}) as Record<string, number>,
    comments: Array.isArray(row.comments) ? (row.comments as Comment[]) : [],
    decided_by: (row.decided_by as string) ?? null,
    decided_at: (row.decided_at as string) ?? null,
    created_at: String(row.created_at || ""),
    updated_at: String(row.updated_at || ""),
  };
}

export async function listProposals(): Promise<Proposal[]> {
  try {
    const { data, error } = await db().from("proposals").select("*").order("created_at", { ascending: false }).limit(300);
    if (error || !data) return [];
    return data.map((d) => norm(d as Record<string, unknown>));
  } catch { return []; }
}

export async function getProposal(id: string): Promise<Proposal | null> {
  try {
    const { data, error } = await db().from("proposals").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return norm(data as Record<string, unknown>);
  } catch { return null; }
}

export async function createProposal(input: {
  author_key: string; author_name: string; type: ProposalType; title: string; content: string; target?: string | null; ai_review?: AiReview;
}): Promise<Proposal | null> {
  const now = new Date().toISOString();
  const row = {
    id: genId("prop"), author_key: input.author_key, author_name: input.author_name || "Mitarbeiter",
    type: input.type, title: input.title.slice(0, 200), content: input.content.slice(0, 6000),
    target: input.target || null, status: "discussion", ai_review: input.ai_review || {},
    votes: {}, comments: [], created_at: now, updated_at: now,
  };
  try {
    const { data, error } = await db().from("proposals").insert(row).select("*").maybeSingle();
    if (error || !data) return null;
    return norm(data as Record<string, unknown>);
  } catch { return null; }
}

export async function voteProposal(id: string, userKey: string, value: number): Promise<Proposal | null> {
  return mutateProposal(id, (p) => {
    const votes = { ...p.votes };
    if (value === 0) delete votes[userKey];
    else votes[userKey] = value > 0 ? 1 : -1;
    return { votes };
  });
}

export async function addComment(id: string, userKey: string, userName: string, body: string): Promise<Proposal | null> {
  return mutateProposal(id, (p) => {
    const comment: Comment = { id: genId("c"), user_key: userKey, user_name: userName || "Mitarbeiter", body: body.slice(0, 2000), at: new Date().toISOString() };
    return { comments: [...p.comments, comment].slice(-200) };
  });
}

export async function decideProposal(id: string, status: ProposalStatus, deciderKey: string): Promise<Proposal | null> {
  return mutateProposal(id, () => ({ status, decided_by: deciderKey, decided_at: new Date().toISOString() }));
}

// Optimistisches Update mit Retry (timestamptz-Guard auf updated_at) — verhindert Lost-Updates
// bei parallelem Voten/Kommentieren. fn() liefert das Patch-Objekt (oder null = kein Write).
async function mutateProposal(id: string, fn: (p: Proposal) => Record<string, unknown> | null): Promise<Proposal | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data: cur, error } = await db().from("proposals").select("*").eq("id", id).maybeSingle();
    if (error || !cur) return null;
    const raw = cur as Record<string, unknown>;
    const patch = fn(norm(raw));
    if (patch === null) return norm(raw);
    let q = db().from("proposals").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
    if (raw.updated_at != null) q = q.eq("updated_at", raw.updated_at as string);
    const { data, error: e2 } = await q.select("*");
    if (e2) return null;
    if (data && data.length) return norm(data[0] as Record<string, unknown>);
    // 0 Zeilen → jemand anderes hat zwischenzeitlich geschrieben → neu lesen & erneut versuchen
  }
  return null; // Konflikt nach Retries
}
