export type Language = "javascript" | "typescript";
export type Severity = "critical" | "high" | "medium" | "low";

export type FixProposal = {
  code: string;
  verified: boolean;
  message: string;
};

export type Finding = {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  line: number;
  excerpt: string;
  explanation: string;
  impact: string;
  remediation: string;
  attackExample: string;
  cwe: string;
  owasp: string;
  fix: FixProposal | null;
};

export type ScanSummary = {
  score: number;
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
};

export type ScanResult = {
  id: string;
  status: "complete";
  language: Language;
  findings: Finding[];
  summary: ScanSummary;
  scannedAt: string;
  durationMs: number;
};

export type Evidence = {
  index: number;
  length: number;
  match: string;
};

export type SecurityRule = {
  id: string;
  title: string;
  severity: Severity;
  cwe: string;
  owasp: string;
  explanation: string;
  impact: string;
  remediation: string;
  attackExample: string;
  detect: (source: string) => Evidence[];
  fix?: (source: string) => string | null;
};
