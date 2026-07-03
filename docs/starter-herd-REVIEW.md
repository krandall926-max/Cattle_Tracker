# Starter herd — please review before trusting

`public/starter-herd.csv` was transcribed **by reading the handwritten tag
sheets** (three photos). Handwriting plus cattle tags is an easy place to make
mistakes, so treat this file as a **draft to check against the originals**, not
as verified truth.

## What was assumed

Every animal defaults to:

- **Breed:** Black Angus
- **Type:** Cow
- **Sex:** Female
- **Status:** Active

These need a human pass:

- **The 7 bulls** are not marked on the sheets — none are flagged as bulls in the
  CSV. Change those animals' Type to **Bull** (and Sex to Male).
- **Red Angus** animals — the sheets don't distinguish color, so all are Black
  Angus. Fix any Red Angus.
- **Milk cows** — only **489** is marked (annotated "Brown Swiss" on the sheet).
  If there's a second "striped" milk cow, set its breed too.

## The `Gen` / `Val` marker

Each tag had a `Gen` or `Val` written next to it. Per instructions this is **not**
part of the tag number, so it's stored in a separate hidden `registry` field
(kept, not shown prominently). Tell me what `Gen`/`Val` actually means and I'll
surface it properly (or drop it).

## Tags flagged `verify` in the notes column

These were hard to read — confirm the exact characters against the paper:

| CSV tag | Uncertainty |
|---|---|
| `K56` | Circled on the sheet — sold/removed? |
| `L21` | Could be `K21` |
| `KL2` / `KL41` / `KL23` / `KL63` / `KL5` / `KL7` / `KL39` / `KL1` | `KL` vs `K`/`L` prefixes are hard to tell apart |
| `KS0` / `KS4` / `KS1` / `K55` / `K59` | `KS` vs `K5` ambiguity |
| `48W` / `5EW` / `W40` | Letter suffix/prefix on the number — confirm |
| `869` | Could be `868` |
| `441` | Could be `444` |
| `906` / `749` / `K381` | Reading unclear |

## How to load it

In the app: **More → Load starter herd from CSV**. It skips any tag already in
the herd, so it's safe to run again after you fix the file. To edit the list,
just change `public/starter-herd.csv` (columns: `tag, breed, type, sex, registry,
notes`) and re-import.

## Count

~126 animals were legible across the three sheets. The operation runs 200+
cow-calf pairs, so this is a starting subset — add the rest (and this year's
calves, linked to their dams) directly in the app or by extending the CSV.
