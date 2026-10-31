"use client";

import { useMemo, useState } from "react";

import {
  AlertIcon,
  CheckIcon,
  ChevronIcon,
  CodeIcon,
  CopyIcon,
  LockIcon,
  ScanIcon,
  ShieldIcon,
} from "@/components/icons";
import type {
  Finding,
  Language,
  ScanResult,
  Severity,
} from "@/lib/analyzer";
import { apiSample, browserSample, nodeSample } from "@/lib/samples";

type ScannerProps = {
  initialSource: string;
  initialResult: ScanResult;
};

const sampleOptions = [
  { label: "Express API", source: apiSample, language: "typescript" as const },
  { label: "Browser DOM", source: browserSample, language: "javascript" as const },
  { label: "Node worker", source: nodeSample, language: "javascript" as const },
];

const severityLabel: Record<Severity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

export function Scanner({ initialSource, initialResult }: ScannerProps) {
  const [source, setSource] = useState(initialSource);
  const [language, setLanguage] = useState<Language>("typescript");
  const [result, setResult] = useState<ScanResult>(initialResult);
  const [activeId, setActiveId] = useState(initialResult.findings[0]?.id ?? "");
  const [showFix, setShowFix] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const activeFinding =
    result.findings.find((finding) => finding.id === activeId) ??
    result.findings[0] ??
    null;

  const lineNumbers = useMemo(
    () => source.split("\n").map((_, index) => index + 1),
    [source],
  );

  async function scan(nextSource = source, nextLanguage = language) {
    if (!nextSource.trim()) {
      setError("Paste some code before starting a scan.");
      return;
    }

    setScanning(true);
    setError("");
    setShowFix(false);

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: nextSource,
          language: nextLanguage,
        }),
      });
      const payload = (await response.json()) as ScanResult | { error: string };
      if (!response.ok || "error" in payload) {
        throw new Error(
          "error" in payload ? payload.error : "The scan could not be completed.",
        );
      }
      setResult(payload);
      setActiveId(payload.findings[0]?.id ?? "");
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "The scan could not be completed.",
      );
    } finally {
      setScanning(false);
    }
  }

  function loadSample(option: (typeof sampleOptions)[number]) {
    setSource(option.source);
    setLanguage(option.language);
    void scan(option.source, option.language);
  }

  function applyFix(finding: Finding) {
    if (!finding.fix) return;
    setSource(finding.fix.code);
    void scan(finding.fix.code, language);
  }

  async function copyFix() {
    if (!activeFinding?.fix) return;
    await navigator.clipboard.writeText(activeFinding.fix.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="scanner-shell" id="scanner" aria-labelledby="scanner-title">
      <div className="scanner-heading">
        <div>
          <span className="section-kicker">Interactive scanner</span>
          <h2 id="scanner-title">Find the flaw. Learn the fix.</h2>
        </div>
        <div className="privacy-note">
          <LockIcon width={16} height={16} />
          Code is analyzed in memory and never executed
        </div>
      </div>

      <div className="workbench">
        <div className="editor-panel">
          <div className="panel-toolbar">
            <div className="window-controls" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="file-tab">
              <CodeIcon width={15} height={15} />
              playground.{language === "typescript" ? "ts" : "js"}
            </div>
            <select
              className="language-select"
              aria-label="Code language"
              value={language}
              onChange={(event) => setLanguage(event.target.value as Language)}
            >
              <option value="typescript">TypeScript</option>
              <option value="javascript">JavaScript</option>
            </select>
          </div>

          <div className="sample-bar" aria-label="Code samples">
            <span>Try a sample</span>
            {sampleOptions.map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() => loadSample(option)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="code-editor">
            <div className="line-numbers" aria-hidden="true">
              {lineNumbers.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
            <textarea
              value={source}
              onChange={(event) => setSource(event.target.value)}
              aria-label="Code to scan"
              spellCheck={false}
            />
          </div>

          <div className="editor-footer">
            <span>{source.length.toLocaleString()} / 50,000 characters</span>
            {error ? <span className="scan-error">{error}</span> : null}
            <button
              className="scan-button"
              type="button"
              disabled={scanning}
              onClick={() => void scan()}
            >
              {scanning ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <ScanIcon width={17} height={17} />
              )}
              {scanning ? "Scanning..." : "Scan code"}
            </button>
          </div>
        </div>

        <div className="results-panel">
          <div className="results-header">
            <div
              className="score-ring"
              style={{
                background:
                  "conic-gradient(var(--score) " +
                  result.summary.score +
                  "%, var(--line) 0)",
              }}
              aria-label={"Security score " + result.summary.score + " out of 100"}
            >
              <div>
                <strong>{result.summary.score}</strong>
                <span>score</span>
              </div>
            </div>
            <div className="result-summary">
              <span className="eyebrow">Scan complete</span>
              <h3>
                {result.summary.total === 0
                  ? "No known patterns found"
                  : result.summary.total +
                    " issue" +
                    (result.summary.total === 1 ? "" : "s") +
                    " found"}
              </h3>
              <p>
                Checked {securityRuleCount} security rules in {result.durationMs} ms
              </p>
            </div>
            <div className="severity-totals">
              <span>
                <i className="severity-dot critical" />
                {result.summary.critical} critical
              </span>
              <span>
                <i className="severity-dot high" />
                {result.summary.high} high
              </span>
              <span>
                <i className="severity-dot medium" />
                {result.summary.medium} medium
              </span>
            </div>
          </div>

          {result.findings.length > 0 && activeFinding ? (
            <div className="results-body">
              <div className="finding-list" aria-label="Security findings">
                {result.findings.map((finding) => (
                  <button
                    type="button"
                    className={
                      "finding-row " +
                      (finding.id === activeFinding.id ? "active" : "")
                    }
                    key={finding.id}
                    onClick={() => {
                      setActiveId(finding.id);
                      setShowFix(false);
                    }}
                  >
                    <span className={"severity-icon " + finding.severity}>
                      <AlertIcon width={15} height={15} />
                    </span>
                    <span className="finding-row-copy">
                      <strong>{finding.title}</strong>
                      <small>
                        Line {finding.line} · {finding.cwe}
                      </small>
                    </span>
                    <ChevronIcon width={15} height={15} />
                  </button>
                ))}
              </div>

              <article className="finding-detail">
                <div className="finding-meta">
                  <span className={"severity-pill " + activeFinding.severity}>
                    {severityLabel[activeFinding.severity]}
                  </span>
                  <span>{activeFinding.cwe}</span>
                  <span>{activeFinding.owasp}</span>
                </div>
                <h3>{activeFinding.title}</h3>
                <div className="evidence-line">
                  <span>{activeFinding.line}</span>
                  <code>{activeFinding.excerpt}</code>
                </div>

                {!showFix ? (
                  <>
                    <div className="explanation-block">
                      <h4>What is happening</h4>
                      <p>{activeFinding.explanation}</p>
                    </div>
                    <div className="explanation-block">
                      <h4>Why it matters</h4>
                      <p>{activeFinding.impact}</p>
                    </div>
                    <div className="attack-note">
                      <AlertIcon width={17} height={17} />
                      <div>
                        <strong>Safe attack idea</strong>
                        <p>{activeFinding.attackExample}</p>
                      </div>
                    </div>
                    <div className="finding-actions">
                      <p>
                        <strong>Recommended:</strong>{" "}
                        {activeFinding.remediation}
                      </p>
                      {activeFinding.fix ? (
                        <button type="button" onClick={() => setShowFix(true)}>
                          View verified fix
                          <ChevronIcon width={15} height={15} />
                        </button>
                      ) : null}
                    </div>
                  </>
                ) : activeFinding.fix ? (
                  <div className="fix-view">
                    <div className="verified-banner">
                      <span>
                        <CheckIcon width={16} height={16} />
                      </span>
                      <div>
                        <strong>Fix verified</strong>
                        <p>{activeFinding.fix.message}</p>
                      </div>
                    </div>
                    <div className="fix-code">
                      <div>
                        <span>Proposed patch</span>
                        <button type="button" onClick={() => void copyFix()}>
                          {copied ? (
                            <CheckIcon width={14} height={14} />
                          ) : (
                            <CopyIcon width={14} height={14} />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <pre>
                        <code>{activeFinding.fix.code}</code>
                      </pre>
                    </div>
                    <div className="fix-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setShowFix(false)}
                      >
                        Back to explanation
                      </button>
                      <button
                        type="button"
                        className="apply-button"
                        onClick={() => applyFix(activeFinding)}
                      >
                        <ShieldIcon width={16} height={16} />
                        Apply and re-scan
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            </div>
          ) : (
            <div className="clean-result">
              <span>
                <CheckIcon width={30} height={30} />
              </span>
              <h3>No covered vulnerabilities detected</h3>
              <p>
                The current rules found no matches. Static analysis cannot prove
                that code is completely secure, so review authorization and
                business logic separately.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const securityRuleCount = 9;
