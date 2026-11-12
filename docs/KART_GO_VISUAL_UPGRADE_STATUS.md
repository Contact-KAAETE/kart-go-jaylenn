# Kart Go V5 — echte grafische upgrade

**Afgerond en live gecontroleerd op 12 november 2026.**

Speel: https://contact-kaaete.github.io/kart-go-jaylenn/

De grafische gamecode staat op main in commit `32d0dbd03431694ef8d57a9e35c8323113b9379b`.
GitHub Pages-run `43162873160` is succesvol afgerond. De laatste documentatiecommit verandert geen spelbestanden.
Alle negen nieuwe rasterassets zijn daadwerkelijk geladen door de gepubliceerde game, inclusief de raceweergave.
De 50 levels, twee werelden, twee eindbazen, besturing en lokale voortgang zijn behouden.
Online vrienden en multiplayer zijn, net als voor V5, niet aangesloten. Dit staat duidelijk in het vriendenmenu.

Bedenker: Jaylenn. Hervat bestaande50levelgame, geen herbouw. Ontwikkeltak work/kart-go-visual-v5-20261112.

## Herstelpunt / audit
Main bij start:2b8b49071bdc4d82aacc3874826928beed281efa (V4.2). Alle genoemde bestanden onderzocht: index, game, player, scenery, desert, style, visual-v4-1/2 en kart-go-race-scene.svg. Hoofdmenu gebruikte SVG; race bleef Canvas-vormen. Personagefunctie had bovendien querySelector(...).forEach in plaats van querySelectorAll: gerepareerd door echte6kaartenselectie.
Herstelbare GitHub-back-up: backup/v4-2-before-v5-20261112. Geen opslag gereset. Bestaande avatar-ID’s blijven gelijk; emoji’s zijn nu uitsluitend interne oude IDs, geen definitieve portretten.

## Beelden en kosten
OpenArt-account gecontroleerd: Free,0credits, geen betaalbare generatiemodellen. Eerdere OpenArt-generatie QCKMh9hxS4oqEChztWI9 bestaat, maar CDN-download gaf403. Geen betaalde generatie gestart. Twee eerder goedgekeurde menuafbeeldingen teruggevonden als stijlreferentie; ze bevatten niet-functionele in-afbeeldingknoppen en zijn daarom niet als complete UI ingeplakt.
Negen nieuwe productiebeelden gemaakt met de beschikbare ingebouwde image_gen, zonder externe betaalde API/abonnement. Geoptimaliseerd naar WebP (beeldinhoud niet gewijzigd). Eindbestanden in assets/graphics, bronafmetingen/alpha/bytes in V5_ASSET_MANIFEST.json.

## Stap1/2 — gebouwd en lokaal getest
Nieuw werkelijk spelmenu met rasterracebeeld, HTMLKARTGO-titel, echte Spelen/Garage/Mijncoureur/Vrienden/Wereldkaart/Instellingen-knoppen en subtiele camera/lichtanimatie. Wereldkaart is een apart scherm; bestaandeback-upknoppen blijven beschikbaar.
Zes eigen3D-gerenderde portretten: Astronaut/Ninja/Vos/Panda/Kikker/Robot. Kaarten, grote selectievoorvertoning en menuprofiel gebruiken de echte atlas. Bestaande avatarIDs, naam, helm/teamkleur en saves blijven behouden. Rasterloader laadt menubeeld/portretten eerst; racebestanden kunnen apart worden geladen.
Tests: Node alle50banen en eerdere regels/migratie slagen. Echte browser: hoofdmenu visueel bekeken, Spelen→Vos→TurboVijf→opslaan→race1 werkt. Geen fysieke iPhone-test.

## Definitieve bestanden / daadwerkelijke integratie

Alle bestanden staan onder `assets/graphics/`. Samen 4.551.172 bytes (circa 4,34 MiB).

| Bestand | Daadwerkelijk gebruik |
| --- | --- |
| menu-v5.webp | Hoofdmenu, achter echte HTML-knoppen |
| characters-v5.webp | Zes kaarten/portretten; profiel, menu, vrienden, garage en gekozen coureur op de racekart |
| karts-v5.webp | Speler en bots tijdens races; drie stuurstanden, drie garagevooraanzichten, opgeslagen lak |
| scenery-v5.webp | Twaalf losse geprojecteerde decorstukken in beide werelden |
| landscapes-v5.webp | Twee bewegende panorama’s voor groen en zand |
| bosses-v5.webp | Hotdog-Hond en Pizzaman in hun echte racelevels |
| effects-v5.webp | Lucky Blocks, power-ups, inventaris en garage-effecten |
| garage-v5.webp | Garagewerkplaats achter het werkelijk gekozen voertuig |
| terrain-v5.webp | Geprojecteerde asfalt-, gras-, zand- en zandwegtexturen |

Alleen menu en coureurportretten laden meteen. Racebestanden, garage en eindbazen worden naar behoefte geladen.
De race wacht op benodigde graphics, met een laadvenster en herstelkeuze bij laadfouten.
De oude procedurele tekenfuncties blijven als expliciete noodweergave behouden.

## Promptbriefs
Alle beelden: premium glossy animated-feature3D-kwaliteit, originele KartGo-onderdelen, warme heldere belichting, geen UI/labels/watermerken. Hoofdmenu: dynamische rode kart/astronaut, vos/frog op achtergrond, groene heuvels/molens/barn, open blauwe lucht voor HTMLtitel. Karakteratlas3×4:6frontale borstportretten en6overeenkomende rugaanzichten. Kartatlas3×2:dezelfde lege rode sportkart in3rear/3frontaanzichten; echte rijdende kart wordt later composiet met gekozen coureur, geen extra voertuigtypes. Decoratlas4×3:oak/pine/blossom/barn,mill/fence/flowers/rocks,palm/cactus/arch/oasis. Panorama2rijen:groeneheuvels en zandduinen, geen vaste weg zodat bestaande bochten behouden blijven. Bossatlas2×2:hondinhotdog en pizzamanmettomatentong, geen nieuwe aanvallen. Effectatlas5×2:block,onweer,hypnose,boost,banaan/ijs,jump,glitter,splash,boem. Garage:lege belichte werkplaats met displayplatform voor de daadwerkelijk gekozen kart.

## Stap3/4/5 — echte racegraphics gebouwd
Kart() gebruikt nu de rasteratlas met3stuurstanden, lak via gecachete kleurtint, gekozen3D-rugaanzichtcoureur op de stoel, bandenlichtjes en bestaande sprong/spin/shadows. Bots krijgen verschillende coureurs. Geselecteerde kleur en coureur blijven echte opgeslagen instellingen.
Panorama’s,12decorstukken en nieuwe asfalt/gras/zand/materialen worden in dezelfde bestaande baanprojectie getekend. Dus echte bochten, hoogtes en alle50baanverschillen blijven behouden. LuckyBlocks,bananen,ijs en effectflitsen gebruiken echte sprites. Beide bosses gebruiken hun nieuwe rasters; hun aanvallen en timing zijn ongewijzigd.
Een negende productieasset toegevoegd:terrain-v5.webp,4materiaaltegels(asfalt/gras/zand/zandweg). Geen sceneplaatje over de game gelegd: iedere kart/decor/block blijft afzonderlijk geprojecteerd, met originele physics en detectie.
Lokaal echtbrowserbeeld vanlevel1 bekeken: rode glanzende kart met gekozen vos, gekleurde bots met coureurs, fotogedetailleerde bomen/barn/mill, rasterlucht, gras en asfalt en gouden blocks daadwerkelijk zichtbaar. Geen spel-JavaScriptfouten; alleen eigen cloudbrowser-metadatawaarschuwingen. Node50level/regressies blijven groen.
Menu/karaktercommit:8a8ad31c51f008f95a25bd1b1e47cb72fa24eb24, veilig gepubliceerd naar main; herstelpunt backup/v5-menu-before-race-art-20261112.
Volgende stap: garage composietpreview en mobiele controles; na bewezen tests volledige race-upgrade publiceren.


## Stap6 — garage en eindbazen afgerond
Nieuwe gamegarage met rasterwerkplaats/displayplatform, werkelijk samengestelde geselecteerde kart+coureur,4kijkhoeken, lakpicker, opgeslagen kleur, grote selecteerbare effectkaarten met echte unlocks, geanimeerde preview en terugknop. Defaultenkeloriginelekart blijft behouden. Browser:blauw kiezen→achteraanzicht→bewaren→heropenen geeft #579be4; avatarVos blijft zichtbaar. Geen nieuwe voertuigtypes of regels toegevoegd.
Hotdog-Hond en Pizzaman zijn aan hun echte in-race bossrenderer gekoppeld, met oorspronkelijke9blocks/10s/2svries/Jump en bestaandePizzamanrace zonder nieuweaanvallen.
Verouderde V4.1/V4.2-stijlbestanden blijven in repository maar worden niet meer geladen; V5CSS bepaalt de echte UI. Dat voorkomt dat oude SVG/emoji-styling de nieuwe rasterweergave overschrijft. Cacheversie v5.0.3 voor gewijzigde code/CSS.

## Mobiele / functionele controles
- Node alle50banen en oorspronkelijkephysicsregels/migraties/controls slagen;20/20 groen en27/30 zand gewonnen doorzelfde begrensde controller,50/50voltooid.
- Echte lokale Chromium rastertest: minstens4rasterkarts+4coureurs perframe, panorama/decor/wegtextuur actief.6onderscheidbare rugaanzichtsprites met verschillende pixels;3lakkeuzes veranderen werkelijk racepixels;alle6avatars opslaan/teruglezen.
- Gekozen groen/zand/bosslevels1,5,10,15,20,21,30,40,50 laden met graphics gereed. Alle9productiebeelden gedecodeerd;56.610.488bytes atlaspixels(~54MiB), exclusief canvas/tintcaches. Tintcache begrensd op31varianten; geen algemene hardwaregeheugenclaim.
- Viewports320×568,375×667,390×844,430×932,844×390:knoppen,wiel,joystick passen zonderoverlap/buitenbeeld. Drie itemslots bereikbaar met hit-test.320extraanalogecheck beideassen/loslaten/reset;op390gelijktijdigestuur/gas/rem,cancel,pauze en opnieuw aanraken.
- Op320profilemodal264pxbreed,scrollWidth264(dus geen horizontaleoverflow),hoogte509pxbinnen568viewport;6kaartkeuzes aanwezig. Grote karaktervoorvertoning blijft op ruimere telefoons; kleine hoogte gebruikt compacte kaarten.
- Browser bevestigt onweer/boost/jump via DOMpointerdown,hypnose10s,bananaplaatsing,ijs2s,Boem2scooldown,geen-effect,savesenbossregels. De remote browser throttlet requestAnimationFrame; daarom koppelt de touch/physics-regressie40vasteupdates aan echte synthetischePointerEvents. Geen foutieve claim van wallclock65Oms of60FPS op hardware.
- Geen fysieke iPhone ofAndroidtoestel beschikbaar. Mobiele viewporttest is geen Safarihardwaretest. Automatische kwaliteitsverlaging blijft actief; het testbrowserrapport schakelde naar niveau1.
Racerendercommit:a52aaa11c304f404246db1a84318717358b7b0fe. Herstelpunt:backup/v5-race-before-garage-20261112.

## Definitieve livecontrole

- Officiële root-URL geopend in Chromium: werkelijk V5-menu en functionerende knoppen zichtbaar.
- Alle 17 gekoppelde code-/stijl-/beeldbestanden gaven HTTP 200 en waren bytegelijk aan de geteste checkout. Alle negen WebP’s zijn inbegrepen. Zie `V5_PUBLICATION_CHECK.json`.
- Bestaande V4-testbrowservoortgang bleef aanwezig: 20 gewonnen levels, XP 5 / 2000 XP en ontgrendelde Zandwereld. Geen reset, opslagkey of avatar-ID gewijzigd.
- Online profiel: Robot en bijnaam TurboJay gekozen en opgeslagen. Garage: paarse lak en Splash opgeslagen. Race 21 toont daadwerkelijk de gekozen Robot in een paarse rasterkart met Splash, duinen, cactussen en palmen. Race reed op 120 km/u; drie inventarisslots verzamelden ijs/hypnose.
- Via Pauze → Wereldkaart → Groene Wereld → level 1 gestart. Echte groene rasteromgeving, drie bots met verschillende coureurs en gekozen Robot/paarse kart zichtbaar. Gas gaf 102 km/u; pauze en terugkeer naar hoofdmenu werkten.
- Geen game-JavaScriptfout waargenomen. De browserextensie zelf logde metadatawaarschuwingen; die kwamen niet uit de game.
- Screenshots van werkelijk gepubliceerde hoofdmenu, groene race en zandrace gemaakt. Dit zijn browseropnamen, geen conceptbeelden.

## Grenzen en hervatten

Geen fysieke iPhone/Android/Safari-hardwaretest uitgevoerd; geen claim van bewezen 60 FPS of gemeten toestelgeheugen. Wel vijf mobiele formaten, touchsimulatie, echte Chromium-rendering en live races gecontroleerd.
Geen nieuwe betaalde dienst, account, tracking of advertentie toegevoegd. OpenArt had geen credits; de ingebouwde beeldgeneratie leverde de geïntegreerde assets.

De V5-opdracht voor de grafische singleplayer is uitgevoerd. Volgende concrete stap bij een vervolg: controleer de actuele main-commit en lees dit document; bouw niet opnieuw. Eventuele terugmelding vanaf een fysieke iPhone gericht reproduceren. Voor online vrienden/multiplayer blijft issue #1 / `ONLINE_PLAN.md` afzonderlijk open en is nog een veilige backend nodig.

## Opgeslagen fases

| Remote commit | Afgeronde fase |
| --- | --- |
| 8a8ad31c51f008f95a25bd1b1e47cb72fa24eb24 | Echt rasterhoofdmenu, zes coureurkaarten en productieassets |
| a52aaa11c304f404246db1a84318717358b7b0fe | Rasterkarts, coureurs, panorama’s, decor, wegtextuur en effecten in races |
| 32d0dbd03431694ef8d57a9e35c8323113b9379b | Garage, mobiele afwerking en geslaagde functionele/rastertests; live game |

Herstelpunten: `backup/v4-2-before-v5-20261112`, `backup/v5-menu-before-race-art-20261112` en `backup/v5-race-before-garage-20261112`. De laatste documentatiecommit na bovenstaande gamecommit legt deze livecontrole vast.
