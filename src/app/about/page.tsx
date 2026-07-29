import { Meta, Schema } from "@once-ui-system/core";
import { about, baseURL, person } from "@/resources";
import AboutPageClient from "@/components/about/AboutPageClient";

export async function generateMetadata() {
  return Meta.generate({
    title: "About Manas Khairnar — Mobile, Backend & AI Engineer",
    description:
      "Meet Manas Khairnar, a software engineer building production mobile applications, scalable backend services, and agentic AI systems.",
    baseURL,
    image: `/api/og/generate?title=${encodeURIComponent("About Manas Khairnar")}`,
    path: about.path,
  });
}

export default function About() {
  return (
    <>
      <Schema
        as="webPage"
        baseURL={baseURL}
        title="About Manas Khairnar"
        description="Software engineer working across mobile, backend, and AI systems."
        path={about.path}
        image={`/api/og/generate?title=${encodeURIComponent("About Manas Khairnar")}`}
        author={{
          name: "Manas Khairnar",
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <AboutPageClient />
    </>
  );
}
