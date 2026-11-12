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
