#set document(title: "Zeidy-D Bo-5783-quote-check")
#set page(
  width: 6in,
  height: 9in,
  margin: (
    inside: 0.78in,
    outside: 0.62in,
    top: 0.68in,
    bottom: 0.82in,
  ),
  numbering: "1",
)
#set text(
  font: "Times New Roman",
  size: 11pt,
  lang: "en",
  dir: auto,
  hyphenate: false,
)
#set par(
  first-line-indent: 0em,
  justify: true,
  leading: 0.6em,
)

#let page-number-header(show-number: true) = context {
  if show-number {
    let number = text(size: 7.2pt, fill: rgb("#444444"))[
      #counter(page).display()
    ]

    if calc.odd(here().page()) {
      grid(
        columns: (1fr, auto),
        align: top,
        [],
        number,
      )
    } else {
      grid(
        columns: (auto, 1fr),
        align: top,
        number,
        [],
      )
    }
  } else {
    []
  }
}

#let article-footer(url, qr) = context {
  let link-text = text(size: 7.2pt, fill: rgb("#222222"))[
    #link(url)[#url]
  ]
  let qr-image = image(qr, width: 0.48in)
  let left-link-block = box[
    #grid(
      columns: (auto, auto),
      gutter: 0.06in,
      align: bottom,
      qr-image,
      link-text,
    )
  ]
  let right-link-block = box[
    #grid(
      columns: (auto, auto),
      gutter: 0.06in,
      align: bottom,
      link-text,
      qr-image,
    )
  ]

  if calc.odd(here().page()) {
    grid(
      columns: (1fr, auto),
      align: top,
      [],
      right-link-block,
    )
  } else {
    grid(
      columns: (auto, 1fr),
      align: top,
      left-link-block,
      [],
    )
  }
}

#show heading.where(level: 1): it => {
  set align(center)
  set text(font: "Times New Roman", size: 11pt, weight: "regular")
  block(above: 0pt, below: 16pt)[#it.body]
}

#show par: it => {
  it
}

#set page(header: page-number-header(), footer: article-footer("https://zeidyd.com/bo/5783/", "../../02 - Shemos/03 - Bo/5783/Bo 5783.png"))
= Bo 5783

In ⁧פרשת בא⁩⁦,⁩ we read about the ⁧מכות⁩. Let's focus on ⁧מכה⁩ number nine, ⁧חשך⁩.
The ⁧פסוק⁩ says (10:21): ⁧וַיֹּאמֶר ה׳ אֶל מֹשֶׁה נְטֵה יָדְךָ עַל הַשָּׁמַיִם וִיהִי חֹשֶׁךְ עַל אֶרֶץ מִצְרָיִם וְיָמֵשׁ חֹשֶׁךְ⁩. There's a pattern in the ⁧מכות⁩⁦,⁩ for some of them ⁧פרעה⁩ got
a ⁧התראה⁩ but for ⁧חשך⁩ he did not. Hashem said to ⁧משה⁩⁦,⁩ “Let there be ⁧חשך⁩”
(10:22): ⁧וַיֵּט מֹשֶׁה אֶת יָדוֹ עַל הַשָּׁמָיִם וַיְהִי חֹשֶׁךְ אֲפֵלָה בְּכׇל אֶרֶץ מִצְרַיִם שְׁלֹשֶׁת יָמִים⁩.
This darkness was unlike any other, it was so intense and thick that
it's described as (10:23): ⁧לֹא רָאוּ אִישׁ אֶת אָחִיו וְלֹא קָמוּ אִישׁ מִתַּחְתָּיו שְׁלֹשֶׁת יָמִים⁩ - The Egyptians were frozen in place for three days. However, ⁧וּלְכׇל בְּנֵי יִשְׂרָאֵל הָיָה אוֹר בְּמוֹשְׁבֹתָם⁩ - but ⁧כלל ישראל⁩ had ⁧אור⁩. Not only that, we
know from the ⁧מדרש⁩ that they were able to travel through all the houses
of ⁧מצרים⁩ to take a look at all their goodies so when it came time to
borrow all of the ⁧כלים⁩⁦,⁩ the ⁧מצריים⁩ said, “We don't have anything”, and
⁧בני ישראל⁩ were able to respond, “Actually, you do, it's in the closet, third drawer on the left.” They knew exactly where it was because they
were able to look around the ⁦מצריים'⁩s houses during ⁧חשך⁩. So this was a
⁧חשך⁩ that only affected the ⁧מצריים⁩⁦,⁩ but not ⁧בני ישראל⁩.

The ⁦חידושי הרי״ם⁩, the Gerrer Rebbe, offers a profound insight into the
phrase ⁧לֹא רָאוּ אִישׁ אֶת אָחִיו⁩. He teaches ⁧הַחשֵׁךְ הַגָּרוּעַ בְּיוֹתֵר⁩ - What is the
greatest ⁧חשך⁩ that we experience in our lives in ⁧עולם הזה⁩⁦?⁩

#align(center)[
⁧כַּאֲשֶׁר אִישׁ אֵינוֹ רוֹצֶה לִרְאוֹת אֶת אָחִיו בְּצַעֲרוֹ וּלְהוֹשִׁיט לוֹ עֶזְרָה⁩ - ⁧לֹא רָאוּ אִישׁ אֶת אָחִיו⁩]

This pasuk is a ⁧מוסר⁩ statement. What is the greatest ⁧חשך⁩? ⁧לֹא רָאוּ אִישׁ אֶת אָחִיו⁩ - if you don't see your friend when he's having difficulty, he's
having his own ⁧צער⁩⁦,⁩ and as a result you don't extend him a helping hand, that is the greatest ⁧חשך⁩. What's going to happen to someone who acts
this way, ignoring his friend's plight? What will be the result? ⁧הַתּוֹצָאָה הִיא, שֶׁכַּאֲשֶׁר אָדָם מִתְעַלֵּם מִדָּחְקוֹ שֶׁל חֲבֵרוֹ⁩ - When a person ignores and totally
is uninterested in his friend's difficulty; ⁧אֵין הוּא עַצְמוֹ יָכוֹל לָמוּשׁ מִמְּקוֹמוֹ⁩ - he himself, ⁧מידה כנגד מידה⁩⁦,⁩ will not be able to help himself.
He'll have his own ⁧צָרות⁩⁦,⁩ and he'll be stricken with exactly the same
issues. He will have a problem, and nobody will help him, ⁧וְלֹא קָמוּ אִישׁ מִתַּחְתָּיו⁩. When we see anybody having difficulty, we should extend a hand, and help in whatever way we can.

The day that I'm recording this is the ⁧שלושים⁩ for my ⁧תיירה ברידער⁩⁦,⁩ and
that's exactly who he was, a man who always ran to help people at all
times.
