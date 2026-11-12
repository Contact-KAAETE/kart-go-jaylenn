# Kart Go V4 — testresultaten

Geteste kandidaat: ontwikkeltak work/kart-go-v4-20261111, 11–12 november 2026. Bedenker Jaylenn.

## Functionele regressies (Node, echte spelcode)
`node tests/game.test.cjs` slaagt.
- Alle50 banen hebben verschillende curven en worden zonder teleport/extra snelheid uitgereden door dezelfde begrensde stuurcontroller. Groen20/20 gewonnen; zand27/30 gewonnen,30/30 voltooid. Dit is een geautomatiseerde rijtest, geen kindergebruikerstest.
- Alle3 besturingen, simultaan gas/rem/stuur, pointereigenaarschap, meerdere vingers, loslaten/cancel/lostcapture, pauze/hervatten en rotatie.
- Nieuw gevonden fout hersteld: een verse start bij net gewijzigd schermformaat pauzeerde onbedoeld. Bestaande race pauzeert bij draaien nog wel.
- Exacte Green-itemgrenzen50/20/15/10/5. Hypnose10s ook bij leidende speler. Banaan2s draaien, automatisch eindigend. Zand uitsluitend Hypnose/IJs/Banaan; handmatig ingebrachte boost geweigerd; freeze2s en weer verder rijden.
- Hotdog-Hond:9 eenmalige blocks, geen botcollectie, schot10s, freeze2s, Jump beschermt. Pizzaman verschijnt op50 zonder ongeautoriseerde speciale ijsaanval.
- Oude V1/V3-save behouden + extra back-up; lokale prototypealias/avatar/kleur/code migreren naar echte profielopslag.
- Garagekleur/avatar/effect/identiteit blijven bewaard. Splash bereikt15, Boem40 en2s afkoeling. XP5 glans, glitterkaartbeloning, geen-effect.
- Export/importroundtrip behoudt en combineert overwinningen/beste tijd/profiel/XP/beloningen/instellingen; foutieve of te grote import wordt geweigerd.

## Echte browser (Chromium)
- Op390×844 de bestaande V3 vóór wijziging geopend en Boost via echte browserklik gebruikt; algemene melding alleitems kapot niet reproduceerbaar. Hypnose zonder doel vóór speler en gescheiden garageproef verklaarden verwarring.
- V4: start→alias TurboJay kiezen→poppetje→bewaar→race werkelijk gestart. Pauze/hervat/menu en settings via echte knoppen; wereldkeuze en garage geopend.
- Kleur paars gekozen, Splash gekozen, opgeslagen en game heropend: beide instellingen opnieuw aanwezig.
- Vriendenvenster toont echte lokaal gegenereerde QR; kopieerknop meldt succes. Geen online vriend of race gesimuleerd.
- Lokale QA-pagina injecteert uitsluitend op localhost?qa=1 de echte synthetische PointerEvents. Onweer/Boost/Jump via echte DOM-slots werken; slots blijven stabiel; hypnose/banaan/ijs, opslag, Boemcooldown en eindbazen bevestigd.
- Viewports320×568,375×667,390×844,430×932,844×390. Alle3 stuurmethoden passen zonder overlap/buiten beeld. Alle3 inventarisslots bereikbaar met elementFromPoint-hit-test. Ook gelijktijdig sturen/gas/rem, cancel en opnieuw aanraken na pauze/reset bevestigd.
- Groen, brug/tunnel en woestijn visueel bekeken. Procedurele assets hebben geen externe downloads nodig.
- 12november: back-uptekst met echte Bewaar/Kopieer-knoppen geëxporteerd en via Leesvoortgang/Plak/Leesback-uptekstin volledig teruggezet; browser bevestigt opgeslagen opditapparaat.

## Grenzen en open punten
- Geen fysieke iPhone, Androidtelefoon of tablet beschikbaar. Chromium-schermformaten en synthetische touches zijn geen Safari/iOS-hardwaretest. Geen bewezen60FPS op echte telefoons; automatische kwaliteitsverlaging blijft aanwezig.
- Remote download/filechooser-controle liep vast en werd afgebroken. Bestandsdownload/importdialoog blijft beschikbaar; bestandsoverdracht op fysieke iPhone niet bevestigd. Kopieer/plak is wel end-to-end getest en werkt zonder bestandskiezer. JSON-parser en merge zijn daarnaast regressiegetest.
- Online vrienden/verzoeken/scan-naar-verzoek/lobby/realtime-races niet gerealiseerd; daarom geen2/3/6/7speler-netwerktests. Zie ONLINE_PLAN.md.
- Pizzaman heeft bevestigd uiterlijk en eigen eindrace; bijzondere aanvallen wachten op Jaylenns keuze.
- Zandkansen tijdelijk gelijk verdeeld; XP500 perlevel en glitter naeersteoverwinning zijn expliciete implementatiekeuzes voor nognietgedetailleerde beloningen.

## Publicatie
Geverifieerd12november: Pages-run43155478534 completed/success op8f0fab77859279f04cdc335bede7f14877379093; rootHTTP200/V4 en alle6 runtime-assets SHA-256 identiek aan geteste bron. Compatibiliteitsroutes200. Echte live race1 en race21 gestart en gas gebruikt, pauze/hervat/wereldkaart en tekstimport bevestigd. Details in KART_GO_WORK_STATUS.md.
