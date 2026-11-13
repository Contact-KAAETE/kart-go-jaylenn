# Kart Go Ultimate — hervatten vanaf deze fase

Bijgewerkt: 12 november 2026. Bedenker: **Jaylenn**. Budget: €0.

## Herstelpunten en branches

- Geauditeerde main: `14c5f0735d3349a28dc5f17943f386e185c82f20`.
- Herstelbare GitHub-backup: `backup/pre-ultimate-14c5f07-20261112`.
- Ontwikkeltak: `work/ultimate-qr-racing-20261112`.
- Gepubliceerde functionele fase: `15920c20a264a7c65874d5f2e25c276eabc5a552` — organisatorstart, QR-uitnodigingen, losse vrijracenmodus.
- Volgende kleine commit: live testresultaten en minder renderwerk buiten een race (zie geschiedenis voor SHA).

## Wat al bestond

- Rootgame: 70 levels / groen, zand, ijs; bestaande fraaie rasterkarts, 12 coureurs, 20 kleuren, garage, 250/509/1000 pk en lokale opslag `kartgo-jaylenn-v1`.
- Party: vijf aparte lane-runnerlevels; eigen opslag `kartgo-party-jaylenn-v1`.
- Multiplayer: Cloudflare Worker en Durable Object met maximaal zes clients, één rechte trainingsbaan van 1800 m, serverposities en uitslag. Dit is **niet** de originele 70-levelengine.
- Frontend verwijst naar de bereikbare Worker `kart-go-jaylenn.thijs30051970.workers.dev`; wrangler.toml noemt echter `kart-go-multiplayer`. Vóór serverpublicatie moet de bestaande deployment/binding worden gecontroleerd.

## Diagnose en daadwerkelijk gebouwde reparatie

- Oorzaak niet kunnen starten: `create` zette `host=true`, waarna `connect` dit onmiddellijk terug op `false` zette. De organisator bleef daardoor geblokkeerd.
- Nieuw: organisator wordt afgeleid uit de door de server verzonden spelersvolgorde (compatibel met de bestaande server die de eerste aangesloten speler als organisator behandelt). Niet afgeleid uit een lokale create-knop.
- Verbondenmelding pas na ontvangst van de echte deelnemerslijst; klaarstatus komt uit de server.
- Vernieuwde besloten wachtruimte met de bestaande coureurs, kleuren en daadwerkelijke rasterkarts in de race.
- Grote QR-uitnodiging met foutcorrectie Q, witte stille rand en decoratie buiten de code. Nieuwe links gebruiken `?room=...#key=...`; oude query-uitnodigingen blijven leesbaar. Geen tweede sleutelveld nodig.
- Uitnodiging opent profielkeuze voor de juiste kamer; vervolgens één Doe mee-knop. De spelersnaam en kleurkeuze bewaren alle overige bestaande opslagvelden.
- Delen, kopiëren, nieuwe kamer/QR, verlaten, klaarzetten en starten aangesloten op echte serveracties. Nieuwe QR maakt een nieuwe kamer, maar trekt de oude uitnodiging nog niet in; interface meldt dit.
- Pointer-id-eigenaarschap voor gelijktijdig sturen en gas, loslaten/cancel/captureverlies/blur/draaien resetten invoer. Rem laat op de huidige trainingsserver gas los (nog geen aparte serverremkracht).
- Tijdverschil met server wordt met ping/pong geschat voor de aftelling.
- Hoofdmenu: Kies je wereld. Vrij racen opent alle 70 oorspronkelijke levels en de vijf Party-levels. Avontuur behoudt oorspronkelijke ontgrendeling. Vrije races wissen geen bestaande hervatrace en leveren geen avonturenontgrendeling/XP op.

## Tests uitgevoerd vóór publicatie

- Node syntaxis: gewijzigde game.js, online.js en party.js.
- DOM-integratietest `npm test`: echte clientcode geladen; serverhost mag starten; bestaande wins/best/session/XP blijven intact bij profielwijziging; twee Pointer Events tegelijk, gas loslaten houdt stuur vast; cancel/captureverlies/orientation/blur zetten invoer correct terug. Dit is synthetische DOM-invoer, geen fysieke touchscreenproef. jsdom is uitsluitend een ontwikkeltestafhankelijkheid, niet onderdeel van de browsergame.
- Echte bestaande Cloudflare-backend: twee onafhankelijke Node WebSocket-clients maakten één kamer, zagen dezelfde profielen, werden beide klaar, kregen dezelfde starttijd, bewogen en finishten. Beide ontvingen exact dezelfde serveruitslag; beide 1800 m afgelegd. `node tests/multiplayer-live.mjs` geslaagd.
- Eerste diagnose gebruikte te korte vaste wachttijden; clients waren toen nog aan het verbinden. Test hersteld naar eventgestuurd wachten. Geen server-startfout uit deze te vroege test afleiden.
- QR: vendor-generator plus onafhankelijke ZXing-decodering van een gerasterde fixture met volledige URL; exact dezelfde payload teruggelezen. Geen echte uitnodigingssleutels in tests/logs/commits opgeslagen.
- Echte Chromium-browser via lokale preview: kart/coureurbeelden geladen; formulier, 12 coureurs en 20 kleuren zichtbaar. Vrij racen → IJs-Wereld → level 51 direct gestart op vers profiel; profiel bewaard; pauze/terug; Avontuur toont ijssloten opnieuw en 0/70 overwinningen.
- Lokale QA-proxy kon geen upstream WebSocket maken (uitsluitend lokale testinfrastructuur). Daarna de echte Pages-site getest: twee aparte Chromium-tabs met onafhankelijke WebSockets, QA Live Een en QA Live Twee, via door de UI gekopieerde uitnodigingslink. Beide zien dezelfde namen, Vos/blauwe kart van deelnemer en Astronaut/rode kart van organisator; beide klaar; organisatorstart werkt; beide in dezelfde race; gas/keybediening verplaatst daadwerkelijk de serverpositie; beide 1800 m voltooid en exact dezelfde uitslag zichtbaar. Server- en browserclienttests geslaagd. Browserinput bij tabs achtereen bediend; gelijktijdige input met onafhankelijke Node-clients getest. Dit bewijst geen fysieke tweetelefoontest.
- Mobiele viewportcontrole in echte Chromium-iframe: 390×844 en 844×390, inhoudsbreedte respectievelijk 375 en 829 px inclusief scrollbar; scrollWidth gelijk aan clientWidth, dus geen horizontale overloop. Nog geen fysieke multitouch-/Safari-test.
- Geen fysieke iPhone/Android, camera-QR, WhatsApp/Berichten of wifi-versus-4G-test uitgevoerd. Geen 70 volledige races opnieuw uitgespeeld.

## Nog niet gerealiseerd / niet claimen

- Serverkamers bestaan alleen in geheugen; geen duurzaam opgeslagen uitnodiging/leden/race, geen hervatten na verbreking. Interface meldt dit.
- Online wereld/levelkeuze, Adventure-co-opregel, oorspronkelijke power-ups/botsingen/checkpoints en Party-gebeurtenissen zijn nog niet op de server aangesloten. Geen nepkeuzes tonen.
- Party blijft bestaande beperkte afzonderlijke uitvoering: blokken geven nog geen echte inventaris; kippen/kat/meteorietgebeurtenissen zijn nog grotendeels eenvoudige tekenen/banners, geen complete platforminteractie.
- Geen nieuwe Blender/Meshy-assets in deze fase. Verloren onopgeslagen Blenderproeven uit eerdere sessies worden niet als opgeleverd beschouwd.
- Geen volledige Ultimate-oplevering; alleen herstel-/QR-/vrijracenfase.

## Volgende concrete stappen

1. Afgerond: frontendfase op officiële Pages-URL gepubliceerd en met twee browserclients tot gezamenlijke finish gecontroleerd. Officiële URL toont nieuwe online.js/online.css en functionerende QR-wachtruimte.
2. Bestaande Cloudflare-deployment openen: deze werkomgeving toont een aanmeldscherm. Er is geen Cloudflare-connector beschikbaar. Secure aanmelding is nodig om servercode/bindings te wijzigen; koop/activeer niets.
3. Daarna op dezelfde bestaande Worker: duurzame kamer/sessionidentiteit, hervatten zonder dubbele spelers, expliciete hostrechten, hostwissel, expiratie en serverversiehandshake. Test twee clients en herstel.
4. Vervolgens geselecteerde wereld/level/mode in gedeelde serverconfig; servergestuurde baan/events/items/finish, dezelfde selectie bij alle deelnemers. Co-op alleen Avontuur. Lokale voortgang is niet cryptografisch bewezen; zonder accounts/serverhistorie geen sterke betrouwbare controle claimen.
5. Pas daarna Party uitbreiden volgens vijf bevestigde levels, gedeelde deterministische gebeurtenissen en 6s straf. Breng echte platformkippen, checkpoint 2,5 km en kat 3 km tot leven. Behoud originele graphics/70 levels.
6. Mobiele/zesclienttests, QR-camera en verschillende netwerken voor zover beschikbaar. Eerlijk rapporteren wat fysieke tests vereist.

## Kosten / infrastructuuronderzoek

Cloudflare officiële documentatie (12-11-2026): SQLite Durable Objects beschikbaar op Workers Free. Free-quota 100.000 requests/dag en 13.000 GB-s/dag; limieten blokkeren verkeer in plaats van automatisch betaald verbruik. Actieve intervals verhinderen hibernation. Beschouw gratis hosting als begrensd, niet onbeperkt. Geen betaalde dienst geactiveerd.

Bronnen: https://developers.cloudflare.com/durable-objects/platform/pricing/ en https://developers.cloudflare.com/durable-objects/best-practices/websockets/ .

## Aanmeldblokkade bij hervatten

De beveiligde Cloudflare-aanmeldflow liep vast/time-out. Een verse dashboardcontrole toonde opnieuw /login; er is geen bevestigde beheersessie en er is geen servercode gepubliceerd. De live frontendfase blijft werken. Handmatige overname van het Cloudflare-aanmeldvenster is de volgende vereiste stap voor serverbeheer. Vraag geen wachtwoorden of codes in de chat.

## Serverreparatie klaargezet voor eigenaarspublicatie

De eigenaar heeft gekozen voor publicatie vanuit zijn eigen werkende Cloudflare-browser. Handleiding: `docs/CLOUDFLARE_SERVER_REPAIR.md`. Zelfstandig Worker-modulebestand: `multiplayer/src/index.js`; versie `ultimate-repair-2`. Bijbehorende frontend-hervatting is meegeleverd op de ontwikkeltak. **Nog niet naar main/Pages of Cloudflare gezet.**

Gebouwd: bestaande Durable Object-opslag voor kamer en identiteit; hibernation-sockets; privé hervattokens; expliciete organisatorrechten en hostwissel; geen dubbele spelers bij herverbinding; invoer-timeout en rem; kamerlevensduur en opslagopruiming. De Worker-naam in wrangler.toml gecorrigeerd naar het daadwerkelijk gebruikte `kart-go-jaylenn`; bestaande binding/class/migratie behouden.

Tests geslaagd: `npm test` en `npm run test:server`. De servertest draait echte workerd/SQLite/WebSocketPair via Miniflare: twee spelers bewegen, hervatten met zelfde positie/id, finishen met identieke uitslag; verkeerde origin/uitnodiging en gaststart geweigerd; zes plekken/zevende geweigerd; organisatorwissel; na volledige runtimeherstart uitnodiging/id terug. Lokale runtime heeft maximaal compatibiliteitsdatum 2026-08-06, terwijl bestaande deploymentdatum 2026-11-12 behouden is. Geen nieuwe productie- of fysieke telefoontest geclaimd.

Volgende stap: eigenaar kopieert de complete module naar **bestaande** Cloudflare Worker → Edit Code → Deploy. Geen nieuwe onderdelen of betaalde opties aanmaken. Na "Gedaan": /health versie controleren, echte tweespelertest, frontendwijzigingen veilig doorzetten naar main en Pages controleren. Online wereldkeuze en complete Party-uitbreiding blijven daarna open.

## Automatische productiepublicatie geslaagd

De Cloudflare GitHub-koppeling bleek **al actief** op main. De eerdere build bij 0ace7e5 was succesvol; handmatig code plakken of opnieuw aanmelden was niet nodig. Dit had eerder via GitHub-checks vastgesteld kunnen worden. De eigenaar liet de bestaande repository/main-configuratie zien.

Herstelpunt vóór doorzetten: `backup/pre-server-repair-0ace7e5-20261112`. Geteste commit `7d374127b9424c8eac8493ec2778145fc8d62468` naar main doorgezet. Cloudflare Workers Builds en GitHub Pages build/deploy alle succesvol. Live /health geeft `ultimate-repair-2`, protocol 2 en resume/durable-rooms/explicit-host terug.

Nieuwe **echte productietest** `node tests/multiplayer-reconnect-live.mjs`: twee onafhankelijke WebSocket-clients; dezelfde starttijd; beide bewegen; speler A verbreekt verbinding, hervat met dezelfde id en minstens dezelfde afgelegde afstand; exact twee spelers, geen duplicaat; beide finishen op 1800 m en ontvangen dezelfde uitslag. Geslaagd. Geen fysieke tweetelefoon- of verschillende-netwerktest geclaimd.

Tijdens browsercontrole één aanvullende frontendfout gevonden: de organisator kreeg na aanmaken nog geen room-query in de eigen adresbalk. Daardoor kon herladen de kameringang verliezen. Nu wordt na de protocol-2-welcome de room-query opgeslagen, naast de private sleutel en resume-identiteit in sessionStorage. Synthetische DOM-regressietest toegevoegd. Cacheversie 2.1.

Volgende stap: deze kleine frontendcorrectie doorzetten en de productie-QR/uitnodiging/browserherlading controleren. Daarna verdere online wereldkeuze/Party-uitbreiding uit de hoofdopdracht, zonder de oorspronkelijke 70 levels te vervangen. Voor normale publicatie is geen nieuw Cloudflare-loginvenster of handmatig plakken meer nodig: commits naar main activeren de bestaande pipeline.

### Definitieve browsercontrole bij live 1b825d9

Live commit `1b825d91da91b4b90c40a5a742855de50b97a2d4`: Cloudflare Workers Builds en alle Pages-checks succesvol. Nieuwste HTML laadt assetversie ultimate-repair-2.1. In echte Chromium-browser: organisator maakt kamer, krijgt room-query; herladen en Doe mee herstelt precies één organisator; uitnodiging gekopieerd via spelknop opent juiste kamer zonder sleutelveld; tweede speler kiest Vos/blauw en verschijnt bij beide clients; herladen van tweede speler herstelt dezelfde naam/kart en houdt exact twee spelers over. Tijdelijke browsertestverbindingen netjes verlaten. Screenshot van geteste QR-wachtruimte vastgelegd; geen echte kindernamen of uitnodigingssleutels in de repository opgeslagen.

Deze serverreparatiefase is gepubliceerd. Geen handmatige Cloudflare-actie meer nodig. Resterend uit Ultimate: online vrije wereld/levelkeuze en Adventure-co-opregel, oorspronkelijke items/botsingen in online races, de complete Party-uitbreiding, fysieke iPhone/Android/camera/wifi-versus-mobieltesten. Noem het totale Ultimate-project dus nog niet afgerond.


## 2026-11-12 — Ontwikkelcheckpoint wereldkeuze en kippen (nog niet gepubliceerd)
- Gebruiker bevestigt dat de bestaande versie daadwerkelijk op twee telefoons samen kon racen. Productiebasis: `1b825d91da91b4b90c40a5a742855de50b97a2d4`.
- Herstelpunt: `backup/pre-world-rollout-1b825d9-20261112`. Ontwikkeltak: `work/worlds-chicken-riders-20261112`.
- Originele Blender-bronnen en zeven geoptimaliseerde WebP-assets: drie knotsgekke racekippen (kaart + achteraanzicht) en een paarse reuzenkat, onder `assets/graphics/chickens/`. Geen betaalde generaties of externe modellen.
- Gedeelde servergestuurde parcoursen voor 70 oorspronkelijke levels plus vijf Party-races. Vier werelden in vaste volgorde: groen, zand, ijs, Party. Vrij racen en Avontuur blijven apart.
- Kippenkeuze met bestaande coureur op het zadel geïntegreerd in Party en online garage/race. Originele singleplayerbestanden en beide opslagstructuren behouden; speler krijgt uitsluitend een extra gevalideerd `chicken`-veld.
- Online wereld-/levelkeuze, drie motoren, drie inventarisplaatsen, power-ups, gezamenlijke kat/checkpoint en dezelfde kamer tussen races.
- Getest: bestaande DOM/multitouch/QR-tests en Miniflare-regressietests slagen; Party-race met vos op Disco Tok in de browser gezien. Nieuwe wereldspecifieke tests en mobiele controle zijn nog vereist vóór samenvoegen.
- Nog open: uitgebreidere feestomgeving, tests nieuwe spelregels en werkelijke live uitrol/controle. Dit checkpoint is geen oplevering.
- Volgende stap: nieuwe simulatie- en twee-clienttests afronden; daarna gecontroleerd main publiceren en Pages én Worker controleren.


## Wereld- en kippenuitrol — klaar voor gecontroleerde publicatie
- Ontwikkelcheckpoint `6ec0b53134d2b3d8018e5f570aac461f8f25d271`; daarna extra oorspronkelijke Blender-feestomgeving en Lucky Block-trein toegevoegd (negen WebP-bestanden samen minder dan 300 kB). Bronnen staan in `tools/blender/`.
- Feestomgeving, trein, kippen met coureur, kat en het verdwijnen van een kip worden door de echte race-renderer gebruikt. Party staat na IJs als wereld 4, levels 71–75.
- Party 71: startramp en schansen; 72: trein met direct herbruikbare Lucky Blocks; 73: vier bewegende hinderniszones; 74: 5 km, wiebelen, meteoren, checkpoint en kat; 75: gezamenlijke mix. De stijl blijft een lichte 2,5D-renderer met voorgerenderde Blender-sprites. Geen volledige 3D-herbouw.
- Mobiele raceweergave in portret 390×844 en landschap 844×390: geen horizontaal of verticaal pagina-scrollen; pedalen, springen, pauze en menu bereikbaar. Draaien/blur onderbreekt lokale Party-race veilig.
- Tests geslaagd: `npm test` (pointereigendom incl. wiel/joystick, behoud wins/XP/best/session, QR SVG); QR decode via ZXing; `tests/worlds-simulation.mjs` (alle 75 parcoursen, originele kansverdeling, zandregels, timers, zes seconden, kat/checkpoint/jump, ijs, hond); `tests/worlds-runtime.mjs` (twee echte Worker-runtimeclients, IJs tot finish, dezelfde kamer naar 5 km Party tot finish, gezamenlijke kat, Adventure-toegang, organisatorrechten); `npm run test:server` (hervatten, SQLite-herstart, zes plaatsen/zevende geweigerd).
- De bestaande 70-levelsingleplayerengine blijft behouden. Online gebruikt dezelfde parcoursrecepten in een gedeelde server-simulatie; dit is geen één-op-één port van elk detail van de oorspronkelijke lokale engine.
- Avontuur controleert aangeleverde lokale overwinningen serverzijdig op vorm/level. Zonder accounts zijn die lokale claims niet cryptografisch te bewijzen; beweren dat dit fraudevrij is zou onjuist zijn. Vrij racen schrijft geen avontuursoverwinningen.
- Nieuwe build nog niet op fysieke iPhone/Android of twee netwerken getest. De gebruiker bevestigde de eerdere online basis op twee telefoons. Geen camera-/WhatsApp-/hardwaretest door ons geclaimd.
- Resterend na publicatie: actuele Worker-versie en Pages-assets verifiëren, `tests/worlds-live.mjs` op productie uitvoeren, browserflow live nalopen. Vriendenlijst met online verzoekbeheer blijft buiten deze fase; private QR-racekamers zijn wel echt online. Het vliegende-kasteelverhaal is een los toekomstidee, niet toegevoegd als nieuwe wereld.


## Live gecontroleerd — 2026-11-12
- Gameplay-uitrolcommit: `edf049d3a709adb59db25bc2177cb657bbe36e83`. GitHub Pages build/deploy/report en Cloudflare Workers Builds alle vier succesvol.
- Werkelijke `/health`: `ultimate-worlds-3`, protocol 3, worlds/items/chicken-riders/resume/durable-rooms/explicit-host. Geen nieuwe Cloudflare-login of handmatige editoractie nodig.
- Alle negen gepubliceerde WebP-assets en zeven belangrijkste HTML/JS-bestanden met HTTP 200 opgehaald; SHA-256 identiek aan de lokale geteste bestanden.
- `node tests/worlds-live.mjs` op productie GESLAAGD: twee onafhankelijke WebSocket-clients openen direct IJs 51, dezelfde aftelling, beide rijden/finishen 2600 m; tussentijds verbreken/herverbinden behoudt id en afstand, geen duplicaat. Daarna dezelfde kamer naar Party 74, kipkeuzes behouden, dezelfde kat bij 3 km, checkpoint en beide finishen de volledige 5000 m met identieke uitslag.
- De eerste testaanname dat A na disconnect organisator bleef, was onjuist. De server droeg organisatorrechten correct over aan B; de test kiest nu de daadwerkelijk actieve organisator. Dit was een testcorrectie, geen versoepeling van serverrechten.
- Echte Chromium-browserflow: kamer gemaakt in IJs, gekopieerde uitnodiging opent deelnemer zonder sleutel overtypen; dezelfde kamer omgezet naar Party 74; beide zien de nieuwe selectie; deelnemer verandert kip naar Disco Tok; beide klaar; organisator start; beide racebeelden met gekozen coureur/kip en bewegende posities bekeken.
- Rootgame live gestart in level 1 en gepauzeerd. Party live met gekozen vos en kip gestart. Portret/landschap in responsive browser gecontroleerd; drie besturingsmethoden/multitouch-eigendom aanvullend via DOM-tests.
- Laatste visuele afwerking: open gouden brilrand van Professor Tok zodat zijn ogen zichtbaar blijven; eigen rijderpositie afgestemd op baanprojectie; cacheversie worlds3.1. Deze afwerking wijzigt geen server-simulatie.
- Niet door ons fysiek getest: iPhone/Android, camera-QR, WhatsApp/Berichten of twee aparte netwerken. De gebruiker bevestigde wel de eerdere online tweetelefoontest.
- Werkende ingangen: oorspronkelijke hoofdpagina, `/multiplayer/` en `/party/`. Party komt na IJs. Vrij racen geeft direct toegang tot alle 75 bestaande/geïntegreerde levels; Avontuur behoudt oorspronkelijke lokale voortgang.
- Open vervolg: verdere grafische verfijning richting de voorbeeldbeelden, speelsessies met de kinderen op echte telefoons; een echt online vriendenverzoekensysteem is niet in deze fase gebouwd. Het losse vliegende-kasteelverhaal is nog geen spelonderdeel.

- Aanvullende integratiecontrole: de knop Samen in de Party-Wereld neemt nu het gekozen Party-level én Vrij/Avontuur mee. `tests/party-riders.mjs` toegevoegd aan `npm test`: behoud bestaande wins/XP/best/session/naam en Party-save, kipkeuze, toegang, start/pauze/menu en correcte online link geslaagd.


## 2026-11-12 — Herstel na iPhone-melding: trein, schaal en sturen
- Uitgangspunt `b716b6eee31918d5b038750504c7638d840aa531`; herstelbranch `backup/pre-party-controls-b716b6e-20261112`, ontwikkeltak `fix/party-controls-projection-20261112`.
- Oorzaken: eigen rijder had factor 1,35 terwijl tegenstanders een andere schaal/grondlijn gebruikten; de trein werd telkens vóór de camera geplaatst en had geen spoor; rodeo begrensde x onzichtbaar op ±0,24 rond de huidige baan.
- Herstel: één camera/projectie en dezelfde basismaat voor alle rijders, echte dieptevolgorde en dezelfde coördinaten als obstakels. De weg loopt door onder de voeten. Startposities van computerkippen verdeeld.
- Trein blijft uitsluitend in 72 en 75; niet in de Kippen-Rodeo 74. Hij rijdt in wereldmeters over een apart spoor, met ballast, dwarsliggers, rails en uitgelijnde wiel-/grondpositie. Geen zweven of meebewegen met de camera.
- Party-sturen: onzichtbare begrenzing verwijderd, minder ongevraagde bochtdrift. Jump blijft handmatig beschikbaar; reparatie verleent geen automatische power-ups. Aanraakeigendom apart per vinger; pauze wist gas/rem/stuurinput en knopmarkering.
- Bewaard: beide opslagkeys, alle bestaande namen/avatars/kleuren/voortgang, oorspronkelijke 70-levelgame, inventaris, zes seconden straf, kat/checkpoint en gratis hosting. Geen nieuwe assets/diensten/kosten.
- Tests geslaagd: `npm test` inclusief nieuwe projectie-/stuurregressies (gelijke schaal bij gelijke positie, juiste diepte en rijrichting, gedeelde botsingscoördinaten, trein niet in 74, alle vijf Party-levels bij alle drie motoren, onafhankelijke aanrakingen, pauze/opslag); `tests/worlds-simulation.mjs`; `tests/worlds-runtime.mjs` met twee clients, IJs en volledige 5 km Party, gezamenlijke kat/finish, wereldwissel en Avontuur-regel.
- Browser lokaal: spoor/trein en gelijke kipmaten bekeken; rodeo op 390×844 gecontroleerd. Fysieke iPhone-test niet door ons uitgevoerd; de aangeleverde iPhonebeelden zijn de aanleiding.
- Publicatie in voorbereiding: assets cache `party-fix-1`; backendversie `ultimate-worlds-3.1`. Na main-update actuele Pages-bestanden en live server/rodeo controleren.


### Live verificatie van de reparatie
- Codecommit `baaf7882285bea1d13f27a7ee777df56a3da7120`: GitHub Pages build/deploy/report en Cloudflare Workers Builds succesvol. Live `/health` meldt `ultimate-worlds-3.1`.
- Gepubliceerde Party-HTML, simulatielogica, renderer en controller met HTTP 200 opgehaald en byte-voor-byte identiek aan geteste bestanden.
- `tests/party-controls-live.mjs` geslaagd: twee onafhankelijke echte productieclients geven gas, sturen gelijktijdig tegengestelde kanten op voorbij ±0,4 (oude grens ±0,24), zien gesynchroniseerde posities, zonder straf en stoppen na verouderde invoer. Geen uitnodigingsgegevens gelogd.
- Lokale Party-integratietest uitgebreid: echte controller + gedeelde simulatie over 150 animatieframes, pointer rechts/links verandert de daadwerkelijke racepositie, vervolgens onafhankelijke release/cancel en pauzereset.
- Mobiel browserformaat 390×844 en gedraaid 844×390 gecontroleerd: geen pagina-overloop, onderbreken pauzeert en maakt de knoppen vrij. Live browser toont de nieuwe schaal en geen trein in level 74.
- Fysieke Safari/iPhone is niet door ons getest. Gebruiker kan dezelfde race opnieuw openen of één keer herladen; nieuwe scriptcacheversies vereisen geen wissen van opslag.


## 2026-11-12 — Grondige audit van iPhone-opname 21:09
- Hervat vanaf `3c72e6985525da92b6ad8438ba21e71170711a06`; herstelpunt `backup/pre-video-audit-3c72e69-20261112`, ontwikkeltak `fix/iphone-video-audit-20261112`.
- Volledige visuele tijdlijn 56,13 s geanalyseerd; concrete tijdstippen, oorzaken en bewijsgrenzen in `docs/KART_GO_VIDEO_AUDIT_20261112.md`. Opname toont Party75, geen root-stuurwiel/multiplayer.
- Herstel: native tekstselectie/aanraakmenu op raceknoppen blokkeren; na uitvliegen terug naar midden; duidelijke pauze, één RAF-keten, Party-aftelling; strafmelding buiten de weg; correcte Megamix-zone. Oorspronkelijke rem accelereert niet meer en stuurwielbereik blijft tijdens draaien constant.
- Party: drie instelbare besturingen, blijvend autogas, compacte positie/ronde/tijd/snelheid; originele profiel- en avonturenopslag behouden. Geen nieuwe betaalde assets of diensten.
- Lokale tests geslaagd: volledige oorspronkelijke70 levels; vijf Party-levels tot finish; multitouch/alle besturingen/rem/autogas/reset/pauze/orientatie; QR exact raster-teruggelezen; lokale echte Worker met twee clients IJs→Party5km/kat/checkpoint/gelijke finish, reconnect/zes plaatsen/hostoverdracht. Browser390×844 en844×390 gecontroleerd.
- Publicatievoorbereiding: `video-audit-1`, Worker `ultimate-worlds-3.2`, protocol3/bestaande binding ongewijzigd. Volgende stap: geteste commit naar main, Pages en Cloudflare-success controleren, gepubliceerde bytes vergelijken en live twee-clientsrace uitvoeren.
- Niet getest: fysieke iPhone/Android/twee telefoons/camera/netwerkwissel; niet als voltooid claimen.

### Live audit afgerond
- Code opgeslagen en uitgerold: `f5be5321a125406779137268890fa5a5e400eec5`; alle Pages-/Cloudflare-checks success, health3.2; negen publieke bestanden HTTP200 en exact gelijk.
- Productie2clients: IJs volledig uit, zelfde aftelling/gelijke uitslag/reconnectpositie; zelfde kamer naarParty74 en volledige5km/kat/checkpoint/identieke finish geslaagd. Productie stuurregressie/staleinputstop geslaagd.
- Ook twee echte browsertabs: uitnodiging→Doe mee→beide namen/kleuren→beide klaar→Start→gezamenlijke ijsbaan, beiden daadwerkelijke beweging. Werkelijke browserQR exact rasterteruggelezen naar gekopieerde uitnodiging.
- Volgend: fysieke iPhone-lange-aanraaktest en QR-camera/twee telefoons op aparte netwerken door gebruiker. Niet als al uitgevoerd rapporteren. Auditrapport en ruwe testresultaten in docs/tests/results opgeslagen.

- Expliciete resterende gameplaybeperking: gedeelde Party/online verwerkt obstakels/power-ups/baanranden, maar nog geen fysieke onderlinge kart-/kipbotsing. Geen succesvolle test daarvan claimen; oorspronkelijke solo-botsrespons bestaat wel.


## 2026-11-13 — Professionele app-interface
- Uitgangspunt `536b8de0cc1da34774c3a123fc7c792a3621aadc`; herstelpunt `backup/pre-app-ui-536b8de-20261113`, tak `design/app-interface-20261113`.
- Nieuwe gedeelde interface voor hoofdmenu, kaarten, garage, coureur, instellingen, multiplayer/lobby/QR en Party-menu. Bestaande illustraties behouden; rustige ronde panelen, gelijkvormige knoppen, duidelijkere hiërarchie en betere mobiele indeling. Voortgangsopties compact maar volledig bereikbaar.
- Geen nieuwe diensten/kosten, geen wijziging aan race-/netwerk-/opslaglogica. Oude misleidende vriendenpopup verwijst nu correct naar echte QR-racekamers; lokale code blijft lokaal.
- `npm test` en na laatste Party-HTML `tests/party-riders.mjs` geslaagd; browser390×844/320×568/430×932/844×390 en desktoplobby gecontroleerd. Werkelijke naam-/karakter-/kleurkeuze bewaren getest, alle20 lakken visueel functioneel gecontroleerd, touchregressies geslaagd.
- Volledig verslag: `docs/KART_GO_APP_INTERFACE_STATUS.md`. Volgende stap: UI-commit publiceren, live bestanden en echte twee-browser-lobby/start controleren, screenshots en eindresultaat vastleggen.

### App-interface live gecontroleerd
- UI-code `5435ea7632448ddd7180b77eadb34ed7b4d0f03a`: alle Pages-/Workers-checks success; zes publieke bestanden exact en zes beeldbestanden HTTP200.
- Echte productie2browserclients: aanmaken→uitnodiging→Doe mee→juiste namen/coureurs/kleuren→beiden klaar→gedeelde start level51→beide karts bewogen. QR exact raster-teruggelezen (Sharp/jsQR); geheimen niet gepubliceerd.
- Screenshot van het echte nieuwe beginscherm wordt ter bewijs vastgelegd. Kleine labelcorrectie Wereldkaart bewaart de bestaande navigatiesemantiek. Geen racephysics/backend/opslag gewijzigd.
- Open blijft: fysieke Safari/Android-test, eerdere Party/online-botsfysicabeperking. Volgende sessie: hervat vanaf laatste main-commit en dit document; niet opnieuw bouwen.

- Definitieve label-/testrapportcommit `f2dff81d8c5d70f3398aa49f77faa12fde8ba769`: Pages en Workers-checks success. Bijgewerkte hoofdpagina met `?v=app7` daadwerkelijk in browser geopend. Bewijsbeeld `docs/screenshots/app-home-20261113.jpg` opgeslagen; geen geheime QR-gegevens in dit beeld.


## 2026-11-13 — Power-ups gebruiken tijdens gas geven en sturen

Basis/herstelpunt: `1bdcd3787844eeb00c69c653f0765a3b3331e3e4`, branch `backup/pre-touch-items-1bdcd37-20261113`. Ontwikkeling: `fix/multitouch-powerups-20261113`.

Jaylenn meldt via screenshot dat hij moet stoppen om een power-up te gebruiken en dat een andere speler soms stilstaat. Concrete oorzaak van gemiste itemaanrakingen: online werden de drie knoppen bij elk 100ms-snapshot verwijderd; daarnaast hadden online/Party alleen click-activering. Gerepareerd met stabiele knoppen en onmiddellijke pointerdown-activering voor alle vingers, zonder gas/stuur-eigendom te wijzigen. Keyboard/assistieve bediening behouden; synthetische tweede klik genegeerd. Springen reageert op dezelfde manier direct.

`npm test` slaagt, inclusief alle oorspronkelijke tracks en alle vijf Party-controllerfinishes. Nieuwe tests falen tegen de vorige code en slagen tegen de reparatie. Twee onafhankelijke WebSocket-clients op de echte server racen in level 1 en 72, verzamelen een echt item, gebruiken dat bij positieve snelheid en gas + stuurinput, ontvangen dezelfde effectstatus en blijven doorrijden. Zie `tests/results/touch-items-20261113.txt` en herhaalbaar `node tests/powerups-live.mjs`.

Geen wijzigingen aan server, originele solo-engine, graphics, spelregels of opgeslagen voortgang. Controller-cacheversie `touch-items-1`. Publicatie en browsercontrole worden na het codecommit vastgelegd.

Nog open: fysieke multitouch op iPhone/Android, verschillende netwerken; oorzaak van incidenteel stilvallen nog niet afzonderlijk bewezen. Bestaande straf/bevriezing/automatisch loslaten bij wegklikken blijven intact. Onderlinge botsfysica is geen onderdeel van deze reparatie. Volgende concrete stap: gepubliceerde controllers verifiëren, dan Jaylenn opnieuw laten proberen met gas/stuur vasthouden en item aantikken.


## 2026-11-13 — Multiplayerbochten, hoogte, schansen en sterke gewapende bots
- Vanaf `29bd10b`; gepubliceerd en op productie getest in `461b92b0fe8ee8fe239401657e043a6a77055a14`. Herstelbranch `backup/pre-stunt-racing-29bd10b-20261113`.
- Alle 75 gedeelde onlineparcoursen met extra haarspeld-/S-bochten, hoogte en brede veilige schansen; renderer volgt nu de geïntegreerde wegbuiging. De oorspronkelijke singleplayerengine blijft behouden.
- Gewone online races vullen het startveld tot zes met snelle bots; Party-bots gebruiken dezelfde betere AI. Bots verzamelen/verbruiken wapens: zichtbare onweer-/hypnose-/ijsprojectielen en bananen. Eindbazen wisselen drie aanvallen af.
- `npm test`, worlds-simulation, worlds-runtime, server-repair en nieuwe stunts-bots/stunts-live lokaal geslaagd. Nieuwe tweespelertest op productie geslaagd: vier bots, gelijke sprongen/projectielen, herverbinden en gezamenlijke uitslag. Pages en Workers Builds success; health `stunt-racing-4.0`.
- Status, exacte scope en bewijsgrenzen: `docs/KART_GO_STUNTS_BOTS_STATUS.md`. Fysieke iPhone/Android niet door ons getest. Voor de nieuwe baanobjecten een nieuwe kamer starten.


## 2026-11-13 — Gerichte gebruikerscorrectie: eindbaasstart, schaal en ijs
- Uitgangspunt `1485453`; code `a7906a7f3016803c89d2b46f7d5c17c39274cf2c` gepubliceerd en op productie geverifieerd. Herstelbranch `backup/pre-boss-fair-1485453-20261113`.
- Screenshot betrof rootgame level20: de 1700-eenhedenvoorsprong en boss-factor2,15 verwijderd. Alle drie eindbaasraces starten gelijk op afstand0. Startkader houdt beide karts volledig naast elkaar; daarna bestaand volgbeeld.
- Rechte achteraanblik van dezelfde Hotdog-Hond geïntegreerd; oude atlas intact. IJsduur 2→1,2s, ook voor eigen items en online/Party.
- Besturingshandlers, gevoeligheid, gas/rem, autogas en spelerbewegingsphysics exact behouden. Bestaande parcours-/omgevingsbestanden, CSS en textures ongewijzigd.
- Volledige basistests, boss-fairness op vier schermformaten, gedeelde simulaties, server-repair en tweespelertest geslaagd. Productietest boss-live: gelijke start, echte ijs-treffer <=1,2s, herstel versnellen en identieke serverstatus. Publicatiechecks success; health `boss-fair-4.1`.
- Details en bewijsbeeld: `docs/KART_GO_BOSS_FAIRNESS_STATUS.md`. Fysieke telefoons niet door ons getest.
