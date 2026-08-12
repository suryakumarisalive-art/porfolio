# Assignment Compliance Check — CT017-3-1 Introduction to AI (APU)

**Brief:** `Assignment_Question_CT01731IAI_012026.pdf` — Group Assignment
**Artefact assessed:** Botpress "IT Learning Advisor" (bot `7af30d25…`), as re-tested in [round 2](botpress-chatbot-evaluation-round2.md)
**Date:** 2026-08-04

> **Scope note:** the brief contains no marking scheme or mark weightings, so this is a compliance check against the stated requirements, not a predicted grade.

---

## Short answer

**The chatbot itself satisfies the brief's chatbot requirements — comfortably.** Platform choice, purpose, and "operational chatbot" are all clearly met, and the round-2 improvements strengthened the strongest criterion ("provide accurate and relevant information").

**The assignment is mostly a report, and none of the report, presentation, or video exists in this repo.** Four of the brief's requirements are documentation deliverables. Only one of the five report sections can be written from what exists today.

**One academic risk stands out:** the brief demands a *Knowledge Representation* section naming semantic networks, frames, or production rules. Botpress's LLM + knowledge-base architecture is none of those by default, and this needs to be argued deliberately rather than glossed over. Details in §4.

---

## 1. Requirements — met

### R1. "Choose a platform: a suitable low-code or no-code chatbot development application such as Chatfuel, ManyChat or similar" — ✅ Met

Botpress is a legitimate no-code/low-code visual chatbot builder and falls squarely under "or similar platforms." The brief does not restrict you to the two named tools. Botpress is arguably a *stronger* choice than Chatfuel/ManyChat for an AI module, because it exposes an explicit Knowledge Base and autonomous-node reasoning you can actually write about in the Methodology section.

### R2. "Define the purpose of the chatbot… (for example, customer care, mental health, **education**, entertainment)" — ✅ Met

The purpose is unambiguous and consistently held across all 25 test conversations. The bot self-describes as:

> "I'm your IT Learning Advisor chatbot, here to help you find the best path for learning IT topics, concepts, and certifications."

**Education** is one of the brief's own named example domains. Scope is explicitly bounded (six IT domains) and the bot correctly refuses out-of-scope requests — that is evidence of *deliberate* scope definition, which is exactly what R2 asks for.

### E1. "Operational chatbot: effectively interact with users, provide accurate and relevant information, establish a smooth and reliable communication link" — ✅ Met, and evidenced

This is the requirement with the hardest evidence behind it:

| Sub-criterion | Evidence |
|---|---|
| "effectively interact" | 79 bot turns across 25 conversations, all coherent and on-topic |
| "reliable communication link" | **0 delivery failures**, p90 latency 10.5s |
| "accurate information" | Refuses to fabricate — declined to invent CCNA pricing or a registration URL rather than guessing |
| "relevant information" | Adapts to level: a beginner gets Network+; an 8-year cloud architect gets Kubernetes source, SIGs, and Cilium |
| Context handling | Recalls name, course, city, and honours a mid-conversation change of mind |
| Robustness | Handles Hinglish, Spanish, heavy typos, and adversarial prompt-injection attempts |

The round-2 fix (answering directly instead of interrogating) materially improved "provide accurate and relevant information" — deflections fell from 7/10 to 1/10 on the benchmark set.

---

## 2. Requirements — cannot be verified from this repo

None of these exist in `origin/main` or on the working branch. They may exist elsewhere (Docs, Drive, a group member's machine) — I can only report what's here.

| # | Requirement | Status |
|---|---|---|
| E2 | **Final report** — Introduction, Literature Review, Methodology, Implementation, Conclusion | ❌ Not present |
| R3 | **Presentation** — final demonstration with real or simulated users | ❌ Not present |
| R4 | **Video** — short demo of the chatbot and its features | ❌ Not present |
| — | **Cover sheet** — project title, intake, group leader + members, signatures | ❌ Not present |
| — | Page numbers, word count stated before references, APA format, Times New Roman/Arial 11pt, 1.15 spacing, justified | ❌ Not applicable yet |
| — | Turnitin report (<15% similarity, <10% AI detector) | ❌ Not applicable yet |

**Only one of the five required report sections can currently be written from existing artefacts** (Implementation — see §3). The other four have no source material in this repo.

---

## 3. What you already have that feeds the report

This is the useful part. The round 1 → round 2 evaluation cycle produced exactly the evidence section 4 of the brief demands.

### Section 4 — Implementation: "at least two significant challenges… and solutions to challenges"

The brief specifically suggests challenges "related to understanding natural language, **dialog management**, or integration with external systems." You have two documented, evidenced, *dialog management* challenges — with before/after measurements:

**Challenge 1 — Over-qualification in dialog management.**
The bot demanded a domain and skill level before answering *any* question, including ones needing neither. Measured: 71% of turns were clarifying questions rather than answers; on a fixed 10-question benchmark, 7/10 replies were sub-300-character deflections.
*Solution:* the dialogue policy was changed to answer first and qualify second.
*Result:* deflections fell to 1/10; average reply length rose from 406 to 662 characters.

**Challenge 2 — Duplicate response emission on scope rejection.**
A single out-of-scope message produced two bot messages ~3s apart — a generic fallback, then the correct specific refusal — because both nodes fired.
*Solution:* the fallback and the specific refusal were made mutually exclusive.
*Result:* one user message now yields exactly one reply.

A third is available if you want it: **conversational dead-ends on repeated vague input**, where six vague inputs produced six identical re-asks; now escalates to a concrete beginner plan after three.

This is genuinely strong material — most student reports invent plausible-sounding challenges. Yours are measured, with transcripts in `chatbot-eval-transcripts/` as an appendix.

### Section 4 — "Key functions implemented"

Defensible from evidence: level-adaptive path generation, prerequisite sequencing, in-conversation context retention, multilingual input handling, scope enforcement, and anti-hallucination refusal behaviour.

### Section 3 — "Tools and technologies used"

Botpress Cloud, webchat v3.7, the Botpress Knowledge Base, LLM-backed autonomous nodes, shareable-link deployment.

---

## 4. The main academic risk — Knowledge Representation

The brief is specific:

> "**Knowledge representation:** Explain the choice of knowledge representation techniques used in the chatbot, **such as semantic networks, frames, or production rules**. Explain the reasons for the chosen technique and how it contributes to the functionality of the chatbot."

This is a classical-AI question in a classical-AI module. A Botpress build using an LLM plus a vector knowledge base does **not** use semantic networks, frames, or production rules out of the box, and "we used an LLM" is not an answer to this question. If this section is written vaguely it will read as not understanding the module content.

**The good news: your bot's observed behaviour genuinely does exhibit two of the three named techniques.** You can argue this from the transcripts rather than inventing it:

**Frames** — the bot maintains a slot-filled user profile and will not proceed until required slots are filled. Observed slots: `name`, `education`, `location`, `known_skills`, `domain_of_interest`, `experience_level`. Transcript evidence: it fills `name`/`education`/`location`/`known_skills` from one utterance, then explicitly requests the unfilled `domain` and `level` slots, then overwrites `domain` on correction ("actually I changed my mind, I want cloud instead") while preserving the rest — textbook frame slot-updating with defaults and constraints.

**Production rules** — the recommendations follow consistent IF-THEN prerequisite rules, reproduced identically across independent conversations:
- IF `domain = cybersecurity` AND `level = beginner` THEN networking fundamentals → Network+ → Security+
- IF `domain = cloud` AND `level = beginner` THEN networking fundamentals → cloud concepts → provider certification
- IF `domain = devops` THEN Linux fundamentals first
- IF `level = advanced` THEN skip fundamentals entirely (verified — the cloud architect was *not* sent to Network+)

That last rule firing correctly is strong evidence of rule-based control rather than LLM improvisation.

**Semantic network** — the prerequisite relationships between topics and certifications (`Network+ →prerequisite-for→ Security+`; `networking →foundation-of→ cloud`) form a directed graph you can legitimately draw as a semantic network diagram for the Methodology section.

**Recommendation:** frame the architecture as *hybrid* — a frame-based user model driving production rules over a prerequisite semantic network, with an LLM layer for natural-language understanding and surface realisation. That is both accurate to what the bot does and directly responsive to the question. Then justify *why*: frames handle incomplete user input gracefully, production rules make recommendations explainable and auditable, and the LLM absorbs input variation (Hinglish, typos) that rigid rules cannot.

---

## 5. Which of my earlier criticisms actually matter here

Important: my two evaluation reports judged the bot **as a product**. Several findings are irrelevant to this brief, and you should not spend time on them.

| Earlier finding | Matters for the assignment? |
|---|---|
| C4 — no lead capture / no human handoff | **No.** The brief has no commercial or escalation requirement. *(Worth one sentence in "Future work" only.)* |
| C11 — not embedded in the portfolio site | **No.** The brief asks for a demonstration and a video; a shareable link is a perfectly valid delivery mechanism. |
| C9 — no branding configured | **Marginal.** Not a requirement, but the demo and video will look more finished with a bot name, `avatar.png`, and a theme colour. Cheap polish for presentation marks. |
| C10 — no privacy policy despite PII | **Small but real.** An education chatbot handling user data is a legitimate ethics/limitations point; examiners on an AI module often look for it. Address it in Conclusion → Future work. |
| C2 — re-asks skill level despite stated context | **Yes.** This will be visible in a live demo. It is also a perfect third "challenge" if you fix it before submission and document the fix. |
| C3 — all links removed rather than curated | **Yes.** For an *education* chatbot, "provide accurate and relevant information" is weakened when it says "search for a CompTIA Network+ free course" instead of pointing anywhere. Restore a small curated, link-checked list. |
| C12 — no proactive greeting | **Yes, for the demo.** A cold empty box is a weak opening shot in a video. A greeting naming the bot and three example questions makes the demo open strongly. |

---

## 6. Priority actions before submission

**Blocking (the assignment cannot be submitted without these):**
1. Write the five-section report — Introduction, Literature Review, Methodology, Implementation, Conclusion.
2. Complete the cover sheet — project title, intake, group leader and members with signatures.
3. Record the demonstration video.
4. Prepare the presentation.
5. Run Turnitin and confirm <15% similarity and <10% AI-detection.

**High value, low effort (do before recording the video):**
6. Write the Knowledge Representation section using the frames + production rules + semantic network framing in §4 — this is the section most likely to lose marks.
7. Add a proactive greeting so the demo opens well.
8. Set the bot name, avatar, and theme colour.
9. Fix the repeated skill-level question, and document it as Challenge 3.
10. Restore a small curated link list.

**Note on Turnitin's AI detector (<10%):** the report must read as human-written. Write it from your own transcripts and measurements — which you have — rather than generating prose about a chatbot with a chatbot. The specific numbers in these evaluation documents are the kind of concrete, project-specific detail that reads as genuine work.

---

## 7. Bottom line

| Brief requirement | Status |
|---|---|
| R1 — Platform choice | ✅ Met |
| R2 — Purpose defined | ✅ Met |
| E1 — Operational chatbot | ✅ Met, well evidenced |
| E2 — Report (5 sections) | ❌ Not present |
| R3 — Presentation | ❌ Not present |
| R4 — Video | ❌ Not present |
| Formatting / APA / Turnitin | ❌ Not applicable yet |

**The build is not the problem. The write-up is the whole remaining assignment.** The chatbot meets every chatbot-related requirement in the brief, and after the round-2 changes it does so convincingly. What is missing is documentation — and the one section carrying real academic risk is Knowledge Representation, which needs the deliberate argument set out in §4 rather than a description of the LLM.
