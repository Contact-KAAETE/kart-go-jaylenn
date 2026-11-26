# KART GO — Jaylenns Racewereld · V6.2

**KART GO — Een spel bedacht door Jaylenn.** AI is uitsluitend hulpmiddel voor programmeren, vormgeving en testen.

Speel op https://contact-kaaete.github.io/kart-go-jaylenn/ . Bestaande Canvas2D/2,5D-game hervat; geen nieuwe repository of herbouw. €0, zonder advertenties/tracking/accounts.

## V9.0 — gevechten: wapenkisten, explosies en duwen (stap 3 van 3)

Levels 1–50, behalve de eindbaaslevels 20 en 50. Jaylenns eigen power-upblokken en hun kansen blijven ongewijzigd; wapens komen uit aparte rode **wapenkisten** (vier rijen per ronde). Code: `assets/combat.js`.
- **Raket** 🎯: zoekt de auto vóór je en ontploft. Ontwijken kan met hard opzij sturen of springen.
- **Bom** 💣: leg je achter je neer; ontploft als iemand dichtbij komt (of na 7 seconden).
- **Duwschild** 🛡️: 6 seconden. Je duwt iedereen hard opzij en het schild vangt een explosie op.
- **Explosies** blazen auto's opzij, laten ze tollen en kunnen ze van de baan of het water in blazen.
- **Duwen**: auto's naast elkaar duwen elkaar echt weg. Met boost of schild ben je sterker. Over de rand geduwd = de normale stof- of PLONS-redding.
- **Tegenstanders vechten terug**: een raket als jij aan kop ligt, een bom als je vlak achter ze zit, en soms rammen ze je.

## V8.0 — stuntbaan (stap 2 van 3)

Geldt voor de Groene Wereld en de Zandwereld (levels 1–50); de IJs-Wereld houdt haar eigen regels. Code: `assets/stunts.js`.
- **Hangbruggen**: hoger, met rode torens en draagkabels.
- **Smalle brug** (tweede brug vanaf level 12, niet in eindbaaslevels): smal plankdek zonder reling. Eraf = PLONS, 3 seconden.
- **Tunnels**: echte tunnelbuis met muren, plafond, lampen en oranje geleidelijnen.
- **Schans over het water** (vanaf level 10): na de schans ligt water. Te langzaam = PLONS.
- **Looping** (vanaf level 9, niet in eindbaaslevels): de looping is van ver te zien. Met genoeg snelheid volgt een looping-animatie van opzij en daarna een boost; te langzaam = terugrollen.
- Waarschuwingen vooraf: "Looping! Vol gas erin!", "Smalle brug…", "Schans over het water!".

## V7.0 — eigen racewagens en bredere banen (stap 1 van 3)

- Zes nieuwe racewagens uit Jaylenns eigen tekeningen: Blauwe Bliksem, Rode Raket, Oranje Orkaan, Zilveren Pijl, Gouden Schicht en Nachtstorm. Merklogo's en merknamen zijn weggeschilderd. Kies ze in de garage onder **Jouw kart**; de originele kart blijft ook kiesbaar. Elke wagen heeft een vaste lak.
- Tegenstanders rijden ook in deze wagens, nooit in dezelfde als jij. Eindbazen blijven gelijk.
- Banen zijn 45% breder. Raak-, pak- en botsafstanden zijn meegeschaald, zodat ze bij de getekende wagens passen.
- Beelden: `assets/graphics/cars/`. Tijdens het racen gebruiken alle wagens een recht achteraanzicht (V7.1, `car-N-straight.webp`); bij sturen helt de wagen over. De garage toont de gedetailleerde schuine foto's van voren en achteren.
- Nog niet online: Samen racen en de Party-Wereld gebruiken nog de oude karts.
- Volgende stappen: 2) bruggen, tunnels, schansen en loopings; 3) items, explosies en elkaar van de baan duwen.

## V6.2 — motoren en terug op de baan

Kies250,509 of1000pk in garage/instellingen. Uit de bocht:2s stof; in water:3s plons, daarna vanzelf terug. Bestaande70 levels,12 coureurs,20 kleuren en lokale voortgang blijven bewaard. [Details en tests](docs/KART_GO_ENGINE_RECOVERY_STATUS.md).

## V6.1 — meer keuze

Twaalf coureurs, twintig kartkleuren en een vrije kleurkiezer. Nieuwe coureurs zijn ook zichtbaar achter het stuur, in de garage en op het podium. Bestaande keuzes en voortgang blijven behouden. Zie [status](docs/KART_GO_CHOICES_V6_1_STATUS.md).

## V6.0 — complete IJs-Wereld

De oorspronkelijke vijftig levels, garage, naam, coureur, kleur en voortgang blijven behouden. Voor V6 is een herstelpunt gemaakt; de bestaande opslagsleutel blijft gelijk.

## V5.2 — levendiger racen

Bots halen elkaar in, reageren zichtbaar en maken soms een herstelbaar foutje. Meer decorverschil per omgeving, meer ruimte rond de kart, rustigere meldingen en bij winst een podium met je eigen coureur, naam, beker en confetti. De 50 levels en lokale voortgang blijven behouden.

Wereld 3 is nu gebouwd: levels51–70, sneeuw, glijden, ijspaleis, ijsschansen, spikes, geheim level63 met negen blokken en de Burgerkoning in één lange finale. Vrijspelen door level50 te winnen. Geluid aan voor de lokale Ho-ho-ho-startstem. Details en toetsbare spelregels: [IJs-Wereld-status](docs/KART_GO_ICE_WORLD_STATUS.md).

## V5.1 — meer avontuur op de baan

Hogere heuvels en dalen, scherpere bochten met gele waarschuwingspijlen, een tweede brug vanaf level 7 en echte automatische springschansen vanaf level 5. Speler en bots kunnen springen en landen; de eindbaasregels en bestaande voortgang blijven behouden. Rem voor scherpe bochten; rijd met voldoende snelheid recht over de gele schans.

## Grafische V5

Nieuw gamehoofdmenu, zes geïllustreerde coureurs, glanzende rasterkarts tijdens races, twee gedetailleerde landschappen, losse decorstukken, wegtexturen, power-upeffecten, beide eindbazen en een werkende gamegarage. De oorspronkelijke 50 levels en lokale voortgang blijven behouden.

Negen AI-gegenereerde productieassets staan daadwerkelijk in `assets/graphics/` en zijn aangesloten op de game. Geen betaalde externe dienst geactiveerd.
[Volledige V5-status en livecontrole](docs/KART_GO_VISUAL_UPGRADE_STATUS.md) · [Assetmanifest](docs/V5_ASSET_MANIFEST.json).

## Spelen
Start je motor, kies bij eerste keer een bijnaam en poppetje. Rem links, gas rechts. Besturing: knoppen, stuurwiel of groene joystick. Autogas optioneel. Desktop:pijltjes/WASD,1–3 voor items, P/Escape pauze. Drie inventarisslots reageren direct op aanraking. Win om volgende level vrij te spelen; eerdere levels blijven herspeelbaar.

- Groene Wereld1–20: oorspronkelijke banen, Onweer50%, Hypnose20%, Boost15%, Banaan10%, Jump5%. Hotdog-Hond op20:9blocks, ijs10s, freeze2s; Jump ontwijkt.
- Zandwereld21–50: duinen, zandwegen, palmen en rotsen; uitsluitend Hypnose/IJs/Banaan, voorlopig gelijke kansen. Geen boost door hitte. Hypnose10s; ijsfreeze2s; banaanspin2s. Pizzaman op50 met vreemd gezicht en tomatentong; nog geen onbevestigde speciale aanvallen.
- Garage: bestaande originele kart, kleur en helm; één cosmetisch effect. Glitters ophalen op kaart naeerste winst, Splash vanaf bereikt15, Boem40/elke2s. Geen effect zet cosmetische deeltjes uit.100XP pereerste levelwinst,500XP perXP-level; vanafXP5 glimt de kart.
- Voortgang blijft lokaal onder bestaande opslagsleutel; V3-back-up automatisch bewaard. Bewaar/importeer JSON-bestand of kopieer/plak volledige back-uptekst. Import combineert overwinningen en beste tijden; neemt gekozen profiel/instellingen over.

## Samen racen (online)
**Online samen racen werkt.** Kies in het hoofdmenu **Samen racen**, maak een kamer en laat vrienden de QR-uitnodiging scannen. Maximaal 6 spelers per kamer.

- Server: eigen gratis Cloudflare Worker `kart-go-jaylenn` met Durable Object `RaceRoom` (code in `multiplayer/src/`). De server bepaalt organisator, klaarstatus, start, posities en uitslag.
- Uitnodiging via QR-link (`?room=...#key=...`); herverbinden na wegvallen houdt dezelfde speler en plek. Een kamer verloopt na twee uur.
- Live gecontroleerd: twee echte clients op de productieserver kregen na herverbinden dezelfde finishuitslag. Zie [serverreparatie](docs/CLOUDFLARE_SERVER_REPAIR.md) en [werkvoortgang](docs/WORK_KARTGO_PROGRESS.md).
- **Nog beperkt:** online is het één trainingsbaan van 1800m. De 70 levels, Party-levels en power-ups zijn online nog niet speelbaar. Nog niet getest met twee fysieke telefoons op verschillende netwerken.
- De **Vriendencode** in het menu is iets anders: een lokale code en QR zonder persoonsgegevens, zonder netwerkverbinding.

## Party-Wereld
Wereld 4, levels 71–75: race op een racekip, ontwijk meteorieten en de kat. Te vinden via het hoofdmenu of `party/`. Eigen lokale opslag; vrij racen opent alle levels.

## Hervatten en kwaliteit
- [Werkstatus](docs/KART_GO_WORK_STATUS.md) en [issue1](https://github.com/Contact-KAAETE/kart-go-jaylenn/issues/1).
- [V4-tests](docs/V4_TEST_RESULTS.md). Run `node tests/game.test.cjs`.
- Geen fysieke iPhone/Androidtest; mobiele Chromium-layouts en synthetische PointerEvents zijn getest.60FPS op hardware niet gegarandeerd.
- Back-ups: backup/v3-working-before-v4-20261111 en backup/main-before-v4-20261111.
- Oude preview-vrienden-links verwijzen naar echte geïntegreerde game. Oude prototypes blijven in Gitgeschiedenis/back-up te vinden.
- Nieuwe V5-rasterillustraties gegenereerd met de ingebouwde image_gen; oude procedurele rendering blijft noodweergave. QR-library qrcode-generator1.4.4 onderMIT, copyright Kazuhiko Arase; licentie in assets/vendor.
