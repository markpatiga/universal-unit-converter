# AI-Assisted Workflow Log

This log records how I used AI throughout the project: the prompts, the decisions, what the AI got wrong, and how I verified its output.

## Phase 0: Design and setup (2026-10-20)

**Goal:** agree on requirements, architecture and plan before writing code; get a placeholder page live on GitHub Pages.

**What I asked the AI to do:**
- Analyze the requirements, list ambiguities, and propose architecture, folder structure, conversion engine design, testing strategy, edge cases and a phased plan, before writing any code.
- Generate the Phase 0 scaffold files.

**Decisions I made (not the AI):**
- Data storage uses binary (IEC) units only: KiB, MiB, GiB (1024-based). The AI proposed both SI and binary; I narrowed the scope.
- Time uses the Julian year (365.25 days), with month = year ÷ 12.

**What the AI got wrong / what I pushed back on:**
- The setup steps assumed npm test would just work. On Windows, PowerShell’s default execution policy blocked npm.ps1. Fixed by setting the policy to RemoteSigned for my user account. Lesson: AI instructions often skip OS-specific setup; check them against your own environment.

**How I verified:**
- Placeholder page loads at the live GitHub Pages URL and shows "JavaScript is running."
- `npm test` passes locally.

## Phase 1: Conversion engine (2026-10-20)

**Goal:** unit data for 8 categories, pure convert/validate/format functions, full test suite. No UI.

**What the AI got wrong / what I checked:**
- Many sources give the US *survey* acre (4046.8726 m²), retired in 2023. We use the
  international acre (4046.8564224 m²). Swapping the old value in makes 2 tests fail.
- The AI claimed −459.67 °F computes slightly below 0 K and "needed" a tolerance.
  Removing the tolerance broke nothing, so the claim was false. Kept as a safety net, comment corrected.

**How I verified:**
- 86 tests pass. I deliberately broke the inch factor and saw 8 targeted failures.
- Checked the 5 defining constants against NIST.

## Phase 2: Core UI (2026-10-20)

**What the AI got wrong / what I checked:**
- The "To" dropdown rendered white text on a white background (it inherited white from the
  navy panel). All scripted tests passed; only the screenshot revealed it. Fixed with an explicit color.
- Plan change: dropped `events.js`; components own their listeners. DESIGN.md updated.

**How I verified:** 94 tests pass; scripted browser run of typing, errors, tab switching and
keyboard navigation; checked at 360px and 1280px; tested on my own phone.

## Phase 3: Swap, Clear, Copy, and the Conversion Formula

**What the AI got wrong / what I checked:**
- Tab order. At first, Clear sat above the input, so pressing Tab from the categories landed on Clear before the box you type in. 
  Moving it inside the input fixed the order. Scripted tab-order checks found this; looking at the page wouldn’t have.
- My own accessibility mistake. I first hid the toast with visibility: hidden, which removes it from what screen readers see, so “Copied”
  might never have been announced. I switched to hiding it with opacity.
- A false alarm, worth noting too. The toast didn’t appear in one screenshot. Before “fixing” anything, I checked: the screenshot
  was taken during the 150 ms fade-in. Not every surprise is a bug, so check before changing code.

## Phase 4: Save recent conversions in the browser

**What the AI got wrong / what I checked:**
- A gap in my own code. My first version checked that the input was valid but not the result. 
  1e300 PiB → bits is a valid input whose result is too big for JavaScript, so it would have been saved and shown as “undefined”.
  I added the check and a test, then removed the check on purpose to confirm the test fails without it.
- Mutation-tested the rules. When I made “switch category” start the save timer, the right test failed.

