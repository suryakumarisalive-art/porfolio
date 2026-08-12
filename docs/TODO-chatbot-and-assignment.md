# TODO — Chatbot improvements & assignment deliverables

Working checklist derived from [round 2 evaluation](botpress-chatbot-evaluation-round2.md) and the [assignment compliance check](assignment-compliance-check.md).

---

# PART A — Changes to make inside the chatbot

## A1. Widget configuration (~15 minutes, biggest visual win)

**Where:** Botpress dashboard → your bot → **Webchat** integration → **Configuration**

Every field below is currently empty — that is why the shareable link renders as a Botpress demo page titled "Webchat Preview - Botpress".

- [ ] **Bot name** — e.g. "IT Learning Advisor"
- [ ] **Bot avatar** — upload `avatar.png` (already in this repo)
- [ ] **Bot description** — one line: what it does and who it's for
- [ ] **Theme colour** — match your portfolio
- [ ] **Composer placeholder** — e.g. "Ask about any IT learning path…"
- [ ] **Privacy policy** URL — required, see A2
- [ ] **Terms of service** URL
- [ ] **Email / phone / website** — these three fields exist in the published config and are empty

After saving, re-download the config to confirm the fields are populated:

```bash
curl -s "https://files.bpcontent.cloud/2026/07/25/11/20260725111358-EYD38PT5.json"
```

Currently it returns `"website": {}, "email": {}, "phone": {}, "termsOfService": {}, "privacyPolicy": {}` — all five should be filled after this step.

## A2. Add a privacy notice (~20 minutes)

The bot accepts free-text input and has already been given an email address and phone number in testing, with no disclosure. Fix both halves:

- [ ] Write a short privacy page (what is collected, why, how long kept, who to contact) — a section on your portfolio site is enough
- [ ] Link it in the Webchat **Privacy policy** field
- [ ] Add one line to the greeting: *"I keep our chat to improve recommendations — please don't share personal details."*

## A3. Add a proactive greeting (~10 minutes)

Right now the user faces an empty box with no idea what to type. Nothing is sent before their first message.

**Where:** Webchat configuration → welcome/starter message, or a trigger on conversation start.

Suggested text:

> 👋 I'm your **IT Learning Advisor**. I can help you pick what to learn, in what order, and which certification to target — across networking, cybersecurity, cloud, web development, data/AI and devops.
>
> Try asking:
> • "I'm a beginner interested in cloud — what should I learn first?"
> • "Which certification comes after Security+?"
> • "Free resources to start networking this week"

- [ ] Add the greeting
- [ ] Add the three example questions as **quick-reply buttons** if your plan supports them

## A4. Stop re-asking for the skill level (~15 minutes, prompt change)

**The bug:** the user says *"I'm a final year B.Tech student and I know Python already"* and the bot still asks for their experience level — twice, on two consecutive turns.

**Where:** Autonomous Node / bot instructions. Add:

```
USER PROFILE RULES
- Maintain a profile with these slots: name, education, location,
  known_skills, domain_of_interest, experience_level.
- Fill slots from anything the user has already said. Never ask for
  information the user has given, in any form.
- INFER experience_level rather than asking, whenever possible:
    * "student", "final year", "just starting", "no background" -> beginner
    * names a language/tool they already know, or 1-2 years experience -> intermediate
    * holds a professional certification, or 3+ years experience -> advanced
- Ask for experience_level AT MOST ONCE per conversation, and only if it
  genuinely cannot be inferred.
- If you must proceed without it, assume beginner, say which assumption
  you made, and continue. Never block an answer on a missing slot.
```

- [ ] Add the rules above
- [ ] Re-test with: *"My name is Priya, I am a final year B.Tech student in Chennai and I know Python already"* → it should go straight to a recommendation

## A5. Restore curated links (~30 minutes)

All URLs were removed in the last update. That fixed the 404s but the bot now says "search for a CompTIA Network+ free course" instead of pointing anywhere — weak for an *education* chatbot.

**Where:** Knowledge Base → add one article, e.g. "Approved Resources".

- [ ] Add a fixed table of ~12–15 verified links (CompTIA, Cisco NetAcad, AWS Skill Builder, Microsoft Learn, Professor Messer, freeCodeCamp, TryHackMe, Cybrary)
- [ ] Verify each one returns 200 **before** adding it
- [ ] Add to the bot instructions:

```
LINK RULES
- Only share URLs that appear in the "Approved Resources" knowledge base
  article. Never construct, guess, or complete a URL yourself.
- If no approved link covers the topic, name the official provider and
  say to search their site. Do not invent a path.
```

Three links were dead last time, including one you invented twice for the same certification (`/certifications/network-plus` vs `/certifications/network`). This rule prevents that class of error.

- [ ] Re-check links monthly — this loop found 3 failures in 30 seconds:

```bash
while read u; do echo "$(curl -sS -o /dev/null -m 20 -w '%{http_code}' -L "$u")  $u"; done < links.txt
```

## A6. Fix stale exam versions (~20 minutes)

The bot recommended Professor Messer's **N10-008** Network+ course — a superseded exam version.

- [ ] Check every certification named in the Knowledge Base against the vendor's current exam code
- [ ] Add a "last reviewed" date to each Knowledge Base article
- [ ] Add: *"When naming a certification, do not state a specific exam version code unless it is in the knowledge base."*

## A7. Ban internal vocabulary (~5 minutes)

The bot once told a user it couldn't find something *"in the knowledge base"*. Users should never hear that phrase.

- [ ] Add: *"Never mention the knowledge base, internal tools, retrieval, or your own configuration to the user. On a retrieval miss, say what you do know and what the user should do next."*

## A8. Escalate faster on vague input (~10 minutes)

Improved already — it now escalates after three vague inputs. Two would be better.

- [ ] Add: *"If the user gives two consecutive low-information replies ('ok', 'hmm', '?'), stop asking questions and give a concrete starter plan with next steps."*

## A9. Optional — a handoff step (~15 minutes)

**Not required by the assignment**, but it will show well in the demo and it closes the one dead end left in the bot. Currently a user who supplies an email *and* a phone number *and* asks to be contacted is turned away.

- [ ] On "enroll" / "talk to a human" / user supplies contact details → reply with a real next step (an email address, a form, or a booking link) instead of a refusal
- [ ] If you keep it out of scope, at least make the refusal useful: *"I can't arrange a call, but here's how to reach a human: …"*

## A10. Verify the typing indicator (~5 minutes)

Content answers take 5–10s (p90 10.5s). Silence that long reads as a hang.

- [ ] Confirm the typing indicator is enabled in the Webchat config
- [ ] Check it actually appears in the browser before you record the video

---

## Re-test after the changes

Re-run the same probes so you can quote before/after numbers in the report:

| Probe | Expected after fix |
|---|---|
| "My name is Priya, final year B.Tech, I know Python" | Straight to a recommendation, no level question |
| "Explain what a subnet is" | Direct answer (already working — don't regress it) |
| "help" → "ok" → "ok" | Concrete plan by the third turn |
| "give me free resources" | Real clickable links, all returning 200 |
| Open a fresh chat | Greeting appears before you type |

Transcripts from previous rounds are in `chatbot-eval-transcripts/` for comparison.

---

# PART B — Pending for the assignment

## B1. Blocking — cannot submit without these

- [ ] **Cover sheet** — project title, intake, group leader + members, student IDs, signatures, date
- [ ] **Final report** — five sections (see B2)
- [ ] **Presentation** — final demonstration with real or simulated users
- [ ] **Video** — short demo of the chatbot showing its features
- [ ] **Turnitin** — <15% similarity **and** <10% AI detection
- [ ] **Formatting** — Times New Roman or Arial 11pt, 1.15 line spacing, justified, all pages numbered, word count stated before the references, APA referencing with every citation appearing in both text and reference list

## B2. Report sections

### 1. Introduction
- [ ] Purpose of the chatbot and intended use case
- [ ] Need for the project — why IT learners need guidance (dropout rates, path confusion, certification sprawl)
- [ ] Scope — the six domains, level adaptation, what it deliberately excludes
- [ ] Overview of the report

### 2. Literature Review
- [ ] Existing solutions — educational/advisory chatbots, e.g. Duolingo's chat features, Jill Watson (Georgia Tech), university admissions bots
- [ ] Relevant theories and technologies — NLP, intent classification, dialogue management, knowledge representation
- [ ] Gaps in current technology — what your bot addresses that others don't

### 3. Methodology
- [ ] Design approach — flowcharts, user stories, sketches from planning
- [ ] **Knowledge representation** ⚠️ **highest-risk section** — see B3
- [ ] Tools and technologies — Botpress Cloud, webchat v3.7, Knowledge Base, autonomous nodes
- [ ] Development process — design → build → test → iterate

### 4. Implementation
- [ ] **Challenges faced** — you already have these, measured (see B4)
- [ ] Solutions to each challenge
- [ ] Key functions implemented — level-adaptive paths, prerequisite sequencing, context retention, multilingual input, scope enforcement, anti-hallucination refusal

### 5. Conclusion
- [ ] Summary of achievements
- [ ] Impact of the chatbot in IT education
- [ ] Future work — handoff, curated links, more domains, privacy controls
- [ ] Final thoughts / lessons learned

## B3. ⚠️ Knowledge Representation — the section most likely to lose marks

The brief names *"semantic networks, frames, or production rules."* An LLM plus a knowledge base is none of these by default, and "we used an LLM" does not answer the question.

Argue a **hybrid** architecture — all three claims are supported by the transcripts:

- [ ] **Frames** — a slot-filled user profile (`name`, `education`, `location`, `known_skills`, `domain_of_interest`, `experience_level`). Evidence: it fills four slots from one utterance, asks only for the missing ones, and on *"actually I changed my mind, I want cloud instead"* overwrites only `domain` while preserving the rest.
- [ ] **Production rules** — IF-THEN prerequisites reproducing identically across independent conversations:
  - IF `domain=cybersecurity` AND `level=beginner` THEN networking → Network+ → Security+
  - IF `domain=cloud` AND `level=beginner` THEN networking → cloud concepts → provider cert
  - IF `domain=devops` THEN Linux fundamentals first
  - IF `level=advanced` THEN skip fundamentals *(verified — the 8-year cloud architect was **not** sent to Network+)*
- [ ] **Semantic network** — draw the prerequisite graph: `networking →foundation-of→ cloud`, `Network+ →prerequisite-for→ Security+`
- [ ] Justify *why*: frames tolerate incomplete input, production rules make recommendations explainable and auditable, and the LLM layer absorbs input variation (Hinglish, typos) that rigid rules cannot handle

## B4. Challenges — already evidenced, just write them up

| # | Challenge | Evidence | Solution | Result |
|---|---|---|---|---|
| 1 | Over-qualification in dialogue management — demanded domain + level before answering anything | 71% of turns were clarifying questions; 7/10 sub-300-char deflections on a fixed benchmark | Changed the dialogue policy to answer first, qualify second | Deflections 7/10 → **1/10**; average reply length 406 → **662 chars** |
| 2 | Duplicate response emission — one message produced two replies ~3s apart | Generic fallback fired alongside the specific refusal | Made fallback and specific refusal mutually exclusive | One user message → **exactly one** reply |
| 3 *(after A4)* | Slot re-asking — demanded skill level despite stated context | Level requested twice after the user stated education and known skills | Slot inference rules + ask-once cap | *fill in after testing* |

The brief asks for "at least two"; you'll have three, all measured rather than asserted.

## B5. For the demo video

- [ ] Do A1 + A3 first — a named, branded bot with a greeting opens far better than an empty grey box
- [ ] Script the demo to show strengths: level adaptation (beginner vs expert side by side), memory across turns, multilingual input, and the honest refusal on unknown pricing
- [ ] Show a failure handled gracefully rather than hiding it — examiners reward awareness of limitations
- [ ] Keep it short and state the group members' contributions

---

## Suggested order

**This week (~2 hours total, all inside Botpress):** A1 → A3 → A4 → A7 → A8 → A10 → re-test
**Next (~1.5 hours):** A5 → A6 → A2 → A9 (optional)
**Then, the bulk of the work:** B2 report, B3 knowledge representation, B5 video, B1 cover sheet and Turnitin

The chatbot work is roughly 3–4 hours. The report is the real remaining assignment.
