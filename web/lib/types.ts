export type Severity = "critical" | "high" | "medium" | "low";
export type PostmortemStatus = "pending" | "published" | "rejected";

export interface Postmortem {
  id: string;
  company: string;
  title: string;
  url: string;
  source_url: string | null;
  published_at: string | null;
  severity: Severity | null;
  affected_services: string[];
  root_cause_category: string | null;
  ai_summary: string | null;
  tags: string[];
  status: PostmortemStatus;
  created_at: string;
}
