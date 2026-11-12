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
