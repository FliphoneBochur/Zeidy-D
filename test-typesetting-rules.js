#!/usr/bin/env node

"use strict";

const assert = require("node:assert/strict");
const {
  isolateHebrewRuns,
  normalizeMisplacedHebrewCommas,
  normalizePunctuationSpacing,
  stripDuplicateTitle,
} = require("./build-typeset-proof");

const LTR_ISOLATE = "\u2066";
const RTL_ISOLATE = "\u2067";
const POP_DIRECTIONAL_ISOLATE = "\u2069";

function applyTextRules(input) {
  return isolateHebrewRuns(
    normalizeMisplacedHebrewCommas(normalizePunctuationSpacing(input))
  );
}

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

test("adds space after citation before Hebrew quote", () => {
  assert.equal(
    normalizePunctuationSpacing("(שמות כ״א:ל״ז):כִּי"),
    "(שמות כ״א:ל״ז): כִּי"
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

test("moves extracted leading comma to the end of the Hebrew phrase", () => {
  assert.equal(
    normalizeMisplacedHebrewCommas("to משה, ,אֱחוֹז בְּכִסֵּא כְבוֹדִי symbolizes"),
    "to משה, אֱחוֹז בְּכִסֵּא כְבוֹדִי, symbolizes"
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

test("keeps plain-letter parenthesized Hebrew citation in reading order", () => {
  assert.equal(
    applyTextRules("as we know משלי ו:כג)) כִּי נֵר"),
    `as we know ${LTR_ISOLATE}(משלי ו:כג)${POP_DIRECTIONAL_ISOLATE} ${RTL_ISOLATE}כִּי נֵר${POP_DIRECTIONAL_ISOLATE}`
  );
});

test("keeps parenthesized Hebrew source reference in reading order", () => {
  assert.equal(
    applyTextRules("called אדם (ע״ש יבמות ס״א ע״א), the אומות"),
    `called ${RTL_ISOLATE}אדם${POP_DIRECTIONAL_ISOLATE} ${LTR_ISOLATE}(ע״ש יבמות ס״א ע״א)${POP_DIRECTIONAL_ISOLATE}, the ${RTL_ISOLATE}אומות${POP_DIRECTIONAL_ISOLATE}`
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
