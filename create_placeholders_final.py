# INERT: one-off scaffolding from before content moved to MongoDB. The absolute
# path below points at a directory that no longer exists, and the placeholder
# text it writes is exactly what `npm run content:check` now fails on.
import os
import datetime

directory = '/home/manas/WebstormProjects/derpx06-blog/src/app/learn/posts/langchain'
new_topics = [
    # 2. LCEL & Prompt Architecture
    ("lcel-mental-model", "LCEL: Why LangChain Is a Composition Engine"),
    ("runnable-protocol", "The Runnable Protocol (invoke, batch, stream)"),
    ("pipe-operator", "Pipe Operator & Data Flow"),
    ("runnable-lambda", "RunnableLambda & Custom Logic"),
    ("runnable-parallel-branch", "RunnableParallel & Branching"),
    ("prompt-templates", "PromptTemplate vs ChatPromptTemplate"),
    ("message-types", "System, Human, AI Messages"),
    ("prompt-architecture", "Prompt Architecture & Reusability"),
    ("json-mode", "Structured Output with JSON Mode"),
    ("pydantic-parser", "PydanticOutputParser"),
    ("output-fixing-parser", "OutputFixingParser"),
    ("streaming-async", "Streaming Tokens & Async Chains"),

    # 3. Data Ingestion & Preparation
    ("document-object", "The Document Object & Metadata"),
    ("document-loaders", "Loaders: PDF, HTML, Text, Web"),
    ("data-cleaning", "Cleaning & Normalization"),
    ("why-chunking", "Chunking: Why It Exists"),
    ("recursive-splitter", "RecursiveCharacterTextSplitter"),
    ("syntax-aware-splitting", "Token-Aware & Syntax-Aware Splitting"),
    ("markdown-splitting", "Markdown & Code Splitting"),
    ("metadata-enrichment", "Metadata Enrichment Strategies"),
    ("content-deduplication", "Deduplication via Content Hashing"),
    ("lazy-loading", "Lazy Loading & Generators"),

    # 4. Embeddings & Vector Stores
    ("embeddings-practical", "Embeddings: What Matters in Practice"),
    ("embedding-models", "Embedding Models in LangChain"),
    ("vector-stores", "Vector Stores: FAISS, Chroma"),
    ("vector-persistence", "Persisting & Reloading Indexes"),
    ("metadata-filtering", "Metadata Filtering"),
    ("dense-vs-sparse", "Dense vs Sparse (BM25 Overview)"),
    ("hybrid-search", "Hybrid Search Concepts"),

    # 5. Retrieval & RAG Patterns
    ("retriever-interface", "The Retriever Interface"),
    ("mmr-vs-similarity", "Similarity vs MMR"),
    ("multi-query-retrieval", "Multi-Query Retrieval"),
    ("rag-fusion", "RAG-Fusion"),
    ("query-decomposition", "Query Decomposition"),
    ("parent-doc-retrieval", "Parent Document Retrieval"),
    ("contextual-compression", "Contextual Compression"),
    ("reranking", "Post-Retrieval Re-Ranking"),
    ("conversational-rag", "Conversational RAG & History"),

    # 6. Memory & State Management
    ("memory-problems", "Why Memory Breaks Systems"),
    ("window-memory", "ConversationBuffer & Window Memory"),
    ("summary-memory", "ConversationSummaryMemory"),
    ("entity-memory", "Entity Memory"),
    ("session-isolation", "Session Isolation"),
    ("memory-persistence", "Persistence Layers (Redis / DB)"),

    # 7. Tools & Agents
    ("tool-design", "Designing Tool Schemas"),
    ("function-calling", "Function Calling in LangChain"),
    ("tool-selection", "Tool Selection & Validation"),
    ("react-agents", "ReAct Agents"),
    ("plan-solve", "Plan-and-Solve Agents"),
    ("agent-fallbacks", "Fallbacks & Error Handling"),
    ("langgraph-foundations", "LangGraph: Stateful Agents"),
    ("human-in-the-loop", "Human-in-the-Loop"),

    # 8. Production, Evaluation & Governance
    ("high-throughput", "Async & High-Throughput Patterns"),
    ("latency-ttft", "Latency & TTFT Optimization"),
    ("langsmith-tracing", "Tracing with LangSmith"),
    ("rag-evaluation", "RAG Evaluation Basics"),
    ("faithfulness-relevance", "Faithfulness & Relevance"),
    ("prompt-injection", "Prompt Injection Defense"),
    ("guardrails", "Input & Output Guardrails"),
    ("deployment", "Deployment & API Serving")
]

today = datetime.date.today().isoformat()

for slug, title in new_topics:
    filename = f"{slug}.mdx"
    path = os.path.join(directory, filename)
    content = f"""---
title: "{title}"
publishedAt: "{today}"
summary: "Learn about {title}."
---

# {title}

Placeholder content for {title}.
"""
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created {filename}")
