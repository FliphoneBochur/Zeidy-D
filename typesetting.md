# Typesetting Pipeline Notes

## Goal

Typeset the existing Word documents into a print-ready book, likely in either 5x8 or 6x9 trim size.

The book should preserve the main document content structure:

- centered article titles
- paragraph breaks
- mixed Hebrew/English text
- per-article footer link
- per-article QR image

Each leaf directory already has the QR image to use. The footer link should be the leaf route from `routes.json`, for example:

`https://zeidyd.com/bereshis/5784/`

## Current Approach

Use a generated Typst pipeline:

1. `routes.json` is the source of truth for each leaf's route, content directory, and base filename.
2. `build-typeset-proof.js` reads selected routes.
3. Full-book order starts with `Rabbi Oelbaum Haskama`, then `About the Name`, then the regular route order beginning with Bereshis.
4. Pandoc converts each `.docx` to Typst body content.
5. The generator strips the duplicate first-line title from Pandoc output.
6. The generator adds a consistent centered Typst heading.
7. The generator sets a per-article page footer with the route link, QR image, and page number.
8. Typst compiles the generated `.typ` file to PDF.

Commands:

```sh
npm run build-typeset-proof
npm run build-typeset-proof -- --size 5x8 --limit 8 --output proof-5x8
npm run build-typeset-proof -- --route /bereshis/5784/ --route /noach/5786/
npm run build-typeset-proof -- --all --output book-6x9
npm run choose-route-titles -- --dry-run
npm run choose-route-titles
npm run editorial-scan
npm run review-spelling
npm run apply-reviewed-spelling
npm run scan-bidi-risks
npm run test-typesetting-rules
```

Outputs are written to `typeset/`, for example:

- `typeset/proof.typ`
- `typeset/proof.pdf`

## Why Typst

Typst gives us a programmable PDF layout without having to maintain a fragile Word workflow. It is much easier to iterate than LaTeX and should be a good fit for page size, margins, headings, footers, page numbers, links, and QR images.

Pandoc already supports Typst output, so the `.docx` files can stay as the source content for now.

## Open Design Decisions

- Final trim size: compare 5x8 vs 6x9 proof output.
- Final font. Current proof uses `Times New Roman` at 11pt for body text and article titles.
- Route entries can include an optional `title`. The typesetting build uses `title` for the visible article heading when present, otherwise it falls back to `baseFilename`.
- Use `npm run choose-route-titles` to review source-title conflicts one at a time and save chosen titles into `routes.json`.
- Footer convention: odd page numbers on bottom right, even page numbers on bottom left. QR code and route link go on the opposite side from the page number, with the link aligned to the bottom of the QR image. On the left side the order is QR then link; on the right side the order is link then QR.
- `About the Name` is front matter and intentionally has no QR/footer link block.
- Whether the footer appears on every article page or only the first page of each article.
- Whether each article should always start on a new page, a right-hand page, or flow continuously.
- Whether to preserve Word bold/italic/footnotes exactly if they appear in later documents.
- Whether to fix literal Hebrew/English missing spaces in the `.docx` source before full-book conversion.

## Known Risks

- Mixed Hebrew/English line breaking needs visual review. The source PDFs can look fine even when extracted text has literal missing spaces.
- Mixed Hebrew/English punctuation can render in surprising visual order if Hebrew runs are not isolated in the generated Typst.
- Pandoc's Typst output preserves paragraphs well, but not all Word layout details should be trusted without proofing.
- QR images are included from each leaf directory by basename. Missing or mismatched QR filenames will fail the build.
- The current proof uses the first routes in `routes.json` by default, not the full book.

## Next Steps

1. Generate 5x8 and 6x9 sample PDFs.
2. Visually inspect Hebrew/English order, line breaks, title spacing, and footer layout.
3. Decide footer behavior and preferred trim size.
4. Add a full-book build mode once the proof styling is acceptable.
5. Add section/chumash dividers and table of contents after the article-level layout is stable.

## Editorial Review

`editorial-scan.js` creates `editorial-report.md` for human review. It does not edit Word documents.

The report includes:

- possible spelling errors after dictionary and Torah-term allowlist filtering
- possible joined English words
- known variant spellings such as `Yom Kippur` / `Yom Kipper`
- punctuation and capitalization variants

All edits remain manual until an explicit apply workflow is designed.

`review-spelling-candidates.js` reads the spelling candidates from `editorial-report.md` and prompts through them one at a time. It records decisions in `spelling-review.json`:

- `allow`: the word is correct and should not be fixed
- `fix`: the word needs correction, with the approved replacement
- `unsure`: needs later review

This review script also does not edit Word documents.

`apply-reviewed-spelling.js` applies only entries in `spelling-review.json` that were marked `fix` with a correction. It edits the matching `.docx` files in place.

`replace-docx-text.js` is a more general exact replacement helper. It is dry-run by default and edits `.docx` files only with `--apply`, for example:

```sh
npm run replace-docx-text -- --from Kipper --to Kippur --word
npm run replace-docx-text -- --from Kipper --to Kippur --word --apply
```

## Bidi Review

`scan-bidi-risks.js` creates `bidi-risk-report.md`. It does not edit Word documents. It scans extracted document text for mixed Hebrew/English patterns that are more likely to render incorrectly in the typeset PDF, especially Hebrew near punctuation or numbers.

The typesetting build wraps Hebrew phrases in Unicode RTL isolates before Typst compilation. This keeps English paragraph flow left-to-right while letting each Hebrew phrase render in its own right-to-left context. The wrapper spans whitespace/newlines inside Hebrew phrases, so a phrase like `הקדוש ברוך הוא` stays together even if Pandoc wrapped the generated Typst source between words. Hebrew acronym-style tokens with internal quotes, such as `רש"י`, `רמב"ם`, and `ש"ך`, are handled as protected acronym tokens so the quote mark does not split the word. Short acronym phrases, such as `יסודותדיק רמב"ן` and `שובבים ת"ת`, are protected together so the words do not swap order in an English sentence. Single-letter geresh words inside Hebrew phrases, such as `ה׳`, remain part of the RTL phrase rather than being treated as acronyms. Hebrew source references in parentheses are protected as one sequence when they contain a reference marker, such as a colon or a strong acronym token. This covers examples like `(משלי ו:כג)`, `(דברים כ״ח:מ״ז)`, `(ס׳ ע״ב)`, and `(ע״ש יבמות ס״א ע״א)` without treating ordinary parenthesized Hebrew like `(מנורה)` as a source reference. Extracted `, ,Hebrew phrase English` cases are normalized to `, Hebrew phrase, English`, for example `משה, אֱחוֹז בְּכִסֵּא כְבוֹדִי, symbolizes`. General punctuation spacing is normalized before bidi isolation, so comma lists like `נזיקין, בבא קמא, בבא מציעא`, dash explanations like `לָבוֹא - First`, em dash characters `\u2014` replaced one-for-one with `-`, numeric references like `(25:7)`, loose citations like `ישעיהו ו׳:ג׳)) מְלֹא`, and post-citation starts like `): כִּי` render with normal spaces, while Hebrew citation colons like `כ״א:ל״ז` stay tight. Punctuation remains outside the isolate so examples like `3,000 משלים. שלמה המלך understood` keep the intended visual order.

These rules are global in `build-typeset-proof.js`; focused route proofs are only used as quick examples while tuning. `test-typesetting-rules.js` contains regression cases for the bidi and punctuation normalization rules.

English hyphenation is disabled globally in the Typst template. Paragraphs still use justified spacing, but Typst should not break English words across lines with inserted hyphens.

Paragraph first-line indentation is disabled globally in the Typst template.

Full-book builds insert a Typst-generated table of contents after the front matter and before the first regular article. Front matter headings are marked `outlined: false`, so the table of contents starts with the main book entries.
