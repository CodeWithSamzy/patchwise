import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ArrowIcon,
  CheckIcon,
  ClockIcon,
  MarkIcon,
  ShieldIcon,
} from "@/components/icons";
import { Scanner } from "@/components/scanner";
import { analyzeSource } from "@/lib/analyzer";
import { getLesson, lessons } from "@/lib/lessons";

type LessonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return lessons.map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) return {};

  return {
    title: lesson.title + " — Patchwise",
    description: lesson.summary,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug } = await params;
  const lesson = getLesson(slug);
  if (!lesson) notFound();

  const lessonIndex = lessons.findIndex((item) => item.slug === lesson.slug);
  const previous = lessons[lessonIndex - 1] ?? null;
  const next = lessons[lessonIndex + 1] ?? null;
  const initialResult = analyzeSource(
    lesson.vulnerable,
    "javascript",
    "lesson-" + lesson.slug,
  );

  return (
    <main className="lesson-page">
      <header className="site-header lesson-site-header">
        <a className="brand" href="/" aria-label="Patchwise home">
          <MarkIcon width={29} height={29} />
          <span>patchwise</span>
        </a>
        <nav aria-label="Lesson navigation">
          <a href="/#scanner">Scanner</a>
          <a href="/lessons" aria-current="page">
            Lessons
          </a>
          <a href="/#coverage">Coverage</a>
        </nav>
        <a className="back-home-link" href="/lessons">
          All lessons
        </a>
      </header>

      <article className="lesson-content">
        <div className="lesson-breadcrumb">
          <a href="/lessons">Lessons</a>
          <span>/</span>
          <span>{lesson.title}</span>
        </div>

        <header className="lesson-detail-hero">
          <div className="lesson-detail-copy">
            <div className="lesson-detail-meta">
              <span>{lesson.number}</span>
              <span>{lesson.difficulty}</span>
              <span>
                <ClockIcon width={14} height={14} />
                {lesson.minutes} minutes
              </span>
              <span>{lesson.cwe}</span>
            </div>
            <h1>{lesson.title}</h1>
            <p>{lesson.summary}</p>
          </div>
          <div className="lesson-shield">
            <ShieldIcon width={42} height={42} />
          </div>
        </header>

        <section className="code-comparison" aria-labelledby="comparison-title">
          <div className="lesson-section-heading">
            <span className="section-kicker">Compare the boundary</span>
            <h2 id="comparison-title">Vulnerable and fixed</h2>
          </div>
          <div className="comparison-grid">
            <div className="comparison-panel vulnerable">
              <div>
                <span />
                Vulnerable
              </div>
              <pre>
                <code>{lesson.vulnerable}</code>
              </pre>
            </div>
            <div className="comparison-panel fixed">
              <div>
                <span>
                  <CheckIcon width={13} height={13} />
                </span>
                Safer version
              </div>
              <pre>
                <code>{lesson.fixed}</code>
              </pre>
            </div>
          </div>
        </section>

        <section className="lesson-takeaways">
          <div>
            <span className="section-kicker">Remember this</span>
            <h2>The useful mental model</h2>
          </div>
          <ul>
            {lesson.takeaways.map((takeaway) => (
              <li key={takeaway}>
                <span>
                  <CheckIcon width={15} height={15} />
                </span>
                {takeaway}
              </li>
            ))}
          </ul>
        </section>
      </article>

      <div className="lesson-scanner-wrap">
        <Scanner
          initialSource={lesson.vulnerable}
          initialResult={initialResult}
        />
      </div>

      <nav className="lesson-pagination" aria-label="Lesson pagination">
        {previous ? (
          <a href={"/lessons/" + previous.slug}>
            <small>Previous lesson</small>
            <span>← {previous.title}</span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a href={"/lessons/" + next.slug}>
            <small>Next lesson</small>
            <span>
              {next.title}
              <ArrowIcon width={16} height={16} />
            </span>
          </a>
        ) : (
          <a href="/lessons">
            <small>Finished</small>
            <span>All lessons</span>
          </a>
        )}
      </nav>
    </main>
  );
}
