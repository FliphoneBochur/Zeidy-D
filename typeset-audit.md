# Typeset Audit

This is a review-only scan for likely visual punctuation and bidi issues in the built typeset output. It does not edit source files.

PDF scanned: `Files/09 - Misc/Final Sefer/Final Sefer.pdf`
Typst scanned: `Files/09 - Misc/Final Sefer/Final Sefer.typ`
Findings: 35 (2 high, 33 medium)
Visual pages rendered: `typeset-audit-pages`

The PDF scan uses extracted visual text, so it is useful for catching rendered punctuation surprises. The Typst scan catches raw source patterns before rendering.

## HIGH - leading punctuation before Hebrew

- PDF visual text, page 208, Emor 5784, line 11
  - visual: [page-0208.png](typeset-audit-pages/page-0208.png)
  - hardly fathom.)⁩ ⁧,‫ ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר...
  - normalized: hardly fathom.) , ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר סה,...
- PDF visual text, page 473, לטובה - the same way, also all of the     גלות and all of the     גלות in the Yidden, line 6
  - visual: [page-0473.png](typeset-audit-pages/page-0473.png)
  - ,‫ גלות יוון‬,‫ ⁩אך בהווה⁧ ⁩;גלות אדום⁧ ⁩גלות בבל‬- but in the present time, ⁦‫לא י...
  - normalized: , גלות יוון, אך בהווה ;גלות אדום גלות בבל- but in the present time, לא יוכל האדם
## MEDIUM - missing space after colon before Hebrew in Typst source

- Typst source, page 59, Chayai Sara 5787, line 1833
  - visual: [page-0059.png](typeset-audit-pages/page-0059.png)
  - מ״ט:י״ז)⁩: ⁧אַל תִּירָא כִּי יַעֲשִׁר אִישׁ כִּי יִרְבֶּה כְּבוֹד בֵּיתוֹ⁩ - Don't be...
  - normalized: מ״ט:י״ז): אַל תִּירָא כִּי יַעֲשִׁר אִישׁ כִּי יִרְבֶּה כְּבוֹד בֵּיתוֹ - Don't be af...
- Typst source, page 132, Mishpatim (1) 5784, line 4291
  - visual: [page-0132.png](typeset-audit-pages/page-0132.png), [page-0133.png](typeset-audit-pages/page-0133.png)
  - כ״א:ל״ז)⁩: ⁧כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר י...
  - normalized: כ״א:ל״ז): כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר יְש...
- Typst source, page 144, Tetzaveh 5783, line 4716
  - visual: [page-0144.png](typeset-audit-pages/page-0144.png), [page-0145.png](typeset-audit-pages/page-0145.png)
  - כ״ט:ל״ט)⁩⁩, referring to the ⁧קרבן תמיד⁩.
  - normalized: כ״ט:ל״ט), referring to the קרבן תמיד.
- Typst source, page 153, Ki Sisa 5783, line 5000
  - visual: [page-0152.png](typeset-audit-pages/page-0152.png), [page-0153.png](typeset-audit-pages/page-0153.png)
  - ל״ד:ל״ג)⁩: ⁧וַיִּתֵּן עַל פָּנָיו מַסְוֶה⁩ - When ⁧משה רבינו⁩ spoke to the people, th...
  - normalized: ל״ד:ל״ג): וַיִּתֵּן עַל פָּנָיו מַסְוֶה - When משה רבינו spoke to the people, they
- Typst source, page 275, Pinchas 5785, line 9127
  - visual: [page-0275.png](typeset-audit-pages/page-0275.png), [page-0276.png](typeset-audit-pages/page-0276.png)
  - א׳:ג׳)⁩: ⁧וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ⁩ -...
  - normalized: א׳:ג׳): וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ - I'...
- Typst source, page 282, Matos-Massei 5785, line 9339
  - visual: [page-0282.png](typeset-audit-pages/page-0282.png), [page-0283.png](typeset-audit-pages/page-0283.png)
  - shouldn't daven that her son would die. It's brought down in ⁦מכות ב:ו⁩:
  - normalized: shouldn't daven that her son would die. It's brought down in מכות ב:ו:
- Typst source, page 286, Devarim 5784, line 9511
  - visual: [page-0286.png](typeset-audit-pages/page-0286.png)
  - pasuk in ⁦זכריה א׳:ט״ז⁩: ⁧שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים⁩. Another is what we say three
  - normalized: pasuk in זכריה א׳:ט״ז: שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים. Another is what we say three
- Typst source, page 298, Eikev 5784, line 9923
  - visual: [page-0298.png](typeset-audit-pages/page-0298.png), [page-0299.png](typeset-audit-pages/page-0299.png)
  - א׳:ב׳)⁩⁩, and then it says ⁧אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם ⁦(ישעיהו נ״א:י״ב)⁩⁩ lat...
  - normalized: א׳:ב׳), and then it says אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם                  later on
- Typst source, page 375, Shavuos 5784, line 12455
  - visual: [page-0375.png](typeset-audit-pages/page-0375.png), [page-0376.png](typeset-audit-pages/page-0376.png)
  - א:נ״ו)⁩ that at ⁧הר סיני⁩⁦,⁩ ⁧כלל ישראל⁩ was sleeping. They went to sleep that
  - normalized: א:נ״ו) that at הר סיני, כלל ישראל was sleeping. They went to sleep that
- Typst source, page 392, Elul 5785, line 12997
  - visual: [page-0392.png](typeset-audit-pages/page-0392.png)
  - כ״ז:ד׳)⁩⁩. What does ⁧דוד המלך⁩ mean by ⁧כׇּל יְמֵי חַיַּי⁩⁦?⁩
  - normalized: כ״ז:ד׳). What does דוד המלך mean by כׇּל יְמֵי חַיַּי?
- Typst source, page 456, Purim 5785, line 15122
  - visual: [page-0456.png](typeset-audit-pages/page-0456.png), [page-0457.png](typeset-audit-pages/page-0457.png)
  - does this connection mean? He brings a ⁧פסוק⁩ from ⁦שמות ד:י״ד⁩: ⁧וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ⁩. What is ⁦אהרן'⁩s ⁧מידה⁩? We all know abou...
  - normalized: does this connection mean? He brings a פסוק from שמות ד:י״ד: וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ. What is אהרן's מידה? We all know about...
## MEDIUM - quote surrounded by spaces

- PDF visual text, page 11, About the Name, line 27
  - visual: [page-0011.png](typeset-audit-pages/page-0011.png)
  - Zeidy as the ⁧“‫ ⁩”ַּמְלָאְך‬in this pasuk feels natural, as anyone who knows him
  - normalized: Zeidy as the “ ”ַּמְלָאְךin this pasuk feels natural, as anyone who knows him
- PDF visual text, page 35, asked him, “Did you daven during those 40 days?” “What a question! Three, line 5
  - visual: [page-0035.png](typeset-audit-pages/page-0035.png)
  - times a day, of course!” “Did you read any ⁧‫“ ”?⁩תהלים‬Of course,” answered
  - normalized: times a day, of course!” “Did you read any “ ”?תהליםOf course,” answered
- PDF visual text, page 38, Lech Lecha 5784, line 9
  - visual: [page-0038.png](typeset-audit-pages/page-0038.png)
  - ‫ ⁩ְׁשֶמָך‬refers to ⁧‫⁩ֵוֱאֹלֵקי ַיֲעֹקב‬. ⁧”‫ ⁩“ָיכֹול ִיְהיּו חֹוְת ִמין ְּבֻכָּלן‬- the bracha could have ended
  - normalized: ְׁשֶמָךrefers to ֵוֱאֹלֵקי ַיֲעֹקב. ” “ָיכֹול ִיְהיּו חֹוְת ִמין ְּבֻכָּלן- the bracha could have ended
- PDF visual text, page 38, Lech Lecha 5784, line 10
  - visual: [page-0038.png](typeset-audit-pages/page-0038.png)
  - by saying ⁧”‫ ְּבָך חֹוְת ִמין ְוֹלא ָבֶהם‬,‫ “ַּת ְלמּוד לֹוַמר ֶוְהֵיה ְּבָר ָכה‬,‫ ⁩ָמֵגן...
  - normalized: by saying ” ְּבָך חֹוְת ִמין ְוֹלא ָבֶהם, “ַּת ְלמּוד לֹוַמר ֶוְהֵיה ְּבָר ָכה, ָמֵגן ַאְבָר...
- PDF visual text, page 170, Vayikra 5784, line 17
  - visual: [page-0170.png](typeset-audit-pages/page-0170.png)
  - - “If the ⁧ ‫[ ⁩נשיא‬which refers to the ⁧ ‫ ]⁩מלך‬will do an ⁧ ”‫ ⁩עבירה‬- but rather ⁧ ‫ ⁩ֲאֶׁשר‬
  - normalized: - “If the  [ נשיאwhich refers to the   ]מלךwill do an  ” עבירה- but rather   ֲאֶׁשר
- PDF visual text, page 213, Behar 5784, line 17
  - visual: [page-0213.png](typeset-audit-pages/page-0213.png)
  - “The Weekly Vort ” is relevant.
- PDF visual text, page 256, “What brings you here?”     רב ברוך asked. “Well,” the     אלטע Rebbe replied, “I, line 16
  - visual: [page-0256.png](typeset-audit-pages/page-0256.png)
  - collect ⁧‫“ ?⁩צדקה‬But why didn’t you just teach them the meaning of the word
  - normalized: collect “ ?צדקהBut why didn’t you just teach them the meaning of the word
- PDF visual text, page 261, the     משנה in Pirkei Avos that discusses the     ֲעָׂשָר ה ִנִּסים that happened in the   בית, line 17
  - visual: [page-0261.png](typeset-audit-pages/page-0261.png)
  - one ever said, ⁧”‫ ⁩“צר לי המקום‬- meaning Hashem, who is ⁧‫⁩המקום‬. No one ever
  - normalized: one ever said, ” “צר לי המקום- meaning Hashem, who is המקום. No one ever
- PDF visual text, page 351, Dvar Torah Pesach 5783, line 7
  - visual: [page-0351.png](typeset-audit-pages/page-0351.png)
  - is ⁧‫נח‬,⁩ so he called the sefer ⁧‫” “מנחת חן‬, ⁧‫ ⁩חן‬is ⁧‫ ⁩ח‬- ⁧‫ ⁩נ‬and ⁧‫ ⁩נח‬is ⁧‫ ⁩נ‬- ⁧‫]⁩ח‬, asked us...
  - normalized: is נח, so he called the sefer ” “מנחת חן,  חןis  ח-  נand  נחis  נ- ]ח, asked us a
## MEDIUM - space before sentence punctuation

- PDF visual text, page 2, May all of Klal Yisroel merit a Ksiva V’chasima Tova, and may this Sefer, line 6
  - visual: [page-0002.png](typeset-audit-pages/page-0002.png)
  - “Hakadosh Boruch Hu Y’shalem S’charam .….”
- PDF visual text, page 29, who knew, hummed along with me. This went on for a few moments. After, line 11
  - visual: [page-0029.png](typeset-audit-pages/page-0029.png)
  - words ⁧‫ ⁩לכבוד‬the ⁧,‫ ”⁩שמחה‬he again urged me.
  - normalized: words  לכבודthe , ”שמחהhe again urged me.
- PDF visual text, page 106, witnessed the oil flowing over    ’ַאֲהֹרן s head, down his face, and onto his beard., line 7
  - visual: [page-0106.png](typeset-audit-pages/page-0106.png)
  - to ⁧‫ ⁩כהן גדול‬was entirely genuine. From this ⁧,‫⁩’רבי יהושע בן קרחה⁦ ⁩מדרש‬s position
  - normalized: to  כהן גדולwas entirely genuine. From this ,’רבי יהושע בן קרחה מדרשs position
- PDF visual text, page 125, Yisro 5783, line 27
  - visual: [page-0125.png](typeset-audit-pages/page-0125.png)
  - “I accept upon myself to become ⁦ ‫⁩’ראובן‬s ⁧ ,‫ ”⁩עבד‬he automatically assumes
  - normalized: “I accept upon myself to become  ’ראובןs  , ”עבדhe automatically assumes
- PDF visual text, page 136, - Don’t rush to     דן him to    מיתה . Just as ascending the     מזבח requires deliberate, line 24
  - visual: [page-0136.png](typeset-audit-pages/page-0136.png)
  - is driving on ⁧,‫ ”⁩שבת‬the child exclaimed. The father calmly responded, “He’s
  - normalized: is driving on , ”שבתthe child exclaimed. The father calmly responded, “He’s
- PDF visual text, page 143, is     מקדים the     רפואה before the  ,  ” מכה He creates the     רפואה before He creates the, line 4
  - visual: [page-0143.png](typeset-audit-pages/page-0143.png)
  - is ⁧‫ ⁩מקדים‬the ⁧‫ ⁩רפואה‬before the ⁧,‫ ”⁩מכה‬He creates the ⁧‫ ⁩רפואה‬before He creates the
  - normalized: is  מקדיםthe  רפואהbefore the , ”מכהHe creates the  רפואהbefore He creates the
- PDF visual text, page 215, Bechukosai 5784, line 11
  - visual: [page-0215.png](typeset-audit-pages/page-0215.png)
  - keep the ⁧,‫ ”⁩תורה‬which we are about to reaccept on ⁧‫שבועות‬,⁩ “then I will give
  - normalized: keep the , ”תורהwhich we are about to reaccept on שבועות, “then I will give
- PDF visual text, page 279, R’ Chaim immediately responded,     “חולה doesn’t mean sick in this context., line 5
  - visual: [page-0279.png](typeset-audit-pages/page-0279.png)
  - It means dancing, as in ⁧ ,‫ ”⁩מחול‬as the ⁧ ‫ ⁩משנה‬in ⁧ ‫ ⁩תענית‬says: ⁧ ‫יוצאות במחולות‬
  - normalized: It means dancing, as in  , ”מחולas the   משנהin   תעניתsays:  יוצאות במחולות
- PDF visual text, page 281, מותר ,  is now     אסור to me, it’s a     הזיק to his     נשמה in exactly the same way as     חזיר, line 16
  - visual: [page-0281.png](typeset-audit-pages/page-0281.png)
  - “This is ⁧,‫ ”⁩תרומה‬it’s now ⁧‫⁩תרומה‬. If a ⁧‫ ⁩זר‬eats that, he’s ⁧‫⁩חייב כרת‬. So you...
  - normalized: “This is , ”תרומהit’s now תרומה. If a  זרeats that, he’s חייב כרת. So you can take
- PDF visual text, page 294, to start filling in this    בור . It’s too big. I’ll never be able to finish it. Might as, line 26
  - visual: [page-0294.png](typeset-audit-pages/page-0294.png)
  - are you not coming to give a ⁧‫ ⁩שלום עליכם‬to my father-in-law the ⁦‫ ?” ב״ח‬The
  - normalized: are you not coming to give a  שלום עליכםto my father-in-law the  ?” ב״חThe
- PDF visual text, page 413, Sukkos 5786, line 18
  - visual: [page-0413.png](typeset-audit-pages/page-0413.png)
  - will say, “Okay, I’ll give you a ⁧,‫ ”⁩מצוה‬and He’ll give them the ⁧‫ ⁩מצוה‬of ⁧‫סוכה‬,⁩
  - normalized: will say, “Okay, I’ll give you a , ”מצוהand He’ll give them the  מצוהof סוכה,
- PDF visual text, page 413, Sukkos 5786, line 21
  - visual: [page-0413.png](typeset-audit-pages/page-0413.png)
  - this “easy ⁧‫?”⁩מצוה‬
  - normalized: this “easy ?”מצוה
- PDF visual text, page 454, A rav named R’ Mordechai Sabato explains that since each event in the first, line 28
  - visual: [page-0454.png](typeset-audit-pages/page-0454.png)
  - What are the central words of this ⁧‫ !⁩ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י⁧ ?⁩פסוק‬Until ⁦‫⁩’מרדכי‬s name is
  - normalized: What are the central words of this  !ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י פסוק?Until ’מרדכיs name is
