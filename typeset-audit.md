# Typeset Audit

This is a review-only scan for likely visual punctuation and bidi issues in the built typeset output. It does not edit source files.

PDF scanned: `Files/09 - Misc/Final Sefer/Final Sefer.pdf`
Typst scanned: `Files/09 - Misc/Final Sefer/Final Sefer.typ`
Findings: 34 (2 high, 32 medium)
Visual pages rendered: `typeset-audit-pages`

The PDF scan uses extracted visual text, so it is useful for catching rendered punctuation surprises. The Typst scan catches raw source patterns before rendering.

## HIGH - leading punctuation before Hebrew

- PDF visual text, page 204, Emor 5784, line 11
  - visual: [page-0204.png](typeset-audit-pages/page-0204.png)
  - hardly fathom.)⁩ ⁧,‫ ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר...
  - normalized: hardly fathom.) , ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר סה,...
- PDF visual text, page 469, לטובה - the same way, also all of the     גלות and all of the     גלות in the Yidden, line 6
  - visual: [page-0469.png](typeset-audit-pages/page-0469.png)
  - ,‫ גלות יוון‬,‫ ⁩אך בהווה⁧ ⁩;גלות אדום⁧ ⁩גלות בבל‬- but in the present time, ⁦‫לא י...
  - normalized: , גלות יוון, אך בהווה ;גלות אדום גלות בבל- but in the present time, לא יוכל האדם
## MEDIUM - missing space after colon before Hebrew in Typst source

- Typst source, page 55, Chaya Sara 5787, line 1747
  - visual: [page-0055.png](typeset-audit-pages/page-0055.png)
  - מ״ט:י״ז)⁩: ⁧אַל תִּירָא כִּי יַעֲשִׁר אִישׁ כִּי יִרְבֶּה כְּבוֹד בֵּיתוֹ⁩ - Don't be...
  - normalized: מ״ט:י״ז): אַל תִּירָא כִּי יַעֲשִׁר אִישׁ כִּי יִרְבֶּה כְּבוֹד בֵּיתוֹ - Don't be af...
- Typst source, page 128, Mishpatim (1) 5784, line 4205
  - visual: [page-0128.png](typeset-audit-pages/page-0128.png), [page-0129.png](typeset-audit-pages/page-0129.png)
  - כ״א:ל״ז)⁩: ⁧כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר י...
  - normalized: כ״א:ל״ז): כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר יְש...
- Typst source, page 140, Tetzaveh 5783, line 4630
  - visual: [page-0140.png](typeset-audit-pages/page-0140.png), [page-0141.png](typeset-audit-pages/page-0141.png)
  - כ״ט:ל״ט)⁩⁩, referring to the ⁧קרבן תמיד⁩.
  - normalized: כ״ט:ל״ט), referring to the קרבן תמיד.
- Typst source, page 149, Ki Sisa 5783, line 4914
  - visual: [page-0148.png](typeset-audit-pages/page-0148.png), [page-0149.png](typeset-audit-pages/page-0149.png)
  - ל״ד:ל״ג)⁩: ⁧וַיִּתֵּן עַל פָּנָיו מַסְוֶה⁩ - When ⁧משה רבינו⁩ spoke to the people, th...
  - normalized: ל״ד:ל״ג): וַיִּתֵּן עַל פָּנָיו מַסְוֶה - When משה רבינו spoke to the people, they
- Typst source, page 271, Pinchas 5785, line 9041
  - visual: [page-0271.png](typeset-audit-pages/page-0271.png), [page-0272.png](typeset-audit-pages/page-0272.png)
  - א׳:ג׳)⁩: ⁧וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ⁩ -...
  - normalized: א׳:ג׳): וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ - I'...
- Typst source, page 278, Matos-Massei 5785, line 9253
  - visual: [page-0278.png](typeset-audit-pages/page-0278.png), [page-0279.png](typeset-audit-pages/page-0279.png)
  - shouldn't daven that her son would die. It's brought down in ⁦מכות ב:ו⁩:
  - normalized: shouldn't daven that her son would die. It's brought down in מכות ב:ו:
- Typst source, page 282, Devarim 5784, line 9425
  - visual: [page-0282.png](typeset-audit-pages/page-0282.png)
  - pasuk in ⁦זכריה א׳:ט״ז⁩: ⁧שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים⁩. Another is what we say three
  - normalized: pasuk in זכריה א׳:ט״ז: שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים. Another is what we say three
- Typst source, page 294, Eikev 5784, line 9837
  - visual: [page-0294.png](typeset-audit-pages/page-0294.png), [page-0295.png](typeset-audit-pages/page-0295.png)
  - א׳:ב׳)⁩⁩, and then it says ⁧אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם ⁦(ישעיהו נ״א:י״ב)⁩⁩ lat...
  - normalized: א׳:ב׳), and then it says אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם                  later on
- Typst source, page 371, Shavuos 5784, line 12369
  - visual: [page-0371.png](typeset-audit-pages/page-0371.png), [page-0372.png](typeset-audit-pages/page-0372.png)
  - א:נ״ו)⁩ that at ⁧הר סיני⁩⁦,⁩ ⁧כלל ישראל⁩ was sleeping. They went to sleep that
  - normalized: א:נ״ו) that at הר סיני, כלל ישראל was sleeping. They went to sleep that
- Typst source, page 388, Elul 5785, line 12911
  - visual: [page-0388.png](typeset-audit-pages/page-0388.png)
  - כ״ז:ד׳)⁩⁩. What does ⁧דוד המלך⁩ mean by ⁧כׇּל יְמֵי חַיַּי⁩⁦?⁩
  - normalized: כ״ז:ד׳). What does דוד המלך mean by כׇּל יְמֵי חַיַּי?
- Typst source, page 452, Purim 5785, line 15036
  - visual: [page-0452.png](typeset-audit-pages/page-0452.png), [page-0453.png](typeset-audit-pages/page-0453.png)
  - does this connection mean? He brings a ⁧פסוק⁩ from ⁦שמות ד:י״ד⁩: ⁧וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ⁩. What is ⁦אהרן'⁩s ⁧מידה⁩? We all know abou...
  - normalized: does this connection mean? He brings a פסוק from שמות ד:י״ד: וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ. What is אהרן's מידה? We all know about...
## MEDIUM - quote surrounded by spaces

- PDF visual text, page 7, About the Name, line 27
  - visual: [page-0007.png](typeset-audit-pages/page-0007.png)
  - Zeidy as the ⁧“‫ ⁩”ַּמְלָאְך‬in this pasuk feels natural, as anyone who knows him
  - normalized: Zeidy as the “ ”ַּמְלָאְךin this pasuk feels natural, as anyone who knows him
- PDF visual text, page 31, asked him, “Did you daven during those 40 days?” “What a question! Three, line 5
  - visual: [page-0031.png](typeset-audit-pages/page-0031.png)
  - times a day, of course!” “Did you read any ⁧‫“ ”?⁩תהלים‬Of course,” answered
  - normalized: times a day, of course!” “Did you read any “ ”?תהליםOf course,” answered
- PDF visual text, page 34, Lech Lecha 5784, line 9
  - visual: [page-0034.png](typeset-audit-pages/page-0034.png)
  - ‫ ⁩ְׁשֶמָך‬refers to ⁧‫⁩ֵוֱאֹלֵקי ַיֲעֹקב‬. ⁧”‫ ⁩“ָיכֹול ִיְהיּו חֹוְת ִמין ְּבֻכָּלן‬- the bracha could have ended
  - normalized: ְׁשֶמָךrefers to ֵוֱאֹלֵקי ַיֲעֹקב. ” “ָיכֹול ִיְהיּו חֹוְת ִמין ְּבֻכָּלן- the bracha could have ended
- PDF visual text, page 34, Lech Lecha 5784, line 10
  - visual: [page-0034.png](typeset-audit-pages/page-0034.png)
  - by saying ⁧”‫ ְּבָך חֹוְת ִמין ְוֹלא ָבֶהם‬,‫ “ַּת ְלמּוד לֹוַמר ֶוְהֵיה ְּבָר ָכה‬,‫ ⁩ָמֵגן...
  - normalized: by saying ” ְּבָך חֹוְת ִמין ְוֹלא ָבֶהם, “ַּת ְלמּוד לֹוַמר ֶוְהֵיה ְּבָר ָכה, ָמֵגן ַאְבָר...
- PDF visual text, page 166, Vayikra 5784, line 17
  - visual: [page-0166.png](typeset-audit-pages/page-0166.png)
  - - “If the ⁧ ‫[ ⁩נשיא‬which refers to the ⁧ ‫ ]⁩מלך‬will do an ⁧ ”‫ ⁩עבירה‬- but rather ⁧ ‫ ⁩ֲאֶׁשר‬
  - normalized: - “If the  [ נשיאwhich refers to the   ]מלךwill do an  ” עבירה- but rather   ֲאֶׁשר
- PDF visual text, page 209, Behar 5784, line 17
  - visual: [page-0209.png](typeset-audit-pages/page-0209.png)
  - “The Weekly Vort ” is relevant.
- PDF visual text, page 252, “What brings you here?”     רב ברוך asked. “Well,” the     אלטע Rebbe replied, “I, line 16
  - visual: [page-0252.png](typeset-audit-pages/page-0252.png)
  - collect ⁧‫“ ?⁩צדקה‬But why didn’t you just teach them the meaning of the word
  - normalized: collect “ ?צדקהBut why didn’t you just teach them the meaning of the word
- PDF visual text, page 257, the     משנה in Pirkei Avos that discusses the     ֲעָׂשָר ה ִנִּסים that happened in the   בית, line 17
  - visual: [page-0257.png](typeset-audit-pages/page-0257.png)
  - one ever said, ⁧”‫ ⁩“צר לי המקום‬- meaning Hashem, who is ⁧‫⁩המקום‬. No one ever
  - normalized: one ever said, ” “צר לי המקום- meaning Hashem, who is המקום. No one ever
- PDF visual text, page 347, Dvar Torah Pesach 5783, line 7
  - visual: [page-0347.png](typeset-audit-pages/page-0347.png)
  - is ⁧‫נח‬,⁩ so he called the sefer ⁧‫” “מנחת חן‬, ⁧‫ ⁩חן‬is ⁧‫ ⁩ח‬- ⁧‫ ⁩נ‬and ⁧‫ ⁩נח‬is ⁧‫ ⁩נ‬- ⁧‫]⁩ח‬, asked us...
  - normalized: is נח, so he called the sefer ” “מנחת חן,  חןis  ח-  נand  נחis  נ- ]ח, asked us a
## MEDIUM - space before sentence punctuation

- PDF visual text, page 25, who knew, hummed along with me. This went on for a few moments. After, line 11
  - visual: [page-0025.png](typeset-audit-pages/page-0025.png)
  - words ⁧‫ ⁩לכבוד‬the ⁧,‫ ”⁩שמחה‬he again urged me.
  - normalized: words  לכבודthe , ”שמחהhe again urged me.
- PDF visual text, page 102, witnessed the oil flowing over    ’ַאֲהֹרן s head, down his face, and onto his beard., line 7
  - visual: [page-0102.png](typeset-audit-pages/page-0102.png)
  - to ⁧‫ ⁩כהן גדול‬was entirely genuine. From this ⁧,‫⁩’רבי יהושע בן קרחה⁦ ⁩מדרש‬s position
  - normalized: to  כהן גדולwas entirely genuine. From this ,’רבי יהושע בן קרחה מדרשs position
- PDF visual text, page 121, Yisro 5783, line 27
  - visual: [page-0121.png](typeset-audit-pages/page-0121.png)
  - “I accept upon myself to become ⁦ ‫⁩’ראובן‬s ⁧ ,‫ ”⁩עבד‬he automatically assumes
  - normalized: “I accept upon myself to become  ’ראובןs  , ”עבדhe automatically assumes
- PDF visual text, page 132, - Don’t rush to     דן him to    מיתה . Just as ascending the     מזבח requires deliberate, line 24
  - visual: [page-0132.png](typeset-audit-pages/page-0132.png)
  - is driving on ⁧,‫ ”⁩שבת‬the child exclaimed. The father calmly responded, “He’s
  - normalized: is driving on , ”שבתthe child exclaimed. The father calmly responded, “He’s
- PDF visual text, page 139, is     מקדים the     רפואה before the  ,  ” מכה He creates the     רפואה before He creates the, line 4
  - visual: [page-0139.png](typeset-audit-pages/page-0139.png)
  - is ⁧‫ ⁩מקדים‬the ⁧‫ ⁩רפואה‬before the ⁧,‫ ”⁩מכה‬He creates the ⁧‫ ⁩רפואה‬before He creates the
  - normalized: is  מקדיםthe  רפואהbefore the , ”מכהHe creates the  רפואהbefore He creates the
- PDF visual text, page 211, Bechukosai 5784, line 11
  - visual: [page-0211.png](typeset-audit-pages/page-0211.png)
  - keep the ⁧,‫ ”⁩תורה‬which we are about to reaccept on ⁧‫שבועות‬,⁩ “then I will give
  - normalized: keep the , ”תורהwhich we are about to reaccept on שבועות, “then I will give
- PDF visual text, page 275, R’ Chaim immediately responded,     “חולה doesn’t mean sick in this context., line 5
  - visual: [page-0275.png](typeset-audit-pages/page-0275.png)
  - It means dancing, as in ⁧ ,‫ ”⁩מחול‬as the ⁧ ‫ ⁩משנה‬in ⁧ ‫ ⁩תענית‬says: ⁧ ‫יוצאות במחולות‬
  - normalized: It means dancing, as in  , ”מחולas the   משנהin   תעניתsays:  יוצאות במחולות
- PDF visual text, page 277, מותר ,  is now     אסור to me, it’s a     הזיק to his     נשמה in exactly the same way as     חזיר, line 16
  - visual: [page-0277.png](typeset-audit-pages/page-0277.png)
  - “This is ⁧,‫ ”⁩תרומה‬it’s now ⁧‫⁩תרומה‬. If a ⁧‫ ⁩זר‬eats that, he’s ⁧‫⁩חייב כרת‬. So you...
  - normalized: “This is , ”תרומהit’s now תרומה. If a  זרeats that, he’s חייב כרת. So you can take
- PDF visual text, page 290, to start filling in this    בור . It’s too big. I’ll never be able to finish it. Might as, line 26
  - visual: [page-0290.png](typeset-audit-pages/page-0290.png)
  - are you not coming to give a ⁧‫ ⁩שלום עליכם‬to my father-in-law the ⁦‫ ?” ב״ח‬The
  - normalized: are you not coming to give a  שלום עליכםto my father-in-law the  ?” ב״חThe
- PDF visual text, page 409, Sukkos 5786, line 18
  - visual: [page-0409.png](typeset-audit-pages/page-0409.png)
  - will say, “Okay, I’ll give you a ⁧,‫ ”⁩מצוה‬and He’ll give them the ⁧‫ ⁩מצוה‬of ⁧‫סוכה‬,⁩
  - normalized: will say, “Okay, I’ll give you a , ”מצוהand He’ll give them the  מצוהof סוכה,
- PDF visual text, page 409, Sukkos 5786, line 21
  - visual: [page-0409.png](typeset-audit-pages/page-0409.png)
  - this “easy ⁧‫?”⁩מצוה‬
  - normalized: this “easy ?”מצוה
- PDF visual text, page 450, A rav named R’ Mordechai Sabato explains that since each event in the first, line 28
  - visual: [page-0450.png](typeset-audit-pages/page-0450.png)
  - What are the central words of this ⁧‫ !⁩ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י⁧ ?⁩פסוק‬Until ⁦‫⁩’מרדכי‬s name is
  - normalized: What are the central words of this  !ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י פסוק?Until ’מרדכיs name is
