# Kart Go — multiplayer voor zes spelers (12 november 2026)

Doel: vrijdag 13 november kunnen Jaylenn en een vriendje vanaf afzonderlijke apparaten via internet samen racen; architectuur ondersteunt vanaf de eerste versie **1–6 menselijke spelers per privékamer**. Geen gefaseerde limiet van twee of vier spelers. Geen account of openbare chat.

## Functionele eisen
- Host maakt kamer met korte willekeurige code en deelbare link; maximaal zes deelnemers, ieder eigen bijnaam, karakter, kleur en kart. De host kan starten met twee tot zes deelnemers; lege plaatsen hoeven niet door bots gevuld te worden.
- Alle deelnemers zien dezelfde baan, aftelling, tegenstanders, posities, power-ups, finish en podium. Server bepaalt race-uitslag en valideert beweging en power-ups.
- Telefoons op verschillende netwerken werken (niet alleen lokaal wifi). Reconnect bij wegvallen, duidelijke foutmeldingen, geen onbeperkte wachttijd.
- iPhone/Android touchbediening blijft; bestaande solo-game, 70 levels, savegame, garage en voortgang onaangetast. Multiplayer in eigen modus, geen automatische publicatie naar hoofdversie.
- Minimaliseer persoonsgegevens; geen openbare chat, geen advertenties of tracking. Kamers verlopen automatisch. Gebruik een server met WebSockets, bijvoorbeeld Node.js + ws/Socket.IO, apart van GitHub Pages. Maak verbinding configureerbaar.
- Snelheid/latency: interpolatie en servervalidatie; test gelijktijdige verbindingen van zes clients, twee verschillende netwerken, start/finish en disconnect/reconnect.

## Levering
1. Controleer bestaande Canvas2D/2,5D code, implementeer aparte multiplayer-modus zonder solo-regressie.
2. Maak server en deployment voor WebSockets met publieke HTTPS/WSS endpoint, zonder betaalde upgrade zonder toestemming.
3. Publiceer eerst een aparte testlink; verifieer twee en zes gelijktijdige spelers vóór een claim dat het werkt.
4. Houd bestaande live solo-link intact tot akkoord.

Status: specificatie vastgelegd; multiplayer nog niet geïmplementeerd of getest.
