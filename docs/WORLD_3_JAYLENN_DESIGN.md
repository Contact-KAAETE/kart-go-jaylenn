# Jaylenns Wereld 3 — Ijs-Wereld

Bron: nieuw spelplan aangeleverd 12 november 2026. Bedenker: Jaylenn.
Status V6: uitgevoerd als levels51–70; zie KART_GO_ICE_WORLD_STATUS.md voor implementatie, gekozen details en tests. Onderstaande oorspronkelijke vragen en aanvullingen blijven als ontwerphistorie bewaard. Martin heeft de nadere uitwerking en complete bouw goedgekeurd.

## Bevestigde ideeën
- Wereld 3: 20 levels, nummers 51–70. IJs, sneeuw, bevroren landschappen en glibberige ijsbanen.
- Startstem vóór groen en het “TUUSSSSSSSSS!”: diep/ijskoud “Ho ho ho!”. Wereld 1: ezel “IAAAA!”. Wereld 2: “Help, ik heb zand in m'n mond!”, met vertalingen per ondersteunde taal. Deze nieuwe stemmen zijn nog niet ingebouwd.
- Ijspaleizen met gigantische ijsdeur van 99 meter. Binnen wordt de baan per ministapje smaller, met muren op veilige afstand van 6 meter.
- Ijsschansen. Eén geheim level met negen IJs Lucky Blocks.
- Ijsspikes op grond en dak; na drie seconden groeien ze weer aan.
- Drie inventarisslots. Jump maakt een barst; na twee seconden breekt het ijs open. Booster trekt een breuklijn over het ijs.
- Level 70: één lang rondje tegen de Koning van de Burgers, met sla-tsunami en wasmand-penalty.
- Wereld 4 wordt Party-Wereld genoemd. Geen verdere levels/regels afgeleid uit de slotzin “Level 3 van Wereld 4”.

## Ontwerpkeuzes die Jaylenn nog moet invullen
1. Sla-tsunami: wanneer vuurt de koning, hoe ontwijk je deze, en wat gebeurt er bij een treffer?
2. Wasmand-penalty: wat gebeurt er precies met de kart/speler en hoelang duurt het?
3. Openbrekend ijs: valt de kart, vertraagt deze, of wordt hij veilig teruggezet? Hoelang blijft een breuklijn bestaan en wie wordt geraakt?
4. Geheim level: welk level is geheim en hoe wordt het ontgrendeld? Onderdeel van de twintig of een extra route?
5. Welke power-ups zijn beschikbaar en met welke kansen? Geen verdeling uit Wereld 1/2 automatisch overnemen.
6. Hoe worden spikes vernietigd of ingetrokken; wat is de trefferstraf?
7. Minimale baanbreedte in het paleis en betekenis van de veilige 6 meter aan weerszijden.

Startstemmen moeten geluid-uit respecteren en betrouwbaar op iPhone werken. Geen externe stemdienst/credits activeren. Talen pas als daadwerkelijk ondersteund rapporteren; geen belofte van automatisch “elke taal”.

De los aangeleverde bestaande-gameverbeteringen (bots, cameraruimte, rustige meldingen, podium en decorvariatie) worden afzonderlijk in V5.2 gebouwd, zonder op deze nieuwe ontwerpkeuzes te wachten.

## Uitgewerkte gevolgen — mandaat van Martin, 12 november 2026

Martin gaf expliciet toestemming om de sla-tsunami, wasmandstraf en gevolgen van brekend ijs zelf mooi uit te werken terwijl Jaylenn op school is. Onderstaande technische keuzes zijn door het programmeerhulpmiddel uitgewerkt binnen Jaylenns concept. Het zijn vastgelegde implementatieregels, nog geen gebouwde Wereld 3.

### Sla-tsunami
De Burgerkoning kondigt met een groene golf en een pijl twee seconden vooraf aan welke twee rijstroken worden geraakt. Eén rijstrook blijft altijd vrij en zichtbaar aangegeven. Iedere twaalf seconden kan een aanval plaatsvinden; er zit minimaal vier seconden tussen het raken/activeren van verschillende eindbaasgevaren. Een treffer geeft twee seconden sla aan de kart en beperkt de snelheid tot 60% van normaal. Sturen en zicht blijven bruikbaar; daarna verdwijnt de sla automatisch. Geen verloren items of reset.

### Wasmandstraf
De koning kan een wasmand op een aangekondigde rijstrook zetten. Een botsing laat de kart drie seconden in een komische rijdende wasmand rijden, op maximaal 50% snelheid. De speler blijft sturen, het zicht op de baan blijft vrij. Daarna springt de kart vanzelf uit de mand. Een mand verschijnt hoogstens iedere twintig seconden, nooit tegelijk met de sla-golf; zo nodig wordt de aanval uitgesteld. Twee seconden bescherming na afloop voorkomen een onvermijdelijke kettingstraf. Strafduur telt alleen tijdens actief racen, niet tijdens pauze of in een menu.

### Openbrekend ijs
Jump maakt op de plek van afzetten een duidelijk zichtbare barst. Precies twee seconden na gebruik opent het ijs daar; het wak blijft drie seconden open en vriest dan dicht. Dit maakt vooral de route voor achtervolgers gevaarlijk. Boost tekent dezelfde waarschuwende breuklijn in het spoor achter de kart; delen openen eveneens na twee seconden en vriezen na drie seconden weer dicht. Er blijft altijd een veilige lijn over de baan; nooit alle rijstroken tegelijk verwijderen.
Een kart die in een wak rijdt krijgt een grappige plons en wordt binnen twee seconden op het eerstvolgende veilige baanpunt gezet, met twee seconden bescherming tegen een nieuwe treffer. Plaatsing is buiten het wak, op dezelfde ronde, zonder levelreset, XP-verlies of gewiste voortgang. Jump kan over een bestaand wak heen. Geen extra rem/uitklimknop nodig.

### Gezamenlijke eerlijkheidsregels
- Dezelfde ijsgevaren gelden voor gewone bots en speler. Bossspecifieke aanvallen blijven bij level 70.
- Geen blijvende straf en geen strafstapeling die de speler langer dan drie seconden de controle afneemt; besturing blijft waar mogelijk actief.
- Visuele waarschuwingen en geluid-uit respecteren. Waarschuwing is nooit alleen een geluid.
- Alle timers en bescherming moeten bewaren/hervatten en schermrotatie aankunnen.
- Oorspronkelijk bevestigd: level 70 blijft één lang rondje tegen de Koning van de Burgers.
- Punten 1–3 uit de eerdere vragenlijst zijn hiermee als ontwerp ingevuld. Geheim level, itemverdeling, spike-details en paleisbreedte blijven afzonderlijk uit te werken; geen onzichtbare aanname in de huidige 50-levelgame.
