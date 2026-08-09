#set document(title: "Zeidy-D Yossi-Haskama-quote-check")
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

#set page(header: none, footer: none)


#align(center)[
“⁧אין שמחה כשמחת התורה⁩”]

#align(center)[
“⁧אשרי מי שבא לכאן ותלמודו בידו⁩”]

When my uncle, Dr. Leslie Bennett, ⁦שליט״א⁩, called me and asked if I
would write a haskamah for this sefer, I was genuinely shocked. After
confirming that I had heard him correctly, I believe my response was, “My haskamah would be worthless.” To which Uncle Leslie replied, in his
inimitable fashion, “But it would be worth something to me.”

As many of the readers of this sefer will undoubtedly be members of the
extended Bennett mishpachah, I think I can safely say - without
offending anyone - that Bennetts always have something to say. And while
many times there is Torah being shared, with Uncle Leslie, I would be
hard-pressed to think of a time when Torah was #emph[not] shared.

It is no wonder that throughout my childhood (and I would assume until
today) Uncle Leslie was the peddler of parsha pamphlets and Torah sheets
in our shul. Although a physician by profession, Uncle Leslie is, at
heart, an educator. He simply cannot keep a beautiful piece of Torah to
himself. Whenever he encounters a vort that inspires him or a chiddush
that captivates him, he feels compelled to share it so that others can
appreciate it as well.

I believe Uncle Leslie and I share a common passion: a love for a
geshmakeh vort. I certainly cannot be the only one who has experienced
seeing him over Shabbos, only to have a parshah sheet or sefer
enthusiastically thrust into my hands with the simple instruction: “Read
this.”

And if I am the only one, then I consider it an honor.

Whether it was an inspiring story, a thought-provoking and original
chiddush, or an intricate mathematical gematria, it was always something
that enriched my Shabbos, deepened my appreciation of that week\'s
parshah, and, by extension, enhanced my family\'s as well. I may not
always have told him so, but many of Uncle Leslie\'s “chiddushim”
remained in my back pocket for years and were subsequently shared with
countless talmidim of my own.

Perusing through this sefer, as I normally do with seforim #emph[al
haTorah], I started with Parshas Bereishis and then flipped to this
week's parsha (Parshas Eikev). True to form, I found myself moved to
tears by the story in Bereishis ⁦תשפ״ו⁩, only to be captivated moments
later by the Megaleh Amukos (whose yahrtzeit is today, ⁦י״ג אב⁩) cited in
Eikev ⁦תשפ״ה⁩.

The title of this sefer, ⁧הדבר בי⁩⁦,⁩ drawn from the ⁧נבואה⁩ of ⁧זכריה הנביא⁩⁦,⁩ referring to the ⁧מלאך⁩ who spoke to ⁧זכריה⁩⁦,⁩ is appropriately titled so, as
it can also homiletically be understood as ⁧בי⁩ - ⁧יששכר בנימין⁩ - who
speaks. The Divrei Torah contained within are the very messages Uncle
Leslie faithfully delivered to the family week after week. Yet the title
is expressed in the present tense rather than the past, because these
teachings are timeless. They continue to speak to us today and will
continue to do so for years to come. Through this sefer, readers can
once again experience those weekly divrei Torah in a style remarkably
faithful to the way Uncle Leslie originally delivered them.

The title also hints to the inclusion of Aunt Devorah (⁧הדבר⁩ = ⁧דברה⁩) in
this accomplishment, which cannot be overstated. Aunt Devorah, a
powerhouse in her own right, has devotedly stood by Uncle Leslie's side
in his myriad accomplishments: raising their family, the medical
profession, as a community askan, as the patriarch or our family, and as
a Ben Torah and Talmid Chochom.

Tremendous credit is likewise due to Reb Ari Bennett (a chavrusah of my
father, ⁦ע״ה⁩, during the final years of his life) who painstakingly
transcribed the video shiurim of Uncle Leslie, reviewed each ⁧מאמר⁩ and
whose meticulous organizational and technological prowess brought this
sefer, ⁧מכח אל הפועל⁩#emph[.]

⁦חז״ל⁩ teach us in the third perek of the Yerushalmi in Rosh Hashana, “⁧דברי תורה עניים במקום אחד ועשירים במקום אחר⁩”. Uncle Leslie has spent
a lifetime collecting these beautiful divrei Torah wherever he found
them and generously sharing them with everyone around him. Now, through
this sefer, that generosity extends far beyond the walls of his home and
shul, allowing countless others to benefit from the Torah that has
enriched our family for so many years.

May this sefer serve as a z'chus for Uncle Leslie and Aunt Devorah, our
entire mishpacha - those in olam hazeh and those in the olam ha'emes -
and, by the time you read this, may we be heralding the coming of
Moshiach Tzidkeinu.

Yossi Bennett
#linebreak()
Woodmere, NY
#linebreak()
⁦י״ג אב תשפ״ו⁩
#linebreak()
July 27#super[th], 2026
