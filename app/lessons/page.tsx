import type { Metadata } from "next";

import {
  ArrowIcon,
  ClockIcon,
  MarkIcon,
  ShieldIcon,
} from "@/components/icons";
import { lessons } from "@/lib/lessons";

export const metadata: Metadata = {
  title: "Security lessons — Patchwise",
  description:
    "Short, practical JavaScript and TypeScript security lessons with vulnerable and fixed examples.",
};

export default function LessonsPage() {
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
        <a className="back-home-link" href="/">
          Back home
        </a>
      </header>

      <section className="lesson-index-hero">
        <span className="hero-kicker">
          <ShieldIcon width={15} height={15} />
          Learn by fixing
        </span>
        <h1>Security lessons for working developers.</h1>
        <p>
          Each lesson starts with vulnerable code, explains the exact trust
          boundary that failed, and finishes with a safer version you can scan.
        </p>
      </section>

      <section className="lesson-index-grid" aria-label="Available lessons">
        {lessons.map((lesson, index) => (
          <article className="lesson-index-card" key={lesson.slug}>
            <span className="lesson-index-number">{lesson.number}</span>
            <div className="lesson-index-meta">
              <span>{lesson.difficulty}</span>
              <span>
                <ClockIcon width={14} height={14} />
                {lesson.minutes} minutes
              </span>
              <span>{lesson.cwe}</span>
            </div>
            <h2>{lesson.title}</h2>
            <p>{lesson.summary}</p>
            <ul>
              {lesson.takeaways.slice(0, 2).map((takeaway) => (
                <li key={takeaway}>{takeaway}</li>
              ))}
            </ul>
            <a href={"/lessons/" + lesson.slug}>
              Start lesson
              <ArrowIcon width={16} height={16} />
            </a>
            <span className={"lesson-index-accent accent-" + (index + 1)} />
          </article>
        ))}
      </section>
    </main>
  );
}
