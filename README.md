# AI Slop Detector

Paste any text. See exactly which patterns give away that an AI wrote it.

## What this does

AI-generated text has tells. Wikipedia's [Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing) page, maintained by WikiProject AI Cleanup, documents 28 distinct patterns observed across thousands of instances of LLM output.

This tool implements 15 pattern categories from that guide as regex matchers. Paste text, and it highlights every match inline, color-coded by category, with a composite "slop score" from 0 to 100.

Everything runs client-side. Nothing leaves your browser. No API calls, no tracking.

## Patterns detected

| Category | What it catches |
|---|---|
| Inflated significance | "pivotal moment", "testament", "vital role", "evolving landscape" |
| Promotional language | "nestled", "vibrant", "breathtaking", "must-visit" |
| AI vocabulary | "delve", "tapestry", "foster", "interplay", "intricate" |
| Superficial -ing phrases | "highlighting...", "ensuring...", "reflecting..." |
| Copula avoidance | "serves as" / "stands as" instead of just "is" |
| Negative parallelisms | "It's not just X; it's Y" |
| Rule of three | Forced triplets in every sentence |
| Chatbot artifacts | "Great question!", "I hope this helps!", "Let's dive in" |
| Em dash overuse | AI loves em dashes more than humans do |
| Excessive hedging | "could potentially possibly be argued" |
| Filler phrases | "In order to", "due to the fact that" |
| Generic conclusions | "The future looks bright. Exciting times lie ahead." |
| False ranges | "From X to Y, from A to B" for fake sweep |
| Vague attributions | "Experts argue", "industry reports suggest" |
| Signposting | Announcing what you're about to say instead of saying it |

## How to use it

**Option 1: Run locally**

```bash
git clone https://github.com/monali_dambre/ai-slop-detector.git
cd ai-slop-detector
npm install
npm run dev
```

**Option 2: Drop into any React project**

The detector is a single self-contained React component (`humanizer.jsx`). Import it and render it. No external dependencies beyond React itself.

```jsx
import AIHumanizer from './humanizer';

function App() {
  return <AIHumanizer />;
}
```

## Who this is for

- Writers editing AI-assisted drafts before publishing
- Content teams reviewing contractor or freelancer submissions
- Anyone who uses ChatGPT/Claude as a starting point and wants to make sure the output doesn't read like a chatbot wrote it
- Editors and reviewers who want a quick sanity check

## How scoring works

The slop score combines two signals: the ratio of flagged words to total words, and the number of distinct pattern categories triggered. A piece of text can have high word count with few flags (low score) or short text packed with AI tells (high score).

| Score | Verdict |
|---|---|
| 0 | Clean — no patterns detected |
| 1-14 | Mostly human — a couple tells, nothing alarming |
| 15-34 | Suspicious — a human editor would catch these |
| 35-59 | Likely AI — multiple patterns, reads like a chatbot |
| 60-79 | AI slop — heavy pattern density |
| 80-100 | Pure slop — textbook LLM output |

## Limitations

This is regex-based pattern matching, not a classifier. It catches surface-level tells, not deeper structural patterns like uniform paragraph length, lack of voice, or suspiciously balanced arguments. It will also flag some legitimate human writing that happens to use these phrases naturally.

Think of it as a linter for AI writing patterns, not a plagiarism detector.

## Built with

- React 18
- CSS variables for light/dark theme support
- JetBrains Mono + DM Sans + Space Mono typography
- Zero external dependencies

## Attribution

Patterns based on [Wikipedia:Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing), maintained by WikiProject AI Cleanup.

## License

MIT
