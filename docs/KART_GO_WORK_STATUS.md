# KART GO V4.0 — voortgang

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
