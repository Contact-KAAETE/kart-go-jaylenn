# Kart Go — speltest en herstel, 12 november 2026

KART GO — Bedacht door Jaylenn.

## Uitgangspunt en herstelpunt

Bestaande main: `3c72e6985525da92b6ad8438ba21e71170711a06`.
Herstelbranch: `backup/pre-video-audit-3c72e69-20261112`.
Ontwikkeltak: `fix/iphone-video-audit-20261112`.
Geen herbouw, nieuwe hosting, kosten of nieuwe grafische assets. De oorspronkelijke rasterbeelden, karts, coureurs, opslagkeys en 75 levels blijven behouden.

## Wat de opname daadwerkelijk toont

Bestand: `ScreenRecording_11-12-2026 21-09-11_1(1).mp4`, duur 56,13 seconden, 512×1112, 30 beelden/s. Volledige visuele tijdlijn beoordeeld met beelden om de halve seconde. Onderstaande tijden zijn afgerond op 0,5 seconde. De privé-opname wordt niet in GitHub gezet.

De opname toont **Party-level 75, De Grote Finale-Megamix**, met stuurknoppen, kip en coureur. Zij toont geen stuurwiel, oorspronkelijke kart-race of multiplayer. Aanraakpunten zijn niet zichtbaar: de bedoelde knop en exacte aanraakvertraging kunnen daaruit niet worden bewezen.

| Tijd | Zichtbare waarneming | Oorzaak en herstel |
|---|---|---|
| 0:00–circa 0:13 | `75 · PAUZE`, 1294/5000 m en één resterende strafseconde blijven staan. De race is gepauzeerd, geen aangetoonde vastloper. | Pauze was alleen herkenbaar aan een kleine tekst/knop. Nu een duidelijk pauzescherm met Hervatten en Menu; geen stuurinput tijdens pauze. |
| Circa 0:01–0:03, 0:05–0:07,5 en 0:20–0:25 | Blauwe selectiemarkeringen, vergrootglas en het iOS-menu **Kopieer/Zoeken** verschijnen rond stuurknoppen/inventaris. | Party-bediening liet tekstselectie en lange-aanraakmenu's toe. `user-select:none`, `-webkit-touch-callout:none`, `touch-action:none` en gerichte `contextmenu`/`selectstart`-afhandeling toegevoegd. Formuliervelden blijven bewerkbaar. |
| Circa 0:13,5–0:14 | Afstand gaat van 1294 naar 0/1 m en score van 105 naar 0. | Een herstart is zichtbaar; de video bewijst niet welke knop werd aangeraakt. Herstart heeft nu één beheerde animatielus en opnieuw 3–2–1–GO. Geen wisactie op avonturenvoortgang. |
| Circa 0:20–0:26 | Afstand blijft op 477 m staan terwijl een zes-secondenstraf aftelt. Een brede rode balk staat dwars over de baan. | Stilstand tijdens straf is de spelregel. De dubbele, zichtblokkerende canvasbalk is verwijderd; de afteller blijft compact in de HUD. Ook online staan gebeurtenissen in een eigen rij buiten de baan. |
| Circa 0:28–0:49,5 | Herhaalde twee-secondenstraffen nabij de rechterrand, achtereenvolgens rond 566, 580, 596, 610, 625, 640, 655, 670 en 684 m. | In de code keerde een uitgegleden speler terug op x=±0,8, dicht bij dezelfde rand. Doorsturen kon snel weer uitvliegen veroorzaken; native selectie verstoorde bovendien de bediening. Terugkeer nu naar het midden, ijsinertie wordt gewist, aanraakeigendom/release gecontroleerd. Blijvend naar buiten sturen kan uiteraard opnieuw uitvliegen veroorzaken. |
| Circa 0:14–0:49 | Omgeving zegt WERKBANK, de gewone HUD zegt steeds ‘Drie reuzenkippen’. | De algemene rodeotak onderschepte de Megamix-zonemelding. De eerste zone wordt nu correct benoemd; kat/meteorieten/checkpoint houden prioriteit wanneer die daadwerkelijk actief zijn. |
| Circa 0:50–0:51,5 | Kort pauzeren/hervatten, nog een herstart, vervolgens terug naar het Party-menu. | Deze handelingen zijn zichtbaar. Geen finish in de opname. Pauze, hervatten, herstart en menu afzonderlijk functioneel getest. |

Wel zichtbaar: autogas staat aan, de afstand loopt tijdens vrij rijden op, computerkippen rijden en halen voorbij, power-ups worden verzameld. De video bewijst geen correcte finish, rondetelling, QR-verbinding of fysieke stuurwielwerking. Geen reproduceerbare witte pagina gezien. Een betrouwbare FPS-meting volgt niet uit deze opname.

## Aanvullende codefouten en verbeteringen

- Oorspronkelijke game: remmen stelde de doelsnelheid op 24% van de topsnelheid. Vanuit stilstand gaf de rem daardoor gas, ook zonder gaspedaal. Doelsnelheid nu nul; rem heeft voorrang op gas en autogas.
- Oorspronkelijk stuurwiel: de gevoeligheid werd bij iedere beweging herberekend uit de geroteerde begrenzing van het stuur. Het meetbereik wordt nu bij het begin van een aanraking vastgelegd; een stilgehouden vinger verandert niet meer door de stuurrotatie van uitslag.
- Party-herstart kon meerdere RAF-ketens laten bestaan. Eén frame-eigenaar en annuleren bij menu/herstart voorkomen dubbel renderwerk.
- Party heeft nu dezelfde drie keuzes: knoppen, stuurwiel en groene joystick. Eén vinger bezit het analoge stuur, andere vingers kunnen gas/rem bedienen. Loslaten, annuleren, verlies van capture, pauze en draaien maken invoer vrij.
- Party bewaart besturingskeuze en autogas zonder bestaande naam, XP, kleuren, wins, beste tijden of opgeslagen oorspronkelijke race te overschrijven.
- Party-HUD toont ook positie, ronde, actieve racetijd en snelheid. Pauze/aftelling tellen niet mee als racetijd. Straf telt wel mee.
- Online protocol blijft 3; backendversie `ultimate-worlds-3.2`. Bestaande Durable Object-binding, namespace en toegang blijven intact.
- Nieuwe script-/stylesheetcache `video-audit-1`; geen opslag/cache wissen nodig.

## Uitgevoerde tests vóór publicatie

| Test | Resultaat |
|---|---|
| `node tests/game.test.cjs` | Geslaagd: alle 20 gras-, 30 zand- en 20 ijslevels tot finish via de echte simulatie, drie besturingen, multitouch-eigendom, remvoorrang, vaste stuurwielgevoeligheid, rondes, checkpoints, finish/heropenen, garage en opslagmigratie. Inclusief 15 extra volledige races over drie motorvermogens, stof 2 s, water 3 s, eindbazen en power-ups. |
| `npm test` (DOM/Party/projectie/QR-generatie; oorspronkelijke gametest afzonderlijk uitgevoerd en nu ook standaard toegevoegd) | Geslaagd. Echte Party-controller 71–75 naar finish, vrije voortgang ongewijzigd, volgend avonturenlevel opgeslagen, driemaal herstart/animatie-eigendom, drie besturingen met onafhankelijke vingers, autogas/rem/gas, pauze/rotatie en native-menuafhandeling. |
| `npm run test:worlds` | Geslaagd: 75 deterministische parcoursen, exacte kansen, zandregels, zes seconden obstakelstraf, veilige verzamelobjecten, kat/checkpoint/jump, centrale terugkeer. Twee onafhankelijke lokale WebSocket-clients rijden IJs én volledige 5 km Party uit met dezelfde resultaten en gebeurtenissen; wereldwissel in dezelfde kamer en Avontuur-toegang gecontroleerd. |
| `npm run test:server` | Geslaagd: CORS, uitnodiging/organisator, gedeelde start, reconnect/positie, geen dubbele speler, stale input, zes plaatsen/zevende weigeren, hostoverdracht en SQLite-herstart. |
| QR teruglezen | SVG naar raster omgezet en met ZXing-C++ exact teruggelezen naar de disposable uitnodigingslink. Geen echte uitnodigingssleutels gepubliceerd. |
| Echte Chrome-browser, mobiele iframes | 390×844 en 844×390: oorspronkelijke knoppen/stuurwiel/joystick zonder overlap, gelijktijdige synthetische touch, rem, motoren, 2/3 s herstel, pauze/opslag, winterbeelden 51–70 en alle ijsregels geslaagd. Party-pauzescherm, aftelling en nieuwe wiel-/joystickindeling zichtbaar gecontroleerd; geen overlap/buiten beeld bij liggende Party-joystick. |

Tests gebruiken echte gamecode; automatische stuurbesturing is geen menselijke moeilijkheidsbeoordeling. Synthetische pointer-events zijn geen fysiek iPhone-multitouchbewijs. De browser rapporteerde eigen extensie-metadatafouten; die zijn geen gamefouten.

## Openstaande grenzen

- De gedeelde Party/online-simulatie verwerkt obstakel-, baanrand- en power-upbotsingen, maar heeft nog geen fysieke botsrespons tussen twee karts/kippen onderling. Zij kunnen elkaar daardoor overlappen. De oorspronkelijke singleplayer heeft wel een onderlinge botsrespons. Dit is een resterende beperking, geen in deze video bewezen netwerkfout.
- Fysieke iPhone Safari, Android-camera, WhatsApp/Berichten en twee echte telefoons op wifi/mobiel internet kunnen vanuit deze sessie niet worden getest. Juist de iOS-selectie moet Martin nog op zijn toestel bevestigen. Geen claim dat die hardwaretest al is uitgevoerd.
- De opname bereikt geen meteorieten, checkpoint, kat of finish. Die zijn daarom apart met de echte simulatie en twee clients getest.
- Avontuur-co-op gebruikt aangeleverde lokale voortgang. Zonder accounts of serverhistorie is dit geen fraudebestendige verificatie van oude singleplayerwinsten. Privékamers zijn werkelijk online; het losse oude vriendenboek blijft lokaal.
- Party gebruikt de bestaande gedeelde 2,5D-presentatie met prerendered kippen/coureurs en kermisbeelden. Deze reparatie maakt geen nieuwe filmkwaliteit-wereld, verandert Jaylenns verhaal niet en vervangt de oorspronkelijke goede graphics niet.

## Geslaagde live publicatie en online controles

Codecommit: `f5be5321a125406779137268890fa5a5e400eec5`.
GitHub Pages build/deploy/report en Cloudflare Workers Builds: **success**.
Live backend `/health`: **ultimate-worlds-3.2**.
Alle negen gewijzigde publieke HTML/JS/CSS-bestanden met HTTP200 geladen en byte-voor-byte gelijk aan de geteste broncode.

- `node tests/party-controls-live.mjs`: twee onafhankelijke echte productieclients versnellen en sturen tegelijk tegengestelde kanten op; gelijke serverposities en automatisch stoppen bij verouderde invoer.
- `node tests/worlds-live.mjs`: twee nieuwe clients direct in de IJs-Wereld zonder vorige levels, dezelfde starttijd, onderbreken/herverbinden met behoud identiteit/positie, allebei de finish met identieke uitslag. Daarna **dezelfde kamer naar Party74**, beide spelers rijden de volledige5km uit met gedeelde kat, checkpoint en identieke serveruitslag.
- Twee afzonderlijke echte browsertabs op de gepubliceerde website: kamer gemaakt, uitnodiging gekopieerd/geopend, Doe mee, beide juiste namen/kleuren zichtbaar, beide klaar en organisator start; dezelfde ijsbaan, beide karts daadwerkelijk met toetsen bewogen (circa79m bij223km/u), posities/stand gedeeld. Dit zijn browserclients op één testcomputer, geen twee telefoons.
- De **werkelijke QR uit deze productiekamer** naar raster omgezet en met ZXing-C++ exact teruggelezen naar de in de browser gekopieerde uitnodiging. Geen tweede sleutel overtypen. Geen scan met een fysieke telefooncamera geclaimd.
- De gepubliceerde Party75-versie geopend in390×844; nieuwe besturingkeuze, startaftelling en HUD aanwezig. Oorspronkelijke naam- en voortgangsopslag intact.

Speellink: https://contact-kaaete.github.io/kart-go-jaylenn/
Party: https://contact-kaaete.github.io/kart-go-jaylenn/party/
Samen: https://contact-kaaete.github.io/kart-go-jaylenn/multiplayer/

Volgende concrete stap: Martin laat op zijn iPhone een stuurknop enkele seconden ingedrukt, stuurt daarna de andere kant op en controleert dat Kopieer/Zoeken wegblijft. Hardwaretest op twee netwerken en fysieke QR-camera blijven nog te doen. Bestaande gratis server en hosting zijn daadwerkelijk gepubliceerd; geen loginhandeling nodig.
