#!/usr/bin/env node

"use strict";

const assert = require("node:assert/strict");
const {
  applyTextRules,
  normalizeMisplacedHebrewCommas,
  normalizePunctuationSpacing,
  tagPersonIndexMentions,
  stripDuplicateTitle,
} = require("./build-typeset-proof");

const LTR_ISOLATE = "\u2066";
const RTL_ISOLATE = "\u2067";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test("adds spaces after commas and removes spaces before commas", () => {
  assert.equal(
    normalizePunctuationSpacing("נזיקין,בבא קמא , בבא מציעא"),
    "נזיקין, בבא קמא, בבא מציעא"
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

test("keeps person index markers after adjacent punctuation", () => {
  assert.equal(
    normalizePunctuationSpacing(
      "R' Moshe Sternbuch#metadata(none) <person-index-1>, who quoted Rav Itzele Peterburger#metadata(none) <person-index-2>. What"
    ),
    "R' Moshe Sternbuch, #metadata(none) <person-index-1> who quoted Rav Itzele Peterburger.#metadata(none) <person-index-2> What"
  );
});

test("adds spaces between adjacent Hebrew and English words", () => {
  assert.equal(
    applyTextRules("we have מצוותwhich are נגד הטבע and quoted inמעינה"),
    `we have ${RTL_ISOLATE}מצוות${POP_DIRECTIONAL_ISOLATE} which are ${RTL_ISOLATE}נגד הטבע${POP_DIRECTIONAL_ISOLATE} and quoted in ${RTL_ISOLATE}מעינה${POP_DIRECTIONAL_ISOLATE}`
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
    `when he grows in ${RTL_ISOLATE}מצות, מעשים טובים${POP_DIRECTIONAL_ISOLATE} and ${RTL_ISOLATE}תורה${POP_DIRECTIONAL_ISOLATE}, he`
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
    `${RTL_ISOLATE}הקדוש ברוך\nהוא${POP_DIRECTIONAL_ISOLATE} will`
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
