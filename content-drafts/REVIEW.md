# Review before these go out under your name

Eighteen articles were written for you, in first person, with lived detail — that
was the choice you made when asked. This file exists because that choice has a
cost: some of the specifics are things I inferred rather than things I know.

**Everything in the "Verified" column below is real** — it comes from your résumé,
your Hugging Face model card, or the papers themselves, all checked against the
source. **Everything in the "Please confirm or cut" column is my construction.**
It is plausible and consistent with your work, but I was not there. Read those
lines and either make them true or delete them.

Nothing here invents an employer, a job title, a metric, a benchmark result or a
scale claim. The inventions are all of the form *"this specific thing happened
while I was building that real project."*

---

## Blog

### `finetuning-a-05b-model-for-shell-commands`

| Verified | Please confirm or cut |
|---|---|
| Base model `unsloth/qwen2.5-coder-0.5b-instruct-bnb-4bit`, 4-bit, Unsloth + TRL, Apache-2.0, and the HF URL — all from your model card | "My first attempt at a dataset was 'shell commands'… the model got worse at all of them simultaneously" — I do not know your actual dataset iterations |
| That the card documents no dataset, no hyperparameters and no evaluation | "The version that works answers a much smaller question: `find`, `grep`, `ls`, `du`, `tar`, `rsync`" — I inferred this scope |
| | "the whole training run finished in the time it takes to make lunch" — plausible for 0.5B QLoRA, but it is your run |
| | The `r=16, lora_alpha=16` in the code sample — illustrative, not read from your config |
| | **"I shipped it without an evaluation set."** This is the article's emotional core and it is my inference from the empty model card. If you did build one, this section is wrong and needs rewriting. |

### `rag-is-not-a-retrieval-problem`
| Verified | Please confirm or cut |
|---|---|
| AssistFlow AI crawls a customer's site and answers from it; embeddable widget | The whole debugging anecdote: "the top chunk was a navigation menu. The second was a cookie banner. The third was the correct paragraph, cut in half" |
| | "I put this off for far too long" — a characterisation of your process |

### `evals-are-the-only-moat`
| Verified | Please confirm or cut |
|---|---|
| WebGenie's planner / navigator / validator loop, from your project description | "it took me an embarrassingly long time to notice why" |
| | "Once I had made the validator strict, the agent's real failure rate … was much worse than my impression of it had been" |

### `local-first-ai-is-a-systems-problem`
| Verified | Please confirm or cut |
|---|---|
| Outreach AI is local-first, multi-agent, LangGraph + Ollama, with research / profiling / drafting / critic agents | "Written the obvious way … the whole thing ran slower than the sequential version and the machine's fans told the story" |

### `mobile-apps-are-distributed-systems`
| Verified | Please confirm or cut |
|---|---|
| RealEdge: a real-estate CRM you built at Scizers, shipped on Google Play; React Native and Jetpack Compose | The opening scene — "a field salesperson … in a basement showroom" — is illustrative, not a reported incident |
| | The specific CRM conflict examples (deal stage, notes, assigned owner) are my design reasoning, not necessarily RealEdge's schema |

### `what-i-got-wrong-about-document-modelling`
| Verified | Please confirm or cut |
|---|---|
| MongoDB is in your stack; **this site's `content` collection really does have a JSON Schema validator** with required fields, status/section enums and BSON date types | "On a CRM I worked on, contacts and their activity timeline were separate collections … every page load was two round trips and a merge" |
| "it has caught several bad writes from my own scripts" — true of the validator in general; I did not count them | |

### `mcp-is-a-protocol-not-a-plugin-system`, `your-retry-made-it-worse`, `btrees-or-lsm-trees`
No personal anecdotes. These argue from general engineering reasoning only —
nothing to verify beyond the technical claims.

---

## Explainers

All nine are technical exposition with **no personal anecdotes**, except one line
in `lora-low-rank-adaptation` referring to your Qwen fine-tune, which matches the
model card.

Every paper citation was checked against the live arXiv abstract page — title,
full author list in order, year, venue, and every number quoted:

| Article | Source checked |
|---|---|
| `flashattention-io-awareness` | arXiv:2205.14135 — Dao, Fu, Ermon, Rudra, Ré; NeurIPS 2022. The 15% / 3× / 2.4× / 0.7 ppl / 6.4 pt / 61.4% / 63.1% figures are quoted from the abstract |
| `chinchilla-compute-optimal-scaling` | arXiv:2203.15556 — Hoffmann et al.; the "over 400 models", 70M–16B, 5–500B tokens, Chinchilla 70B / 1.4T tokens, ~300B tokens for prior models, 67.5% MMLU, 7% over Gopher, and the three approach names were read from the paper PDF, not from memory |
| `lora-low-rank-adaptation` | arXiv:2106.09685 — Hu et al.; 10,000× / 3× / RoBERTa, DeBERTa, GPT-2, GPT-3 from the abstract |
| `mamba-selective-state-spaces` | arXiv:2312.00752 — Gu, Dao; 5× throughput, million-length, Mamba-3B claims, language/audio/genomics from the abstract |
| `speculative-decoding` | arXiv:2211.17192 — Leviathan, Kalman, Matias; ICML 2023 Oral; 2×–3× on T5-XXL |
| `hnsw-vector-search` | arXiv:1603.09320 — Malkov, Yashunin; logarithmic scaling, multi-layer structure |
| `tokenizers-and-byte-pair-encoding` | arXiv:1508.07909 — Sennrich, Haddow, Birch; ACL 2016 |
| `raft-consensus` | Ongaro & Ousterhout, Stanford, USENIX ATC 2014; three subproblems and three server states read from the paper |
| `quantization-what-breaks-at-4-bits` | GPTQ arXiv:2210.17323, AWQ arXiv:2306.00978, LLM.int8() arXiv:2208.07339 |

`npm run content:check --links` confirmed **zero dead links** across all eighteen.

---

## What to do with this

1. Read the "Please confirm or cut" cells. Each is one or two sentences in the
   article; edit the draft in `content-drafts/`, then `npm run content:import -- --write`.
2. If an anecdote is wrong and you would rather not replace it, deleting the
   paragraph is safe — none of them carry the argument, they illustrate it.
3. `finetuning-a-05b-model-for-shell-commands` needs the closest read. It is the
   most personal piece and therefore the one where an invented detail would be
   most visible to anyone who knows your work.
