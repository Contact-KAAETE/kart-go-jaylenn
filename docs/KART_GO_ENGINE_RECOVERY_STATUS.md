# Kart Go V6.2 — vermogen, uitvliegen en water

Bedenker: Jaylenn. Martin heeft na spelen expliciet gevraagd om uit de bocht vliegen met stof en terugkeer na2s, waterplons3s en hogere snelheid met250/509/1000pk. Geen bestaande wereld/level/coureur/voortgang verwijderd.

## Herstelpunt
backup/v6-1-before-engine-recovery-20261112 →201e6f46936549b50b88a1997913e7584ab4d7a6. Ontwikkeltak work/engine-recovery-v6-2-20261112. Nieuwe compacte module assets/race-adventure.js bovenop de bestaande engine. Cache6.2.0.

## Gebouwd en getest
| Klasse | Speltopsnelheid zonder Boost | Interne afstand/s |
|---|---:|---:|
|250pk|140km/u|3100|
|509pk|185km/u|4100|
|1000pk|240km/u|5300|
Dit zijn arcade-keuzes, geen natuurkundige omrekening van pk naar km/u. Oude maximum was2650 interne afstand/s met120km/u-weergave; ook250pk is dus werkelijk sneller. Alle tegenstanders gebruiken dezelfde gekozen motorbasis; moeilijkheidspercentages blijven maximaal29. Meer snelheid geeft meer bochtrisico. Klassen in garage en instellingen; garagekeuze via Bewaar mijn kart. Opgeslagen/heropende race behoudt zijn eigen motor, ook als ondertussen een andere keuze voor de volgende nieuwe race is gemaakt. Stuurmethoden en zandregels blijven behouden; motorvermogen is geen Boost-item.

- Werkelijke baanrandcontrole: op snelheid meer dan een kwart baanbreedte buiten de rand gedurende een kort, vergevingsgezind moment geeft uitvliegen. Kart vliegt opzij, helt, krijgt bewegende stofdeeltjes en komt exact na2 actieve raceseconden terug in het midden op dezelfde baanpositie. Langzaam langs de droge berm rijden blijft mogelijk.
- Water ligt zichtbaar naast bruggen en bij de bestaande vijvers in de Groene Wereld. Rijden buiten de rand aan de waterkant geeft ook bij lage snelheid3s plons; kringen, spat-sprite, bewegende druppels en tijdelijk zinkende kart. Daarna veilig terug, zonder afstandsbonus.
- Water uit een wak in de IJs-Wereld is op Martins laatste instructie eveneens van2s naar3s gewijzigd. Hotdog-ijs blijft2s bevriezen; sla2s/wasmand3s blijven onveranderd. Jump/barst2s en wak-open3s blijven ongewijzigd.
- Twee seconden bescherming tegen direct opnieuw uitvliegen. Inventaris/naam/kleur/coureur/XP/levels blijven bewaard. Items tijdens redding worden niet opgebruikt. Geen racevoortgang tijdens redding; geen onbedoeld winnen in een plons.
- Pauze en schermrotatie stoppen timers; herstelstatus en motor worden in bestaande lokale checkpoint/export meegenomen. Gewone bots kunnen bij een bestaand foutje eveneens uitvliegen; bots rijden na redding weer verder en hun basissnelheid wordt niet op nul opgeslagen. Eindbazen krijgen geen verzonnen nieuwe aanvallen.
- Procedurale animatie en bestaand Splash-asset hergebruikt. Geen generatiecredits, abonnementen of betaalde diensten gebruikt.8/18 deeltjes afhankelijk van kwaliteitsstand; geen zware nieuwe renderer.

## Verificatie vóór publiceren
- node tests/game.test.cjs: alle70 oorspronkelijke/nieuwe circuits en regels slagen, plus15 volledige races over alle3 motoren en levels1/12/35/54/70. Echte snelheidsverschillen, sessiemotor, dust2s/water3s, langzaam in water, pauze/opslaan/heropenen, itembehoud en NPC-herstel getest. Rapport tests/results/engine-v6-2-node.txt.
- Echte Chrome-renderer in390×844,320×568 en844×390: motoren via echte garageknoppen gekozen/bewaard/heropend; echte baanrand/waterbotsing, geanimeerde verschuiving/zinken,2s/3s-terugkeer, pauze/checkpoint/heropenen, inventaris en3 besturingen zonder overlap. Visueel stof- en waterpassage gecontroleerd. Rapport tests/results/engine-v6-2-mobile.txt.
- Geen fysieke iPhone-test of gemeten60FPS-claim.

## Volgende concrete stap
Geteste ontwikkeltak naar main publiceren, Pages-build volgen en officiële game met nieuwe motor controleren. Nog geen claim van een voltooide livepublicatie in deze fase.
