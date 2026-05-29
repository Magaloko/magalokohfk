import { db } from "./supabase-server";
import { genId } from "./cockpit-write";
import type { Proposal, ProposalType, ProposalStatus, AiReview, Comment } from "./werkstatt-meta";

export * from "./werkstatt-meta";

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
  const p = await getProposal(id);
  if (!p) return null;
  const votes = { ...p.votes };
  if (value === 0) delete votes[userKey];
  else votes[userKey] = value > 0 ? 1 : -1;
  return updateRow(id, { votes });
}

export async function addComment(id: string, userKey: string, userName: string, body: string): Promise<Proposal | null> {
  const p = await getProposal(id);
  if (!p) return null;
  const comment: Comment = { id: genId("c"), user_key: userKey, user_name: userName || "Mitarbeiter", body: body.slice(0, 2000), at: new Date().toISOString() };
  const comments = [...p.comments, comment].slice(-200);
  return updateRow(id, { comments });
}

export async function decideProposal(id: string, status: ProposalStatus, deciderKey: string): Promise<Proposal | null> {
  return updateRow(id, { status, decided_by: deciderKey, decided_at: new Date().toISOString() });
}

async function updateRow(id: string, patch: Record<string, unknown>): Promise<Proposal | null> {
  try {
    const { data, error } = await db().from("proposals")
      .update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id).select("*").maybeSingle();
    if (error || !data) return null;
    return norm(data as Record<string, unknown>);
  } catch { return null; }
}
