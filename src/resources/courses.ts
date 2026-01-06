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
                title: "0. Intro & Setup",
                links: [
                    { title: "Introduction", slug: "langchain-intro", postSlugs: ["langchain-intro"] },
                    { title: "Setup & Installation", slug: "langchain-setup", postSlugs: ["langchain-setup"] },
                    { title: "Evolution of AI Agents", slug: "evolution-of-ai-agents", postSlugs: ["evolution-of-ai-agents"] }
                ]
            },
            {
                title: "1. LLM Foundations (The Essentials)",
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
                        title: "The 'Lost in the Middle' Phenomenon",
                        slug: "lost-in-middle",
                        postSlugs: ["lost-in-middle"]
                    },
                    {
                        title: "Handling Errors: Rate Limits & Overflow",
                        slug: "handling-llm-errors",
                        postSlugs: ["handling-llm-errors"]
                    }
                ]
            },
            {
                title: "2. Model Comms",
                links: [
                    { title: "Interface Standards", slug: "interface-standards", postSlugs: ["interface-standards"] },
                    { title: "LLM vs. ChatModel", slug: "llm-vs-chatmodel", postSlugs: ["llm-vs-chatmodel"] },
                    { title: "Message Types", slug: "message-types", postSlugs: ["message-types"] },
                    { title: "Structured Reliability", slug: "structured-intelligence", postSlugs: ["structured-intelligence"] },
                    { title: "JSON Mode vs. Functions", slug: "json-mode-vs-functions", postSlugs: ["json-mode-vs-functions"] },
                    { title: "PydanticOutputParser", slug: "pydantic-output-parser", postSlugs: ["pydantic-output-parser"] },
                    { title: "OutputFixingParser", slug: "output-fixing-parser", postSlugs: ["output-fixing-parser"] },
                    { title: "Prompt Architecture", slug: "prompt-architecture", postSlugs: ["prompt-architecture"] },
                    { title: "System Prompt Engineering", slug: "system-prompt-engineering", postSlugs: ["system-prompt-engineering"] },
                    { title: "Dynamic Few-Shotting", slug: "dynamic-few-shotting", postSlugs: ["dynamic-few-shotting"] },
                    { title: "Chain-of-Thought & Tree-of-Thought", slug: "cot-tot-prompting", postSlugs: ["cot-tot-prompting"] }
                ]
            },
            {
                title: "3. Data Ingestion",
                links: [
                    { title: "Unstructured Data Parsing", slug: "unstructured-data-parsing", postSlugs: ["unstructured-data-parsing"] },
                    { title: "HTML Cleaning", slug: "html-cleaning", postSlugs: ["html-cleaning"] },
                    { title: "PDF Extraction Strategies", slug: "pdf-extraction", postSlugs: ["pdf-extraction"] },
                    { title: "Chunking Strategies", slug: "chunking-strategies", postSlugs: ["chunking-strategies"] },
                    { title: "RecursiveCharacterTextSplitter", slug: "recursive-text-splitter", postSlugs: ["recursive-text-splitter"] },
                    { title: "Syntax-Aware Splitting", slug: "syntax-aware-splitting", postSlugs: ["syntax-aware-splitting"] },
                    { title: "Markdown Header Splitting", slug: "markdown-header-splitting", postSlugs: ["markdown-header-splitting"] },
                    { title: "Data Hygiene", slug: "data-hygiene", postSlugs: ["data-hygiene"] },
                    { title: "Lazy Loading", slug: "lazy-loading-generators", postSlugs: ["lazy-loading-generators"] },
                    { title: "Deduplication via Content Hashing", slug: "content-deduplication", postSlugs: ["content-deduplication"] },
                    { title: "Metadata Enrichment", slug: "metadata-enrichment", postSlugs: ["metadata-enrichment"] }
                ]
            },
            {
                title: "4. RAG Architecture",
                links: [
                    { title: "Query Translation & Expansion", slug: "query-translation", postSlugs: ["query-translation"] },
                    { title: "Multi-Query Retrieval", slug: "multi-query-retrieval", postSlugs: ["multi-query-retrieval"] },
                    { title: "RAG-Fusion", slug: "rag-fusion", postSlugs: ["rag-fusion"] },
                    { title: "Step-Back Prompting", slug: "step-back-prompting", postSlugs: ["step-back-prompting"] },
                    { title: "Query Decomposition", slug: "query-decomposition", postSlugs: ["query-decomposition"] },
                    { title: "Advanced Indexing Strategies", slug: "advanced-indexing", postSlugs: ["advanced-indexing"] },
                    { title: "Multi-Rep Indexing", slug: "multi-representation-indexing", postSlugs: ["multi-representation-indexing"] },
                    { title: "RAPTOR", slug: "raptor-indexing", postSlugs: ["raptor-indexing"] },
                    { title: "ColBERT / Late Interaction", slug: "colbert-interaction", postSlugs: ["colbert-interaction"] },
                    { title: "Vector Space Theory", slug: "vector-space-theory", postSlugs: ["vector-space-theory"] },
                    { title: "Dense vs. Sparse Vectors", slug: "dense-vs-sparse", postSlugs: ["dense-vs-sparse"] }
                ]
            },
            {
                title: "5. RAG Optimization",
                links: [
                    { title: "Hybrid Search Architecture", slug: "hybrid-search", postSlugs: ["hybrid-search"] },
                    { title: "Ensemble Retrievers", slug: "ensemble-retrievers", postSlugs: ["ensemble-retrievers"] },
                    { title: "Advanced Retrieval Patterns", slug: "advanced-retrieval-patterns", postSlugs: ["advanced-retrieval-patterns"] },
                    { title: "Parent Document Retrieval", slug: "parent-document-retrieval", postSlugs: ["parent-document-retrieval"] },
                    { title: "Hypothetical Document Embeddings (HyDE)", slug: "hyde-retrieval", postSlugs: ["hyde-retrieval"] },
                    { title: "Self-Querying", slug: "self-querying", postSlugs: ["self-querying"] },
                    { title: "Time-Weighted Retrieval", slug: "time-weighted-retrieval", postSlugs: ["time-weighted-retrieval"] },
                    { title: "Post-Retrieval Refinement", slug: "post-retrieval-refinement", postSlugs: ["post-retrieval-refinement"] },
                    { title: "Cross-Encoder Re-Ranking", slug: "cross-encoder-reranking", postSlugs: ["cross-encoder-reranking"] },
                    { title: "Contextual Compression", slug: "contextual-compression", postSlugs: ["contextual-compression"] },
                    { title: "Active Retrieval Architectures", slug: "active-retrieval", postSlugs: ["active-retrieval"] },
                    { title: "FLARE", slug: "flare-retrieval", postSlugs: ["flare-retrieval"] }
                ]
            },
            {
                title: "6. LCEL Orchestration",
                links: [
                    { title: "The Runnable Protocol", slug: "runnable-protocol", postSlugs: ["runnable-protocol"] },
                    { title: "Standard Methods", slug: "lcel-standard-methods", postSlugs: ["lcel-standard-methods"] },
                    { title: "The Pipe Operator", slug: "lcel-pipe-operator", postSlugs: ["lcel-pipe-operator"] },
                    { title: "High-Throughput Patterns", slug: "high-throughput-patterns", postSlugs: ["high-throughput-patterns"] },
                    { title: "RunnableParallel", slug: "runnable-parallel", postSlugs: ["runnable-parallel"] },
                    { title: "RunnableBranch", slug: "runnable-branch", postSlugs: ["runnable-branch"] },
                    { title: "RunnablePassthrough", slug: "runnable-passthrough", postSlugs: ["runnable-passthrough"] },
                    { title: "Streaming UX", slug: "streaming-ux", postSlugs: ["streaming-ux"] },
                    { title: "Async Generators", slug: "async-generators", postSlugs: ["async-generators"] },
                    { title: "Handling Latency (TTFT)", slug: "handling-latency-ttft", postSlugs: ["handling-latency-ttft"] }
                ]
            },
            {
                title: "7. Memory & State",
                links: [
                    { title: "Cognitive Load Management", slug: "cognitive-load", postSlugs: ["cognitive-load"] },
                    { title: "Context Pollution", slug: "context-pollution", postSlugs: ["context-pollution"] },
                    { title: "ConversationWindowMemory", slug: "conversation-window-memory", postSlugs: ["conversation-window-memory"] },
                    { title: "Intelligent Strategies", slug: "intelligent-memory", postSlugs: ["intelligent-memory"] },
                    { title: "ConversationSummaryMemory", slug: "conversation-summary-memory", postSlugs: ["conversation-summary-memory"] },
                    { title: "Entity Memory", slug: "entity-memory", postSlugs: ["entity-memory"] },
                    { title: "Persistence Layers", slug: "persistence-layers", postSlugs: ["persistence-layers"] },
                    { title: "Database Backends", slug: "database-backends", postSlugs: ["database-backends"] },
                    { title: "Session Isolation", slug: "session-isolation", postSlugs: ["session-isolation"] }
                ]
            },
            {
                title: "8. Agent Architectures",
                links: [
                    { title: "Reasoning", slug: "reasoning-frameworks", postSlugs: ["reasoning-frameworks"] },
                    { title: "ReAct Paradigm", slug: "react-paradigm", postSlugs: ["react-paradigm"] },
                    { title: "Plan-and-Solve", slug: "plan-and-solve", postSlugs: ["plan-and-solve"] },
                    { title: "Reflexion", slug: "reflexion-agents", postSlugs: ["reflexion-agents"] },
                    { title: "Tool Engineering Patterns", slug: "tool-engineering", postSlugs: ["tool-engineering"] },
                    { title: "Robust Tooling", slug: "robust-tooling", postSlugs: ["robust-tooling"] },
                    { title: "Tool Selection", slug: "tool-selection", postSlugs: ["tool-selection"] },
                    { title: "Fallbacks & Error Handling", slug: "agent-fallbacks", postSlugs: ["agent-fallbacks"] },
                    { title: "Human-in-the-Loop", slug: "human-in-the-loop", postSlugs: ["human-in-the-loop"] },
                    { title: "Multi-Agent Concepts", slug: "multi-agent-concepts", postSlugs: ["multi-agent-concepts"] },
                    { title: "Handoffs", slug: "agent-handoffs", postSlugs: ["agent-handoffs"] },
                    { title: "Supervisor Pattern", slug: "supervisor-pattern", postSlugs: ["supervisor-pattern"] }
                ]
            },
            {
                title: "9. Security & Governance",
                links: [
                    { title: "Input Guardrails", slug: "input-guardrails", postSlugs: ["input-guardrails"] },
                    { title: "Prompt Injection", slug: "prompt-injection-defense", postSlugs: ["prompt-injection-defense"] },
                    { title: "PII Masking", slug: "pii-masking", postSlugs: ["pii-masking"] },
                    { title: "Output Guardrails", slug: "output-guardrails", postSlugs: ["output-guardrails"] },
                    { title: "Hallucination Checks", slug: "hallucination-detection", postSlugs: ["hallucination-detection"] },
                    { title: "Toxicity Filters", slug: "toxicity-filters", postSlugs: ["toxicity-filters"] }
                ]
            },
            {
                title: "10. Optimization",
                links: [
                    { title: "Semantic Caching", slug: "semantic-caching", postSlugs: ["semantic-caching"] },
                    { title: "GPTCache / Redis", slug: "gptcache-redis", postSlugs: ["gptcache-redis"] },
                    { title: "Observability", slug: "observability", postSlugs: ["observability"] },
                    { title: "Tracing Latency", slug: "tracing-latency", postSlugs: ["tracing-latency"] },
                    { title: "Evaluation (RAGAS & DeepEval)", slug: "evaluation", postSlugs: ["evaluation"] },
                    { title: "Faithfulness & Relevance", slug: "faithfulness-relevance", postSlugs: ["faithfulness-relevance"] },
                    { title: "Context Precision & Recall", slug: "context-precision-recall", postSlugs: ["context-precision-recall"] },
                    { title: "Synthetic Data Generation", slug: "synthetic-data-generation", postSlugs: ["synthetic-data-generation"] }
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
