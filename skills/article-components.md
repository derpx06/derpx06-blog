---
name: article-components
description: a comprehensive guide to reusable React components and UI alignment patterns used in LangChain and Explainer articles. Use this to build high-fidelity, structured AI education content.
---

# Blog UI Components & Design Guide

This guide documents the core library of components and design principles used to create distinctive, high-fidelity blog posts. Use these to maintain consistency and professional UI alignment.

## Core Layout Components

### <Card>
The fundamental container for grouping related content.
- **padding**: Numeric or string (e.g., `"24"`, `20`). Consistent padding creates rhythm.
- **radius**: `s`, `m`, `l`, or custom tokens like `l-4`.
- **direction**: `row` (default), `column`.
- **border**: `neutral-weak`, `neutral-medium`, `neutral-strong`.
- **background**: `surface`, `overlay`, `transparent`.
- **gap**: Spacing between children.

### <Grid>, <Row>, <Column>
Alignment primitives.
- **fillWidth**: Boolean. Essential for full-bleed layouts.
- **horizontal / vertical**: `start`, `center`, `end`.
- **gap**: Standardizes spacing between elements.
- **s, m, l**: Responsive overrides (e.g., `s={{direction: 'column'}}`).

## Content & Media

### <CodeBlock>
- **codes**: `[{ code, language, label, file, cellIndex, showOutput }]`.
- **minimized**: Boolean to start collapsed.
- **showOutput**: Show execution results.

### <Image> & <Media>
- **src**: Asset path.
- **alt**: Descriptive text.
- **width / height**: Dimensions (supports `'100%'`, `'auto'`, or numbers).
- **caption**: Legend text below the media.
- **enlarge**: Boolean (default `true` for `Image`, `false` for `Media`).
- **radius**: `none`, `s`, `m`, `l`. Use `none` for full-width wrapped media.

### <Button>
Actionable links.
- **href**: Destination URL.
- **label**: Button text.
- **variant**: `primary`, `secondary`.
- **suffixIcon**: Icon name (e.g., `arrowUpRight`).

## Feedback & Info

### <Feedback>
Instructional callouts.
- **variant**: `info`, `neutral`, `warning`, `success`, `danger`.
- **title**: Bold heading.
- **description**: Summary text (can be used alongside or instead of children).

## Design & Alignment Guidelines

### 1. Proper UI Alignment
Professional layouts are built by nesting containers intentionally:
- **Hero/Center Alignment**: Wrap components in a `<Row fillWidth horizontal="center">` or `<Column fillWidth horizontal="center">`.
- **Grid Layouts**: Use `<Grid columns="2" s={{columns: 1}} gap="16">` for side-by-side comparisons.
- **Media Wrapping**: Wrap `<Media>` in a `<Row fillWidth ... style={{ backgroundColor: 'black', overflow: 'hidden' }}>` to create a "cinema" effect with a background.

### 2. Component Tweaking
- **Spacing**: Use `marginTop` and `marginBottom` (typically `16`, `24`, or `32`) instead of `<br/>` for more precise vertical rhythm.
- **Color Context**: Use `onBackground` tokens on `<Text>` (e.g., `neutral-weak`, `brand-weak`, `success-medium`) to create hierarchy.
- **Card Hierarchy**: Use `radius="l"` and `border="neutral-medium"` for primary cards. Use `radius="none"` or `border="none"` for nested backgrounds.

### 3. Visual Hierarchy
- **Typography**: Pair `heading-strong-s` for section titles with `body-default-s` for descriptions.
- **Badges**: Use `<Text variant="label-default-xs" onBackground="brand-weak">` inside `Column` as a subtitle or tag.

## Usage Checklist
- [ ] Is the primary container using `fillWidth` if it needs to center its content?
- [ ] Are gaps consistent (e.g. `16` or `24`)?
- [ ] Does the `Image` or `Media` have a meaningful `caption`?
- [ ] Is the `Feedback` variant appropriate for the message tone?
