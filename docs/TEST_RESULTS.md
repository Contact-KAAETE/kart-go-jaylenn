# Kart Go V3 — feitelijke testresultaten

Datum: 11 november 2026. Bron: bestaande V2.1 in Contact-KAAETE/kart-go-jaylenn, commit ebc396a09c4622716dbcc7250a5609dbd95f3b71.

## Geslaagd in de echte Chromium-browser

| Controle | Uitkomst en werkwijze |
|---|---|
| Startknop | Opent de race en toont de kart en HUD |
| Rijden en bots | Afstand/snelheid lopen op, bots rijden en posities veranderen |
| Multitouch | Synthetische touch-PointerEvents op de echte bedieningsknoppen: gelijktijdig sturen en gas; sturen en rem; een onbekende pointer kan de andere knop niet loslaten |
| Loslaten en annuleren | Alleen de bijbehorende vinger wordt vrijgegeven; pointercancel en pauze wissen invoer |
| Wiel en joystick | Beide sturen met gelijktijdig gas; loslaten centreert; een nieuwe aanraking werkt na reset |
| Schermformaten | Geen overlap of knoppen buiten beeld bij 320×568, 375×667, 390×844, 430×932 en 844×390; drie stuurmethoden gecontroleerd |
| Draaien | De race pauzeert na wijzigen van de iframe-oriëntatie; invoer wordt gewist |
| Lucky Blocks | Voorbereid testblok op de echte baan verzameld; item verschijnt in inventaris |
| Power-ups bedienen | Echte inventarisknoppen aangeklikt voor Onweer, Boost en Jump; effecten en timerstatus waargenomen |
| Finish en vrijspelen | Race in een voorbereide situatie vlak vóór de finish uitgereden; eerste plaats; level 2 vrijgespeeld |
| Heropenen | Overwinning en het vrijgespeelde level blijven zichtbaar na herladen |
| Race hervatten | Na pauze en herladen verschijnt Hervat race; race is hervatbaar |
| Eindbaas | Grote herkenbare bruine hond/hotdog-kart; automatische schotmelding met nextShot 20 na tijdstip 10; ijs veroorzaakt bevriezen, Jump ontwijkt het ijs |
| Scenery | Brug boven water, houten leuningen, tunnelportal en tunnelinterieur bekeken; geen applicatie-JavaScriptfouten gezien |
| Externe diensten | Webfonts verwijderd; spel laadt lokale HTML/CSS/JavaScript |

De lokale browser-testomgeving bevat zichtbare voorbereidingsknoppen. Voor de finish en sommige power-up-/eindbaassituaties is daarmee de beginsituatie gezet; de echte spel-loop, botsingen, UI en opslag zijn daarna gebruikt. Niet alle 20 races zijn met de hand volledig uitgereden.

## Geslaagd in de geautomatiseerde spelcodecontrole

Command: `node tests/game.test.cjs`.

- Alle twintig unieke circuits met een eenvoudige stuurcontroller volledig uitgereden; laatste deterministische run: 20/20 gewonnen.
- Exacte power-upgrenzen 0–50, 50–70, 70–85, 85–95 en 95–100 procent gecontroleerd.
- Maximaal drie inventarisvakjes en alle vijf effecten gecontroleerd.
- Negen Lucky Blocks in level 20; hond neemt geen blokken; geen onzichtbaar opnieuw verschijnen in ronde 2.
- Eerste ijsschot bij 10 seconden en volgende tijdstip 20; exact twee seconden bevriezen binnen één simulatiestap; Jump voorkomt bevriezen.
- Multitouch-eigenaarschap, meerdere vingers op dezelfde knop, willekeurige release, cancel, verloren pointer capture, gelijktijdige pedalen en pedaalprioriteit.
- Gelijkwaardige stuurreactie bij 30/60/120 Hz; demping en geen zijwaarts schuiven van een stilstaande kart.
- Oude voortgang behouden en ruwe back-up aangemaakt; instellingen en licht-kwaliteitsvoorkeur na heropenen behouden.
- Racecheckpoint met inventaris hersteld; sluiten van resultaatvenster keert terug naar de wereldkaart.
- Bruggen, tunnels en alle twintig scènes zonder runtimefout getekend in de canvas-stub.

`node --check` slaagt voor game.js, scenery.js en browser-driver.js.

## Nog niet geslaagd / niet beschikbaar

- GitHub Pages: de gewenste online URL gaf bij controle 404. Nog niet gepubliceerd.
- GitHub-back-up en fasecommits: nog niet naar de repository geschreven. De native GitHub-koppeling retourneert 403 bij het maken van een branch en somt alleen digitale-marco-native op als toegankelijke repository.
- Pages-configuratie heeft geen native GitHub-tool in deze sessie. De cloudbrowser was niet aangemeld. De gebruiker wees op gebruik van de plug-in; er wordt geen verdere browser-aanmelding aangevraagd.
- Geen fysieke iPhone/Safari, fysieke Android/Chrome, native touch-apparaat of WebKit-browser beschikbaar. De touchcontrole betreft synthetische PointerEvents in Chromium, geen echte iOS-aanraking.
- Geen meting van 60 FPS op echte telefoons. Automatische kwaliteitsverlaging is geïmplementeerd, maar geen prestatiegarantie.
- Opslag van een andere website/origin verhuist niet automatisch naar github.io; de bestaande opslag wordt op dezelfde origin behouden en de import/exportfunctie kan bestanden samenvoegen.

## Publicatie hervatten

1. Eigenaar voegt kart-go-jaylenn toe aan bestaande GitHub-installatie 179583608, zonder digitale-marco-native te verwijderen.
2. Verifieer de actuele remote main; maak eerst backup/v2-before-v3-20261111 op de oorspronkelijke V2.1-commit. Geen force push.
3. Activeer GitHub Pages: Deploy from a branch, main, /(root). Controleer de bestaande V2.1 online zoals fase A vraagt.
4. Zet de opgeslagen lokale fasecommits vervolgens in de bestaande repository. Blijf dezelfde repository en index.html als ingang gebruiken.
5. Open de echte HTTPS-speellink, controleer een unieke V3-bronmarkering en test opnieuw start, race, wereldkaart en assets zonder foutmeldingen.
6. Rapporteer pas daarna een werkende publicatie en de werkelijk opgeslagen GitHub-SHA.
