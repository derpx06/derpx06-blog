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
    },
    {
        id: "python-overview",
        title: "Python Overview",
        description: "A high-level overview of the Python programming language.",
        slug: "python-overview",
        image: "/images/projects/project-01/cover-04.jpg",
        topics: [
            {
                title: "1. Foundations & Environment",
                links: [
                    {
                        title: "The Toolbox",
                        slug: "python-toolbox",
                        postSlugs: ["python-toolbox"]
                    },
                    {
                        title: "The Zen of Python",
                        slug: "python-zen",
                        postSlugs: ["python-zen"]
                    },
                    {
                        title: "Structural Basics",
                        slug: "python-structure",
                        postSlugs: ["python-structure"]
                    }
                ]
            },
            {
                title: "2. Control Flow & Functions",
                links: [
                    {
                        title: "Logic & Arithmetic",
                        slug: "python-control-flow",
                        postSlugs: ["python-control-flow"]
                    }
                ]
            },
            {
                title: "3. Data Structures",
                links: [
                    {
                        title: "Lists",
                        slug: "python-lists",
                        postSlugs: ["python-lists"]
                    },
                    {
                        title: "Tuples",
                        slug: "python-tuples",
                        postSlugs: ["python-tuples"]
                    },
                    {
                        title: "Dictionaries",
                        slug: "python-dicts",
                        postSlugs: ["python-dicts"]
                    },
                    {
                        title: "Sets",
                        slug: "python-sets",
                        postSlugs: ["python-sets"]
                    }
                ]

            },
            {
                title: "4. Advanced Data Tools",
                links: [
                    {
                        title: "Sorting",
                        slug: "python-sorting",
                        postSlugs: ["python-sorting"]
                    },
                    {
                        title: "List Comprehensions",
                        slug: "python-comprehensions",
                        postSlugs: ["python-comprehensions"]
                    },
                    {
                        title: "Generators & Iterators",
                        slug: "python-generators",
                        postSlugs: ["python-generators"]
                    },
                    {
                        title: "Functional Tools",
                        slug: "python-functional-tools",
                        postSlugs: ["python-functional-tools"]
                    }
                ]
            },
            {
                title: "5. Working with Data",
                links: [
                    {
                        title: "Randomness",
                        slug: "python-randomness",
                        postSlugs: ["python-randomness"]
                    },
                    {
                        title: "Regular Expressions",
                        slug: "python-regex",
                        postSlugs: ["python-regex"]
                    },
                    {
                        title: "Object-Oriented Programming",
                        slug: "python-oop",
                        postSlugs: ["python-oop"]
                    },
                    {
                        title: "Iterators & Zip",
                        slug: "python-iterators-zip",
                        postSlugs: ["python-iterators-zip"]
                    },
                    {
                        title: "Args & Kwargs",
                        slug: "python-args-kwargs",
                        postSlugs: ["python-args-kwargs"]
                    }
                ]
            }
        ]
    }
];
