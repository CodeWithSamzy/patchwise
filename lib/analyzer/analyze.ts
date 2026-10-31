import { securityRules } from "./rules";
import type {
  Finding,
  Language,
  ScanResult,
  Severity,
} from "./types";

const severityWeight: Record<Severity, number> = {
  critical: 30,
  high: 20,
  medium: 12,
  low: 6,
};

function lineAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function excerptAt(source: string, index: number): string {
  const lineStart = source.lastIndexOf("\n", index - 1) + 1;
  const lineEnd = source.indexOf("\n", index);
  return source
    .slice(lineStart, lineEnd === -1 ? source.length : lineEnd)
    .trim()
    .slice(0, 180);
}

export function analyzeSource(
  source: string,
  language: Language,
  id = crypto.randomUUID(),
): ScanResult {
  const startedAt = performance.now();
  const findings: Finding[] = [];

  for (const rule of securityRules) {
    const evidence = rule.detect(source);
    if (evidence.length === 0) continue;

    let fixedCode: string | null = null;
    let verified = false;
    if (rule.fix) {
      fixedCode = rule.fix(source);
      verified = Boolean(
        fixedCode &&
          fixedCode !== source &&
          rule.detect(fixedCode).length === 0,
      );
    }

    evidence.forEach((item, index) => {
      findings.push({
        id: rule.id + "-" + (index + 1),
        ruleId: rule.id,
        title: rule.title,
        severity: rule.severity,
        line: lineAt(source, item.index),
        excerpt: excerptAt(source, item.index),
        explanation: rule.explanation,
        impact: rule.impact,
        remediation: rule.remediation,
        attackExample: rule.attackExample,
        cwe: rule.cwe,
        owasp: rule.owasp,
        fix:
          fixedCode && verified
            ? {
                code: fixedCode,
                verified: true,
                message:
                  "The proposed patch was re-scanned and this rule no longer matched.",
              }
            : null,
      });
    });
  }

  findings.sort((a, b) => {
    const order: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    return order[a.severity] - order[b.severity] || a.line - b.line;
  });

  const summary = {
    total: findings.length,
    critical: findings.filter((item) => item.severity === "critical").length,
    high: findings.filter((item) => item.severity === "high").length,
    medium: findings.filter((item) => item.severity === "medium").length,
    low: findings.filter((item) => item.severity === "low").length,
    score: Math.max(
      0,
      100 -
        findings.reduce(
          (score, finding) => score + severityWeight[finding.severity],
          0,
        ),
    ),
  };

  return {
    id,
    status: "complete",
    language,
    findings,
    summary,
    scannedAt: new Date().toISOString(),
    durationMs: Math.max(1, Math.round(performance.now() - startedAt)),
  };
}
