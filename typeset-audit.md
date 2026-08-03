# Typeset Audit

This is a review-only scan for likely visual punctuation and bidi issues in the built typeset output. It does not edit source files.

PDF scanned: `Files/08 - Misc/Final Sefer/Final Sefer.pdf`
Typst scanned: `Files/08 - Misc/Final Sefer/Final Sefer.typ`
Findings: 19 (3 high, 16 medium)
Visual pages rendered: no

The PDF scan uses extracted visual text, so it is useful for catching rendered punctuation surprises. The Typst scan catches raw source patterns before rendering.

## HIGH - leading punctuation before Hebrew

- PDF visual text, page 197, Emor 5784, line 11
  - hardly fathom.)⁩ ⁧,‫ ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר...
  - normalized: hardly fathom.) , ַאל ִּת ְהיּו ַכֲעָבִד ים ַהְמַׁשְּמִׁשין ֶאת ָהַר ב ַעל ְמָנת ְלַקֵּבל ְּפָר סה,...
- PDF visual text, page 445, Shabbos - The Gift of Olam Haba in This World, line 17
  - The ⁧‫ ⁩גמרא‬says, ⁧,‫ אמר להם הקדוש ברוך הוא למשה‬,‫ כי אני ה׳ מקדשכם‬,‫ לדעת‬,‫תני נמי הכי‬
  - normalized: The  גמראsays, , אמר להם הקדוש ברוך הוא למשה, כי אני ה׳ מקדשכם, לדעתת,ני נמי הכי
- PDF visual text, page 457, לטובה - the same way, also all of the     גלות and all of the     גלות in the Yidden, line 6
  - ,‫ גלות יוון‬,‫ ⁩אך בהווה⁧ ⁩;גלות אדום⁧ ⁩גלות בבל‬- but in the present time, ⁦‫לא י...
  - normalized: , גלות יוון, אך בהווה ;גלות אדום גלות בבל- but in the present time, לא יוכל האדם
## MEDIUM - missing space after colon before Hebrew in Typst source

- Typst source, line 3628
  - כ״א:ל״ז)⁩: ⁧כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר י...
  - normalized: כ״א:ל״ז): כִּי יִגְנֹב אִישׁ שׁוֹר אוֹ שֶׂה וּטְבָחוֹ אוֹ מְכָרוֹ חֲמִשָּׁה בָקָר יְש...
- Typst source, line 4024
  - כ״ט:ל״ט)⁩ referring to the ⁧קרבן תמיד⁩.
  - normalized: כ״ט:ל״ט) referring to the קרבן תמיד.
- Typst source, line 4289
  - ל״ד:ל״ג)⁩: ⁧וַיִּתֵּן עַל פָּנָיו מַסְוֶה⁩ - When ⁧משה רבינו⁩ spoke to the people, th...
  - normalized: ל״ד:ל״ג): וַיִּתֵּן עַל פָּנָיו מַסְוֶה - When משה רבינו spoke to the people, they
- Typst source, line 8131
  - א׳:ג׳)⁩: ⁧וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ⁩ -...
  - normalized: א׳:ג׳): וַיְצַו אֶת שְׁלֹמֹה בְנוֹ לֵאמֹר אָנֹכִי הֹלֵךְ בְּדֶרֶךְ כׇּל הָאָרֶץ - I'...
- Typst source, line 8328
  - shouldn't daven that her son would die. It's brought down in ⁦מכות ב:ו⁩:
  - normalized: shouldn't daven that her son would die. It's brought down in מכות ב:ו:
- Typst source, line 8490
  - pasuk in ⁦זכריה א׳:ט״ז⁩: ⁧שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים⁩. Another is what we say three
  - normalized: pasuk in זכריה א׳:ט״ז: שַׁבְתִּי לִירוּשָׁלַם בְּרַחֲמִים. Another is what we say three
- Typst source, line 8876
  - א׳:ב׳)⁩, and then it says ⁧אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם⁩ ⁦(ישעיהו נ״א:י״ב)⁩ late...
  - normalized: א׳:ב׳), and then it says אָנֹכִי אָנֹכִי הוּא מְנַחֶמְכֶם                  later on
- Typst source, line 11116
  - א:נ״ו)⁩ that at ⁧הר סיני⁩⁦,⁩ ⁧כלל ישראל⁩ was sleeping. They went to sleep that
  - normalized: א:נ״ו) that at הר סיני, כלל ישראל was sleeping. They went to sleep that
- Typst source, line 11608
  - כ״ז:ד׳)⁩⁩. What does ⁧דוד המלך⁩ mean by ⁧כׇּל יְמֵי חַיַּי⁩⁦?⁩
  - normalized: כ״ז:ד׳). What does דוד המלך mean by כׇּל יְמֵי חַיַּי?
- Typst source, line 13572
  - does this connection mean? He brings a ⁧פסוק⁩ from ⁦שמות ד:י״ד⁩: ⁧וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ⁩. What is ⁦אהרן'⁩s ⁧מידה⁩? We all know abou...
  - normalized: does this connection mean? He brings a פסוק from שמות ד:י״ד: וְרָאֲךָ וְשָׂמַח בְּלִבּוֹ. What is אהרן's מידה? We all know about...
## MEDIUM - space before sentence punctuation

- PDF visual text, page 28, Lech Lecha 5784, line 10
  - by saying ⁧,‫⁧“ ⁩ָמֵגן ַאְבָר ָהם ִיְצָחק ְוַיֲעֹקב‬,‫ ⁩”ְּבָך חֹוְת ִמין ְוֹלא ָבֶה ם⁦ ⁩ַּ...
  - normalized: by saying ,“ ָמֵגן ַאְבָר ָהם ִיְצָחק ְוַיֲעֹקב, ”ְּבָך חֹוְת ִמין ְוֹלא ָבֶה ם ַּת ְלמּוד...
- PDF visual text, page 95, witnessed the oil flowing over    ’ַאֲהֹרן s head, down his face, and onto his beard., line 7
  - to ⁧‫ ⁩כהן גדול‬was entirely genuine. From this ⁧,‫⁩’רבי יהושע בן קרחה⁦ ⁩מדרש‬s position
  - normalized: to  כהן גדולwas entirely genuine. From this ,’רבי יהושע בן קרחה מדרשs position
- PDF visual text, page 283, to start filling in this    בור . It’s too big. I’ll never be able to finish it. Might as, line 26
  - are you not coming to give a ⁧‫ ⁩שלום עליכם‬to my father-in-law the ⁦‫ ?“ ב״ח‬The
  - normalized: are you not coming to give a  שלום עליכםto my father-in-law the  ?“ ב״חThe
- PDF visual text, page 399, Sukkos 5786, line 21
  - this “easy ⁦‫?⁩”מצוה‬
  - normalized: this “easy ?”מצוה
- PDF visual text, page 440, A rav named R’ Mordechai Sabato explains that since each event in the first, line 28
  - What are the central words of this ⁧‫ !⁩ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י⁧ ?⁩פסוק‬Until ⁦‫⁩’מרדכי‬s name is
  - normalized: What are the central words of this  !ׇמׇמ ְר ֳּד ַכי ַהְּיהּוִד י פסוק?Until ’מרדכיs name is
## MEDIUM - space on both sides of semicolon in Typst source

- Typst source, line 4087
  - \; ⁧בן ננס⁩ says ⁧וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ⁩ ⁦(ויקרא י״ט:י״ח)⁩ \; ⁧שמעון בן פזי⁩ says from
  - normalized: \; בן ננס says וְאָהַבְתָּ לְרֵעֲךָ כָּמוֹךָ (ויקרא י״ט:י״ח) \; שמעון בן פזי says from
