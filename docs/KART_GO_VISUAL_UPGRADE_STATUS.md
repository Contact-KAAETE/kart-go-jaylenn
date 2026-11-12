# Kart Go V5 — echte grafische upgrade

Bedenker: Jaylenn. Hervat bestaande50levelgame, geen herbouw. Ontwikkeltak work/kart-go-visual-v5-20261112.

## Herstelpunt / audit
Main bij start:2b8b49071bdc4d82aacc3874826928beed281efa (V4.2). Alle genoemde bestanden onderzocht: index, game, player, scenery, desert, style, visual-v4-1/2 en kart-go-race-scene.svg. Hoofdmenu gebruikte SVG; race bleef Canvas-vormen. Personagefunctie had bovendien querySelector(...).forEach in plaats van querySelectorAll: gerepareerd door echte6kaartenselectie.
Herstelbare GitHub-back-up: backup/v4-2-before-v5-20261112. Geen opslag gereset. Bestaande avatar-ID’s blijven gelijk; emoji’s zijn nu uitsluitend interne oude IDs, geen definitieve portretten.

## Beelden en kosten
OpenArt-account gecontroleerd: Free,0credits, geen betaalbare generatiemodellen. Eerdere OpenArt-generatie QCKMh9hxS4oqEChztWI9 bestaat, maar CDN-download gaf403. Geen betaalde generatie gestart. Twee eerder goedgekeurde menuafbeeldingen teruggevonden als stijlreferentie; ze bevatten niet-functionele in-afbeeldingknoppen en zijn daarom niet als complete UI ingeplakt.
Acht nieuwe productiebeelden gemaakt met de beschikbare ingebouwde image_gen, zonder externe betaalde API/abonnement. Geoptimaliseerd naar WebP (beeldinhoud niet gewijzigd). Eindbestanden in assets/graphics, bronafmetingen/alpha/bytes in V5_ASSET_MANIFEST.json.

## Stap1/2 — gebouwd en lokaal getest
Nieuw werkelijk spelmenu met rasterracebeeld, HTMLKARTGO-titel, echte Spelen/Garage/Mijncoureur/Vrienden/Wereldkaart/Instellingen-knoppen en subtiele camera/lichtanimatie. Wereldkaart is een apart scherm; bestaandeback-upknoppen blijven beschikbaar.
Zes eigen3D-gerenderde portretten: Astronaut/Ninja/Vos/Panda/Kikker/Robot. Kaarten, grote selectievoorvertoning en menuprofiel gebruiken de echte atlas. Bestaande avatarIDs, naam, helm/teamkleur en saves blijven behouden. Rasterloader laadt menubeeld/portretten eerst; racebestanden kunnen apart worden geladen.
Tests: Node alle50banen en eerdere regels/migratie slagen. Echte browser: hoofdmenu visueel bekeken, Spelen→Vos→TurboVijf→opslaan→race1 werkt. Geen fysieke iPhone-test.

## Gegenereerde bestanden / integratie
- menu-v5.webp: daadwerkelijk als hoofdmenuachtergrond geladen.
- characters-v5.webp:12sprites(6portretten+6achteraanzichten); selectie/profiel/menu actief, race volgt.
- karts-v5.webp:6aanzichten, renderer gereed maar nog niet aangesloten op kart().
- scenery-v5.webp:12decorstukken; raceaansluiting volgt.
- landscapes-v5.webp:2panorama’s(groen/zand); raceaansluiting volgt.
- bosses-v5.webp:Hotdog-Hond/Pizzaman, beide voor/achteraanzicht; aansluiting volgt.
- effects-v5.webp:10item/effectsprites; aansluiting volgt.
- garage-v5.webp:garageachtergrond; aansluiting volgt.

## Promptbriefs
Alle beelden: premium glossy animated-feature3D-kwaliteit, originele KartGo-onderdelen, warme heldere belichting, geen UI/labels/watermerken. Hoofdmenu: dynamische rode kart/astronaut, vos/frog op achtergrond, groene heuvels/molens/barn, open blauwe lucht voor HTMLtitel. Karakteratlas3×4:6frontale borstportretten en6overeenkomende rugaanzichten. Kartatlas3×2:dezelfde lege rode sportkart in3rear/3frontaanzichten; echte rijdende kart wordt later composiet met gekozen coureur, geen extra voertuigtypes. Decoratlas4×3:oak/pine/blossom/barn,mill/fence/flowers/rocks,palm/cactus/arch/oasis. Panorama2rijen:groeneheuvels en zandduinen, geen vaste weg zodat bestaande bochten behouden blijven. Bossatlas2×2:hondinhotdog en pizzamanmettomatentong, geen nieuwe aanvallen. Effectatlas5×2:block,onweer,hypnose,boost,banaan/ijs,jump,glitter,splash,boem. Garage:lege belichte werkplaats met displayplatform voor de daadwerkelijk gekozen kart.

## Volgende concrete stap
Stap3/4: rasterkarts+gekozenrugaanzichtcoureur in kart() aansluiten, echte rasterpanorama/decor/itemeffecten tijdens race1 valideren; daarna uitrollen50levels, garage en bosses. Alleen geteste stappen naar main publiceren. Publicatiebewijs/commit hieronder aanvullen.

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

## Volgende stap
Geteste volledigeV5 naar main samenvoegen, GitHubPages-run controleren, alle9assetbytes op liveURL vergelijken, echte online race met nieuwe sprites/gekozen coureur spelen en screenshots vastleggen. Daarna laatstecommit/publicatiebewijs hieraan toevoegen.
