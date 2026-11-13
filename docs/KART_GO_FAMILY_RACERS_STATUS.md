# Kart Go — Jaylenn en Ezra als speelbare coureurs

13 november 2026. **Bedacht door Jaylenn.** Uitgangspunt `bf1f5dca318f174f1c4822da3856545f082dbff3`.

## Geïntegreerd

- Jaylenn en Ezra zijn twee extra kiesbare coureurs, achter de bestaande twaalf. Bestaande avatar-IDs zijn niet verplaatst. Lokale opslag gebruikt de stabiele waarden `jaylenn` en `ezra`; online zijn dit respectievelijk 12 en 13.
- De twee door de gebruiker goedgekeurde voor-/achteraanzichten zijn opgenomen als transparante WebP-atlassen: `assets/graphics/family-front-v7.webp` en `family-rear-v7.webp`, elk 1774×887. Geen originele familiefoto's of schoolachtergronden opgenomen.
- Jaylenn rijdt in zijn eigen rode kart en Ezra in zijn eigen groene kart. Tijdens racen wordt de echte achteraanblik gebruikt; Ezra's blonde staartje blijft zichtbaar. Garage en online voorvertoning tonen het vooraanzicht, garage kan ook naar achter wisselen. De ongebruikte zijhoekknoppen zijn uitsluitend bij deze twee karts uitgeschakeld.
- Profielkeuze, hoofdmenuportret, podium en online deelnemerskaarten hebben herkenbare portretten van beide jongens. Het bestaande kleurensysteem blijft bruikbaar voor de oorspronkelijke coureurs. Bij de eigen familie-karts toont de garage hun vaste kleur en wordt de eerdere klassieke lakkleur niet overschreven.
- Party behoudt de gekozen racekip: beide jongens zijn daar als coureur te kiezen en worden met hun eigen pet en bovenlichaam op de kip getoond. Er wordt in die speciale wereld geen gewone kart voorgespiegeld.
- Multiplayer-server accepteert en synchroniseert de twee nieuwe avatar-ID's. Herverbinden en uitslag behouden de geselecteerde coureur. Online wachtruimte toont de passende eigen kart, geen verwarrende andere lakkleur.
- Spelernaam, voortgang, XP, beste tijden, garagekleur en export/import blijven behouden. Alle bestaande spelerphysics, stuurhandlers, baanbestanden en bestaande CSS zijn byte-voor-byte gelijk gebleven; de portretten gebruiken een aparte kleine stylesheet.

## Verificatie

- `npm test` geslaagd, inclusief oorspronkelijke races, bestaande controls/multitouch, opslag en werkelijke Party-controller tot finish. `family-racers.cjs` controleert echte profielknoppen/garage in de DOM, alle veertien keuzes, behouden klassieke IDs, opslag-/backuproundtrip, juiste voor-/achteratlas per jongen, grondanker en bovenlichaam voor Party.
- `worlds-simulation` en `stunts-bots` geslaagd.
- `KARTGO_FAMILY=1 node tests/stunts-live.mjs` tegen echte lokale workerd-runtime geslaagd: twee onafhankelijke WebSocket-clients kiezen IDs 12 en 13, rijden met vier bots, zien dezelfde sprongen/projectielen, behouden hun identiteit/coureur na herverbinden en finishen met dezelfde gezamenlijke uitslag.
- Echte Chrome op 390×844: veertien profielkeuzes zichtbaar; Ezra geselecteerd en opgeslagen; voor-/achteraanzicht in garage bekeken; groene kart met zichtbaar staartje daadwerkelijk gestart op de oorspronkelijke baan.
- Geen fysieke iPhone-/Androidtest claimen.

## Publicatie

Gepubliceerd op de bestaande Pages-link. Codecommit `46db6abdec0147ef7a3543dcd162d102eece3e3a`, voorvertoning passend gemaakt in `3f4a51684c0be0fd1ed11804ac595138d69c08b3`. Script-/CSS-cache `family-1`; productie-health bevestigt `family-racers-4.2` en feature `family-racers`.

- Productiebestanden voor root, online controller, graphics, player, renderer, CSS en beide WebPs via HTTP 200 opgehaald en byte-voor-byte met de gepubliceerde bron vergeleken.
- `KARTGO_LIVE=1 KARTGO_FAMILY=1 node tests/stunts-live.mjs` geslaagd tegen de echte server: avatars 12/13, vier bots, sprongen/projectielen, herverbinden, volledige race en gelijke uitslag.
- Echte publieke rootgame in Chrome op 390×844: Jaylenn via profiel gekozen, opgeslagen en race gestart; rode kart van achteren zichtbaar. Bewijs: [live race](screenshots/family-racers-live-20261113.jpg).
- Controlescripts en uitvoer: `tests/results/family-racers-20261113.txt`. Geen fysieke telefoontest uitgevoerd.
