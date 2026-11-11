# Kart Go V3 — voortgang

## Actuele status — V3 online gepubliceerd en gecontroleerd

GitHub Pages is door de eigenaar ingeschakeld vanuit `main` en `/(root)`.

**Werkende HTTPS-speellink:** https://contact-kaaete.github.io/kart-go-jaylenn/

- GitHub Pages-run `43079220423` op commit `80051ef6f8eabf0b1b77cbb4427bba747a097c37`: completed / success.
- De openbare pagina en alle drie de lokale spelassets geven HTTP 200. SHA-256 is exact gelijk aan de geteste bronbestanden.
- Op de echte openbare URL in Chromium gecontroleerd: startknop, rijden (118 km/u zichtbaar), bots, stuurknop, pauze, wereldkaart, opnieuw starten, herladen en Hervat race.
- De wereldkaart en voetregel tonen de juiste V3.0. Geen account nodig om te spelen.
- De oorspronkelijke V2.1 staat veilig op `backup/v2-before-v3-20261111` bij `ebc396a09c4622716dbcc7250a5609dbd95f3b71`.
- Fase A: `58c5145a9cd45e0a4f724168a3dc7fd7a949e263`.
- Fase B: `c9258466de7ea3283f42e46edb4a82a269d32bc5`.
- Fase C: `a96f712735ed158e9cab993eb2e48b140a8a4a2a`.
- Fase D: `80311453008a84adcec00d35f7737db77740113a`.
- Fase E: `a20cdc9638347632990e04cc477374e2bbd20f8b`.

De publicatieblokkades in het onderstaande werklog zijn opgelost. De openstaande beperkingen zijn echte iPhone/Safari- en Android-tests en een FPS-meting op fysieke telefoons. De eerdere mobiele browser- en PointerEvent-controles zijn geslaagd; details staan in TEST_RESULTS.md.

---

Bedenker: Jaylenn. Hervat vanaf bestaande GitHub-commit ebc396a09c4622716dbcc7250a5609dbd95f3b71.

## Fase A

- Bestaande index.html en README gecontroleerd en gekloond.
- Lokale back-upbranch backup/v2-before-v3-20261111 wijst naar de ongewijzigde V2.1.
- Back-up in GitHub geblokkeerd: integratie retourneert 403 Resource not accessible by integration.
- De GitHub-koppeling heeft uitsluitend digitale-marco-native geselecteerd; kart-go-jaylenn ontbreekt. Eigenaar moet deze toevoegen aan installatie 179583608.
- Pages-speellink geeft 404. Pages-instelling niet bereikbaar zonder eigenaar-aanmelding. Nog niet gepubliceerd.

## Fase B (lokaal)

- Bestaande inline broncode opgesplitst in HTML, CSS, scenery en spelcode; bestaande engine behouden.
- Rem links, gas rechts, sturen ertussen; aparte zones voor verschillende schermmaten.
- Pointer-ID-registratie, gelijktijdige bediening, reset bij pauze/schermverandering/verlies van contact.
- Voortgangssleutel behouden, bestaande gegevens lokaal geback-upt; voortgang exporteren/importeren en actieve race hervatten.
- Nog te testen: functionele browsercontroles en simulatiecontroles.

## Fasen C–E

Nog in uitvoering. Geen claim dat de publicatie of het project voltooid is.

## Fase C (lokaal)

- Bestaande 2,5D-engine behouden; twintig baanprofielen met stapsgewijze bochten en hoogteverschillen.
- Bruggen boven water met houten leuningen; stenen tunnelportalen, binnenwanden en tunnelverlichting.
- Bestaande landschapsonderdelen behouden en rijkere menu-illustratie, bewegende wolken toegevoegd.
- Karts met getekende banden/treden, licht en schaduw; grotere Hotdog-Hond.
- Pickup-, onweer-, sprong-, boost-, ijs- en botsingseffecten.
- Automatische verlaging van tekenafstand, details en resolutie bij langdurig lage beeldsnelheid.
- Browser- en simulatiecontrole volgt; nog niet naar GitHub gepubliceerd wegens ontbrekende repositorytoegang.

## Fase D — spelregels en eerste controles (lokaal geslaagd)

- Alle twintig unieke banen in een simulatie met de echte spelcode uitgereden en gewonnen door een eenvoudige stuurcontroller.
- Exacte kansgrenzen voor Onweer/Hypnose/Boost/Banaan/Jump gecontroleerd (50/20/15/10/5).
- Eindbaas: negen eenmalige Lucky Blocks; hond neemt geen blokken; ijs om de tien seconden; bevriezen twee seconden; Jump voorkomt een treffer.
- Voortgang van V2 blijft onder dezelfde sleutel bewaard; oude gegevens worden geback-upt; racesessie kan na heropenen hervatten.
- Pointer-eigenaarschap, meerdere vingers, pedaalprioriteit, loslaten, annuleren, reset, draaien en drie besturingsmethoden geslaagd.
- In Chromium echte browsercontroles met zichtbare testpagina uitgevoerd: start, rijden, verzamelen, power-upknoppen, synthetische touch-events en geen overlap bij 320×568, 375×667, 390×844, 430×932 en 844×390.
- Een CSS-fout bij het verwijderen van externe webfonts gevonden en hersteld; alle lettertypen en styles zijn lokaal.
- Browsercontroles voor finish/opslaan/eindbaas en definitieve publicatie nog in uitvoering.
- Niet getest op een fysieke iPhone of Android. Geen gemeten garantie van 60 FPS op echte telefoons.

## Fase E — lokale kandidaat gereed; publicatie geblokkeerd

- Functionele browsercontroles voor finish, vrijspelen, heropenen, hervatten, draaien, automatische ijsaanval, bevriezen en Jump geslaagd.
- De definitieve spelcodecontrole is deterministisch en heeft alle twintig banen gewonnen.
- Een onjuist vroege tijdscheck in de lokale testhulp is vervangen door wachten op het echte botsingsresultaat; het spel zelf bevroor correct.
- Zichtbaarheid van karts en Lucky Blocks in perspectief verbeterd; de Hotdog-Hond heeft nu een duidelijk grotere schaal. Een donkere strook buiten de tunnel is hersteld.
- Sluiten van het finishvenster gaat terug naar de wereldkaart; opgeslagen lage grafische kwaliteit wordt ook na heropenen toegepast.
- Alle details en beperkingen staan in docs/TEST_RESULTS.md.
- Laatste controle van de GitHub-installatie: uitsluitend digitale-marco-native toegestaan, Kart Go nog niet toegevoegd.
- ONLINE GAME NOG NIET V3: publicatie en GitHub-back-up wachten op eigenaarstoegang. De originele remote hoofdbranch is ongewijzigd.

### Hervatten zonder opnieuw te bouwen

De lokale geschiedenis bevat aparte commits voor B, C, D en de E-kandidaat. De lokale branch backup/v2-before-v3-20261111 bewaart de oorspronkelijke versie. Een herstelbundel wordt bewaard omdat deze nieuwe commits door de toegangsfout nog niet extern gesynchroniseerd zijn. Na toegang eerst remote status en back-up verifiëren, dan de fasen opslaan en de echte Pages-link testen. Niet teruggaan naar een oudere ZIP of het oorspronkelijke Sites-project.
