import { CourseRail, type RailCourse } from "./CourseRail";
import { NewsletterBlock } from "./NewsletterBlock";

/**
 * The band that closes a page: what to read or learn next, and the newsletter.
 * The newsletter lives here and nowhere else, so it is always the last ask.
 */
export function RailBand({ courses }: { courses: RailCourse[] }) {
  return (
    <section className="ds-railband">
      <CourseRail courses={courses} />
      <NewsletterBlock />
    </section>
  );
}
