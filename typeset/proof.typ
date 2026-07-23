#set document(title: "Zeidy-D Typesetting Proof")
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
)
#set par(
  first-line-indent: 1.1em,
  justify: true,
  leading: 0.6em,
)

#let article-footer(url, qr) = context {
  let number = text(size: 7.2pt, fill: rgb("#444444"))[
    #counter(page).display()
  ]
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
      columns: (auto, 1fr, auto),
      align: bottom,
      left-link-block,
      [],
      number,
    )
  } else {
    grid(
      columns: (auto, 1fr, auto),
      align: bottom,
      number,
      [],
      right-link-block,
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

#set page(footer: article-footer("https://zeidyd.com/bereshis/5784/", "../Files/01 - Bereshis/01 - Bereshis/5784/Bereshis 5784.png"))
= Bereshis 5784

וַיְבָרֶךְ אֱלֹקִים אֶת יוֹם הַשְּׁבִיעִי וַיְקַדֵּשׁ אֹתוֹ כִּי בוֹ שָׁבַת מִכׇּל מְלַאכְתּוֹ אֲשֶׁר בָּרָא אֱלֹקִים
לַעֲשׂוֹת (2:3) The pasuk could have said כִּי בוֹ שָׁבַת מִכׇּל מְלַאכְתּוֹ אֲשֶׁר בָּרָא
אֱלֹקִים. What does the word לַעֲשׂוֹת add? רש\"י says on the pasuk before וַיְכַל
אֱלֹהִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר עָשָׂה - what was the world missing? The world
was missing מנוחה. He brings from the medrash מֶה הָיָה הָעוֹלָם חָסֵר? מְנוּחָה,
בָּאת שַׁבָּת בָּאת מְנוּחָה. An interesting concept. We think of מנוחה as the
absence of work. So how is it called a בריאה? We have to redefine and
reunderstand what the word מנוחה means, vis-a-vis הקדוש ברוך הוא. Now,
we know that the ששת ימי בראשית are different from all the rest of
history in that each and every day הקדוש ברוך הוא created something
which had not been there before, it's a Latin term, creatio ex nihilo,
the term that we're more familiar with is יש מאין. Duringששת ימי בראשית,
Hashem created יש מאין all of the contents of the world which has never
been there before.

Beginning with Shabbos, הקדוש ברוך הוא is recreates everything in the
world each and every day, יש מאין. All the ספרים bring down that בכל רגע
ורגע, הקדוש ברוך הוא is ממציא כל הנמצא - הקדוש ברוך הוא causes the
existence of all matter in this world. The exact opposite of Aristotle
who said matter is eternal, we say that matter is הקדוש ברוך הוא's
creation each and every moment, and not only that, it's יש מאין. Just
because it was there before, the previous moment's existence is
absolutely no reason for this matter, this particle of matter to be
there the next second. Each and every moment, the world is being
recreated. We say that in davening every single day, הַמְחַדֵּשׁ בְּטוּבוֹ בְּכָל יוֹם
תָּמִיד מַעֲשֵׂה בְרֵאשִׁית. What does that mean? הַמְחַדֵּשׁ בְּטוּבוֹ - הקדוש ברוך הוא in
his goodness is newly creating; תָּמִיד - continuously; מַעֲשֵׂה בְרֵאשִׁית. So
שבת, which we use as a symbol of resting, of stopping from work, is
actually our עדות, is our testimony that הקדוש ברוך הוא is the ממציא and
the בורא העולם and continues its constant existence. As the בית הלוי,
which this is from, says, we are used to seeing things continually
existing because in our minds, in our eye, we see things being there on
a constant basis. That's because we can't see it being recreated every
second. הקדוש ברוך הוא made it that way. In our mind and in our
consciousness, that's called מנוחה. That's called שבת, it's called
resting. Hashem is recreating the world every second - that is מנוחה.
ששת ימי בראשית was creating something which had never been there before
\- that's called בריאה.

The בית הלוי is explaining that רש\"י is saying that when Hashem made
שבת, it's a symbol of מנוחה, that Hashem is actually the ongoing מנהיג
and בורא העולם forever. That's what לַעֲשׂוֹת means - that Hashem's act of
creation wasn't something finished, but something that continues;
creation was made "לַעֲשׂוֹת", to be ongoing, constantly renewed. That is a
tremendous concept. I understand the great גדולים knew this, appreciated
it, and kept it in their minds constantly. We of a lesser stature have
to be reminded of it at least once a year in פרשת בראשית. It's a good
thing to remember. הקדוש ברוך הוא is הַמְחַדֵּשׁ בְּטוּבוֹ בְּכָל יוֹם תָּמִיד מַעֲשֵׂה
בְרֵאשִׁית. It's a great thing to be able to keep in mind, relearn, and
emphasize.

#pagebreak()

#set page(footer: article-footer("https://zeidyd.com/bereshis/5785/", "../Files/01 - Bereshis/01 - Bereshis/5785/Bereshis 5785.png"))
= Bereshis 5785

פרשת בראשית. Everybody's favorite פרשה. We love פרשת בראשית\.I had the
זכות to hear the following vort from Zeidy Weiss, ע״ה, who was such a
טייערער מענטש. He said this so sweetly that it was unforgettable, as
many of the things that he did, and it's good to pass it along to you.
He heard it in the name of R' Rosenzweig, the מרא דאתרא of the קהל עדת
ישורון, and he heard it from R' Yoshe Ber Soloveitchik - that's a pretty
impressive line of מאן דאמרין.

The pasuk says (1:16) וַיַּעַשׂ אֱלֹהִים אֶת שְׁנֵי הַמְּאֹרֹת הַגְּדֹלִים - הקדוש ברוך הוא
created the two great luminaries; אֶת הַמָּאוֹר הַגָּדֹל לְמֶמְשֶׁלֶת הַיּוֹם וְאֶת הַמָּאוֹר
הַקָּטֹן לְמֶמְשֶׁלֶת הַלַּיְלָה וְאֵת הַכּוֹכָבִים. R' Soloveitchik asked the following
question on this pasuk: At a bris we say זֶה הַקָּטוֹן גָדוֹל יִהְיֶה. It's a
famous ברכה, that we want this little one to become big. So the obvious
קשיא is what kind of ברכה is that? It is the nature of things - he's a
little kid, he's going to grow up. That's a ברכה? What is the intention
of this ברכה? We should say he should become a צדיק, he should be a
תלמיד חכם. What is the פשט - זֶה הַקָּטוֹן גָדוֹל יִהְיֶה?

So the Rav refers to this pasuk, the two מְּאֹרֹת הַגְּדֹלִים, the מָּאוֹר הַגָּדֹל,
which is the sun, and the מָּאוֹר הַקָּטֹן, which is the moon. We know that the
sun illuminates on its own power. We know that the moon is simply a
reflection of the light of the sun. So too each and every one of us.
When we're young and learning and our parents are raising us and our
רביים, our teachers are teaching us, we are all receiving instruction,
receiving חכמה, receiving תורה, receiving all the things we need to grow
up properly and to stand on our own. As children, when we have light,
it's a reflection of that which was instilled within us, the light
reflecting off of the sun. That's a מָּאוֹר הַקָּטֹן. In that ברכה, we daven
that בעזרת השם we should get to a point in our lives when we're big
enough that we will be able to illuminate on our own, a מָּאוֹר הַגָּדֹל, that
we will take what we've what we've gotten from our previous teachers and
דורות and use that to start our own light, to instill within ourselves
the ability to fire up our own light and to illuminate those around us
and those who come after us. So it's a beautiful take on these words זֶה
הַקָּטוֹן גָדוֹל יִהְיֶה.

בעזרת השם, we should all have the זכות to illuminate all those around
us.

#pagebreak()

#set page(footer: article-footer("https://zeidyd.com/bereshis/5786/(1)/", "../Files/01 - Bereshis/01 - Bereshis/5786/Bereshis (1)/Bereshis 5786 (1).png"))
= Bereshis 5786 (1)

פרשת בראשית, a new cycle for the year. The holy Yid of P'shischa was
known to have great insight in the important things in life. One of the
דברי מוסר that he had was that he advised people to always wear a jacket
with pockets on both sides. He said that in the two pockets, he should
have two different slips of paper. On one side he should have a piece of
paper that says בשבילי נברא העולם. In the other pocket, he should have
the phrase, אנכי עפר ואפר. I found an interesting parallel in פרשת
בראשית.

Regarding שבת the pasuk says (2:2), וַיְכַל אֱלֹקִים בַּיּוֹם הַשְּׁבִיעִי מְלַאכְתּוֹ אֲשֶׁר
עָשָׂה וַיִּשְׁבֹּת בַּיּוֹם הַשְּׁבִיעִי מִכׇּל מְלַאכְתּוֹ אֲשֶׁר עָשָׂה - הקדוש ברוך הוא completed his
work on יום השביעי, and he rested on יום השביעי. The question is that
there's a סתירה מיניה וביה in the pasuk. It says that Hashem finished
his work, and in the same pasuk it says וַיִּשְׁבֹּת - he rested from his work.
Did Hashem work or did He rest? The answer that's always given is, and
I'll quote it now verbatim fromבראשית רבה (י׳:ט׳) :בָּשָׂר וָדָם שֶׁאֵינוֹ יוֹדֵעַ לֹא
עִתָּיו וְלֹא רְגָעָיו וְלֹא שְׁעוֹתָיו, הוּא מוֹסִיף מֵחֹל עַל הַקֹּדֶשׁ - Since we cannot
determine precisely when that moment when שבת comes in, we have to
perforce add on from חול to קודש\;אֲבָל הַקָּדוֹשׁ בָּרוּךְ הוּא שֶׁהוּא יוֹדֵעַ רְגָעָיו
וְעִתָּיו וּשְׁעוֹתָיו, נִכְנַס בּוֹ כְּחוּט הַשַּׂעֲרָה - הקדוש ברוך הוא knows precisely the
way that time is running, Hashem created time, and therefore He knows
exactly when שבת starts and when שבת ends. This בראשית רבה appears to be
pointing out man's deficiencies, man's limited view of the world, man's
inability to be as precise as כביכול הקדוש ברוך הוא.

The וילנא גאון changes the meaning of this בראשית רבה just a drop. To
repeat: בָּשָׂר וָדָם שֶׁאֵינוֹ יוֹדֵעַ לֹא עִתָּיו וְלֹא רְגָעָיו וְלֹא שְׁעוֹתָיו - A man does not
know his moments, his minutes, or his hours. The מדרש is telling us we
have no control over our lives; we don't know how long our lives will
last. We have no control at all over one of the most basic aspects of
life, which is time. That is man's limitation. Look how little we are,
look how imprecise we are, look how humble we should be because of this
fact of knowing so little about even every moment of the day. That's
what the מדרש is telling us. When שבת comes in, we should glorify and
magnify הקדוש ברוך הוא's greatness as מלך מלכי המלכים, especially when
#emph[we] look at it from the point of view that we are unable to do
that at all. So, אנכי עפר ואפר, the famous saying about עפר ואפר: עפר is
dirt, it has no past. אפר is ashes, has no future. אברהם אבינו was
saying, I have no past and no future. I am nothing. Therefore, if we
recognize our humility and our true station in life, we will be better
people.

Let's go to another pasuk. The pasuk says when הקדוש ברוך הוא was
preparing to create אדם הראשון, he had a conference with the מלאכים. He
said (1:26), נַעֲשֶׂה אָדָם בְּצַלְמֵנוּ כִּדְמוּתֵנוּ וְיִרְדּוּ בִדְגַת הַיָּם וּבְעוֹף הַשָּׁמַיִם וּבַבְּהֵמָה
וּבְכׇל הָאָרֶץ וּבְכׇל הָרֶמֶשׂ הָרֹמֵשׂ עַל הָאָרֶץ. In (ס׳ ע״ב) מסכת ברכות this pasuk is
brought down with the following rather startling observation: כִּי סַיֵּים
מְסָאנֵיהּ - when a person ties his shoes in the morning;לֵימָא: ״בָּרוּךְ שֶׁעָשָׂה לִי
כׇּל צׇרְכִּי״ - Hashem, you have made for me all that I need. The וילנא גאון
again asks, what do all of the things that we need have to do with
putting on our shoes? Is the fact that we put on our shoes fulfilling
all of our requests and our needs?

The גאון answers with the famous pasuk in (8:7) תהלים: תַּמְשִׁילֵהוּ בְּמַעֲשֵׂי
יָדֶיךָ כֹּל שַׁתָּה תַחַת רַגְלָיו - Everything that is in creation is under man's
dominion. The pasuk tells you that we have a שליטה. הקדוש ברוך הוא gave
Man the power to control the entire בריאה. We take a seed, we can crush
it up, make it into food, or we can plant it and we can make it into
many plants which we can eat or feed them to our בהמות. We can take the
בהמה and we can שחט it. We can use the בהמה as food. We can use the בהמה
as a source of milk. We can use the leather of the בהמה to make a shoe.
Hashem gave us these opportunities to control the world. Man's purpose
is to be שולט in the world for one reason and one reason only: because
הקדוש ברוך הוא said so. הקדוש ברוך הוא says, you rule the world, we have
to do that job as part of our responsibility that Hashem gives us.

The וילנא גאון has an amazing insight that he quotes from the sefer אמרי
נועם. Why do we sayשֶׁעָשָׂה לִי כׇּל צׇרְכִּי inלשון עבר , שֶׁעָשָׂה לִי? Because this
ממשלה, this rulership of the world, we already got this fromמעשה בראשית.
That's what the פרשה is telling us.

בשבילי נברא העולם. On the one hand, yes, אנכי עפר ואפר. But Hashem also
told us that we rule the world. If we rule it properly, Hashem will let
us continue ruling the world. It is our job, our function, in exactly
the same way as it is our job to remain humble as we do it. Let's try to
work on both of these things and see if we can pull it off. Not an easy
task, but it's doable only because the Torah says so.

#pagebreak()

#set page(footer: article-footer("https://zeidyd.com/bereshis/5786/(2)/", "../Files/01 - Bereshis/01 - Bereshis/5786/Bereshis (2)/Bereshis 5786 (2).png"))
= Bereshis 5786 (2)

In פרשת בראשית, we have the pasuk (2:24) עַל כֵּן יַעֲזׇב אִישׁ אֶת אָבִיו וְאֶת אִמֹּו
וְדָבַק בְּאִשְׁתֹּו וְהָיוּ לְבָשָׂר אֶחָד, which is the basis of all of our שידוכים
efforts, to fulfill this pasuk and bring שידוכים and זיווגים into the
world. The following story, quoting from the Torah Tavlin, was recently
told over by a יונגערמאן, married with three children. This story
occurred when he was 27 years old.

The שידוך period was a real difficult one for him. It's not that he was
overly picky, but the appropriate offers just didn't happen. The right
date had just not come along. After so many offers that ended in
nothing, one can easily reach despair.

What's more, two of his friends were married, and one of them already
had a six-year-old child. "On one of the days of בין הזמנים", he says,
"I went to בני ברק to attend the wedding of a friend. I arrived at the
חופה, stayed for the food and dancing. At 10 o'clock, I left the hall
for the nearest bus back to ירושלים. I met a friend and started talking
to him at the entrance of a building. It turns out that he was at a שבע
ברכות of his relative. Suddenly, a man comes down from the building and
says to my friend, "Why are you out here? Come upstairs. It's really
empty and sad up there." Then he turns to me, "Come upstairs, they're
waiting for you there." "Waiting for me?" I asked? "Go upstairs?"
"Waiting for what?" I tried to tell him that he's mixing me up with
somebody else, but he interrupted me. "Look, I'm really looking for a
man to complete our מנין for a שבע ברכות. So please, come upstairs.
There's a חתן and כלה up there, they're supposed to be happy. It's
already 10:30 p.m. and there are only six people there. If you go up,
you'll get a prize." I opened my mouth to answer him that I'm in a
hurry, and besides, I wasn't looking for a prize. But something in his
voice sounded kind and innocent. I decided to comply.

"It was a basic שבע ברכות in a private home. It was also rather shabby,
with the bride and groom, two in-laws, one grandfather, two boys, and
several babies in strollers. No one sang or even spoke. No music was
being played. It was quite נעבעכדיק, to be quite honest. I thought to
myself, "How are they going to pass the time here?" Little by little,
individual family members arrived, and finally, they had a מנין. The man
who had called me looked and said to me, "Sing something." I looked to
left, then to my right, and realized he was talking to me. I had no
choice. I started with עוד ישמע and מהרה, and then lapsed into ענוי הגפן
וענוי הגפן and ויזכו לבנות בית נאמן בישראל. A few members of the bride's
family, it might have been the groom's family, who knew, hummed along
with me. This went on for a few moments. After these songs, the same man
approached me and whispers in my ear, "Say a few words for the שמחה\." I
looked at him. "I know you didn't prepare a דבר תורה, but go ahead.
Start to speak. Say something about the חתן. You will receive a prize."
Again with the prize. What does he want from me? The man told me that
the חתן's name was Mordechai, he learns in such-and-such ישיבה, his
מסכתא, his ראש ישיבה, and a few other pertinent details. "Say a few
words לכבוד the שמחה," he again urged me.

"And so I acted bravely, got up and began to sing the praises of a man
named Mordechai whom I had never in my life seen before and most likely
would never see again. Somehow, a speech came out that was full of
praise for the bridegroom, whose name I'd never heard a few minutes ago,
who went far in his learning, עבודת השם, and in relation to his friends.
I even gave examples from his life which I had heard a moment before, in
which Mordechai proved himself to be noble and special in the מידה of
giving. My words made a great impression on those present, and to be
honest, myself too. I praised the wonderful חתן by saying that "This is
what they say about him." Everyone shook my hand, and the bridegroom
embraced me with many thanks. No one stood up to speak after me. It
seemed that my speech saved the שבע ברכות, which had almost shut down.

"The Yid sitting next to me asked for my name. He wanted to propose a
שידוך. "How are you related to the groom?" he was interested. "I'm not
related to the groom - or the bride," I explained to him. "I don't know
anyone, I don't even know the bride's surname." "So what are you doing
here?" he asked. "חסד," I told him. "I was asked to come and make the
מנין\." He laughed heartily and said, "I am also a passerby who came
here at the request of one of the relatives. Since we are both in the
same family situation towards this חתן and כלה, that already makes us
מחותנים, kind of." He smiled kindly. "In short, I want to suggest to you
my sister's daughter," "What makes you think of proposing your sister's
daughter before you even know me? I asked him. "To tell you the truth,
after your special speech, I feel like I know you a little. After I hear
that you were here voluntarily, I know you even more and appreciate you.
Thirdly, why not give it a try?" Indeed, the third claim tipped the
scales. I gave him my parents' phone number and we went our separate
ways.

"Everything else is already history. That evening produced a match, and
today I am married with three children, ברוך השם. And why did I remember
this story? Because a week ago I met someone familiar on the bus. He
looked at me and I looked at him. "I know you from somewhere," he said.
"Yeah, I recognize you too," I answered him. We both looked at each
other. We both knew each other, but we couldn't remember from where.
Suddenly he tapped his forehead. At that moment, I did the same. We both
remembered. "It was you who spoke at the שבע ברכות of my brother, Muti,
in בני ברק without even knowing him. How could I forget that? I have
never heard such praise from someone who does not know the groom at all.
It might have been the best שבע ברכות speech of all time. It was a sad
evening that did not contribute to the happiness of the חתן and כלה, and
you saved it with your appearance and your wonderful words and your act
of חסד. I remember that very well." We both laughed. "Wait, oy oy, hold
on a second" he said suddenly. "What's the matter"? I asked. "I promised
you a prize, remember? One must keep his promise." I laughed and said to
the kind man, "Don't worry, Hashem has kept your promise, I received my
prize."

#pagebreak()

#set page(footer: article-footer("https://zeidyd.com/noach/5784/(1)/", "../Files/01 - Bereshis/02 - Noach/5784/Noach 5784 (1)/Noach 5784.png"))
= Noach 5784

Parshas Noach. All the בעלי מדרש have said numerous times that
everything needs to have מזל, even aספר תורה בהיכל has to have מזל. The
מזל about חומש is that the first pasuk in every parsha has millions of
מדרשים on it, and the later pesukim in the parsha are not discussed as
intensively. So in פרשת נח, guess who we're going to talk about? Not
what you expected, we're going to talk about אברהם אבינו.

It says at the very end of the parsha that אברהם אבינו comes from תרח
(11:27):תֶּרַח הוֹלִיד אֶת אַבְרָם אֶת נָחוֹר וְאֶת הָרָן. Who is הרן? הרן was אברהם
אבינו's brother. It also mentions that הרן died in אור כשדים (11:28)
וַיָּמׇת הָרָן עַל פְּנֵי תֶּרַח אָבִיו. Rashi says that הרן died before his father
died. Why did he die?

Another question is that one of our famous stories about אברהם אבינו is
אור כשדים. Where is that in the תורה? Ain't nowhere in the תורה. It's in
this Rashi at the end of נח. אברהם אבינו would not bow down to נמרוד
הרשע ימח שמו. So Nimrod said "I'm throwing you into the fire." But as he
was going into the fire and was being saved, they asked הרן, "Who are
you with? Are you with נמרוד or are you with אברם?" He said "Let me see
what happens." When he saw that אברם was saved, he said, "I'm with
אברם". They threw him into the fire and he wasn't saved as he was doing
it שלא לשמה. אברהם אבינו did it לשמה. So the whole אור כשדים מדרש, upon
which we start our whole narrative of אברהם אבינו, who he was and what
he represented, which was מסירות נפש and קידוש שם שמים, is in Rashi at
the end of נח. Not in לך לך, certainly not in וירא or חיי שרה. So now we
know who אברם is. Thank you Rashi, and thank you the pasuk, because
Rashi is explaining the pasuk, of course. But it's buried here. It's
buried here for a very simple reason.

Every nation in the world glorifies itself on its independence. America
has July 4th, the French have their day, July 14th. The Mexicans have
José de Martín. Every nation, even the Russians ימח שמם, even the
Ukrainians, certainly the French, everybody is always proud of their
heritage, of their independence and their Bastille Day, their starting
out as great nations. And what do we do? We start out with, as we say
about the haggadah, מתחילין בגנות ומסיימין בשבח. So we say מִתְּחִלָּה עוֹבְדֵי
עֲבוֹדָה זָרָה הָיוּ אֲבוֹתֵינוּ - We started out little. We never claim our
independence. We say הקדוש ברוך הוא took us out of מצרים, no one
else.הקדוש ברוך הוא is the one who's responsible for our independence,
not us. In exactly the same way, אברהם אבינו's great brilliance,
fantastic מסירות נפש to start off our history as a nation is also
buried. It's very hidden. We have to go and uncover it and search for
it. Like everything else in this world, אמת is hidden; שקר is all over
the place. Our אמת is buried there. We have to look for it, and when we
look for it we'll actually appreciate it more because we have to put in
the effort to find it.

אברהם אבינו's glorious beginning is hidden at the end of פרשת נח. Hidden
at the end of the parsha where nobody is looking. Everybody's looking at
how wonderful נח is. And yet אברהם אבינו surpassed him in so many ways.
We're not בני נח, we're בני אברהם, יצחק ויעקב. And בעזרת השם, in that
זכות, may we be זוכה to ביאת גואל צדק במהרה בימינו אמן.
