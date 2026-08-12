# Botpress "IT Learning Advisor" — Round 2 Re-evaluation

**Re-tested:** 2026-08-04, after changes were made to the bot
**Baseline:** [`botpress-chatbot-evaluation.md`](botpress-chatbot-evaluation.md)
**Method:** Same probes, same harness, replayed verbatim against the live bot. New transcripts in [`chatbot-eval-transcripts/v2/`](chatbot-eval-transcripts/v2/).

---

## Verdict

**The two worst findings are fixed.** C1 (interrogation instead of answering) and C7 (double-send) are resolved, and C5 (repetition loop) now escalates. Those were the biggest drags on the experience.

**Nothing outside the bot's prompt/flow changed.** The published widget config is byte-identical to the baseline, so branding, contact details, privacy policy, and site embedding are all still open — as is the handoff gap, which is the one that costs you leads.

---

## Status of every baseline finding

| # | Finding | Severity | Status |
|---|---|---|---|
| C1 | Interrogates instead of answering | Critical | ✅ **Fixed** |
| C2 | Re-asks for info the user already gave | Critical | ❌ Unchanged |
| C3 | 20% of links dead | High | ⚠️ **Sidestepped** — links removed entirely |
| C4 | No handoff / lead capture / CTA | High | ❌ Unchanged |
| C5 | Boilerplate repetition loop | Medium | ✅ **Improved** — now escalates |
| C6 | "knowledge base" leaks to users | Medium | ✅ Not reproduced |
| C7 | Double-send on off-topic rejection | Medium | ✅ **Fixed** |
| C8 | p90 latency 14.1s | Medium | ✅ **Improved** — p90 now 10.5s |
| C9 | Zero branding configuration | Medium | ❌ Unchanged (config byte-identical) |
| C10 | No privacy policy / ToS despite PII | Medium | ❌ Unchanged |
| C11 | Not embedded in the portfolio site | High | ❌ Unchanged (no embed on `origin/main`) |
| C12 | No proactive greeting | Low | ❌ Unchanged |

---

## What got fixed

### C1 — Answers now come first. *(This was the #1 finding.)*

The identical three probes, before and after:

| Question | Before | After |
|---|---|---|
| "Explain what a subnet is" | *"could you tell me your current experience level…?"* (229c) | **A real definition** — logical network segments, broadcast containment, security boundaries (464c) |
| "Should I learn Linux for devops?" | *"Could you share your current experience level…?"* (119c) | **"Yes, learning Linux is highly recommended…"** + what to focus on first (721c) |
| "Is Python needed for cybersecurity?" | *"Could you share your current experience level…?"* (137c) | **"Not strictly required to get started, but highly valuable as you advance"** — genuinely nuanced (732c) |

Measured across the **identical 10-question benchmark set**:

| Metric | Before | After |
|---|---|---|
| Replies under 300 chars (deflections) | **7 / 10** | **1 / 10** |
| Average reply length | 406 chars | **662 chars** (+63%) |

That is the single biggest quality improvement in this round.

### C7 — Double-send is gone.

The laptop-won't-boot probe previously produced two messages 3 seconds apart (a generic deflection, then the real refusal). It now produces **exactly one** message — and a better-worded one, offering to teach IT troubleshooting instead of flatly refusing.

### C5 — The repetition loop now escalates.

Before, six vague inputs produced six near-identical re-asks. Now, after three, the bot gives up asking and just delivers value:

> **User:** hmm
> **Bot:** If you're not sure which IT area to start with, a great foundation is learning basic computer concepts, networking fundamentals, and some programming basics… **Weeks 1-2:** … **Weeks 3-4:** … **Weeks 5-6:** …

That's the right behaviour. It still burns three turns before escalating — two would be better — but the dead-end loop is gone.

### C8 — Tail latency improved, median got slower.

| Metric | Before | After |
|---|---|---|
| p50 | 3.6s | **6.1s** |
| p90 | 14.1s | **10.5s** |
| max | 14.1s | **10.5s** |
| Delivery failures | 0/51 | **0/28** |

The slower median is the *expected cost* of the C1 fix — it's generating real answers now instead of two-line deflections. The worst case improving from 14.1s to 10.5s is the number that matters, and it moved the right way. Still worth confirming the typing indicator is on.

### Bonus: structured plans are now volunteered

Answers now arrive pre-staged with week ranges without being asked ("Stage 1 (Weeks 1-3): Networking Fundamentals…"). Previously this only appeared after an explicit request for a week-by-week plan.

---

## What is still open

### C4 — Still no handoff. *(Highest remaining priority.)*

Identical outcome to the baseline. The wording is warmer; the result is the same:

> **User:** my email is priya.test@example.com and my number is +91 90000 00000, please have someone call me
> **Bot:** I'm not able to arrange a call or connect you directly with a person, but I'm here to help you plan your IT learning journey…

A user who volunteered an email *and* a phone number *and* explicitly asked to be contacted is still turned away. "I am ready to enroll, how do I sign up and who do I pay?" still gets a scope statement, not a next step. Every other fix in this round improves the conversation; this one is the reason the conversation still doesn't lead anywhere.

### C2 — Still re-asks for the skill level.

Verbatim repeat of the baseline failure. Priya states she's a final-year B.Tech student who already knows Python, and is then asked for her experience level on **turn 2 and again on turn 3**:

> **Turn 2 —** "Since you already know Python, could you tell me your current experience level in IT or programming overall? Would you consider yourself a beginner, intermediate, or advanced learner?"
> **Turn 3 —** "…could you tell me your current experience level in IT overall? Would you consider yourself a beginner, intermediate, or advanced learner?"

The bot is clearly *reading* the profile — it uses her name, and it references that she knows Python — it just won't treat that as sufficient to infer a level. Memory recall itself remains perfect (name, course, city, and the revised track all correct on turn 4).

### C3 — Dead links fixed by deleting all links.

**Zero URLs appeared across the entire round-2 test set** (was 15, of which 3 were 404s). Instead it now says things like:

> "Search for 'CompTIA Network+ free course' to find beginner-friendly, vendor-neutral material"
> "free introductory networking courses on platforms like Coursera or freeCodeCamp"

No more broken links — but the user now has to go do their own searching, and named platforms without links are only marginally actionable. The right end state is a small curated link table with a CI link-check, not zero links.

### C9 / C10 / C11 / C12 — untouched

- The config at `20260725111358-EYD38PT5.json` is **byte-identical** to the baseline: `website`, `email`, `phone`, `termsOfService`, `privacyPolicy` all still `{}`. The shareable page still renders as `Webchat Preview - Botpress`.
- Still no privacy notice, while the bot still accepts PII in free text.
- `git grep` for botpress/bpcontent across `origin/main` (HEAD `741d586`) returns **nothing** — the bot is still not embedded in the portfolio.
- Still no proactive greeting before the user's first message.

---

## Updated scorecard

| Dimension | Round 1 | Round 2 |
|---|---|---|
| Conversational efficiency | 3 / 10 | **8 / 10** ⬆ |
| Link accuracy | 4 / 10 | **6 / 10** ⬆ (no dead links, but no links) |
| Reliability of delivery | 8 / 10 | **9 / 10** ⬆ (better tail latency) |
| Factual honesty | 9 / 10 | 9 / 10 |
| In-conversation memory | 8 / 10 | 8 / 10 |
| Depth for advanced users | 8 / 10 | 8 / 10 |
| Business outcome / handoff | 1 / 10 | **1 / 10** ❌ |
| Branding & distribution | 1 / 10 | **1 / 10** ❌ |

**Round 1 summary was "a technically sound engine wrapped in a funnel that goes nowhere." Round 2: the engine is now genuinely good — and the funnel still goes nowhere.** All remaining work is outside the bot's prompt.

---

## Next four actions, in order

1. **Add the handoff.** Fill `configuration.email` / `phone` / `website` in the widget config, and add a flow branch: on `enroll` / `talk to human` / detected contact details → return a real next step instead of a refusal. Highest value remaining, by a wide margin.
2. **Embed it in `index.html`** on `main`, deferred or on first interaction (the bundle is ~1.3 MB). Right now nobody visiting the site can find the bot at all.
3. **Stop re-asking for the skill level.** Infer it from stated context ("final-year B.Tech, knows Python") and hard-cap the question at once per conversation.
4. **Configure branding + privacy** — bot name, `avatar.png`, theme colour, and a privacy policy link, so the shareable link stops presenting as a Botpress demo page and PII collection is disclosed.

Then reinstate a small curated link list with a scheduled link-check, and add a proactive greeting.

---

*UI-layer behaviour (typing indicator, contrast, keyboard navigation, mobile layout) remains untested — the evaluation sandbox has no browser network access.*
