# Codex preview layout

The fixed layout for `/understand` in the Codex design preview, the inline view from the bundled
`visualize` plugin. Read the `visualize` skill in full first. Its rules apply to this layout,
and where they disagree with `template.html`, `visualize` wins.

The preview shows the same four sections and the same facts as the HTML page, but it does not
try to look like it. Every preview uses this layout, so two of them can be compared side by side.

## Fragment

- One root `<div id="understand-<target-slug>">`. Use `visualize`'s theme variables, utility
  classes and type scale. Only weights 400 and 500, and no custom font sizes or line heights.
- No paragraphs inside the fragment. The headline, each section's one-line explanation and the
  concept descriptions go in the chat reply, in the same order as the sections.
- Nothing scrolls inside the fragment. Each SVG sizes itself from its container. Below about
  600px, cards and panels stack into one column.
- Each section starts with an `h2` holding its number and name: `1 The picture`,
  `2 Concepts in code`, `3 Flows step by step`, `4 Left out`.

## Sections

1. **The picture.** The before diagram above the after diagram. Same nodes, numbered data flow
   edges, contract tags and new/removed marks as the page. Draw them in `currentColor` and series variables
   (`--viz-series-1` for the main flow, `--viz-series-2` for a second flow). Below them, one
   card per shift in the model, each holding the question as its label, the old value
   struck through, and the new value.
2. **Concepts in code.** First one card per contract: the badge with its edge numbers, the
   name, its state, producer → consumer and the kind, and one line per field, with added fields
   prefixed `+`, changed ones `~` and removed ones struck through, then the definition link. Then a row of label and value
   pairs for lines per concept, with no stacked bar. Then one card per concept: the badge with its edge numbers, the name, and file chips
   grouped by where they live. Chips show `+added −removed`. Removed files are struck through,
   local-only files say "local", and proposed files say "proposed". Links follow the same
   evidence rules as the page.
3. **Flows step by step.** For each flow, a numbered list with one step per line in the form
   `actor → actor: message`, each followed by its code link. At 600px and wider, a sequence
   diagram drawn from the container width can sit above the list. Below that width, show the
   list only.
4. **Left out.** One card per non-empty group: outside the code, testing aids, known limits,
   not run. Each item is a short line with its source link. A rollout window is a row of three
   labelled segments, with the outage segment in `--destructive`.

## Chat reply

Fill this outline, around the visualization reference line that `visualize` requires:

```
<headline: what changes, one sentence>

1 The picture: <one sentence>
2 Concepts in code: <one sentence on the contracts, then one sentence per concept>
<visualization reference line>
3 Flows: <one sentence per flow>
4 Left out: <one sentence>
```
