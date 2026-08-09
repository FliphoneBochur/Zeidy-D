#set document(title: "Zeidy-D Yom-Kippur-5784-quote-check")
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

#set page(header: page-number-header(), footer: article-footer("https://zeidyd.com/yom-kippur/5784/", "../../06 - Yom Tov/10 - Yom Kippur/5784/Yom Kippur 5784.png"))
= Yom Kippur 5784

We are constantly making sure that we do things correctly. However, to
do things ⁧לפנים משורת הדין⁩⁦,⁩ for example, to be ⁧מוַתֵר⁩⁦,⁩ requires an
extra-special effort. It is that kind of behavior that will stand us in
good stead for the upcoming ⁧יום כיפור⁩. If we go out of our way to be
⁧מוַתֵר⁩⁦,⁩ to give in, to say to the other person “You're right” even if we
think that they might not be right, that will stand us in very good
stead. The following story illustrates this in a powerful way.

A new sefer came out which retells stories, which you may or may not
want to believe, about people who have ⁧פגישות⁩ with ⁧נשמות⁩ in the next
world. The book is called, 'Regards from Our Upstairs Neighbors'. Here's
the story.

It was said of a certain famous politician that you can know when he's
telling a lie: If his lips are moving, you know he's lying. The
following story may sound weird or unrealistic. I get that. It really
does sound improbable, but I also know this fellow, let's call him
Yaakov. He is the polar opposite of the opening joke. If his lips are
moving, you know he's telling the truth. I've had the pleasure of
working with Yaakov in a number of business deals. He's a highly
respected businessman and upright and down-to-earth guy, definitely not
the someone-came-to-me-in-a-dream type. When Yaakov's mother passed
away, she left a terrible void. In her will she instructed her two
children, “Please, divide all my possessions in half. There should
always be shalom between you.” Her possessions included a number of
estates. However, Yaakov's sibling lived in one of them. The property
was actually legally under Yaakov's name, and therefore he felt that
this particular estate was not among the possessions that were meant to
be divided.

At first, Yaakov wanted to contest the will, or at least suggest that he
receive a similar share in one of the other properties instead. But then
he recalled his mother's plea for shalom, and realizing that this could
easily escalate into a full-blown fight, he courageously decided to
remain silent and swallow the loss. Their attention then turned to the
other properties. Yaakov's sibling asked to buy out the remaining
estates for their then market value, which happened to be at an all-time
low due to a dip in the market. Once again, Yaakov remained silent. Even
after the meager property value was calculated, Yaakov only received his
share over a course of several years in five-hundred-dollar increments
which disappeared as quickly as they came. In the meantime, the original
property's market value soared. Yaakov felt that he had received
virtually nothing, but once again, he did not say a word.

At one point, Yaakov's sibling called him, unaware of his feelings.
“Look, the money I owe to you is more or less paid up,” the sibling said. “Let's calculate it and see if I still owe you anything.” The
calculation of the total value from the various slips of paper revealed
that after all was said and done, Yaakov had been overpaid, and now he
owed his sibling some seven thousand dollars. To be clear, this sibling
is a wonderful and giving person. It was Yaakov who went out of his way
to avoid confrontation. Yaakov's impulse was to say, “Oh, okay, I'll
pay it in tiny installments,” but once again he caught himself and said
nothing.

With a big smile on his face, he wrote out a check for the full amount
and handed it over to his sibling. The accounts were finally completely
settled and the story was over. Or so he thought. A few seconds later, Yaakov's breath nearly caught in his throat. Before him, standing and
smiling joyfully, was his deceased mother. She looked at him with soft
eyes and just smiled as if to say, you have made me so happy, my son.
Then she disappeared. Sharing this story with me, Yaakov told me with
emotion, “I saw her vividly and clearly. I was not hallucinating. She
was right there before me.” Stopping thoughtfully for a moment, he
continued, “Believe me, everything was worth it to see her like that.”

We want to get through ⁧יום כיפור בשלום⁩. We want to see our children, ⁧אייניקלאך⁩⁦,⁩ and our whole family well. In the ⁧זכות⁩ of ⁧תשובה תפילה וצדקה⁩⁦,⁩ may we have a ⁧גוט געבענטשט געזונט יאר⁩ and a ⁧גמר חתימה טובה⁩.
