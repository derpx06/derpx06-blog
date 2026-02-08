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
        image: "/images/projects/project-01/cover-04.png",
        topics: [
            {
                title: "0. Intro & Setup",
                links: [
                    { title: "Introduction", slug: "langchain-intro", postSlugs: ["langchain-intro"] },
                    { title: "Setup & Installation", slug: "langchain-setup", postSlugs: ["langchain-setup"] },
                    { title: "Evolution of AI Agents", slug: "evolution-of-ai-agents", postSlugs: ["evolution-of-ai-agents"] }
                ]
            },
            {
                title: "1. LLM Foundations",
                links: [
                    {
                        title: "How LLMs Work: Tokens & Prediction",
                        slug: "llm-tokens-prediction",
                        postSlugs: ["llm-tokens-prediction"]
                    },
                    {
                        title: "The Context Window & Budgeting",
                        slug: "context-window-budgeting",
                        postSlugs: ["context-window-budgeting"]
                    },
                    {
                        title: "Prompting Essentials",
                        slug: "prompting-essentials",
                        postSlugs: ["prompting-essentials"]
                    },
                    {
                        title: "Handling Errors: Rate Limits & Overflow",
                        slug: "handling-llm-errors",
                        postSlugs: ["handling-llm-errors"]
                    }
                ]
            },
            {
                title: "2. LCEL & Prompt Architecture",
                links: [
                    { title: "Your First Chatbot: Talking to an LLM", slug: "your-first-chatbot", postSlugs: ["your-first-chatbot"] },
                    { title: "LCEL: Why LangChain Is a Composition Engine", slug: "lcel-mental-model", postSlugs: ["lcel-mental-model"] },
                    { title: "The Runnable Protocol (invoke, batch, stream)", slug: "runnable-protocol", postSlugs: ["runnable-protocol"] },
                    { title: "Pipe Operator & Data Flow", slug: "pipe-operator", postSlugs: ["pipe-operator"] },
                    { title: "RunnableLambda & Custom Logic", slug: "runnable-lambda", postSlugs: ["runnable-lambda"] },
                    { title: "RunnableParallel & Branching", slug: "runnable-parallel-branch", postSlugs: ["runnable-parallel-branch"] },
                    { title: "PromptTemplate vs ChatPromptTemplate", slug: "prompt-templates", postSlugs: ["prompt-templates"] },
                    { title: "System, Human, AI Messages", slug: "message-types", postSlugs: ["message-types"] },
                    { title: "Prompt Architecture & Reusability", slug: "prompt-architecture", postSlugs: ["prompt-architecture"] },
                    { title: "Structured Output with JSON Mode", slug: "json-mode", postSlugs: ["json-mode"] },
                    { title: "PydanticOutputParser", slug: "pydantic-parser", postSlugs: ["pydantic-parser"] },
                    { title: "OutputFixingParser", slug: "output-fixing-parser", postSlugs: ["output-fixing-parser"] },
                    { title: "Streaming Tokens & Async Chains", slug: "streaming-async", postSlugs: ["streaming-async"] }
                ]
            },
            {
                title: "3. Data Ingestion & Preparation",
                links: [
                    { title: "The Document Object & Metadata", slug: "document-object", postSlugs: ["document-object"] },
                    { title: "Loaders: PDF, HTML, Text, Web", slug: "document-loaders", postSlugs: ["document-loaders"] },
                    { title: "Cleaning & Normalization", slug: "data-cleaning", postSlugs: ["data-cleaning"] },
                    { title: "Chunking: Why It Exists", slug: "why-chunking", postSlugs: ["why-chunking"] },
                    { title: "RecursiveCharacterTextSplitter", slug: "recursive-splitter", postSlugs: ["recursive-splitter"] },
                    { title: "Token-Aware & Syntax-Aware Splitting", slug: "syntax-aware-splitting", postSlugs: ["syntax-aware-splitting"] },
                    { title: "Markdown & Code Splitting", slug: "markdown-splitting", postSlugs: ["markdown-splitting"] },
                    { title: "Metadata Enrichment Strategies", slug: "metadata-enrichment", postSlugs: ["metadata-enrichment"] },
                    { title: "Deduplication via Content Hashing", slug: "content-deduplication", postSlugs: ["content-deduplication"] },
                    { title: "Lazy Loading & Generators", slug: "lazy-loading", postSlugs: ["lazy-loading"] }
                ]
            },
            {
                title: "4. Embeddings & Vector Stores",
                links: [
                    { title: "Embeddings: What Matters in Practice", slug: "embeddings-practical", postSlugs: ["embeddings-practical"] },
                    { title: "Embedding Models in LangChain", slug: "embedding-models", postSlugs: ["embedding-models"] },
                    { title: "Vector Stores: FAISS, Chroma", slug: "vector-stores", postSlugs: ["vector-stores"] },
                    { title: "Persisting & Reloading Indexes", slug: "vector-persistence", postSlugs: ["vector-persistence"] },
                    { title: "Metadata Filtering", slug: "metadata-filtering", postSlugs: ["metadata-filtering"] },
                    { title: "Dense vs Sparse (BM25 Overview)", slug: "dense-vs-sparse", postSlugs: ["dense-vs-sparse"] },
                    { title: "Hybrid Search Concepts", slug: "hybrid-search", postSlugs: ["hybrid-search"] }
                ]
            },
            {
                title: "5. Retrieval & RAG Patterns",
                links: [
                    { title: "The Retriever Interface", slug: "retriever-interface", postSlugs: ["retriever-interface"] },
                    { title: "Similarity vs MMR", slug: "mmr-vs-similarity", postSlugs: ["mmr-vs-similarity"] },
                    { title: "Multi-Query Retrieval", slug: "multi-query-retrieval", postSlugs: ["multi-query-retrieval"] },
                    { title: "RAG-Fusion", slug: "rag-fusion", postSlugs: ["rag-fusion"] },
                    { title: "Query Decomposition", slug: "query-decomposition", postSlugs: ["query-decomposition"] },
                    { title: "Parent Document Retrieval", slug: "parent-doc-retrieval", postSlugs: ["parent-doc-retrieval"] },
                    { title: "Contextual Compression", slug: "contextual-compression", postSlugs: ["contextual-compression"] },
                    { title: "Post-Retrieval Re-Ranking", slug: "reranking", postSlugs: ["reranking"] },
                    { title: "Conversational RAG & History", slug: "conversational-rag", postSlugs: ["conversational-rag"] }
                ]
            },
            {
                title: "6. Memory & State Management",
                links: [
                    { title: "Why Memory Breaks Systems", slug: "memory-problems", postSlugs: ["memory-problems"] },
                    { title: "ConversationBuffer & Window Memory", slug: "window-memory", postSlugs: ["window-memory"] },
                    { title: "ConversationSummaryMemory", slug: "summary-memory", postSlugs: ["summary-memory"] },
                    { title: "Entity Memory", slug: "entity-memory", postSlugs: ["entity-memory"] },
                    { title: "Session Isolation", slug: "session-isolation", postSlugs: ["session-isolation"] },
                    { title: "Persistence Layers (Redis / DB)", slug: "memory-persistence", postSlugs: ["memory-persistence"] }
                ]
            },
            {
                title: "7. Tools & Agents",
                links: [
                    { title: "Designing Tool Schemas", slug: "tool-design", postSlugs: ["tool-design"] },
                    { title: "Function Calling in LangChain", slug: "function-calling", postSlugs: ["function-calling"] },
                    { title: "Tool Selection & Validation", slug: "tool-selection", postSlugs: ["tool-selection"] },
                    { title: "ReAct Agents", slug: "react-agents", postSlugs: ["react-agents"] },
                    { title: "Plan-and-Solve Agents", slug: "plan-solve", postSlugs: ["plan-solve"] },
                    { title: "Fallbacks & Error Handling", slug: "agent-fallbacks", postSlugs: ["agent-fallbacks"] },
                    { title: "LangGraph: Stateful Agents", slug: "langgraph-foundations", postSlugs: ["langgraph-foundations"] },
                    { title: "Human-in-the-Loop", slug: "human-in-the-loop", postSlugs: ["human-in-the-loop"] }
                ]
            },
            {
                title: "8. Production, Evaluation & Governance",
                links: [
                    { title: "Async & High-Throughput Patterns", slug: "high-throughput", postSlugs: ["high-throughput"] },
                    { title: "Latency & TTFT Optimization", slug: "latency-ttft", postSlugs: ["latency-ttft"] },
                    { title: "Tracing with LangSmith", slug: "langsmith-tracing", postSlugs: ["langsmith-tracing"] },
                    { title: "RAG Evaluation Basics", slug: "rag-evaluation", postSlugs: ["rag-evaluation"] },
                    { title: "Faithfulness & Relevance", slug: "faithfulness-relevance", postSlugs: ["faithfulness-relevance"] },
                    { title: "Prompt Injection Defense", slug: "prompt-injection", postSlugs: ["prompt-injection"] },
                    { title: "Input & Output Guardrails", slug: "guardrails", postSlugs: ["guardrails"] },
                    { title: "Deployment & API Serving", slug: "deployment", postSlugs: ["deployment"] }
                ]
            }
        ]
    },
    {
        id: "python-overview",
        title: "Python Overview",
        description: "A high-level overview of the Python programming language.",
        slug: "python-overview",
        image: "/images/projects/project-01/cover-04.png",
        topics: [
            {
                title: "1. Foundations",
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
                title: "2. Control Flow",
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
                title: "4. Advanced Tools",
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
                title: "5. Data Work",
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
