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
