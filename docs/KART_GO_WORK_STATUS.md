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
