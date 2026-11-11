# Kart Go V3 — voortgang

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
