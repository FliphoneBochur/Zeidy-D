#!/usr/bin/env node

"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const {
  applyDocxParagraphAlignments,
  applyTextRules,
  convertDocxToTypst,
  normalizeMisplacedHebrewCommas,
  normalizeColonHebrewSoftBreaks,
  normalizeHebrewParagraphSoftBreaks,
  normalizeNumberedSoftBreaks,
  normalizePunctuationSpacing,
  repairEscapedHebrewParagraphCitations,
  shiftedParagraphAlignments,
  tagPersonIndexMentions,
  tightenHaskamaSignatureBlock,
  stripDuplicateTitle,
} = require("./build-typeset-proof");

const LTR_ISOLATE = "\u2066";
const RTL_ISOLATE = "\u2067";
const POP_DIRECTIONAL_ISOLATE = "\u2069";
const ROOT_DIR = __dirname;
const FILES_DIR = path.join(ROOT_DIR, "Files");
const ROUTES = require("./routes.json").byRoute;

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function titleFromBaseFilename(filename) {
  return String(filename || "")
    .replace(/\.[^.]+$/, "")
    .replace(/\s*\(\d+\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromRouteSegment(segment) {
  return String(segment || "")
    .replace(/^\d+\s*-\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function docxEntry(route) {
  const details = ROUTES[route];
  assert.ok(details, `Route not found in routes.json: ${route}`);

  const baseTitle = titleFromBaseFilename(details.baseFilename);
  const title = details.title
    ? details.title.replace(/\s+/g, " ").trim()
    : baseTitle;
  const directory = path.join(FILES_DIR, details.contentPath);
  const routeSegmentTitles = details.contentPath
    .split("/")
    .map(titleFromRouteSegment)
    .filter(Boolean);

  return {
    route,
    title,
    isHaskama: details.contentPath.startsWith("07 - Haskamos/"),
    sourceTitles: [title, baseTitle, ...routeSegmentTitles],
    docxPath: path.join(directory, `${details.baseFilename}.docx`),
  };
}

function convertedDocx(route) {
  return convertDocxToTypst(docxEntry(route));
}

function assertContains(haystack, needle, label = needle) {
  assert.ok(
    haystack.includes(needle),
    `Expected converted Typst to contain ${label}\n\nNeedle:\n${needle}\n`
  );
}

function assertNotContains(haystack, needle, label = needle) {
  assert.ok(
    !haystack.includes(needle),
    `Expected converted Typst not to contain ${label}\n\nNeedle:\n${needle}\n`
  );
}

test("adds spaces after commas and removes spaces before commas", () => {
  assert.equal(
    normalizePunctuationSpacing("נזיקין,בבא קמא , בבא מציעא"),
    "נזיקין, בבא קמא, בבא מציעא"
  );
});

test("wraps selected typst paragraphs in docx alignment", () => {
  const alignments = new Map([
    [0, { align: "center", text: "first" }],
    [2, { align: "right", text: "שלום וברכה" }],
    [3, { align: "right", text: "English text" }],
  ]);

  assert.equal(
    applyDocxParagraphAlignments("first\n\nsecond\n\nthird\n\nfourth", alignments),
    "#align(center)[\nfirst\n]\n\nsecond\n\n#align(right)[\nthird\n]\n\nfourth"
  );
});

test("right-aligns Hebrew-only paragraphs without explicit docx alignment", () => {
  assert.equal(
    applyDocxParagraphAlignments("English paragraph\n\nשלום וברכה", new Map()),
    "English paragraph\n\n#align(right)[\nשלום וברכה\n]"
  );
});

test("does not auto-align paragraphs containing ascii numbers", () => {
  assert.equal(
    applyDocxParagraphAlignments("תהלים 105:24", new Map()),
    "תהלים 105:24"
  );
});

test("splits Hebrew paragraph from following English after double soft break", () => {
  assert.equal(
    normalizeHebrewParagraphSoftBreaks("שלום וברכה \\ \\ The next paragraph"),
    "שלום וברכה\n\nThe next paragraph"
  );
});

test("shifts docx paragraph alignment after stripped title paragraphs", () => {
  const shifted = shiftedParagraphAlignments(
    new Map([
      [0, { align: "both", text: "Title" }],
      [1, { align: "right", text: "שלום" }],
    ]),
    1
  );

  assert.deepEqual([...shifted.entries()], [
    [0, { align: "right", text: "שלום" }],
  ]);
});

test("tightens haskama signature paragraphs into line breaks", () => {
  assert.equal(
    tightenHaskamaSignatureBlock("Body paragraph.\n\nYossi Bennett\n\nWoodmere, NY\n\nי״ג אב תשפ״ו\n\nJuly 27#super[th], 2026"),
    "Body paragraph.\n\nYossi Bennett\n#linebreak()\nWoodmere, NY\n#linebreak()\nי״ג אב תשפ״ו\n#linebreak()\nJuly 27#super[th], 2026"
  );
});

test("converts escaped numbered soft breaks to typst line breaks", () => {
  assert.equal(
    normalizeNumberedSoftBreaks("\\1. First item \\ 2. Second item \\ \\3. Third item"),
    "\\1. First item \\\n\\2. Second item \\\n\\3. Third item"
  );
});

test("preserves paragraph break after colon before numbered list", () => {
  assert.equal(
    applyTextRules("I count five:\n\n\\1. First item \\ 2. Second item"),
    "I count five: \\\n\\1. First item \\\n\\2. Second item"
  );
});

test("converts consecutive escaped numbered paragraphs to tight hard breaks", () => {
  assert.equal(
    applyTextRules("questions:\n\n\\1. First question.\n\n\\2. Second question.\n\n\\3. Third question."),
    "questions: \\\n\\1. First question.\\\n\\2. Second question.\\\n\\3. Third question."
  );
});

test("converts colon before Hebrew quote paragraph to tight line break", () => {
  assert.equal(
    normalizeColonHebrewSoftBreaks("second time (22:15-17):\n\nוַיִּקְרָא מַלְאַךְ"),
    "second time (22:15-17):\\\nוַיִּקְרָא מַלְאַךְ"
  );
});

test("keeps numeric thousands separators tight", () => {
  assert.equal(
    normalizePunctuationSpacing("There are 12,196 letters, which appears again as 12, 196"),
    "There are 12,196 letters, which appears again as 12,196"
  );
});

test("removes spaces before sentence punctuation", () => {
  assert.equal(
    normalizePunctuationSpacing("R' Moshe Sternbuch , who quoted Rav Itzele Peterburger . What"),
    "R' Moshe Sternbuch, who quoted Rav Itzele Peterburger. What"
  );
});

test("removes spaces before closing parenthesis", () => {
  assert.equal(
    normalizePunctuationSpacing("it is the בית הלוי ). He says"),
    "it is the בית הלוי). He says"
  );
});

test("keeps person index markers after adjacent punctuation", () => {
  assert.equal(
    normalizePunctuationSpacing(
      "R' Moshe Sternbuch#metadata(none) <person-index-1>, who quoted Rav Itzele Peterburger#metadata(none) <person-index-2>. What"
    ),
    "R' Moshe Sternbuch, #metadata(none) <person-index-1> who quoted Rav Itzele Peterburger.#metadata(none) <person-index-2> What"
  );
});

test("keeps person index marker after close parenthesis", () => {
  assert.equal(
    normalizePunctuationSpacing(
      "it is the בית הלוי#metadata(none) <person-index-bais-halevi-33>). He says"
    ),
    "it is the בית הלוי).#metadata(none) <person-index-bais-halevi-33> He says"
  );
});

test("adds spaces between adjacent Hebrew and English words", () => {
  assert.equal(
    applyTextRules("we have מצוותwhich are נגד הטבע and quoted inמעינה"),
    `we have ${RTL_ISOLATE}מצוות${POP_DIRECTIONAL_ISOLATE} which are ${RTL_ISOLATE}נגד הטבע${POP_DIRECTIONAL_ISOLATE} and quoted in ${RTL_ISOLATE}מעינה${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("removes pandoc source wrapping newlines inside Hebrew runs", () => {
  assert.equal(
    applyTextRules("it says, וַיְדַבֵּר פַּרְעֹה אֶל יוֹסֵף בַּחֲלֹמִי\nהִנְנִי עֹמֵד עַל שְׂפַת הַיְאֹר."),
    `it says, ${RTL_ISOLATE}וַיְדַבֵּר פַּרְעֹה אֶל יוֹסֵף בַּחֲלֹמִי הִנְנִי עֹמֵד עַל שְׂפַת הַיְאֹר${POP_DIRECTIONAL_ISOLATE}.`
  );
});

test("adds space after citation before Hebrew quote", () => {
  assert.equal(
    normalizePunctuationSpacing("(שמות כ״א:ל״ז):כִּי"),
    "(שמות כ״א:ל״ז): כִּי"
  );
});

test("preserves space after Hebrew label colon before Hebrew quote", () => {
  assert.equal(
    normalizePunctuationSpacing("The פסוק says in פסוק ב: דַּבֵּר"),
    "The פסוק says in פסוק ב: דַּבֵּר"
  );
});

test("keeps Hebrew citation colons tight", () => {
  assert.equal(
    normalizePunctuationSpacing("כ״א : ל״ז"),
    "כ״א:ל״ז"
  );
});

test("keeps numeric source references tight", () => {
  assert.equal(
    normalizePunctuationSpacing("itself says (25:7) וְשָׁכַנְתִּי"),
    "itself says (25:7) וְשָׁכַנְתִּי"
  );
});

test("adds space after numeric parenthesized source before Hebrew quote", () => {
  assert.equal(
    applyTextRules("The dream described (37:9)הַשֶּׁמֶשׁ וְהַיָּרֵחַ"),
    `The dream described (37:9) ${RTL_ISOLATE}הַשֶּׁמֶשׁ וְהַיָּרֵחַ${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("repairs escaped open parenthesis after numeric source reference", () => {
  assert.equal(
    applyTextRules("The פסוק says (30:15\\(:הֶעָשִׁיר לֹא"),
    `The ${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} says (30:15): ${RTL_ISOLATE}הֶעָשִׁיר לֹא${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("repairs escaped open parenthesis after Hebrew label before numeric source", () => {
  assert.equal(
    applyTextRules("in the פסוק (\\(45:24: וַיְשַׁלַּח"),
    `in the ${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} (45:24): ${RTL_ISOLATE}וַיְשַׁלַּח${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("strips duplicate source title when route title has copy marker", () => {
  assert.equal(
    stripDuplicateTitle("Chukas 5784\n\nפרשת חקת", ["Chukas 5784 (1)"]),
    "פרשת חקת"
  );
});

test("strips duplicate source title with same-line parenthetical subtitle", () => {
  assert.equal(
    stripDuplicateTitle(
      "10 Teves 5785 \\ (Erev Shabbos)\n\nThe אבודרהם says",
      ["10 Teves 5785"]
    ),
    "The אבודרהם says"
  );
});

test("strips duplicate source title with next-line parenthetical subtitle", () => {
  assert.equal(
    stripDuplicateTitle(
      "10 Teves 5785\n(Erev Shabbos)\n\nThe אבודרהם says",
      ["10 Teves 5785"]
    ),
    "The אבודרהם says"
  );
});

test("strips duplicate source title when copy marker moves before year", () => {
  assert.equal(
    stripDuplicateTitle(
      "Simchas Torah (1) 5786\n\nFor שמחת תורה",
      ["Simchas Torah 5786 (1)"]
    ),
    "For שמחת תורה"
  );
});

test("strips duplicate source title with alternate b av spelling", () => {
  assert.equal(
    stripDuplicateTitle("Tu B'Av 5784\n\nחמישה עשר באב", ["15 Av 5784"]),
    "חמישה עשר באב"
  );
});

test("strips duplicate source title using route segment context", () => {
  assert.equal(
    stripDuplicateTitle("Krovitz Purim 5783\n\nWe said this morning", [
      "Krovitz",
      "Purim",
    ]),
    "We said this morning"
  );
});

test("restores missing open parenthesis on loose Hebrew citation closes", () => {
  assert.equal(
    normalizePunctuationSpacing("know ישעיהו ו׳:ג׳)) מְלֹא כׇל הָאָרֶץ"),
    "know (ישעיהו ו׳:ג׳) מְלֹא כׇל הָאָרֶץ"
  );
});

test("restores missing open parenthesis in Hebrew citation after English article", () => {
  assert.equal(
    normalizePunctuationSpacing("the תוכחה דברים כ״ח:מ״ז)): תַּחַת"),
    "the תוכחה (דברים כ״ח:מ״ז): תַּחַת"
  );
});

test("restores missing open parenthesis on named numeric citation from raw pandoc", () => {
  assert.equal(
    normalizePunctuationSpacing("as the פסוק says דברים 15:18)): וּבֵרַכְךָ"),
    "as the פסוק says (דברים 15:18): וּבֵרַכְךָ"
  );
});

test("normalizes Hebrew perek before pasuk references", () => {
  assert.equal(
    normalizePunctuationSpacing("in פסוק טו פרק מא, it says"),
    "in פרק מא פסוק טו, it says"
  );
});

test("adds spaces around dash between Hebrew phrase and English explanation", () => {
  assert.equal(
    normalizePunctuationSpacing("כִּי קְרוֹבָה יְשׁוּעָתִי לָבוֹא- First"),
    "כִּי קְרוֹבָה יְשׁוּעָתִי לָבוֹא - First"
  );
});

test("replaces em dashes with hyphen-minus", () => {
  assert.equal(
    normalizePunctuationSpacing("This idea\u2014we know\u2014is important"),
    "This idea-we know-is important"
  );
});

test("moves extracted leading comma to the end of the Hebrew phrase", () => {
  assert.equal(
    normalizeMisplacedHebrewCommas("to משה, ,אֱחוֹז בְּכִסֵּא כְבוֹדִי symbolizes"),
    "to משה, אֱחוֹז בְּכִסֵּא כְבוֹדִי, symbolizes"
  );
});

test("collapses duplicate commas between Hebrew list items", () => {
  assert.equal(
    applyTextRules("when he grows in מצות, ,מעשים טובים and תורה, he"),
    `when he grows in ${RTL_ISOLATE}מצות${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} ${RTL_ISOLATE}מעשים טובים${POP_DIRECTIONAL_ISOLATE} and ${RTL_ISOLATE}תורה${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} he`
  );
});

test("keeps trailing comma with Hebrew phrase in reading order", () => {
  assert.equal(
    applyTextRules("may grant us ישועות, נחמות, and גואל צדק"),
    `may grant us ${RTL_ISOLATE}ישועות${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} ${RTL_ISOLATE}נחמות${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} and ${RTL_ISOLATE}גואל צדק${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps single Hebrew phrase with trailing comma together before English", () => {
  assert.equal(
    applyTextRules("from רב שלמה גאנצפריד, the famous author"),
    `from ${RTL_ISOLATE}רב שלמה גאנצפריד${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} the famous author`
  );
});

test("keeps pure Hebrew comma list visually spaced inside RTL run", () => {
  assert.equal(
    applyTextRules("What qualities contribute to a מצוה? אהבה, זריזות, יראה, כוונה - these aspects"),
    `What qualities contribute to a ${RTL_ISOLATE}מצוה${POP_DIRECTIONAL_ISOLATE}? ${RTL_ISOLATE}אהבה, זריזות, יראה, כוונה${POP_DIRECTIONAL_ISOLATE} - these aspects`
  );
});

test("keeps comma after single Hebrew phrase before English", () => {
  assert.equal(
    applyTextRules("As the בית הלוי, which this is from, says"),
    `As the ${RTL_ISOLATE}בית הלוי${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} which this is from, says`
  );
});

test("keeps internal Hebrew commas attached before spaces", () => {
  assert.equal(
    applyTextRules("אינו יודע רגעיו ועתיו ושעותיו, נכנס בו כחוט השערה - Since"),
    `${RTL_ISOLATE}אינו יודע רגעיו ועתיו ושעותיו, נכנס בו כחוט השערה${POP_DIRECTIONAL_ISOLATE} - Since`
  );
});

test("keeps Hebrew acronym token together", () => {
  assert.equal(
    applyTextRules('רש\\"י says'),
    `${LTR_ISOLATE}רש\\"י${POP_DIRECTIONAL_ISOLATE} says`
  );
});

test("keeps short Hebrew acronym phrase in logical order", () => {
  assert.equal(
    applyTextRules('There is a יסודותדיק רמב\\"ן at the beginning'),
    `There is a ${LTR_ISOLATE}יסודותדיק רמב\\"ן${POP_DIRECTIONAL_ISOLATE} at the beginning`
  );
});

test("keeps shorthand acronym phrase in logical order", () => {
  assert.equal(
    applyTextRules('part of שובבים ת\\"ת, which includes'),
    `part of ${LTR_ISOLATE}שובבים ת\\"ת${POP_DIRECTIONAL_ISOLATE}, which includes`
  );
});

test("keeps comma-separated Hebrew bracha phrase in one reading order", () => {
  assert.equal(
    applyTextRules("all following בדרך השם,בנים ובני בנים עוסקים בתורה ובמצוות, להגדיל תורה ולהאדירה, עד עולם!"),
    `all following ${RTL_ISOLATE}בדרך השם, בנים ובני בנים עוסקים בתורה ובמצוות, להגדיל תורה ולהאדירה, עד עולם${POP_DIRECTIONAL_ISOLATE}!`
  );
});

test("keeps Hebrew hyphenated divine name in one reading order", () => {
  assert.equal(
    applyTextRules("spell י-ה, Hashem's name"),
    `spell ${RTL_ISOLATE}י-ה${POP_DIRECTIONAL_ISOLATE}, Hashem's name`
  );
});

test("keeps Hebrew hyphenated phrase with trailing name in one reading order", () => {
  assert.equal(
    applyTextRules("understood as בי-יששכר בנימין - who speaks"),
    `understood as ${RTL_ISOLATE}בי${POP_DIRECTIONAL_ISOLATE} - ${RTL_ISOLATE}יששכר בנימין${POP_DIRECTIONAL_ISOLATE} - who speaks`
  );
});

test("keeps Hebrew phrase split by ellipsis in one reading order", () => {
  assert.equal(
    applyTextRules("אַחַת שָׁאַלְתִּי מֵאֵת ה׳ \\... שִׁבְתִּי בְּבֵית ה׳ כׇּל יְמֵי חַיַּי - Hashem"),
    `${RTL_ISOLATE}אַחַת שָׁאַלְתִּי מֵאֵת ה׳ \\... שִׁבְתִּי בְּבֵית ה׳ כׇּל יְמֵי חַיַּי${POP_DIRECTIONAL_ISOLATE} - Hashem`
  );
});

test("keeps acronym-led Hebrew source titles in logical order", () => {
  assert.equal(
    applyTextRules('addresses this in שו\\"ת חתם סופר, יורה דעה סימן רל\\"ג, in the name'),
    `addresses this in ${LTR_ISOLATE}שו\\"ת חתם סופר, יורה דעה סימן רל\\"ג${POP_DIRECTIONAL_ISOLATE}, in the name`
  );
});

test("keeps Hebrew name phrase ending with acronym in logical order", () => {
  assert.equal(
    applyTextRules('written by ר\\\' שלמה גנצפריד זצ\\"ל - a tremendous'),
    `written by ${LTR_ISOLATE}ר\\' שלמה גנצפריד זצ\\"ל${POP_DIRECTIONAL_ISOLATE} - a tremendous`
  );
});

test("keeps divine-name geresh inside a Hebrew pasuk phrase", () => {
  assert.equal(
    applyTextRules("The פסוק says: וַיֹּאמֶר ה׳ אֶל מֹשֶׁה נְטֵה יָדְךָ. There"),
    `The ${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} says: ${RTL_ISOLATE}וַיֹּאמֶר ה׳ אֶל מֹשֶׁה נְטֵה יָדְךָ${POP_DIRECTIONAL_ISOLATE}. There`
  );
});

test("keeps short parenthesized acronym source in reading order", () => {
  assert.equal(
    applyTextRules("In (ס׳ ע״ב) מסכת ברכות"),
    `In ${LTR_ISOLATE}(ס׳ ע״ב)${POP_DIRECTIONAL_ISOLATE} ${RTL_ISOLATE}מסכת ברכות${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps full parenthesized Hebrew citation in reading order", () => {
  assert.equal(
    applyTextRules("the תוכחה (דברים כ״ח:מ״ז): תַּחַת"),
    `the ${RTL_ISOLATE}תוכחה${POP_DIRECTIONAL_ISOLATE} ${LTR_ISOLATE}(דברים כ״ח:מ״ז)${POP_DIRECTIONAL_ISOLATE}: ${RTL_ISOLATE}תַּחַת${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("moves newline-wrapped parenthesized Hebrew citation after following quote", () => {
  assert.equal(
    applyTextRules("That's what we say (תהילים\nכ״ז:ד׳) שִׁבְתִּי"),
    `That's what we say ${RTL_ISOLATE}שִׁבְתִּי${POP_DIRECTIONAL_ISOLATE} ${LTR_ISOLATE}(תהילים\nכ״ז:ד׳)${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("moves parenthesized Hebrew citation after following quote", () => {
  assert.equal(
    applyTextRules("That's what we say (תהילים כ״ז:ד׳) שִׁבְתִּי בְּבֵית ה׳ כׇּל יְמֵי חַיַּי."),
    `That's what we say ${RTL_ISOLATE}שִׁבְתִּי בְּבֵית ה׳ כׇּל יְמֵי חַיַּי ${LTR_ISOLATE}(תהילים כ״ז:ד׳)${POP_DIRECTIONAL_ISOLATE}${POP_DIRECTIONAL_ISOLATE}.`
  );
});

test("moves standalone leading parenthesized Hebrew citation after paragraph quote", () => {
  assert.equal(
    applyTextRules("(זכריה א:ט) וָאֹמַר מָה אֵלֶּה אֲדֹנִי וַיֹּאמֶר אֵלַי הַמַּלְאָךְ."),
    `${RTL_ISOLATE}וָאֹמַר מָה אֵלֶּה אֲדֹנִי וַיֹּאמֶר אֵלַי הַמַּלְאָךְ (זכריה א:ט)${POP_DIRECTIONAL_ISOLATE}.`
  );
});

test("repairs escaped leading parenthesis on standalone Hebrew citation paragraph", () => {
  assert.equal(
    repairEscapedHebrewParagraphCitations("\\(וָאֹמַר #strong[הַדֹּבֵר בִּי] אֲנִי אַרְאֶךָּ (זכריה א:ט"),
    "וָאֹמַר #strong[הַדֹּבֵר בִּי] אֲנִי אַרְאֶךָּ (זכריה א:ט)"
  );
});

test("keeps repaired standalone Hebrew source in RTL paragraph order", () => {
  assert.equal(
    applyTextRules("\\(וָאֹמַר #strong[הַדֹּבֵר בִּי] אֲנִי אַרְאֶךָּ (זכריה א:ט"),
    `${RTL_ISOLATE}וָאֹמַר #strong[הַדֹּבֵר בִּי] אֲנִי אַרְאֶךָּ (זכריה א:ט)${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("moves parenthesized Hebrew citation after quote before dash explanation", () => {
  assert.equal(
    applyTextRules("The pasuk says (דברים י׳:י״ב) וְעַתָּה יִשְׂרָאֵל מָה ה׳ אֱלֹקֶיךָ שֹׁאֵל מֵעִמָּךְ - What"),
    `The pasuk says ${RTL_ISOLATE}וְעַתָּה יִשְׂרָאֵל מָה ה׳ אֱלֹקֶיךָ שֹׁאֵל מֵעִמָּךְ ${LTR_ISOLATE}(דברים י׳:י״ב)${POP_DIRECTIONAL_ISOLATE}${POP_DIRECTIONAL_ISOLATE} - What`
  );
});

test("keeps plain-letter parenthesized Hebrew citation in reading order", () => {
  assert.equal(
    applyTextRules("as we know משלי ו:כג)) כִּי נֵר"),
    `as we know ${LTR_ISOLATE}(משלי ו:כג)${POP_DIRECTIONAL_ISOLATE} ${RTL_ISOLATE}כִּי נֵר${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps bare Hebrew source reference before quote colon in reading order", () => {
  assert.equal(
    applyTextRules("from שמות ד:י״ד: וְרָאֲךָ וְשָׂמַח"),
    `from ${LTR_ISOLATE}שמות ד:י״ד${POP_DIRECTIONAL_ISOLATE}: ${RTL_ISOLATE}וְרָאֲךָ וְשָׂמַח${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps parenthesized Hebrew source reference in reading order", () => {
  assert.equal(
    applyTextRules("called אדם (ע״ש יבמות ס״א ע״א), the אומות"),
    `called ${RTL_ISOLATE}אדם${POP_DIRECTIONAL_ISOLATE} ${LTR_ISOLATE}(ע״ש יבמות ס״א ע״א)${POP_DIRECTIONAL_ISOLATE}, the ${RTL_ISOLATE}אומות${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps parenthesized Hebrew source range in reading order", () => {
  assert.equal(
    applyTextRules("בְּשִׂמְחָה (דברים כ״ח:מ״ה - מ״ז). Our failure"),
    `${RTL_ISOLATE}בְּשִׂמְחָה ${LTR_ISOLATE}(דברים כ״ח:מ״ה - מ״ז)${POP_DIRECTIONAL_ISOLATE}${POP_DIRECTIONAL_ISOLATE}. Our failure`
  );
});

test("keeps Hebrew quote with ellipsis and trailing source in reading order", () => {
  assert.equal(
    applyTextRules("וּבָאוּ עָלֶיךָ כׇּל הַקְּלָלוֹת הָאֵלֶּה \\... תַּחַת אֲשֶׁר לֹא עָבַדְתָּ בְּשִׂמְחָה (דברים כ״ח:מ״ה - מ״ז). Our failure"),
    `${RTL_ISOLATE}וּבָאוּ עָלֶיךָ כׇּל הַקְּלָלוֹת הָאֵלֶּה \\... תַּחַת אֲשֶׁר לֹא עָבַדְתָּ בְּשִׂמְחָה ${LTR_ISOLATE}(דברים כ״ח:מ״ה - מ״ז)${POP_DIRECTIONAL_ISOLATE}${POP_DIRECTIONAL_ISOLATE}. Our failure`
  );
});

test("does not protect ordinary parenthesized Hebrew as a source reference", () => {
  assert.equal(
    applyTextRules("This (מנורה) is the example"),
    `This (${RTL_ISOLATE}מנורה${POP_DIRECTIONAL_ISOLATE}) is the example`
  );
});

test("does not hang on malformed unclosed Hebrew source reference", () => {
  assert.equal(
    applyTextRules('The פסוק says (\\(שמות ל:טו:הֶעָשִׁיר לֹא יַרְבֶּה - everybody'),
    `The ${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} says ${LTR_ISOLATE}(שמות ל:טו)${POP_DIRECTIONAL_ISOLATE}: ${RTL_ISOLATE}הֶעָשִׁיר לֹא יַרְבֶּה${POP_DIRECTIONAL_ISOLATE} - everybody`
  );
});

test("keeps Hebrew phrase together across a source newline", () => {
  assert.equal(
    applyTextRules("הקדוש ברוך\nהוא will"),
    `${RTL_ISOLATE}הקדוש ברוך הוא${POP_DIRECTIONAL_ISOLATE} will`
  );
});

test("tags person index aliases with straight or slanted Hebrew quotes", () => {
  const indexState = {
    people: [
      {
        id: "rashi",
        displayName: "Rashi",
        aliases: ['רש"י', "Rashi"],
      },
    ],
    mentions: new Map([["rashi", []]]),
    nextMarker: 1,
  };

  assert.equal(
    tagPersonIndexMentions("Rashi says רש״י explains", indexState),
    'Rashi#metadata(none) <person-index-rashi-1> says רש״י#metadata(none) <person-index-rashi-2> explains'
  );
  assert.deepEqual(indexState.mentions.get("rashi"), [
    "person-index-rashi-1",
    "person-index-rashi-2",
  ]);
});

test("docx: Mikeitz 5783 fixes named numeric double-parenthesis citations", () => {
  const typst = convertedDocx("/mikeitz/5783/");

  assertContains(
    typst,
    `as the ${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} says (${RTL_ISOLATE}דברים${POP_DIRECTIONAL_ISOLATE} 15:18): ${RTL_ISOLATE}וּבֵרַכְךָ ה׳ אֱלֹקֶיךָ בְּכֹל אֲשֶׁר תַּעֲשֶׂה${POP_DIRECTIONAL_ISOLATE}`,
    "fixed דברים 15:18 source"
  );
  assertContains(
    typst,
    `says (${RTL_ISOLATE}דברים${POP_DIRECTIONAL_ISOLATE} 11:14): ${RTL_ISOLATE}וְאָסַפְתָּ דְגָנֶךָ וְתִירֹשְׁךָ${POP_DIRECTIONAL_ISOLATE}`,
    "fixed דברים 11:14 source"
  );
  assertNotContains(typst, "15:18))", "raw 15:18)) double close");
  assertNotContains(typst, "11:14))", "raw 11:14)) double close");
});

test("docx: Mikeitz 5784 keeps numbered quote block tight and literal", () => {
  const typst = convertedDocx("/mikeitz/5784/");

  assertContains(
    typst,
    `I count five: \\\n\\1. When they pull`,
    "literal escaped item 1 after hard break"
  );
  assertContains(
    typst,
    `in ${RTL_ISOLATE}פרק מא פסוק טו${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} it says`,
    "perek before pasuk in item 1"
  );
  assertNotContains(typst, "פסוק טו פרק מא", "raw reversed perek/pasuk order");
  assertContains(
    typst,
    `${RTL_ISOLATE}וַיְדַבֵּר פַּרְעֹה אֶל יוֹסֵף בַּחֲלֹמִי הִנְנִי עֹמֵד עַל שְׂפַת הַיְאֹר${POP_DIRECTIONAL_ISOLATE}. \\\n\\3.`,
    "source-wrapped Hebrew quote flattened before item 3"
  );
  assertNotContains(typst, "#linebreak()\n\\2.", "block linebreak before item 2");
});

test("docx: Vayigash 5783 keeps numbered question paragraphs tight and literal", () => {
  const typst = convertedDocx("/vayigash/5783/");

  assertContains(
    typst,
    `several profound questions on this episode: \\\n\\1. All of`,
    "literal item 1 after episode intro"
  );
  assertContains(
    typst,
    `irrelevant.\\\n\\2. When the brothers returned`,
    "hard break before literal item 2"
  );
  assertContains(
    typst,
    `${RTL_ISOLATE}הַעוֹד אָבִי חָי${POP_DIRECTIONAL_ISOLATE}?\\\n\\3. Even if the question`,
    "hard break before literal item 3"
  );
});

test("docx: Vayigash 5785 repairs escaped numeric source parenthesis", () => {
  const typst = convertedDocx("/vayigash/5785/");

  assertContains(
    typst,
    `${RTL_ISOLATE}פסוק${POP_DIRECTIONAL_ISOLATE} (45:24): ${RTL_ISOLATE}וַיְשַׁלַּח אֶת אֶחָיו`,
    "fixed 45:24 source"
  );
  assertNotContains(typst, "((45:24", "double open numeric source");
  assertNotContains(typst, "(\\(45:24", "raw escaped open numeric source");
});

test("docx: Vayigash 5785 keeps comma after R' Shlomo Ganzfried", () => {
  const typst = convertedDocx("/vayigash/5785/");

  assertContains(
    typst,
    `from ${RTL_ISOLATE}רב שלמה גאנצפריד${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} the famous author`,
    "comma after R' Shlomo Ganzfried"
  );
});

test("docx: Bereshis 5784 keeps comma after Bais Halevi before English", () => {
  const typst = convertedDocx("/bereshis/5784/");

  assertContains(
    typst,
    `As the ${RTL_ISOLATE}בית הלוי${POP_DIRECTIONAL_ISOLATE}${LTR_ISOLATE},${POP_DIRECTIONAL_ISOLATE} which this is from, says`,
    "comma after Bais Halevi"
  );
});

test("docx: Bereshis 5786 keeps mid-Hebrew commas attached before spaces", () => {
  const typst = convertedDocx("/bereshis/5786/(1)/");

  assertContains(
    typst,
    `${RTL_ISOLATE}אֲבָל הַקָּדוֹשׁ בָּרוּךְ הוּא שֶׁהוּא יוֹדֵעַ רְגָעָיו וְעִתָּיו וּשְׁעוֹתָיו, נִכְנַס בּוֹ כְּחוּט הַשַּׂעֲרָה${POP_DIRECTIONAL_ISOLATE}`,
    "comma-space inside Hebrew phrase"
  );
  assertNotContains(typst, "שְׁעוֹתָיו ,נִכְנַס", "space-before-comma inside Hebrew phrase");
});

test("docx: Vayairah 5784 keeps colon Hebrew quote break tight", () => {
  const typst = convertedDocx("/vayairah/5784/");

  assertContains(
    typst,
    `a second time (22:15-17):\n\n#align(right)[\n${RTL_ISOLATE}וַיִּקְרָא מַלְאַךְ ה׳ אֶל אַבְרָהָם`,
    "right-aligned Hebrew quote after source colon"
  );
});

test("docx: Vayairah 5784 keeps pure Hebrew comma list in PDF-friendly order", () => {
  const typst = convertedDocx("/vayairah/5784/");

  assertContains(
    typst,
    `qualities contribute to a ${RTL_ISOLATE}מצוה${POP_DIRECTIONAL_ISOLATE}? ${RTL_ISOLATE}אהבה, זריזות, יראה, כוונה${POP_DIRECTIONAL_ISOLATE} - these`,
    "pure Hebrew comma list"
  );
});

test("docx: Chukas 5784 copy title is stripped from body", () => {
  const typst = convertedDocx("/chukas/5784/(1)/");

  assert.ok(
    typst.trimStart().startsWith(`${RTL_ISOLATE}פרשת חקת${POP_DIRECTIONAL_ISOLATE}.`),
    "Expected Chukas body to start after duplicate English title"
  );
  assertNotContains(typst.slice(0, 120), "Chukas 5784", "duplicate Chukas title");
});

test("docx: Yossi Bennett Haskama signature uses tight line breaks", () => {
  const typst = convertedDocx("/yossi-bennett/");

  assertContains(
    typst,
    `Yossi Bennett\n#linebreak()\nWoodmere, NY\n#linebreak()\n${LTR_ISOLATE}י״ג אב תשפ״ו${POP_DIRECTIONAL_ISOLATE}\n#linebreak()\nJuly 27#super[th], 2026`,
    "tight haskama signature block"
  );
});

test("docx: About the Name preserves right-aligned Hebrew source paragraph", () => {
  const typst = convertedDocx("/about-the-name/");

  assert.ok(
    typst.trimStart().startsWith(`#align(right)[\n${RTL_ISOLATE}וָאֹמַר מָה אֵלֶּה`),
    "Expected About the Name to begin with right-aligned Hebrew source"
  );
  assertContains(typst, `(זכריה א:ט)${POP_DIRECTIONAL_ISOLATE}]`, "source after Hebrew paragraph");
});

test("docx: Shemos 5783 right-aligns full Hebrew paragraph", () => {
  const typst = convertedDocx("/shemos/5783/");

  assertContains(
    typst,
    `#align(right)[\n${RTL_ISOLATE}וַיֶּפֶר אֶת עַמּוֹ מְאֹד`,
    "right-aligned full Hebrew quote"
  );
  assertContains(
    typst,
    `${RTL_ISOLATE}וַיֶּפֶר אֶת עַמּוֹ מְאֹד וַיַּעֲצִמֵהוּ מִצָּרָיו׃ הָפַךְ לִבָּם לִשְׂנֹא עַמּוֹ לְהִתְנַכֵּל בַּעֲבָדָיו׃ שָׁלַח מֹשֶׁה עַבְדּוֹ אַהֲרֹן אֲשֶׁר בָּחַר בּוֹ׃${POP_DIRECTIONAL_ISOLATE}]\n\nThe entire`,
    "Hebrew quote split before following English paragraph"
  );
});
