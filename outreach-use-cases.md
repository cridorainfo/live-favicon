# live-favicon — outreach use cases

Ten globally recognized products, each with a real, specific moment in their
own UI where a user is waiting on something and has no way to know it's done
without leaving the tab open and watching. For each: the actual pain point,
the staged sequence of states across that moment, the code, and a one-line
pitch angle you can drop into an email.

**Every one of these is already running live on the site** — the Showcase
section renders each company's own mini tab icon in their real brand color,
cycling through the exact stages listed below, built from the same
`spinner()` / `iconBadge()` primitives any team can `favicon.define()` for
themselves. That's the single strongest thing to put in front of a
recipient: not a description of the idea, but their own product's flow
already animating.

Live demo + showcase: **https://cridorainfo.github.io/live-favicon/#showcase**
Source: **https://github.com/cridorainfo/live-favicon**

---

## 1. ChatGPT (OpenAI)

**The moment:** A long response — especially with browsing, code
interpreter, or an agentic tool loop — streams for 10–60+ seconds. Users
routinely alt-tab to check email or Slack while it finishes, then have to
keep flipping back to see if it's done.

**Stages:** Thinking → Answer ready

**Integration:**
```js
favicon.thinking();       // while the model is generating/using a tool
await streamResponse();
favicon.success();        // response ready
// or favicon.error() if generation is interrupted/fails
```

**Pitch angle:** "Your users already tab away during long generations —
right now that means guessing when to come back. A live tab icon turns that
guess into a glance."

---

## 2. Claude (Anthropic)

**The moment:** Extended thinking, multi-step tool use, and Artifact
generation can run well past what a user will sit and watch — particularly
in Claude Code or agentic workflows where a task can take minutes.

**Stages:** Thinking → Using tools → Ready

**Integration:**
```js
favicon.thinking();        // extended thinking
favicon.processing();      // tool use / an Artifact rendering
await runAgenticTask();
favicon.notification();    // task finished, needs the user's attention
```

**Pitch angle:** "Claude Code sessions already run in the background while
people context-switch — the tab itself could tell them the moment it's
waiting on them again."

---

## 3. YouTube

**The moment:** After upload, Studio shows "Processing HD versions..." —
often minutes to hours. Creators switch tabs constantly and have to
manually reload Studio to check progress.

**Stages:** Uploading → Processing → Ready to watch

**Integration:**
```js
favicon.uploading();
favicon.progress(percentComplete);   // bind to the real transcode %
favicon.success();                   // all resolutions ready
```

**Pitch angle:** "Creators already leave the upload tab open and forget
about it — the favicon could be the thing that reminds them it's ready,
without another email or push notification."

---

## 4. GitHub

**The moment:** Actions workflow runs and PR status checks are a textbook
watch-and-wait — minutes of CI, with the outcome (pass/fail) mattering more
than anything else on the page.

**Stages:** Running checks → Checks passed (or failed)

**Integration:**
```js
favicon.processing();   // workflow run in progress
favicon.success();      // all checks passed
favicon.error();        // a check failed
```

**Pitch angle:** "GitHub already tints the favicon for CI status — this
would make that live and animated instead of a static icon swap, visible
the instant a run finishes rather than only on reload."

---

## 5. Vercel

**The moment:** A deploy (build + deploy) commonly takes 30 seconds to a
few minutes. The audience watching the deployment log is, almost by
definition, developers — exactly the people who'd immediately get what a
live tab status is doing.

**Stages:** Building → Deployed (or failed)

**Integration:**
```js
favicon.processing();   // build/deploy in progress
favicon.success();      // deployed
favicon.error();        // build failed
```

**Pitch angle:** "Your own users are developers — the same people this
library is built for. A live deploy-status favicon is a feature Vercel's
audience would recognize and want immediately."

---

## 6. Figma

**The moment:** Exporting large frames, boards, or prototypes to PNG/PDF
takes real time, and Figma's own "Saving..." indicator lives inside the
canvas — invisible the second you switch tabs.

**Stages:** Rendering export → Export ready

**Integration:**
```js
favicon.processing();   // export rendering
favicon.syncing();      // mirrors the in-canvas "Saving..." indicator
favicon.success();      // export ready to download
```

**Pitch angle:** "Figma already tells people it's saving — just not
anywhere they can see once they've tabbed away to reference another file."

---

## 7. Canva

**The moment:** Exporting a video design or a large multi-page print file
routinely takes over a minute; users switch to another tab while "Preparing
your download..." runs.

**Stages:** Preparing → Download ready

**Integration:**
```js
favicon.processing();
favicon.progress(percentComplete);
favicon.success();      // download ready
```

**Pitch angle:** "The 'Preparing your download' toast disappears the
moment someone switches tabs — the browser icon doesn't have to."

---

## 8. Notion

**The moment:** Notion AI generation (drafting, summarizing, building a
page) takes several seconds to a minute, and page sync status is only
visible while looking directly at the page.

**Stages:** Generating → Draft ready

**Integration:**
```js
favicon.thinking();     // Notion AI generating
favicon.success();      // done
favicon.syncing();      // save/sync status, visible from the tab strip
```

**Pitch angle:** "People ask Notion AI to draft something and switch to
another tab while it thinks — right now there's no way to know it's done
without checking back."

---

## 9. Dropbox

**The moment:** Uploading or syncing large files/folders through the web
client — the canonical "long-running transfer users forget about" case.

**Stages:** Syncing → Synced

**Integration:**
```js
favicon.uploading();    // or .downloading()
favicon.progress(percentComplete);
favicon.success();
```

**Pitch angle:** "Dropbox already put a sync icon on every file — this is
the same idea, one level up, on the tab itself."

---

## 10. Zoom

**The moment:** After a cloud meeting ends, "Your recording is being
processed" can take 10–30+ minutes. Hosts routinely forget the tab
entirely and have to come back later to check the recordings page.

**Stages:** Processing recording → Ready to share

**Integration:**
```js
favicon.processing();     // recording rendering
favicon.notification();   // ready to share
```

**Pitch angle:** "Meeting hosts already leave this tab open and forget
about it for half an hour — a live favicon is the reminder that's already
sitting right there in the tab strip."

---

## Going further: their own brand, their own states

Every stage above uses only the built-in states. But the library also lets
any team register their **own** named states in their own brand color, with
zero canvas code:

```js
import favicon, { spinner, iconBadge } from "@live-favicon/core";

favicon.define("researching", spinner("#10A37F"));   // e.g. ChatGPT's green
favicon.define("blocked", iconBadge("#DC2626", "!"));

favicon.state("researching");
```

Worth a line in the email for a technical recipient — it means the pitch
isn't "use our 14 presets," it's "the tab can carry *your* product's exact
states, in *your* brand color."

---

## A ready-to-adapt email skeleton

```
Subject: A small idea for [Product]'s [specific waiting moment]

Hi [name],

I noticed [Product] has [the specific moment — e.g. "a 'Processing HD
versions' step after upload that can run for a while"]. I built a small
open-source library, live-favicon, that turns exactly that kind of wait
into a live status on the browser tab itself — so users don't have to
keep the tab in view (or keep re-checking it) to know when something's
done.

There's actually a live, running mini version of [Product]'s own flow on
the site right now — worth a 10-second look:
https://cridorainfo.github.io/live-favicon/#showcase

And the full interactive demo (click "Start task," then switch tabs):
https://cridorainfo.github.io/live-favicon/

It's MIT-licensed, ~3KB, zero dependencies, and the integration for a case
like [Product]'s would be close to:

[paste the relevant code snippet from above]

Happy to talk through it if it's useful — no obligation either way.

[your name]
```

Swap in the specific pain point and code snippet per company from above —
that specificity, plus pointing them at their own card already running on
the site, is what makes it read as "I actually looked at your product"
rather than a form email.
