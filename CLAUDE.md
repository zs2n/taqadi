# تقاضي الأخوياء — project notes (keep this file short)

## What is live
- The ONLY live game is `game/taqadi.html` — one self-contained HTML file published as a Claude artifact:
  https://claude.ai/artifact/5x3fGN1Cfp3nwYwLFTaiw9
- It runs only inside claude.ai. The judge = `window.claude.use("sample")` (players' own Claude accounts, images allowed); deed image saving = `use("downloads")`. Artifact capabilities: `{"sample":{"images":true},"downloads":{}}`.
- `docs/`, `worker/`, `android/`, `store/`, `README.md` = an ABANDONED server/Android version. Do not read, edit, or "fix" them.

## Save tokens — rules
- Never Read `game/taqadi.html` whole (≈120 KB). Lines 345 (Qirtas logo SVG) and 482 (`JUDGE_ART`, 23 KB) are huge single lines — never print them.
- Find code with `grep -n`, then Read only the needed line range.
- Verify with a syntax check only, no screenshots/browser loops unless asked:
  `python3 -c "import re;s=open('game/taqadi.html').read();open('/tmp/t.js','w').write(re.search(r'<script>(.*)</script>',s,re.S).group(1))" && node --check /tmp/t.js`
- Short replies, in Arabic (Saudi dialect is fine).

## Code map (game/taqadi.html, approx. lines)
- `state` 368 · sound: `playGavel`/`playStamp` 418–434 · `el()` helper 457 · `TONES` (5 judge temperaments) 475 · `JUDGE_ART` 482
- Scene: `person` 488, `ghost` 523, `renderScene` 540
- Setup: `rosterBox` (remembered players, localStorage key `taqadi_roster`) 613, `partyBox` 634, `stageSetup` 663
- Session: `writeStage` 715, `bribeBox` (hidden bribe) 754, `penaltyField` 769, `stageChoice` 778, `stageAnswer` 811
- Verdict: `courtLog` 843, `shareBox` + `deedImage` (canvas PNG) 861–1036, `respBar` 1036, `stageVerdict` 1055
- AI prompts: `buildPrompt` 1140, `interjectPrompt` 1203, `interject` 1219, `judgeCase` 1249
- Router: `go`/`render` 1291

## Conventions
- UI is Arabic RTL. `render()` rebuilds the panel from `state`; add a stage = add a `case` in `render()`.
- Wrap every localStorage access in try/catch.
- Credit is «من إنشاء استوديو قرطاس» with the official Qirtas wordmark; never add a personal name.
- After editing, tell the user the file is ready to republish to the artifact URL above (Claude Code may not be able to publish it itself).
