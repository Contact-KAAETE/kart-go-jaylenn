# Kart Go — multiplayerbochten, schansen en sterke bots

13 november 2026. **Bedacht door Jaylenn.** Hervat vanaf `29bd10b916c7fadc74a2a350b1cc92045fd91cb3`.

## Veranderd

- Alle 75 gedeelde onlineparcoursen en de vijf lokale Party-races hebben nu terugkerende scherpe linker-/rechterbochten, S-bochten, verhoogde heuvels en brede schansen. De originele 70-levelsingleplayer heeft zijn bestaande engine behouden.
- De multiplayerrenderer integreert de kromming van de weg over de kijkafstand; hij gebruikte eerst slechts een klein verschil tussen twee bochtwaarden. Daardoor waren echte bochten nauwelijks zichtbaar. Bochtborden, verhoogd terrein, sprongschaduw en zichtbare projectielen gebruiken dezelfde wereldposities als de simulatie.
- De brede schans lanceert over de volle wegbreedte, geeft een korte snelheidskick en een grotere sprong. De aanloop en landingszone bevatten geen onvermijdelijke gewone hindernissen. Hoogteprofielen beïnvloeden ook de snelheid bergop en bergaf.
- Gewone online races vullen ongebruikte plaatsen tot zes racers met herkenbare BOT-coureurs; zes menselijke spelers houden alle zes plaatsen. De drie eindbaasraces behouden hun eigen enkele baas. Klaarzetten, organisatorrechten en het maximum van zes echte spelers blijven behouden.
- Bots rijden met de volledige simulatietijd; de oude Party-vertraging van 12% is verwijderd. Ze rijden 8–13% boven de overeenkomstige motorbasis, kiezen een rijlijn, sturen tegen bochtdrift in, vermijden hindernissen en remmen kort voor een zeer scherpe bocht. Het motorvermogen volgt de sterkste aanwezige speler.
- Bots krijgen een beperkte beginvoorraad en verzamelen daarna dezelfde blokken als spelers. Ze verbruiken hun voorraad, met een pauze tussen aanvallen. Onweer en hypnose zijn zichtbare projectielen, bananen blijven achter op de weg; waar de wereld ijs toestaat kan ook ijs worden verzameld/gebruikt. Projectielen hebben een eindige levensduur en echte botsingsgevolgen. Bots mogen ook elkaar raken.
- De drie eindbazen wisselen iedere tien seconden ijs, onweer en hypnose af. De eerste Hotdog-Hond-aanval blijft ijs na tien seconden.
- De online stand en uitslag bevatten de bots. Sprongduur en spronghoogte reizen mee in de serverstatus. Beide clients gebruiken dezelfde serverposities, wapens, sprongen en finishvolgorde; geen lokale schijntegenstanders.
- Lokale opslagkeys, namen, karts, coureurs, voortgang, QR-uitnodigingen en de bestaande Worker/hosting behouden. Geen nieuwe dienst of betaald asset.

## Verificatie vóór publicatie

- `npm test`: geslaagd, inclusief oorspronkelijke 70-levelsimulatie, echte Party-controller 71–75 tot finish, drie besturingsvormen, multitouch en power-ups tijdens gas/sturen, opslagbehoud en QR-generatie.
- `tests/worlds-simulation.mjs`: geslaagd, deterministische parcoursen, bestaande wereldregels en events.
- `tests/stunts-bots.mjs`: geslaagd, alle 75 parcoursen met brede schansen, hoogte en beide bochtrichtingen; aantallen bots bij 2–6 spelers; bots sneller dan vol gas bij alle drie motoren; werkelijk verbruik en treffen van drie projectielsoorten en bananen; eindbaasvariatie; zichtbare bochtprojectie op telefoonformaten.
- `tests/server-repair.mjs`: geslaagd, echte workerd/SQLite-runtime, organisatorrechten, zes spelers, herverbinden, identiteitsbehoud en volledige runtimeherstart.
- `tests/worlds-runtime.mjs`: twee onafhankelijke clients, IJs en volledige 5 km Party, gezamenlijke events/finish, configuratiewissel en Avontuurregels. Definitieve herhaling loopt bij dit checkpoint.
- `tests/stunts-live.mjs`: nieuwe tweespelertest, standaard tegen lokale workerd; productie alleen met `KARTGO_LIVE=1`. Controleert vier echte serverbots, gesynchroniseerde hoge sprongen en projectielen, meerdere wapens, snelheid boven de menselijke motorbasis, herverbinden en identieke uitslag voor zes racers. Loopt bij dit checkpoint.
- Echte Chrome-browser: daadwerkelijke Party-controller gestart; gebogen weg, bochtborden, brede schans, springende kippen en rijdende bots visueel beoordeeld. Telefoonformaten en productiecontrole worden hieronder aangevuld.

Geen fysieke iPhone-/Androidtest door ons; geen fysieke tweetelefoontest claimen.

## Publicatie

Nog niet gepubliceerd bij dit checkpoint. Backendversie `stunt-racing-4.0`, scriptcache `stunts-4-0`.
Nieuwe racekamer maken voor een volledig nieuw parcours en startveld; een al begonnen kamer behoudt deels zijn bestaande parcoursobjecten.
