#set document(title: "Zeidy-D shemos-5785-semicolon-visual")
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

#set page(header: page-number-header(), footer: article-footer("https://zeidyd.com/shemos/5785/", "../../02 - Shemos/01 - Shemos/5785/Shemos 5785.png"))
= Shemos 5785

⁧וְאֵלֶּה שְׁמוֹת בְּנֵי יִשְׂרָאֵל⁩ -- There's a chap-vort which I cannot resist
sharing, about the word ⁧שמות⁩. The ⁧בעל הטורים⁩⁦,⁩ in many editions (though
not all), interprets ⁧שמות⁩ as an acronym for ⁧שניים מקרא ואחד תרגום⁩⁦,⁩ which
is a very ⁧חשובה ענין⁩. Many people are ⁧מקיים⁩ this mitzvah. R' Chaim
Kanievsky ⁦זצ״ל⁩ was very ⁧מקפיד⁩ on ⁧שניים מקרא ואחד תרגום⁩. He would always
complete it on Friday, ensuring he wouldn't be ⁧מטרִיחַ⁩ his family to wait
for him, whether at the ⁧סעודות⁩ on Friday night or Shabbos morning.
Despite his immense schedule and many ⁧חובות⁩⁦,⁩ he still prioritized ⁧שניים מקרא ואחד תרגום⁩. He did it in the order: ⁧מקרא⁩⁦,⁩ ⁧תרגום⁩⁦,⁩ and then ⁧מקרא⁩
again. This method allowed him to understand the ⁧מקרא⁩ better when he
read it the second time.

That's just a small introduction to the topic of ⁧שמות⁩⁦,⁩ which means
names. Names hold a very ⁧חשובה⁩ place in ⁧כלל ישראל⁩. We know from the ⁧מדרש⁩
that there's a small ⁧ענין⁩ of ⁧רוח הקודש⁩ involved when parents choose a
name for their child, parents have to ask for ⁧סיעתא דשמיא⁩ in order to
choose a name that's appropriate for the child. The ⁧גמרא⁩ in ⁧מסכת ברכות⁩
teaches that a name has a profound effect on a person. First, it impacts
the individual directly, and second, it reflects who the person will
become throughout his life. Because of this, ⁧רב מאיר⁩ in the ⁧גמרא⁩ would
ask for a person's name before interacting with them. He used the name
as a way to determine how to approach the person and how to deal with
his ⁧שאלות⁩ and issues. (The concept of ⁧רוח הקודש⁩ influencing a parent's
choice of a name is from the ⁦אריז״ל⁩\; it's not ⁧סתם אזוי אַ ווערטל⁩). R'
Chaim Kanievsky advised that parents should give their children normal
names to prevent embarrassment. Both the ⁧חזון איש⁩ and the Steipler were
shtark on this ⁧ענין⁩.

The ⁧זוהר⁩⁦,⁩ as quoted by R' Chaim, explains that the letters of a person's
name combine to influence their life. It also discusses certain name
combinations that are not ideal for marriage. These are secrets of ⁧רוח הקודש⁩⁦,⁩ and we do not truly understand how they work. R' Chaim was
adamant that we should not consult people who claim to understand these
mysteries. Instead, we should focus on ⁧מידות⁩ and other practical, meaningful aspects when arranging ⁧שידוכים⁩⁦,⁩ rather than being preoccupied
with names.

I came across an interesting insight from R' Chaim. He used to say that
naming a child after a deceased relative had no ⁧ייחוס⁩ or benefit, either
for the ⁧נפטר⁩ or for the child. He explained it was simply a ⁧זיכרון⁩ of
the ⁧נפטר⁩. However, he later revised this opinion. Like many ⁧גדולים⁩ in
the ⁧גמרא⁩ who changed their views, R' Chaim stated that it is indeed a
tremendous ⁧זכות⁩ for the child and provides great ⁧נחת⁩ to the ⁧נשמה⁩ of the
deceased. He also mentioned that the ⁧חזון איש⁩ shared this opinion.
Furthermore, giving a child a name connected to the ⁧פרשה⁩ is an added
⁧זכות⁩ for the child. We named some of our children based on the ⁧פרשה⁩⁦,⁩ and
others after relatives or individuals we felt were ⁧חשוב⁩.

In life, it's essential to approach all our activities with the same
seriousness and ⁧חשיבות⁩ as we do when naming a child. Each day, we should
ask ourselves, "What am I doing today to increase ⁧כבוד שמים⁩⁦?⁩ What am I
doing to improve my family's ⁧רוחניות⁩ and ⁧גשמיות⁩?" A name reflects our
willingness, our ⁧תשוקה⁩⁦,⁩ our yearning to improve ourselves, to become
better people, and to live up to the names that we have chosen for
ourselves. Bezras Hashem, we should have ⁧גרויסא הצלחה⁩ in achieving this
and be a ⁧נחת⁩ for ⁧כלל ישראל⁩ and for all those who came before us.
