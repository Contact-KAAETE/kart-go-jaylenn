# KART GO — Jaylenns Racewereld · V5.2

**KART GO — Een spel bedacht door Jaylenn.** AI is uitsluitend hulpmiddel voor programmeren, vormgeving en testen.

Speel op https://contact-kaaete.github.io/kart-go-jaylenn/ . Bestaande Canvas2D/2,5D-game hervat; geen nieuwe repository of herbouw. €0, zonder advertenties/tracking/accounts.

## V5.2 — levendiger racen

Bots halen elkaar in, reageren zichtbaar en maken soms een herstelbaar foutje. Meer decorverschil per omgeving, meer ruimte rond de kart, rustigere meldingen en bij winst een podium met je eigen coureur, naam, beker en confetti. De 50 levels en lokale voortgang blijven behouden.

De IJs-Wereld en nieuwe startstemmen zijn nog ontwerp, niet speelbaar; zie [Jaylenns nieuwe spelplan](docs/WORLD_3_JAYLENN_DESIGN.md).

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

## Online status
**Online vrienden en multiplayer zijn niet aangesloten.** Het vriendenvenster toont uitsluitend eigen lokale code en QR zonder persoonsgegevens in de QR. Geen werkende netwerkverzoeken/lobby gesuggereerd. Voor echte maximaal6speler-races is een veilige backend nodig. Geen externe dienst geactiveerd; ontwerp en gratis opties in [ONLINE_PLAN](docs/ONLINE_PLAN.md).

## Hervatten en kwaliteit
- [Werkstatus](docs/KART_GO_WORK_STATUS.md) en [issue1](https://github.com/Contact-KAAETE/kart-go-jaylenn/issues/1).
- [V4-tests](docs/V4_TEST_RESULTS.md). Run `node tests/game.test.cjs`.
- Geen fysieke iPhone/Androidtest; mobiele Chromium-layouts en synthetische PointerEvents zijn getest.60FPS op hardware niet gegarandeerd.
- Back-ups: backup/v3-working-before-v4-20261111 en backup/main-before-v4-20261111.
- Oude preview-vrienden-links verwijzen naar echte geïntegreerde game. Oude prototypes blijven in Gitgeschiedenis/back-up te vinden.
- Nieuwe V5-rasterillustraties gegenereerd met de ingebouwde image_gen; oude procedurele rendering blijft noodweergave. QR-library qrcode-generator1.4.4 onderMIT, copyright Kazuhiko Arase; licentie in assets/vendor.
