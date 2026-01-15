# Final UI / Layout Prompt — Modular vCard About Page (Once UI)

## Context
This About page is built using **Once UI System** components (`Row`, `Column`, `Avatar`, `Heading`, `Text`, `Tag`, `Media`, etc.).

The current page works but feels like:
- A long scrollable container
- Weak hierarchy
- Sections blend into each other

The goal is to **redesign the layout and UI structure** to match a **modern vCard-style personal website**, similar to classic portfolio designs with:
- A strong left profile card
- Modular content cards on the right
- Clear separation of Experience, Skills, and Projects

⚠️ This is a **layout + UI refactor only**
- Do NOT change data or copy
- Do NOT add routes or tabs
- Do NOT animate
- Use **Once UI primitives only**

---

## Core Layout Goal

The page must feel like a **dashboard of cards**, not a single scrolling article.

### Section Order (IMPORTANT)
1. Introduction
2. Work Experience
3. Skills
4. Studies
5. Projects (MOVED TO BOTTOM)

---

## Desktop Layout (≥ 1024px)

### Overall Structure

| Profile Card (sticky) | Modular Content Cards |

yaml
Copy code

- Use a strict two-column grid
- Left column is fixed width
- Right column scrolls
- No overlap, no floating

---

### Profile Card (Left Column)

This must visually match a **vCard identity panel**.

**Rules**
- Fixed width (~280–320px)
- `position: sticky; top: 64px`
- One contained card
- Strong visual weight

**Contents**
- Avatar
- Name
- Role
- Location
- Languages (tags)
- Social icons
- Resume / Schedule CTA

This card should NOT change across sections.

---

### Right Column: Modular Card Stack

Each section on the right must be its **own modular card**, like the reference screenshots.

Use repeated card containers with consistent:
- Padding
- Radius
- Border
- Background

---

## Section Layout Rules (Desktop)

### 1. Introduction (Top Card)
- Card-style container
- Clear title
- Short narrative text
- This is the “About Me” summary

---

### 2. Work Experience (PRIMARY SECTION)

This section must feel like the **main proof of credibility**.

**Layout**
- One large card titled “Experience”
- Inside it, **stacked sub-cards** for each job
- Each job card contains:
  - Company
  - Role
  - Timeframe (right aligned)
  - Bullet points
  - Optional image preview

This section should visually dominate the page.

---

### 3. Skills (Progress / Capability Section)

Style this similar to the reference screenshot:

- One card titled “My Skills”
- Inside:
  - Skill name
  - Visual indicator (progress bar or meter style)
  - Clean, horizontal layout
- No heavy text blocks

This section should feel **visual and scannable**.

---

### 4. Studies (Lightweight Card)

- Simple modular card
- Less visual weight than Experience and Skills
- Clean typography
- Minimal decoration

---

### 5. Projects (MOVED TO BOTTOM)

Projects must appear **after everything else**.

**Layout**
- One card titled “Projects”
- Inside:
  - Grid or stacked project cards
  - Each project card includes:
    - Project name
    - Short description
    - Tech tags
    - Repo / Demo links
- Projects should feel like **extra proof**, not the main focus

---

## Tablet Layout (768px – 1023px)

- Collapse into single column
- Profile card moves to top
- Modular cards stack vertically
- Experience and Skills still visually dominant
- Projects remain at the bottom

No sticky behavior on tablet.

---

## Mobile Layout (≤ 767px)

Mobile must feel calm and structured.

Order:
1. Profile Card
2. Introduction
3. Experience (job cards stacked)
4. Skills
5. Studies
6. Projects

Rules:
- One card per screen where possible
- No dense layouts
- Clear separation between cards

---

## Visual Design Rules

- Cards must feel **modular and repeatable**
- Avoid one giant container
- Spacing between cards is important
- Borders and radius must be consistent
- Dark UI with subtle contrast
- No visual noise

---

## What NOT To Do

- Do NOT merge sections into one container
- Do NOT make everything text-heavy
- Do NOT place projects near the top
- Do NOT overlap profile and content
- Do NOT reduce everything to a blog-style layout

---

## Expected Result

After refactor:
- The page feels like a **professional vCard portfolio**
- Experience and Skills dominate attention
- Projects feel secondary and optional
- UI feels modular, clean, and premium
- Scrolling feels intentional, not endless

---

## Success Criteria

- Clear left/right separation on desktop
- Modular card system on the right
- Experience > Skills > Studies > Projects
- No overlap or layout instability
- Page visually resembles classic vCard portfolio designs
🧱 UPDATED WIREFRAME (PROJECTS AT BOTTOM)
🖥️ Desktop Wireframe
scss
Copy code
┌──────────────────────────────────────────────────────┐
│                     TOP NAV                          │
└──────────────────────────────────────────────────────┘

┌───────────────┬──────────────────────────────────────┐
│ PROFILE CARD  │  INTRODUCTION CARD                   │
│ (Sticky)      │  ----------------------------------  │
│ Avatar        │  About summary                       │
│ Name          │                                      │
│ Role          │                                      │
│ Location      │                                      │
│ Languages     │                                      │
│ Social + CTA  │                                      │
├───────────────┼──────────────────────────────────────┤
│               │  EXPERIENCE CARD                     │
│               │  ----------------------------------  │
│               │  [Job Card]                          │
│               │  [Job Card]                          │
│               │  [Job Card]                          │
├───────────────┼──────────────────────────────────────┤
│               │  MY SKILLS CARD                      │
│               │  ----------------------------------  │
│               │  Skill — Progress Bar                │
│               │  Skill — Progress Bar                │
│               │  Skill — Progress Bar                │
├───────────────┼──────────────────────────────────────┤
│               │  STUDIES CARD                        │
│               │  ----------------------------------  │
│               │  Education info                      │
├───────────────┼──────────────────────────────────────┤
│               │  PROJECTS CARD (BOTTOM)              │
│               │  ----------------------------------  │
│               │  [Project Card] [Project Card]       │
│               │  [Project Card]                      │
└───────────────┴──────────────────────────────────────┘
📱 Mobile Wireframe
css
Copy code
[ PROFILE CARD ]
[ INTRODUCTION ]
[ EXPERIENCE ]
  - Job
  - Job
[ SKILLS ]
[ STUDIES ]
[ PROJECTS ]
