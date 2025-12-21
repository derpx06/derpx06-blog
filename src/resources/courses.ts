export interface Link {
    title: string;
    slug: string;
    postSlugs: string[]; // Slugs of the MDX content (from learn/posts or blog/posts)
}

export interface Topic {
    title: string;
    links: Link[];
}

export interface Course {
    id: string;
    title: string;
    description: string;
    slug: string;
    image: string;
    topics: Topic[];
}

export const courses: Course[] = [
    {
        id: "course-demo",
        title: "Interactive Course Demo",
        description: "A demonstration of the course platform capabilities.",
        slug: "course-demo",
        image: "/images/projects/project-01/cover-04.jpg", // Placeholder
        topics: [
            {
                title: "Getting Started",
                links: [
                    {
                        title: "Introduction",
                        slug: "interactive-course-demo",
                        postSlugs: ["interactive-course-demo"] // Maps to src/app/learn/posts/interactive-course-demo.mdx
                    }
                ]
            }
        ]
    },
    {
        id: "python-basics",
        title: "Basic Python Tutorial",
        description: "Learn Python from scratch with this comprehensive guide.",
        slug: "python-basics",
        image: "/images/projects/project-01/cover-04.jpg",
        topics: [
            {
                title: "Introduction",
                links: [
                    { title: "Setup", slug: "python-setup", postSlugs: ["python-setup"] },
                    { title: "Hello World", slug: "python-hello-world", postSlugs: ["python-hello-world"] }
                ]
            },
            {
                title: "Data Types",
                links: [
                    { title: "Variables", slug: "python-variables", postSlugs: ["python-variables"] },
                    { title: "Strings", slug: "python-strings", postSlugs: ["python-strings"] },
                    { title: "Numbers", slug: "python-numbers", postSlugs: ["python-numbers"] }
                ]
            },
            {
                title: "Control Flow",
                links: [
                    { title: "If Statements", slug: "python-if-statements", postSlugs: ["python-if-statements"] },
                    { title: "Loops", slug: "python-loops", postSlugs: ["python-loops"] }
                ]
            },
            {
                title: "Functions",
                links: [
                    { title: "Defining Functions", slug: "python-functions", postSlugs: ["python-functions"] },
                    { title: "Arguments", slug: "python-arguments", postSlugs: ["python-arguments"] }
                ]
            }
        ]
    },
    {
        id: "langchain-mastery",
        title: "LangChain Mastery",
        description: "Master building LLM applications with LangChain, from basics to advanced agents and RAG.",
        slug: "langchain-mastery",
        image: "/images/projects/project-01/cover-04.jpg",
        topics: [
            {
                title: "Introduction",
                links: [
                    { title: "Introduction", slug: "langchain-intro", postSlugs: ["langchain-intro"] },
                    { title: "Setup & Installation", slug: "langchain-setup", postSlugs: ["langchain-setup"] }
                ]
            },
            {
                title: "Model I/O",
                links: [
                    { title: "LLMs & Chat Models", slug: "langchain-llms", postSlugs: ["langchain-llms"] },
                    { title: "Prompts", slug: "langchain-prompts", postSlugs: ["langchain-prompts"] },
                    { title: "Prompt Templates", slug: "langchain-prompt-templates", postSlugs: ["langchain-prompt-templates"] },
                    { title: "Advanced Prompts", slug: "langchain-advanced-prompts", postSlugs: ["langchain-advanced-prompts"] },
                    { title: "Debugging Prompts", slug: "langchain-prompt-debugging", postSlugs: ["langchain-prompt-debugging"] },
                    { title: "Output Parsers", slug: "langchain-parsers", postSlugs: ["langchain-parsers"] }
                ]
            },
            {
                title: "Data Connection (RAG)",
                links: [
                    { title: "Introduction to RAG", slug: "langchain-rag-intro", postSlugs: ["langchain-rag-intro"] },
                    { title: "Document Loaders", slug: "langchain-document-loaders", postSlugs: ["langchain-document-loaders"] },
                    { title: "Text Splitters", slug: "langchain-text-splitters", postSlugs: ["langchain-text-splitters"] },
                    { title: "Vector Stores", slug: "langchain-vector-stores", postSlugs: ["langchain-vector-stores"] },
                    { title: "Retrievers", slug: "langchain-retrievers", postSlugs: ["langchain-retrievers"] },
                    { title: "Advanced Retrieval", slug: "langchain-retrieval", postSlugs: ["langchain-retrieval"] }
                ]
            },
            {
                title: "Chains & LCEL",
                links: [
                    { title: "Chains Basics", slug: "langchain-chains-core", postSlugs: ["langchain-chains-core"] },
                    { title: "LCEL", slug: "langchain-lcel", postSlugs: ["langchain-lcel"] },
                    { title: "Advanced Chains", slug: "langchain-advanced-chains", postSlugs: ["langchain-advanced-chains"] }
                ]
            },
            {
                title: "Memory",
                links: [
                    { title: "Memory Basics", slug: "langchain-memory", postSlugs: ["langchain-memory"] },
                    { title: "Memory Types", slug: "langchain-memory-types", postSlugs: ["langchain-memory-types"] },
                    { title: "Tools & Memory", slug: "langchain-tools-memory", postSlugs: ["langchain-tools-memory"] }
                ]
            },
            {
                title: "Agents",
                links: [
                    { title: "Agents Intro", slug: "langchain-agents-intro", postSlugs: ["langchain-agents-intro"] },
                    { title: "Tools", slug: "langchain-tools", postSlugs: ["langchain-tools"] },
                    { title: "Custom Tools", slug: "langchain-custom-tools", postSlugs: ["langchain-custom-tools"] },
                    { title: "ReAct Agent", slug: "langchain-react", postSlugs: ["langchain-react"] },
                    { title: "LangGraph", slug: "langchain-langgraph", postSlugs: ["langchain-langgraph"] }
                ]
            },
            {
                title: "Deployment",
                links: [
                    { title: "Deployment", slug: "langchain-deployment", postSlugs: ["langchain-deployment"] },
                    { title: "Streaming & Errors", slug: "langchain-streaming-errors", postSlugs: ["langchain-streaming-errors"] }
                ]
            },
            {
                title: "Projects",
                links: [
                    { title: "PDF Chat", slug: "langchain-project-pdf", postSlugs: ["langchain-project-pdf"] },
                    { title: "Research Assistant", slug: "langchain-project-research", postSlugs: ["langchain-project-research"] }
                ]
            }
        ]
    }
];
