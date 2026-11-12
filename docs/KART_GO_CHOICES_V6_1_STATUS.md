# V6.1 — twaalf coureurs en twintig kartkleuren · LIVE

Opdracht Martin: meer keuze dan zes karakters/vijf kleuren. Bedenker Kart Go: Jaylenn. Uitbreiding van bestaande game, geen herbouw. Alle70 levels/werelden/eindbazen/spelregels en opslagsleutel blijven behouden.

## Veiligheid en versie
Herstelpunt backup/v6-0-1-before-more-choices-20261112 →6882529029af5588011c7223f81257177c2dc8cc. Afzonderlijke ontwikkeltak work/more-racers-colors-v6-1-20261112. Cache6.1.0.

## Gebouwd
- Zes bestaande coureurs behouden met exact dezelfde IDs/indices. Zes nieuwe keuzes: Draak, Konijn, Tijger, Pinguïn, Kat en Piraat. Allemaal direct beschikbaar. Namen blijven wijzigbaar.
- Productieatlas assets/graphics/characters-extra-v6-1.webp:1086×1448 RGBA,591662 bytes, gitblob309a805266068af661d03d0a55bb8d5b2ecb8ea2.3×4cellen: twee rijen vooraanzichten en twee rijen bijbehorende rugaanzichten. Wordt daadwerkelijk gebruikt in profiel, menu, garage, vriendenprofiel, race en podium. Bij race alleen extra atlas laden wanneer een nieuwe coureur is gekozen.
- Ingebouwde image_gen, geen externe betaalde dienst/API. Promptbrief: uitbreidingsatlas in de bestaande glossy3D-cartoonstijl, zes originele vriendelijke racers met racepakken/handschoenen, front en rear consistent, transparant, geen tekst/auto/UI/wapens. Referentie bestaande characters-v5.webp. Origineel behouden; mobiele WebP met alpha.
- Twintig lakknoppen: oorspronkelijke vijf plus Oranje, Roze, Turquoise, Lime, Nachtblauw, Lavendel, Mint, Petrol, Bordeaux, Koraal, Zand, Wit, Zilver, Grafiet en Zwart. Bestaande vrije kleurkiezer blijft werken. Zwart/wit behouden glanzende schaduw en hooglichten; chroom/banden/goud/alpha blijven ongemoeid.
- Garage krijgt automatisch passend aantal kolommen en op smalle schermen een kolom voor de onderdelen. Minimaal44px kleurknoppen, geen overlappende bolletjes. Keuze blijft zichtbaar met naam/vinkje en wordt via de bestaande bewaarknop opgeslagen.

## Getest voor publicatie
- node tests/game.test.cjs: alle bestaande70-levelregels, voortgang, besturing, ijsgevaren en bosses geslaagd.
- Echte Chrome-game in390×844,320×568 en844×390: alle12 coureurs via werkelijke selecteer/bewaarknoppen gekozen, opgeslagen en heropend. Geen horizontale profiel-overflow.12 unieke frontsprites en12 unieke rearsprites gecontroleerd; nieuwe coureur overleeft export/import.
- Alle20 kleurknoppen, selectie-vinkjes, opslaan/heropenen,20 verschillende echte garagebeelden en20 verschillende echte racekarts slagen zonder Canvas.filter. Twintig verschillende lakpixelkleuren bevestigd.
- Garage-overflow op320px gevonden en gerepareerd; daarna modal.scrollWidth=modal.clientWidth=264. Visueel losse44px bolletjes, geen overlap. QA-rapport tests/results/choices-v6-1-mobile.txt.
- Geen fysieke iPhone-test. Mobiele Chrome-frames en echte Pages-publicatie zijn wel gecontroleerd.

## Definitieve livepublicatie
- Gamecommit eb446a08a63ff482b48d5f2a46a5ce414f0b2cb1; Pages-run43186596692 succesvol. Officiële gecontroleerde URL https://contact-kaaete.github.io/kart-go-jaylenn/?v=6.1.0 .
- Alle vijf gewijzigde HTML/JS/CSS/WebP-bestanden HTTP200 en bytegelijk aan geteste checkout, SHA256 in tests/results/choices-v6-1-live-assets.json.
- In echte online390×844-game via gewone profielknop Draak gekozen/bewaard, via garage Turquoise gekozen/bewaard. Pagina opnieuw geopend: Draak nog geselecteerd, twaalf echte karakterknoppen, kleur nog#22c7bd. Bestaand testprofiel,6900XP en69 overwinningen behouden. Geen testdriver actief; dit betreft geïsoleerde QA-browser, geen echte iPhonegegevens veranderd.
- Bestaande ijsrace70 via Hervat race geopend: echte draak-rugsprite achter het stuur van echte turquoise kart, live rijdend. Nieuwe coureur dus geen losse profielafbeelding.
- Desktopprofiel toont alle twaalf kaarten met echte sprites; geen game-origin console errors in laatste controle. Screenshot tests/results/choices-v6-1-live.jpg is de gepubliceerde karakterselectie, geen concept.
- Hervatten vanaf actuele main; herstelpunt en ontwikkeltak blijven beschikbaar. Eventuele volgende stap: feedback van fysieke iPhone verwerken. Geen betaalde dienst geactiveerd,70 levels/voortgang behouden.
