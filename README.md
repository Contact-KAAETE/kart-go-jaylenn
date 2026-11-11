# Kart Go — Wereld 1: De Groene Wereld · V3.0

Het spelconcept, de power-ups, de 20 levels en de Hotdog-Hond zijn bedacht door **Jaylenn**. Technische uitwerking met hulp van AI.

**Speel direct:** https://contact-kaaete.github.io/kart-go-jaylenn/

Bestaand project, hervat vanaf `ebc396a09c4622716dbcc7250a5609dbd95f3b71`. De bestaande Canvas 2D / 2,5D-engine en spelregels zijn behouden.

## Spelen

Start met **Start je motor**. Win om het volgende level te openen. Eerder vrijgespeelde banen blijven op de wereldkaart beschikbaar.

- Rem links, gas rechts. Sturen met knoppen, het virtuele wiel of de groene joystick.
- **Autogas** laat je op sturen focussen. Wissel de besturing tijdens de race met de knop onderin.
- Computer: pijltjes/WASD, 1–3 voor power-ups, P/Escape voor pauze.
- Drie inventarisvakjes. Tik eenmaal op een power-up om die te gebruiken.
- Op de wereldkaart kun je voortgang bewaren als JSON en later inlezen. Overwinningen worden bij import samengevoegd; bestaande resultaten worden niet gewist.
- Een onderbroken race kan via **Hervat race** verder worden gespeeld.

## Jaylenns spelregels

| Power-up | Kans | Effect |
|---|---:|---|
| Onweer | 50% | Vertraagt alle tegenstanders |
| Hypnose | 20% | Laat de dichtstbijzijnde tegenstander vóór je slingeren |
| Boost | 15% | Vier seconden extra snelheid |
| Bananenschil | 10% | Legt een schil achter je neer |
| Jump | 5% | Springt over bananen, ijs en obstakels |

De kansgrenzen zijn exact 50/70/85/95/100. Dit zijn kansen per trekking, geen garantie voor een vaste verdeling in een kleine reeks.

Level 20: vrolijke bruine hond in een grote hotdog-kart. Hij neemt geen Lucky Blocks en schiet elke 10 seconden ijs. Een treffer bevriest de speler 2 seconden; Jump voorkomt een treffer. De baan bevat 9 eenmalige Lucky Blocks, die niet opnieuw verschijnen in ronde 2.

## Techniek

Geen build, accounts, advertenties, trackers, betaalde assets of externe runtime-diensten. `index.html` laadt uitsluitend de lokale bestanden in `assets/`. Hosting is bedoeld voor GitHub Pages vanuit `main` en `/(root)`. `.nojekyll` is aanwezig.

De 20 unieke banen worden vanuit vaste profielen opgebouwd. Levels 1–5 zijn eenvoudig; daarna komen meer bochten, hoogteverschillen, bruggen, tunnels en ontwijkbare obstakels. Bots krijgen geleidelijk meer snelheid en ontwijkgedrag. De getoonde 3–29% is een interne moeilijkheidsinstelling van dit spel, geen externe maat voor AI-intelligentie.

De engine verlaagt detail, tekenafstand en renderresolutie wanneer de gemeten beeldsnelheid langdurig laag is. 60 FPS is een streefdoel, geen geverifieerde garantie op fysieke telefoons.

## Opslaan

De bestaande sleutel `kartgo-jaylenn-v1` blijft behouden. Oude gegevens worden vóór conversie onder een aparte back-upsleutel bewaard. Overwinningen, beste tijden, instellingen en een racecheckpoint worden lokaal opgeslagen. Uitgeschakelde browseropslag wordt afgehandeld.

Browseropslag is per website. Voortgang van een eerdere privé-speellink verhuist niet automatisch naar github.io. Gebruik de export/importfunctie voor websites waarop die beschikbaar is. Privémodus of het wissen van browsergegevens kan lokale voortgang verwijderen; bewaar daarom desgewenst een voortgangsbestand.

## Testen

```sh
node --check assets/game.js
node --check assets/scenery.js
node tests/game.test.cjs
```

De simulatie gebruikt de echte broncode en controleert alle twintig banen, multitouch-eigenaarschap, de drie stuurmethoden, gas/rem, annuleren, pauze/rotatie, de exacte power-upgrenzen, eindbaasregels, opslag en hervatten.

`tests/browser-qa.html` en `tests/browser-driver.js` vormen een lokale zichtbare browser-testomgeving. De driver weigert uitvoering buiten localhost/127.0.0.1. Voor de gebruikte preview worden deze bestanden als `/qa.html` en `/qa-driver.js` aangeboden. Ze worden niet geladen door het normale spel.

Zie `docs/WORK_STATUS.md` en `docs/TEST_RESULTS.md` voor feitelijk uitgevoerde controles, publicatie en beperkingen.
