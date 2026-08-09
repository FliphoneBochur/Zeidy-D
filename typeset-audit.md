# Typeset Audit

This is a review-only scan for likely visual punctuation and bidi issues in the built typeset output. It does not edit source files.

PDF scanned: `Files/08 - Misc/Final Sefer/Final Sefer.pdf`
Typst scanned: `Files/08 - Misc/Final Sefer/Final Sefer.typ`
Findings: 19 (3 high, 16 medium)
Visual pages rendered: `typeset-audit-pages`

The PDF scan uses extracted visual text, so it is useful for catching rendered punctuation surprises. The Typst scan catches raw source patterns before rendering.

## HIGH - leading punctuation before Hebrew

- PDF visual text, page 197, Emor 5784, line 11
  - visual: [page-0197.png](typeset-audit-pages/page-0197.png)
  - hardly fathom.)⁩ ⁧,‫ ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר...
  - normalized: hardly fathom.) , ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר סה,...
- PDF visual text, page 445, Shabbos - The Gift of Olam Haba in This World, line 17
  - visual: [page-0445.png](typeset-audit-pages/page-0445.png)
  - The ⁧‫ ⁩גמרא‬says, ⁧,‫ אמר להם הקדוש ברוך הוא למשה‬,‫ כי אני ה׳ מקדשכם‬,‫ לדעת‬,‫תני נמי הכי‬
  - normalized: The  גמראsays, , אמר להם הקדוש ברוך הוא למשה, כי אני ה׳ מקדשכם, לדעתת,ני נמי הכי
- PDF visual text, page 457, לטובה - the same way, also all of the     גלות and all of the     גלות in the Yidden, line 6
  - visual: [page-0457.png](typeset-audit-pages/page-0457.png)
  - ,‫ גלות יוון‬,‫ ⁩אך בהווה⁧ ⁩;גלות אדום⁧ ⁩גלות בבל‬- but in the present time, ⁦‫לא י...
  - normalized: , גלות יוון, אך בהווה ;גלות אדום גלות בבל- but in the present time, לא יוכל האדם
## MEDIUM - missing space after colon before Hebrew in Typst source

- Typst source, page 121, Mishpatim (1) 5784, line 3627
  - visual: [page-0121.png](typeset-audit-pages/page-0121.png), [page-0122.png](typeset-audit-pages/page-0122.png)
  - כ״א:ל״ז)⁩: ⁧כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר י...
  - normalized: כ״א:ל״ז): כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר יְש...
- Typst source, page 133, Tetzaveh 5783, line 4022
  - visual: [page-0133.png](typeset-audit-pages/page-0133.png), [page-0134.png](typeset-audit-pages/page-0134.png)
  - כ״ט:ל״ט)⁩⁩, referring to the ⁧קרבן תמיד⁩.
  - normalized: כ״ט:ל״ט), referring to the קרבן תמיד.
- Typst source, page 142, Ki Sisa 5783, line 4287
  - visual: [page-0141.png](typeset-audit-pages/page-0141.png), [page-0142.png](typeset-audit-pages/page-0142.png)
  - ל״ד:ל״ג)⁩: ⁧וַיִּתֵּן עַל פָּנָיו מַסְוֶה⁩ - When ⁧משה רבינו⁩ spoke to the people, th...
  - normalized: ל״ד:ל״ג): וַיִּתֵּן עַל פָּנָיו מַסְוֶה - When משה רבינו spoke to the people, they
- Typst source, page 264, Pinchas 5785, line 8129
  - visual: [page-0264.png](typeset-audit-pages/page-0264.png), [page-0265.png](typeset-audit-pages/page-0265.png)
  - א׳:ג׳)⁩: ⁧וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ⁩ -...
  - normalized: א׳:ג׳): וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ - I'...
- Typst source, page 271, Matos Massei 5785, line 8326
  - visual: [page-0271.png](typeset-audit-pages/page-0271.png), [page-0272.png](typeset-audit-pages/page-0272.png)
  - shouldn't daven that her son would die. It's brought down in ⁦מכות ב:ו⁩:
  - normalized: shouldn't daven that her son would die. It's brought down in מכות ב:ו:
- Typst source, page 275, Devarim 5784, line 8488
  - visual: [page-0275.png](typeset-audit-pages/page-0275.png)
  - pasuk in ⁦זכריה א׳:ט״ז⁩: ⁧שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים⁩. Another is what we say three
  - normalized: pasuk in זכריה א׳:ט״ז: שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים. Another is what we say three
- Typst source, page 287, Eikev 5784, line 8874
  - visual: [page-0287.png](typeset-audit-pages/page-0287.png), [page-0288.png](typeset-audit-pages/page-0288.png)
  - א׳:ב׳)⁩⁩, and then it says ⁧אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם ⁦(ישעיהו נ״א:י״ב)⁩⁩ lat...
  - normalized: א׳:ב׳), and then it says אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם                  later on
- Typst source, page 361, Shavuos 5784, line 11116
  - visual: [page-0361.png](typeset-audit-pages/page-0361.png), [page-0362.png](typeset-audit-pages/page-0362.png)
  - א:נ״ו)⁩ that at ⁧הר סיני⁩⁦,⁩ ⁧כלל ישראל⁩ was sleeping. They went to sleep that
  - normalized: א:נ״ו) that at הר סיני, כלל ישראל was sleeping. They went to sleep that
- Typst source, page 378, Elul 5785, line 11608
  - visual: [page-0378.png](typeset-audit-pages/page-0378.png)
  - כ״ז:ד׳)⁩⁩. What does ⁧דוד המלך⁩ mean by ⁧כׇּל יְמֵי חַיַּי⁩⁦?⁩
  - normalized: כ״ז:ד׳). What does דוד המלך mean by כׇּל יְמֵי חַיַּי?
- Typst source, page 442, Purim 5785, line 13573
  - visual: [page-0442.png](typeset-audit-pages/page-0442.png), [page-0443.png](typeset-audit-pages/page-0443.png)
  - does this connection mean? He brings a ⁧פסוק⁩ from ⁦שמות ד:י״ד⁩: ⁧וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ⁩. What is ⁦אהרן'⁩s ⁧מידה⁩? We all know abou...
  - normalized: does this connection mean? He brings a פסוק from שמות ד:י״ד: וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ. What is אהרן's מידה? We all know about...
## MEDIUM - space before sentence punctuation

- PDF visual text, page 28, Lech Lecha 5784, line 10
  - visual: [page-0028.png](typeset-audit-pages/page-0028.png)
  - by saying ⁧,‫⁧“ ⁩ָמֵגן ַאְבָר ָהם ִיְצָחק ְוַיֲעֹקב‬,‫ ⁩”ְּבָך חֹוְת ִמין ְוֹלא ָבֶה ם⁦ ⁩ַּ...
  - normalized: by saying ,“ ָמֵגן ַאְבָר ָהם ִיְצָחק ְוַיֲעֹקב, ”ְּבָך חֹוְת ִמין ְוֹלא ָבֶה ם ַּת ְלמּוד...
- PDF visual text, page 95, witnessed the oil flowing over    ’ַאֲהֹרן s head, down his face, and onto his beard., line 7
  - visual: [page-0095.png](typeset-audit-pages/page-0095.png)
  - to ⁧‫ ⁩כהן גדול‬was entirely genuine. From this ⁧,‫⁩’רבי יהושע בן קרחה⁦ ⁩מדרש‬s position
  - normalized: to  כהן גדולwas entirely genuine. From this ,’רבי יהושע בן קרחה מדרשs position
- PDF visual text, page 283, to start filling in this    בור . It’s too big. I’ll never be able to finish it. Might as, line 26
  - visual: [page-0283.png](typeset-audit-pages/page-0283.png)
  - are you not coming to give a ⁧‫ ⁩שלום עליכם‬to my father-in-law the ⁦‫ ?“ ב״ח‬The
  - normalized: are you not coming to give a  שלום עליכםto my father-in-law the  ?“ ב״חThe
- PDF visual text, page 399, Sukkos 5786, line 21
  - visual: [page-0399.png](typeset-audit-pages/page-0399.png)
  - this “easy ⁦‫?⁩”מצוה‬
  - normalized: this “easy ?”מצוה
- PDF visual text, page 440, A rav named R’ Mordechai Sabato explains that since each event in the first, line 28
  - visual: [page-0440.png](typeset-audit-pages/page-0440.png)
  - What are the central words of this ⁧‫ !⁩ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י⁧ ?⁩פסוק‬Until ⁦‫⁩’מרדכי‬s name is
  - normalized: What are the central words of this  !ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י פסוק?Until ’מרדכיs name is
## MEDIUM - space on both sides of semicolon in Typst source

- Typst source, page 136, Tetzaveh (1) 5784, line 4085
  - visual: [page-0135.png](typeset-audit-pages/page-0135.png), [page-0136.png](typeset-audit-pages/page-0136.png)
  - \; ⁧בן ננס⁩ says ⁧וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ⁩ ⁦(ויקרא י״ט:י״ח)⁩ \; ⁧שמעון בן פזי⁩ says from
  - normalized: \; בן ננס says וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ (ויקרא י״ט:י״ח) \; שמעון בן פזי says from
