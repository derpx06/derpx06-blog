import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Logo, Row, Text } from "@once-ui-system/core";

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
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Turning problems into possibilities</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Once UI</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/building-once-ui-a-customizable-design-system",
  },
  subline: (
    <>
      I'm Manas. I like to solve problems, creating solutions that are both effective and intuitive.
    </>
  ),
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
    display: true,
    link: "https://cal.com",
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
        role: "" +
          "App development Intern",
        achievements: [
          <>
            Build react native apps along with functionlity and api integration
          </>,
          <>

          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          // {
          //   src: "/images/projects/project-01/cover-01.jpg",
          //   alt: "Once UI Project",
          //   width: 16,
          //   height: 9,
          // },
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "Pune Institute of Computer Technology",
        description: <>Studied software engineering.</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "App Development",
        description: (
          <>I can build full fledged apps</>
        ),
        tags: [
          {
            name: "React Native",
            icon: "javascript",
          },
          {
            name: "kotlin",
            icon: "supabase"
          }
        ],
        // optional: leave the array empty if you don't want to display images
        images: [
          {
            src: "/images/projects/description-images/ChatBlaze.jpg",
            alt: "Project image",
            width: 5,
            height: 12,
          },
          {
            src: "/images/projects/description-images/NewsPulse.png",
            alt: "Project image",
            width: 5,
            height: 12,
          },
          {
            src: "/images/projects/description-images/Techrush.png",
            alt: "Project image",
            width: 5,
            height: 12,
          },
          {
            src: "/images/projects/description-images/NoteSphere.png",
            alt: "Project image",
            width: 5,
            height: 12,
          }

        ],
      },
    ],
  },
};

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

export { person, social, newsletter, home, about, blog, work, gallery, learn, explainers };
