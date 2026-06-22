import fs from "fs";
import path from "path";
import Link from "next/link";
import React from "react";
import { Column, Heading, Row, Text, SmartLink } from "@once-ui-system/core";

export default function DraftsPage() {
  const draftsDir = path.join(process.cwd(), "src", "app", "blog", "drafts");
  const drafts = fs.existsSync(draftsDir)
    ? fs.readdirSync(draftsDir).filter((f) => f.endsWith(".mdx")).map((f) => f.replace(/\.mdx$/, ""))
    : [];

  return (
    <Column maxWidth="m" paddingTop="24" gap="16">
      <Heading>Drafts</Heading>
      {drafts.length === 0 && <Text>No drafts found.</Text>}
      {drafts.map((slug) => (
        <Row key={slug} paddingY="8">
          <SmartLink href={`/blog/editor?slug=${encodeURIComponent(slug)}`}>{slug}</SmartLink>
        </Row>
      ))}
    </Column>
  );
}
