import { About, Blog, Home, Newsletter, Person, Social } from "@/types";

const person: Person = {
  firstName: "Manas",
  lastName: "Khairnar",
  name: "derpx06",
  role: "App Development Lead at Aionyix",
  avatar: "/images/derpx06-avatar.png",
  email: "manaskhairnar1511@gmail.com",
  location: "Pune, India",
  timeZone: "Asia/Kolkata",
  languages: ["English", "Hindi", "Marathi", "German"],
};

const newsletter: Newsletter = {
  display: true,
  title: "The weekly letter",
  description: "One piece a week on systems, models and learning.",
};

const social: Social = [
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
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: "derpx06.dev — systems, models and learning notes",
  description: "Essays, paper explainers and learning notes on systems and AI by Manas Khairnar.",
  headline: "Turning problems into possibilities",
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I am a Software Engineer based in India with a strong passion for Linux, programming, and system-level thinking. I enjoy building practical software solutions that simplify complex problems, and I focus on writing clean, efficient, and well-structured code. I am highly curious, self-driven, and always eager to learn by experimenting and building real projects.
      </>
    ),
  },
  work: {
    display: true,
    title: "Work Experience",
    experiences: [
      {
        company: "Scizers",
        timeframe: "2025 - Present",
        role: "App development Intern",
        achievements: [<>Build react native apps along with functionality and api integration</>],
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
        description: <>Studied software engineering.</>,
      },
    ],
  },
  technical: {
    display: true,
    title: "Technical skills",
    skills: [
      {
        title: "App Development",
        description: <>Building cross-platform mobile applications with modern frameworks.</>,
        tags: [
          { name: "React Native", icon: "react" },
          { name: "Kotlin Compose", icon: "kotlin" },
        ],
        images: [
          { src: "/images/projects/description-images/ChatBlaze.jpg", alt: "Project image", width: 5, height: 12 },
          { src: "/images/projects/description-images/NewsPulse.png", alt: "Project image", width: 5, height: 12 },
          { src: "/images/projects/description-images/Techrush.png", alt: "Project image", width: 5, height: 12 },
          { src: "/images/projects/description-images/NoteSphere.png", alt: "Project image", width: 5, height: 12 },
        ],
      },
      {
        title: "AI & Machine Learning",
        description: <>Developing intelligent systems using state-of-the-art models and frameworks.</>,
        tags: [
          { name: "TensorFlow", icon: "tensorflow" },
          { name: "PyTorch", icon: "pytorch" },
          { name: "LangChain", icon: "python" },
          { name: "LangGraph", icon: "python" },
          { name: "LangSmith", icon: "python" },
          { name: "LlamaIndex", icon: "python" },
          { name: "SmolAgents", icon: "python" },
          { name: "CrewAI", icon: "python" },
        ],
        images: [],
      },
      {
        title: "Backend & Systems",
        description: <>Robust backend architectures and system-level engineering.</>,
        tags: [
          { name: "Node.js", icon: "node" },
          { name: "Express.js", icon: "express" },
          { name: "Java Spring Boot", icon: "springboot" },
          { name: "FastAPI", icon: "fastapi" },
          { name: "MongoDB", icon: "mongodb" },
          { name: "Qdrant", icon: "python" },
          { name: "Linux", icon: "linux" },
          { name: "Git", icon: "git" },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing",
  description: "Long-form essays on distributed systems, retrieval and AI plumbing.",
};

const explainers: Blog = {
  path: "/explainers",
  label: "Explainers",
  title: "Paper explainers",
  description: "Landmark AI papers, one idea at a time.",
};

const learn: Blog = {
  path: "/learn",
  label: "Learn",
  title: "Notes",
  description: "Structured learning notes: LangChain, fine-tuning and Python.",
};

export { person, social, newsletter, home, about, blog, learn, explainers };
