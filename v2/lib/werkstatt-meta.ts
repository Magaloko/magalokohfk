// Reine Typen, Labels & Helfer der Werkstatt — KEIN DB-Import, damit Client-Komponenten sie nutzen können.
export type ProposalType = "einwand" | "argumentation" | "idee" | "loesung" | "korrektur";
export type ProposalStatus = "discussion" | "approved" | "adapted" | "rejected" | "merged";
export type Comment = { id: string; user_key: string; user_name: string; body: string; at: string };
export type AiReview = { score?: number; feedback?: string; improved?: string };
export type Proposal = {
  id: string; author_key: string; author_name: string; type: ProposalType; title: string; content: string;
  target: string | null; status: ProposalStatus; ai_review: AiReview; votes: Record<string, number>;
  comments: Comment[]; decided_by?: string | null; decided_at?: string | null; created_at: string; updated_at: string;
};

export const TYPE_LABEL: Record<ProposalType, string> = {
  einwand: "Einwand-Antwort", argumentation: "Argumentation", idee: "Idee", loesung: "Lösung", korrektur: "Korrektur",
};
export const TYPE_OPTIONS: { key: ProposalType; label: string }[] = [
  { key: "einwand", label: "Einwand-Antwort" }, { key: "argumentation", label: "Argumentation" },
  { key: "idee", label: "Idee" }, { key: "loesung", label: "Lösung" }, { key: "korrektur", label: "Korrektur" },
];
export const STATUS_LABEL: Record<ProposalStatus, string> = {
  discussion: "In Diskussion", approved: "Angenommen", adapted: "Angepasst übernommen", rejected: "Abgelehnt", merged: "In Bibliothek übernommen",
};
// Ab diesem Netto-Votum gilt ein Vorschlag als „bereit zur Freigabe" (Team-Votum → Admin).
export const READY_THRESHOLD = 3;

export const voteScore = (p: Pick<Proposal, "votes">) => Object.values(p.votes || {}).reduce((a, b) => a + (Number(b) || 0), 0);
export const isReady = (p: Proposal) => p.status === "discussion" && voteScore(p) >= READY_THRESHOLD;

// Client-sichere Ansicht — KEINE rohen Schlüssel (Telegram-IDs) an den Browser.
export type PublicComment = { id: string; body: string; at: string; mine: boolean };
export type PublicProposal = {
  id: string; type: ProposalType; title: string; content: string; status: ProposalStatus;
  ai_review: AiReview; score: number; myVote: number; ready: boolean; decided: boolean;
  comments: PublicComment[]; commentsCount: number; createdAt: string;
};
