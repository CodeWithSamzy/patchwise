import {
  ArrowIcon,
  BookIcon,
  CheckIcon,
  ClockIcon,
  CodeIcon,
  GithubIcon,
  LockIcon,
  MarkIcon,
  ScanIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { Scanner } from "@/components/scanner";
import { analyzeSource } from "@/lib/analyzer";
import { lessons } from "@/lib/lessons";
import { apiSample } from "@/lib/samples";

export default function Home() {
  const initialResult = analyzeSource(apiSample, "typescript", "demo-scan");
  const repositoryUrl =
    process.env.NEXT_PUBLIC_REPOSITORY_URL ??
    "https://github.com/CodeWithSamzy/patchwise";

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Patchwise home">
          <MarkIcon width={29} height={29} />
          <span>patchwise</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="/lessons">Lessons</a>
          <a href="#coverage">Coverage</a>
        </nav>
        <a
          className="github-link"
          href={repositoryUrl ?? "#open-source"}
          aria-label={repositoryUrl ? "Patchwise on GitHub" : "Open source project"}
        >
          <GithubIcon width={18} height={18} />
          <span>{repositoryUrl ? "GitHub" : "Open source"}</span>
        </a>
      </header>

      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-content">
          <span className="hero-kicker">
            <SparkIcon width={15} height={15} />
            Security that teaches
          </span>
          <h1>
            Catch the bug.
            <br />
            <span>Understand the risk.</span>
          </h1>
          <p>
            Paste your JavaScript or TypeScript. Get clear findings, safe attack
            examples, and fixes that are checked before you see them.
          </p>
          <div className="hero-actions">
            <a className="primary-cta" href="#scanner">
              Scan your code
              <ArrowIcon width={17} height={17} />
            </a>
            <a className="text-cta" href="#how-it-works">
              See how it works
            </a>
          </div>
          <div className="hero-proof">
            <span>
              <CheckIcon width={15} height={15} />
              No sign-up
            </span>
            <span>
              <CheckIcon width={15} height={15} />
              Code never executed
            </span>
            <span>
              <CheckIcon width={15} height={15} />
              Deterministic rules
            </span>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="hero-shield">
            <div className="shield-pulse" />
            <ShieldIcon width={62} height={62} />
          </div>
          <div className="floating-code floating-code-one">
            <span className="code-status danger" />
            <code>db.query(sql + input)</code>
          </div>
          <div className="floating-code floating-code-two">
            <span className="code-status safe" />
            <code>db.query(sql, [input])</code>
          </div>
          <div className="floating-tag">
            <CheckIcon width={15} height={15} />
            re-scan passed
          </div>
        </div>
      </section>

      <div className="content-wrap">
        <Scanner initialSource={apiSample} initialResult={initialResult} />

        <section className="how-section" id="how-it-works">
          <div className="section-intro">
            <span className="section-kicker">How it works</span>
            <h2>Rules find it. Context explains it.</h2>
            <p>
              Patchwise keeps detection deterministic and uses plain language to
              turn every finding into something you can act on.
            </p>
          </div>
          <div className="steps-grid">
            <article>
              <span className="step-number">01</span>
              <div className="step-icon blue">
                <CodeIcon width={22} height={22} />
              </div>
              <h3>Paste code</h3>
              <p>
                Add a JavaScript or TypeScript snippet. It is size-limited,
                analyzed as text, and never executed.
              </p>
            </article>
            <article>
              <span className="step-number">02</span>
              <div className="step-icon orange">
                <ScanIcon width={22} height={22} />
              </div>
              <h3>See the real risk</h3>
              <p>
                Purpose-built rules identify unsafe patterns and connect them to
                CWE and the OWASP Top 10.
              </p>
            </article>
            <article>
              <span className="step-number">03</span>
              <div className="step-icon green">
                <ShieldIcon width={22} height={22} />
              </div>
              <h3>Ship a checked fix</h3>
              <p>
                Proposed changes are scanned again. A fix is offered only when
                the original rule no longer matches.
              </p>
            </article>
          </div>
        </section>

        <section className="lessons-section" id="lessons">
          <div className="lessons-heading">
            <div>
              <span className="section-kicker">Lessons mode</span>
              <h2>Build your security instincts.</h2>
            </div>
            <p>
              Short, practical lessons pair vulnerable code with its safer
              version. No security background required.
            </p>
          </div>
          <div className="lesson-grid">
            {lessons.map((lesson, index) => (
              <article className="lesson-card" key={lesson.slug}>
                <div className={"lesson-art lesson-art-" + (index + 1)}>
                  <span>{lesson.number}</span>
                  <div>
                    {index === 0 ? (
                      <CodeIcon width={30} height={30} />
                    ) : index === 1 ? (
                      <ShieldIcon width={30} height={30} />
                    ) : (
                      <LockIcon width={30} height={30} />
                    )}
                  </div>
                </div>
                <div className="lesson-body">
                  <div className="lesson-meta">
                    <span>{lesson.difficulty}</span>
                    <span>
                      <ClockIcon width={14} height={14} />
                      {lesson.minutes} min
                    </span>
                  </div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.summary}</p>
                  <div className="lesson-footer">
                    <span>{lesson.cwe}</span>
                    <a href={"/lessons/" + lesson.slug}>
                      Start lesson
                      <ArrowIcon width={15} height={15} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="coverage-section" id="coverage">
          <div className="coverage-copy">
            <span className="section-kicker">Current coverage</span>
            <h2>Focused rules, useful answers.</h2>
            <p>
              Version one covers nine common security mistakes in JavaScript and
              TypeScript. Each rule includes learning context and a testable
              remediation path.
            </p>
          </div>
          <div className="coverage-list">
            {[
              "SQL injection",
              "Cross-site scripting",
              "Command injection",
              "Path traversal",
              "Hardcoded secrets",
              "Weak hashing",
              "JWT verification",
              "Open redirects",
              "Permissive CORS",
            ].map((item) => (
              <span key={item}>
                <CheckIcon width={14} height={14} />
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="open-source-section" id="open-source">
          <div className="open-source-icon">
            <GithubIcon width={28} height={28} />
          </div>
          <div>
            <span className="section-kicker">Free and open source</span>
            <h2>Inspect it, improve it, make it yours.</h2>
            <p>
              Patchwise uses no paid API and no proprietary scanner. The full
              rule engine, explanations, lessons, tests, and interface are
              available under the MIT license.
            </p>
          </div>
          {repositoryUrl ? (
            <a href={repositoryUrl}>
              View repository
              <ArrowIcon width={16} height={16} />
            </a>
          ) : (
            <span className="repository-hint">
              Set NEXT_PUBLIC_REPOSITORY_URL after publishing
            </span>
          )}
        </section>
      </div>

      <footer>
        <div>
          <a className="brand footer-brand" href="#">
            <MarkIcon width={27} height={27} />
            <span>patchwise</span>
          </a>
          <p>Learn the flaw. Understand the fix.</p>
        </div>
        <div className="footer-note">
          <BookIcon width={17} height={17} />
          Built for developers who are still learning security.
        </div>
      </footer>
    </main>
  );
}
