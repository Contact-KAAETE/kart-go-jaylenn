# Actueel: V5.2 race-afwerking

Bots, omgevingsvariatie, ruimte rond de kart, rustige meldingen en podium gebouwd. Zie `KART_GO_VISUAL_UPGRADE_STATUS.md`. Wereld 3 en startstemmen zijn nog ontwerp, zie `WORLD_3_JAYLENN_DESIGN.md`. Onderstaande versies blijven als geschiedenis behouden.

# Huidige versie: Kart Go V5.1

**12 november 2026: V5.1 voegt hoogtes, extra bruggen, scherpere bochten en echte springschansen toe.** Details en actuele publicatiestatus staan in het visuele statusdocument.
Lees eerst [KART_GO_VISUAL_UPGRADE_STATUS.md](KART_GO_VISUAL_UPGRADE_STATUS.md). Hervat vanaf de actuele main-commit; begin niet opnieuw.
Gamecommit `9637c8d8f1c6960557e863b2678c56b63e4f9c3b`, succesvolle Pages-run `43167523684`. V5.1 is ook live gecontroleerd, inclusief de automatische springschans in level 5.
Nieuwe echte rastergraphics zijn geïntegreerd in menu, coureurs, races, beide werelden, garage en eindbazen.
Alle 50 levels en bestaande lokale opslag behouden. Online vrienden/multiplayer blijven afzonderlijk open.

Onderstaande V4-notities zijn de bewaarde historische onderbouwing.

---

# KART GO V4.0 — voortgang

**Actueel 12 november 2026: singleplayer V4 staat live en is online getest.** Online vrienden/multiplayer zijn niet gerealiseerd en blijven afzonderlijk open. Speellink: https://contact-kaaete.github.io/kart-go-jaylenn/ . Gepubliceerde gamecommit:8f0fab77859279f04cdc335bede7f14877379093. Laatste main-commit bevat dit verificatieverslag.

Bedenker: Jaylenn. Opdracht: issue #1. Ontwikkeltak: `work/kart-go-v4-20261111`.

## Uitgangssituatie en audit
- Root main1359ca4 bevat de werkende V3 racegame met20 levels, Canvas2D, controls, opslag en Hotdog-Hond.
- 8d7b564 voegde het losse friends-prototype.html toe op de featuretak. bcc095a koppelde dit via een iframe aan het menu, uitsluitend op die tak.
- Main kreeg vervolgens vijf afzonderlijke previewkopieën (839f4c2 t/m1359ca4). Het hoofdmenu op root kreeg die koppeling niet. Daarom ontbreken de nieuwe functies in het echte spel.
- Het prototype bewaart zijn eigen lokale gegevens onder kartgo-jaylenn-friends-prototype-v1. Het is geen online vrienden- of racesysteem; garagekeuzes hebben geen invloed op de race.
- Root Boost werkte bij een echte browserklik tijdens deze audit. De algemene melding dat alle items kapot zijn kon niet worden gereproduceerd. Hypnose bewaart het item zonder doel vóór de speler; dit voelt als een kapotte knop. DOM-vervanging van slots tijdens aanraking wordt preventief verholpen.
- Publicatiehistorie bevat geannuleerde builds tijdens vijf losse commits. Een GitHub-eenhoorn is geen fout uit spelcode. De hoofdpaden zijn aanwezig; huidige livepublicatie wordt nog apart geverifieerd.

## Veiligheid
GitHub-back-ups aangemaakt:
- backup/v3-working-before-v4-20261111 → f6df9d234bfadef236d99c4f259cdf45e0ae5df3 (laatst geverifieerde V3).
- backup/main-before-v4-20261111 →1359ca4753eabb9af02aad122c741f592c9bad62 (volledige uitgangssituatie).
Geen voortgang verwijderd; geen betaalde dienst geactiveerd.

## Fase1
Stabiele inventarisknoppen met directe pointerdown, toetsenbord/schermlezerklik en melding tijdens aftellen. Pointerdown is niet afhankelijk van een tweede klik na loslaten. Bestaande besturing blijft intact. Voorlopig alleen ontwikkeltak; niet gepubliceerd.

## Tests
Voor wijziging: browser op390×844 kon de echte race starten, drie slots tonen en Boost activeren. Geen fysieke iPhone beschikbaar.
Node regressies volgen na integratie. Alle nieuwe functies zijn nog in uitvoering.

## Volgende stap
Fase2: geïntegreerde coureur, garage, opslagmigratie. Daarna Wereld1/2, QR en backendonderzoek, volledige regressies, veilige publicatie en livecontrole.

## Fase2 — geïntegreerd
Alias en poppetje (bestaande zes prototypekeuzes), helm en kartkleur staan in de echte game. De enige bestaande spelerskart blijft de originele kart; geen nieuwe voertuigtypen toegevoegd. Garage heeft één actief effect: geen/glitter/splash/boem. Splash vanaf bereikt15, Boem vanaf bereikt40 met2s afkoeling. Glitters ophalen op de kaart na eerste winst. XP:100 per eerste levelwinst;500 per XP-level, vanafXP5 glanzende kart. Deze transparante XP-drempel en glitterkaartbeloning zijn implementatiekeuzes bij niet-gespecificeerde details.

Opslag behoudt sleutel kartgo-jaylenn-v1 en maakt backup-before-v4. Alias, avatar, kleur en code worden overgenomen uit het lokale prototype indien nog geen echt profiel bestaat; de lokale proefvrienden worden niet als echte vrienden overgenomen. Export bevat profiel/garage/XP; import voegt overwinningen/beste tijden samen en leest bewust gekozen profiel en instellingen in. Nieuwe lokale codes gebruiken crypto.getRandomValues. QR is lokaal gegenereerd met MIT qrcode-generator1.4.4, geen netwerkdienst. Online koppeling staat expliciet uit.

Tests: bestaande20leveltests nog groen; nieuwe tests voor profielvalidatie, prototypemigratie, blijvende code/kleur/effect, beloningen15/40, XP5 en Boem2s. Browsercontrole en tekenen van effecten volgen in volgende fase.

Fase1 GitHub-commit:9af1790cb7ff6ce1cf62bf32f4a566895fecaf9d.

## Fase3 — Wereld1 en items
Alle oorspronkelijke20 circuits behouden. Hypnose werkt ook als je vooraan rijdt: eerstvolgende tegenstander vóór je, anders dichtstbijzijnde achter je. Geen schijnbaar dode knop meer. Duur10s volgensV4, paarse sprankels. Banaan geeft echte draai-animatie2s, ook bij bots, en eindigt automatisch. Onweer50%, Hypnose20%, Boost15%, Banaan10%, Jump5% blijven exact. Dog blijft9blocks/10sijs/2sfreeze/Jumpbescherming. Garage-effecten tekenen werkelijk tijdens rijden; Boem-knop toont2s cooldown. Geen effect schakelt de cosmetische deeltjes uit; gameplay-aanvallen blijven zichtbaar.
Tests:20/20 circuits door de testcontroller gewonnen; bestaande multitouch/rotatie/pauzechecks groen. Nieuwe regressies bevestigen hypnose vanuit leidende positie en einde spin. Fase2 GitHub394389bf6c427c55afbb831451ee91f58504805c.

## Fase4 — Zandwereld gebouwd
Levels21–50 zijn echte, verschillende circuits in dezelfde engine, met oplopende bochten/duinhoogtes/obstakels en bots15–29%. Nieuwe gecachete procedurele duinen, palmen, cactussen, zandsteenbogen, rotsen, oases en zandweg. Wereldkeuzeknoppen, aparte kaart en doorlopende vrijspeelregel20→21 en49→50. Bestaande20 groene namen/circuits blijven intact.

Zandwereld geeft uitsluitend Hypnose/IJs/Banaan; voorlopig gelijke kansen (Jaylenn heeft daarvoor geen kansen opgegeven). Geen boosts/Onweer/Jump; ook hervatten filtreert wereldvreemde inventaris en boost. IJs houdt tegenstander2s stil. Level50 heeft een grote pizzakart met asymmetrisch gezicht en tomatentong. Geen speciale Pizzaman-aanvallen bedacht. Open creatieve keuze: welke bijzondere aanval/mechaniek wil Jaylenn later? Tot die tijd is dit een volwaardige eindrace tegen Pizzaman met gewone race-AI.

Tests: alle30 zandbanen voltooid,27/30 gewonnen door dezelfde begrensde testcontroller (20/20 groen);50 verschillende curvenreeksen totaal. Geen teleports of extra snelheid tijdens die rijtests. Freeze2s en herstel, boostweigering, toegestane items, geen ongoedgekeurde ijsaanval bij Pizzaman en sessie50 heropenen bevestigd. Grafische browsercontrole volgt. Lokale vriendencode wordt nu meteen opgeslagen, ook vóór eerste race.
Fase3 GitHub:ace6394c6db3cf5ac216c9e44c3f278ee7af0256.

## Fase5/6 — eerlijk voorbereid, online open
Code/QR zijn geïntegreerd en anoniem lokaal; geen werkend online vriendensysteem. Verzoeken/accepteren/verwijderen/naamzoeken/QR-scannen naar een verzoek en multiplayer zijn nog niet gerealiseerd. Alle bijbehorende nepacties uit het prototype ontbreken in het echte spel. Het vriendenmenu meldt dit expliciet.
`docs/ONLINE_PLAN.md` vergelijkt gratis opties en beschrijft identiteit, ouderlijke toestemming, gegevensbeheer, beveiliging en een autoritatieve6speler-backend. Cloudflare Free is technisch kansrijk, maar nog geen goedgekeurde/geactiveerde dienst. Geen betaalde diensten of onnodige kindergegevens gekoppeld. Realtime2/3/6/7 tests zijn daarom niet uitgevoerd. De originele lokale proefcode blijft in de GitHub-back-up raadpleegbaar.

## Fase7 — browsercontroles in uitvoering
Alle echte items,9blocks/10s/2s/Jump, profielsaves, Boem2s en geen-effect getest in echte Chromium met synthetische PointerEvents. Browsercontrole vond dat een start bij veranderde viewport direct pauzeerde; start-resize slaat nu alleen voor de nieuwe race de rotatiepauze over. Een al lopende race pauzeert bij draaien nog steeds. Fase4 GitHub:dcb35d2100b44dc626768c0f59b57037109d62ae.


## Fase7 afgerond — klaar voor publicatie
12november hervat vanaf4f9f9efc5e158efde185ffe5a6e79b34c187fba3 nadat externe browserbestandstest vastliep. Geen code verloren; alle afgeronde fasen stonden in GitHub.
Nu exportdialoog met download én complete kopieerbare back-uptekst; import ondersteunt zowel bestand als plakken. Parser/merge hebben één gedeelde functie, met grootte/validatie en behoud van bestaande wins/beste tijden. Browser heeft kopiëren→plakken→import→opgeslagen bevestigd; bestandskiezer op fysieke iPhone blijft onbevestigd.
`docs/V4_TEST_RESULTS.md` bevat resultaten en eerlijke beperkingen. Alle50 banen/regressies opnieuw geslaagd. Oude previewroutes leiden naar geïntegreerde game; geen aparte nepvrienden of proeflobby meer actief.

## Fase8 — volgende concrete stap
Geteste ontwikkeltak veilig fast-forwarden naar main (verwachte oudehead1359ca4), Pages-build afwachten en de daadwerkelijke officiële URL openen/spelen. Daarna exacte publicatiecommit en live-resultaat hieronder vastleggen. Onlinewerk blijft open als afzonderlijke vervolgfase in issue1.


## Fase8 — publicatie geverifieerd
Ontwikkeltak veilig gefast-forward naar main, vanaf gecontroleerde oudehead1359ca4753eabb9af02aad122c741f592c9bad62. Geen forcepush. Beide back-uptakken blijven bestaan.

GitHub Pages-run43155478534 op gamecommit8f0fab77859279f04cdc335bede7f14877379093 is **completed/success**.
- Officiële rootURL HTTP200 en V4.0 zichtbaar.
- Alle6 stylesheet/scripts HTTP200, SHA-256 identiek aan geteste lokale bestanden (style, QR, player, scenery, desert, game).
- Oude routes friends-prototype.html, preview-vrienden/ en preview-vrienden/friends-prototype.html HTTP200 met doorverwijzing naar echte game.
- Echte livebrowser: Start→testalias kiezen→race1. Gas vasthouden liet kart versnellen tot58km/u; bots verschenen en verplaatsten. Pauze/hervat en terugwereldkaart werkten.
- Op de liveURL een expliciete TEST-back-up met wins1–20 geïmporteerd via plakken, vervolgens via wereldkaart level21 gestart en werkelijk geaccelereerd (66km/u). Deze testdata staat uitsluitend in de remote testbrowser, niet op Jaylenns iPhone en niet in GitHub/de spelbron. Opslag van echte spelers is niet veranderd.
- Geen fout uit een spelbestand in de browserconsole gezien; cloudbrowserextensie gaf eigen metadatawaarschuwingen. Geen spel404 of ontbrekende asset.
- Screenshot van liveZandwereld opgeslagen als bewijs. Geen fysieke iPhone/Safaritest; geen hardwareFPS-claim.

## Opgeslagen fasen
| Fase | GitHub-commit |
|---|---|
|1 audit/touch |9af1790cb7ff6ce1cf62bf32f4a566895fecaf9d|
|2 profiel/garage |394389bf6c427c55afbb831451ee91f58504805c|
|3 items/effecten |ace6394c6db3cf5ac216c9e44c3f278ee7af0256|
|4 zandwereld |dcb35d2100b44dc626768c0f59b57037109d62ae|
|5/6 onlineonderzoek +7 herstel |4f9f9efc5e158efde185ffe5a6e79b34c187fba3|
|7 verificatie/back-up |8f0fab77859279f04cdc335bede7f14877379093|

## Wat nog open is (niet als werkend opgeleverd)
1. Echte online identiteit, veilige vriendschapsverzoeken, acceptatie, verwijderen, scannen en afgeschermd zoeken.
2. Private6speler-lobby en autoritatieve realtime-races; geen backend geactiveerd. Zie ONLINE_PLAN.md; nieuwe dienst met persoonsgegevens vereist toestemming.
3. Jaylenns nog te kiezen bijzondere aanval voor Pizzaman. De gewone Pizzaman-eindrace werkt al.
4. Fysieke iPhone/Android-test, Safari bestandsdownload/keuze en daadwerkelijke apparaatprestaties. Kopieer/plak-back-up is end-to-end getest en beschikbaar.

Volgende Work-sessie: lees issue1 en dit document; bouw voort op laatste main. Offlinegame niet opnieuw bouwen. Alleen onlinefase activeren na concrete goedkeuring van dienst/gegevensbeheer; geen kosten starten.
