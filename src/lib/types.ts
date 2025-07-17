import type { LucideIcon } from "lucide-react";

export interface AuditMetric {
  title: string;
  value: string;
  description: string;
}

export interface AuditOpportunity extends AuditMetric {
  type: 'opportunity';
}

export interface AuditDiagnostic extends AuditMetric {
  type: 'diagnostic';
}

export type AuditDetail = AuditOpportunity | AuditDiagnostic;

export interface AuditCategory {
  id: 'performance' | 'accessibility' | 'best-practices' | 'seo';
  title: string;
  score: number;
  description: string;
  Icon: LucideIcon;
  details: AuditDetail[];
  rawReport: string;
}

export interface AuditData {
  url: string;
  timestamp: string;
  categories: AuditCategory[];
}
