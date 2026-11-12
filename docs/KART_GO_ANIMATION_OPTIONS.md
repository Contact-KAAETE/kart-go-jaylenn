# Animatieadvies voor Kart Go —12 november2026

Vraag Martin: een betaalbare route naar hoger animatieniveau. Dit onderzoek heeft geen aankoop of externe dienst geactiveerd. De hieronder genoemde grotere productiestap is nog niet gebouwd.

## Advies: Blender + korte vooraf gerenderde animaties
Blender is gratis/open source en heeft modellering, rigging, animatie en rendering. Bronnen: https://www.blender.org/about/ en https://github.com/blender/blender/blob/main/README.md . Voor Kart Go is mijn technische advies één consistent kartmodel met twaalf losse coureurkoppen te animeren en korte transparante sprite-reeksen te renderen: stuurhoeken, vering, banden, springen/landen en coureurreacties. De bestaande Canvas2,5D-game kan die lichte frames afspelen; een volledige3D-herbouw is hiervoor niet nodig. De beelden moeten daadwerkelijk worden gemaakt, geoptimaliseerd, getest en in de renderer aangesloten. Grootste werk is een goed model/rig/animatieset; software aanschaffen levert die productie niet vanzelf.

## Betaald alternatief: Spine voor2D-coureuranimatie
Officiële aankoop-pagina https://esotericsoftware.com/spine-purchase gecontroleerd12nov2026: Essential momenteelUS$69 (doorgestreeptUS$99), ProfessionalUS$379 (doorgestreeptUS$449), eenmalig voor een named-user-licentie met toekomstige updates. Essential bevat geen meshes/IK; voor geavanceerde vervorming is Professional nodig. Prijs is USD en kan wijzigen. Spine is nuttig voor losse karakterlagen en effecten; onze bestaande vlakke karakterafbeeldingen moeten daarvoor eerst in passende lagen worden opgebouwd/gerigd. Geen aankoop gedaan.

## Wat nu al gratis is ingebouwd
V6.2 laat de bestaande kart werkelijk naar buiten vliegen/kantelen, maakt bewegende stofdeeltjes en waterspatten/kringen, laat de kart zinken en veilig terugkeren. Dit is functionele animatie in de huidige game. Het is niet de bovengenoemde toekomstige Blender- of Spine-productie.
