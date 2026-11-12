# Serverreparatie publiceren — bestaande Kart Go

Status: **automatisch gepubliceerd via de reeds bestaande GitHub-koppeling**. Cloudflare en Pages succesvol. Twee echte productieclients hebben na herverbinden dezelfde finishuitslag ontvangen. De handmatige route hieronder is alleen een terugvaloptie en hoeft niet uitgevoerd te worden.
Versie die na publicatie zichtbaar moet worden: `ultimate-repair-2`.
Bedenker: Jaylenn. Geen nieuwe dienst of betaald abonnement nodig.

## Klaargezet

- Eén compleet Worker-bestand: `multiplayer/src/index.js`.
- De bestaande klassenaam `RaceRoom` en binding `RACE_ROOMS` blijven behouden.
- Geen externe imports of build nodig voor het dashboard: kopieer het gehele JS-bestand.
- De bijbehorende spelupdate staat op de ontwikkeltak, nog niet op de openbare Pages-site. Eerst server publiceren en controleren, daarna frontend activeren.

## Op jouw iPhone

1. Open het Worker-bestand in deze GitHub-ontwikkeltak. Kopieer de **hele inhoud** (eventueel via de knop voor de ruwe/Raw-bestandsinhoud). Kopieer geen regelnummers of Markdown-codehekken.
2. Ga terug naar je eigen reeds aangemelde Cloudflare-browser.
3. Tik op de bestaande Worker **kart-go-jaylenn** en kies **Edit Code**.
4. Controleer dat je de bestaande Worker bewerkt. Bewaar desgewenst de huidige editorinhoud apart; de oorspronkelijke repositorycode staat ook in de GitHub-geschiedenis bij `d0fc091` en de eerdere back-upbranch. Cloudflare Deployment History biedt een aanvullende terugkeer naar de vorige versie.
5. Vervang de inhoud van het bestaande JS-modulebestand door het volledige nieuwe bestand. De oude en nieuwe code niet achter elkaar plakken.
6. Laat de bestaande Durable Object-binding, namespace en migraties staan: **RACE_ROOMS → RaceRoom**. Verander geen abonnement, maak geen nieuwe Worker of nieuwe database aan. Dit dashboardpakket gebruikt de bestaande opslag.
7. Kies **Deploy**. Bij een binding-, migratie- of abonnementsmelding: niet verder gaan met het aanmaken van nieuwe onderdelen; stuur de foutmelding zodat de bestaande configuratie gericht kan worden gecontroleerd.
8. Meld in de chat **Gedaan**. Dan wordt de daadwerkelijke healthversie gecontroleerd, volgt een tweespelertest op de echte server en wordt de bijbehorende frontend via GitHub Pages geactiveerd.

Bestaande tijdelijke kamers uit de oude geheugenserver kunnen bij deze serverupdate verdwijnen. Publiceer daarom als niemand racet en maak daarna een **nieuwe** QR-uitnodiging. Bestaande lokale namen, karts en singleplayervoortgang worden niet gewist.

## Wat deze reparatie daadwerkelijk verandert

- Kameruitnodiging en spelersidentiteit worden in bestaande Durable Object-opslag bewaard.
- Een privé hervattoken herstelt dezelfde speler; de uitnodigingslink bevat dit token niet. Vriendjes krijgen nooit elkaars hervattoken.
- Herverbinding vervangt de oude socket; geen dubbele speler of extra bezette plek.
- Server bepaalt organisator, klaarstatus, start, posities en uitslag. Een deelnemer kan niet zelf organisator worden door een frontendvlag te wijzigen.
- Bij vertrek wordt een aanwezige speler organisator. Afwezige lobbyplekken zijn maximaal 90 seconden gereserveerd; een begonnen race kan binnen de kamerlevensduur worden hervat.
- Invoer wordt na 1,2 seconde stilte losgelaten; de kart remt uit. Rem-invoer krijgt ook echte extra remkracht op de trainingsserver.
- Hele kamer offline: raceklok wordt bevroren tot herverbinding. Bij tijdelijke serveruitval kan maximaal circa één seconde rijvoortgang terugvallen op het laatste opgeslagen checkpoint.
- Kamer verloopt na twee uur; opslag en verbindingen worden dan opgeruimd. Hibernation-sockets voorkomen een permanente lobbytimer. Tijdens daadwerkelijk racen blijft een interval nodig.
- Bestaande frontend blijft gewone trainingsraces ondersteunen. Hervatten na herladen/onderbreken wordt pas zichtbaar na activering van de meegeleverde frontendupdate.

**Dit blijft de 1800m-trainingsbaan.** Online wereld-/levelkeuze, Party-events en de oorspronkelijke 70-levelpower-ups zijn geen onderdeel van deze reparatie. Die functies worden niet ten onrechte als gereed gemeld.

## Tests

`npm ci` en vervolgens:

- `npm test` — bestaande opslagvelden behouden bij profielwijziging, organisatorstart, twee Pointer Events tegelijk/loslaten/cancel/captureverlies/draaien/blur, hervattoken opnieuw meesturen, offline lid blokkeert de aanwezige organisator niet.
- `npm run test:server` — echte lokale Cloudflare workerd/Miniflare-runtime met SQLite Durable Objects en echte WebSocketPair-verbindingen. Verkeerde origin en verkeerde uitnodiging geweigerd; organisator versus gast; beide klaar; gedeelde aftelling; beide bewegen; na verbreking zelfde id/positie, geen dubbele speler; stilgevallen input stopt; beide finishen met exact dezelfde uitslag; zes spelers, zevende geweigerd; organisatorwissel; SQLite uitnodiging en identiteit blijven na volledige runtimerecreatie behouden.
- Syntaxcontrole van gewijzigde JS-bestanden geslaagd.

De geïnstalleerde lokale runtime ondersteunt maximaal compatibility date **2026-08-06**; de lokale test gebruikt die datum. De bestaande deploymentconfiguratie behoudt **2026-11-12**. De gebruikte API's werken in de lokale oudere runtime; de echte productieomgeving wordt na de eigenaarspublicatie afzonderlijk gecontroleerd.

Nog niet getest voor deze kandidaat: fysieke iPhone/Android, twee telefoons op verschillende netwerken, daadwerkelijke nieuwe Cloudflare-deployment, QR-camera. De eerdere live trainingsrace was wel met twee browserclients tot gezamenlijke finish gecontroleerd.

## Terugdraaien

Gebruik Cloudflare Deployments om de vorige werkende versie terug te zetten. Of herstel de oorspronkelijke module uit GitHub-commit `d0fc0913be1c81d091098976048111a092bb6aa5`. Laat daarbij de bestaande namespace/binding staan. Zet de frontend pas door na een geslaagde servertest.

## Technische bronnen

- https://developers.cloudflare.com/durable-objects/best-practices/websockets/
- https://developers.cloudflare.com/durable-objects/api/alarms/
- https://developers.cloudflare.com/workers/testing/miniflare/core/web-sockets/
- https://developers.cloudflare.com/workers-ai/get-started/dashboard/ (bestaande Worker openen en Edit Code)
