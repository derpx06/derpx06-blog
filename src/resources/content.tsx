import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";

const person: Person = {
  firstName: "Manas",
  lastName: "Khairnar",
  name: 'Derpx06',
  role: "Software Developer",
  avatar: "/images/derpx06-avatar.png",
  email: "manaskhairnar1511@gmail.com",
  location: "Pune, India",
  timeZone: "Asia/Kolkata",
  languages: ["English", "Hindi", "Marathi", "German"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/derpx06",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/manas-khairnar-98329132b/",
  },
  {
    name: "Hugging Face",
    icon: "github",
    link: "https://huggingface.co/Manas200",
  },
  {
    name: "LeetCode",
    icon: "github",
    link: "https://leetcode.com/u/manas1511/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name} — Notes on systems, models & learning`,
  description: `Writing, explainers and courses on retrieval systems, LLM plumbing and the long way round to understanding them.`,
  headline: <>Turning problems into possibilities</>,
  featured: {
    display: true,
    title: "Latest writing",
    href: "/blog",
  },
  subline: "I want to share magic",
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `${person.role} building production mobile apps, backend services and agentic AI systems, from ${person.location}.`,
  tableOfContent: { display: true, subItems: false },
  avatar: { display: true },
  calendar: { display: false, link: "" },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I build production mobile applications, scalable backend services and agentic AI
        systems — React Native and Jetpack Compose on the front, Node.js and FastAPI behind
        them, and retrieval and multi-agent workflows where the two meet. App Development
        Lead, four-time hackathon winner, and the person who ships the whole thing rather
        than a slice of it.
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Aionyix",
        link: "https://mfdstack.com/",
        timeframe: "2026 — Present",
        role: "App Development Lead Intern",
        achievements: [
          <>
            Lead development of MFD Stack&apos;s production mobile application — feature
            architecture, API integration, performance and release-ready implementation.
          </>,
          <>
            Contribute the backend services, API workflows and data handling that keep
            end-to-end CRM operations reliable.
          </>,
        ],
        images: [],
      },
      {
        company: "Scizers",
        link: "https://play.google.com/store/apps/details?id=com.realedgetech.app",
        timeframe: "Sep 2025 — Feb 2026",
        role: "App Developer Intern",
        achievements: [
          <>
            Built RealEdge from the ground up: a production CRM for real-estate
            professionals, shipped on Google Play.
          </>,
          <>
            Improved UI responsiveness, cross-device stability and real-time data flow
            through production-focused development and testing.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true,
    title: "Studies",
    institutions: [
      {
        name: "Pune Institute of Computer Technology",
        description: <>B.E. in Computer Engineering, 2024 — 2028.</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "What I work on",
    skills: [
      {
        title: "Mobile products",
        description: (
          <>Production React Native and Jetpack Compose apps, shipped and maintained on store.</>
        ),
        tags: [
          { name: "React Native" }, { name: "Jetpack Compose" }, { name: "Kotlin" },
          { name: "TypeScript" }, { name: "React" },
        ],
        images: [],
      },
      {
        title: "Backend & data",
        description: <>APIs, services and the storage decisions that decide how they age.</>,
        tags: [
          { name: "Node.js" }, { name: "Express.js" }, { name: "FastAPI" },
          { name: "Spring Boot" }, { name: "PostgreSQL" }, { name: "MongoDB" }, { name: "Qdrant" },
        ],
        images: [],
      },
      {
        title: "Agentic AI",
        description: <>Retrieval, multi-agent workflows, and evaluation you can actually trust.</>,
        tags: [
          { name: "LangChain" }, { name: "LangGraph" }, { name: "RAG" },
          { name: "LlamaIndex" }, { name: "Hugging Face" }, { name: "PyTorch" }, { name: "TensorFlow" },
        ],
        images: [],
      },
      {
        title: "Cloud & delivery",
        description: <>Containers, pipelines and the boring plumbing that makes releases dull.</>,
        tags: [
          { name: "Docker" }, { name: "Kubernetes" }, { name: "Terraform" },
          { name: "GitHub Actions" }, { name: "AWS" }, { name: "GCP" }, { name: "Linux" }, { name: "Git" },
        ],
        images: [],
      },
    ],
  },
};

/** Things built outside work, newest first. */
const projects = [
  {
    name: "WebGenie",
    href: "https://github.com/derpx06/webgenie",
    stack: "TypeScript · React · Chrome MV3 · Multi-agent",
    description:
      "Local-first browser automation agent with planner, navigator and validator loops, compressed DOM context, persistent task state and sandboxed browser actions.",
  },
  {
    name: "Outreach AI",
    href: "https://github.com/derpx06/Outreach_bot",
    stack: "Python · FastAPI · LangGraph · Ollama",
    description:
      "Local-first multi-agent outreach platform: prospect research, profiling, multi-channel drafting, RAG, memory, streaming and critic-based quality checks.",
  },
  {
    name: "AssistFlow AI",
    href: "https://github.com/derpx06/AssistFlow-Ai",
    stack: "Node.js · React · MongoDB · RAG",
    description:
      "API-first support platform with an embeddable chat widget on npm — site crawling, vector search, AI-to-human handoff, ticketing and per-site knowledge bases.",
  },
  {
    name: "The Interview Room",
    href: "https://theinterviewroom.in/",
    stack: "Full-stack · Community · 210K+ visitors",
    description:
      "A platform where students share company-specific interview experiences, hiring rounds and preparation notes. Grew past 210,000 unique visitors.",
  },
  {
    name: "CollabSphere",
    href: "https://github.com/ParagD1606/CollabSphere",
    stack: "React · Node.js · Socket.IO · Semantic search",
    description:
      "Developer collaboration platform with real-time chat, AI-assisted planning, skill-gap analysis and semantic candidate matching.",
  },
];

/** Roles and wins worth a line, not a section. */
const achievements: Array<{ label: string; href?: string }> = [
  { label: "Tech Head — PICT INC" },
  { label: "Tech Team — Startup & Innovation Cell, PICT" },
  { label: "4× hackathon winner — AI, backend and app development" },
  {
    label: "Published a fine-tuned Qwen 0.5B for natural-language-to-shell translation",
    href: "https://huggingface.co/Manas200/shellm-qwen-0.5b-nl2sh-finetuned",
  },
];

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about AI and agents..",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};
const explainers: Blog = {
  path: "/explainers",
  label: "Explainers",
  title: "Explainers",


  description: "Simple Explanations to various research papers",
};

const learn: Blog = {
  path: "/learn",
  label: "Learn",
  title: `Learn with ${person.name}`,
  description: `Courses and tutorials by ${person.name}`,
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `Photos by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

const heroWords = [
  { w: "Share Magic", tag: "software that matters" },
  { w: "Build", tag: "software that matters" },
  { w: "Ship", tag: "fast, iteratively, boldly" },
  { w: "Architect", tag: "systems that last" },
  { w: "Innovate", tag: "at the edge of what's possible" },
  { w: "Engineer", tag: "with intention" },
  { w: "Create", tag: "things I'm proud of" },
  { w: "Deploy", tag: "ideas into reality" },
  { w: "Design", tag: "for the humans behind the screen" },
  { w: "Automate", tag: "the boring stuff" },
  { w: "Scale", tag: "without losing the soul" },
  { w: "Dream", tag: "beyond the obvious" },
  { w: "Listen", tag: "before I write a line of code" },
  { w: "Wonder", tag: "about everything" },
  { w: "Empathize", tag: "with every user" },
  { w: "Grow", tag: "every single day" },
];

export {
  person,
  social,
  newsletter,
  home,
  about,
  achievements,
  projects,
  blog,
  work,
  gallery,
  learn,
  explainers,
  heroWords,
};
