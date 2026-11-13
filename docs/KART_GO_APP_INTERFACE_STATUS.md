# Kart Go — app-interface, 13 november 2026

KART GO — Bedacht door Jaylenn.

## Herstelpunt

Uitgangspunt main `536b8de0cc1da34774c3a123fc7c792a3621aadc`.
Herstelbranch `backup/pre-app-ui-536b8de-20261113`.
Ontwikkeltak `design/app-interface-20261113`.

## Gebouwd en geïntegreerd

- Gedeelde lokale presentatielaag `assets/app-interface.css`, geladen door het echte hoofdmenu, multiplayer en Party-Wereld. Geen externe fonts, trackers, nieuwe diensten of betaalde assets.
- Hoofdmenu: rustige donkerblauwe basis, meer ruimte voor de bestaande race-illustratie, compacte titel, gouden speelknop, verzorgde hervatknop en vier gelijke kaarten voor coureur, garage, samen racen en lokale vriendencode. Schaalbare interface-iconen en compacte navigatie.
- Party-vooruitblik teruggebracht tot één overzichtelijke kaart met de bestaande kippen. Geen lange introductietekst vóór de wereldkaart; openen van de kaart verbergt de teaser correct.
- Wereldkaart: grote beeldkaarten met aparte gras-/zanduitsnede van de bestaande atlas, ijs- en Party-afbeelding; rustige levelkaarten en herkenbare selectie.
- Garage, personagekeuze, instellingen en dialoogvensters: dezelfde ronde panelen, betere afstanden, grotere invoervelden, duidelijke selectie en sluitknop die zichtbaar blijft bij scrollen. Twintig lakken en twaalf coureurs blijven beschikbaar.
- Lobby: spelerskaarten, duidelijke klaarstatus, QR-kaart in dezelfde stijl, compact delen/kopiëren en gescheiden klaar-/startacties. Op een telefoon staat de QR vóór de optionele baaninstellingen; bij390×844 is de volledige QR vrij van de actiebalk. Kleine/lage schermen gebruiken normale scroll zodat de QR niet wordt afgedekt.
- Multiplayer-startmenu: vier echte wereldafbeeldingen, herkenbare stappen voor race en coureur, verzorgde profiel-/kleur-/motor-/besturingskeuze. Bestaande kamer- en uitnodigingslogica behouden.
- Party-beginscherm: dezelfde header en panelen, grotere coureur-op-kipvoorvertoning, kiesbare kipkaarten, vijf herkenbare levelkaarten en compacte uitklapbare coureur-/motor-/besturingsopties.
- Lokale vriendencode: oude, achterhaalde tekst ‘privéraces nog niet beschikbaar’ vervangen door een juiste uitleg en werkende link naar echte QR-racekamers. Geen online vriendenboek voorgespiegeld.
- Subtiele CSS-overgangen; verminderde beweging wordt gerespecteerd. Geen per-frame menu-JavaScript toegevoegd.

## Behouden

Geen wijzigingen aan de racephysics, besturinghandlers, multiplayerprotocol/Worker, backendbinding, opslagstructuur, spelregels of levelbestanden. De originele rasterbeelden, karts, coureurs en alle75 levels zijn behouden. De oude onderlinge-botsfysicabeperking van Party/online is niet gewijzigd.

## Vóór publicatie getest

- `npm test` geslaagd: alle oorspronkelijke70 levels via echte simulatie naar finish, garage/profiel/export/import/opslag, drie besturingen en eerdere reparaties; echte Party-controller71–75 naar finish; online DOM-handlers, onafhankelijke vingers, projectie en QR-generatie.
- Na de compacte Party-opties `node tests/party-riders.mjs` opnieuw geslaagd: alle vijf races, drie besturingen, gas/rem/autogas, pauze/herstart, vrij/avontuur en bestaande saves.
- Alle drie HTML-pagina's geparseerd: unieke IDs, gedeelde stylesheet aanwezig, bestaande selectors bereikbaar.
- Echte Chrome-browser in mobiele iframes: hoofdmenu op390×844 en320×568, online startmenu op430×932 en844×390, garage/coureur390 en320. Geen horizontale overloop in de gemeten schermen. Party- en lobbyweergave visueel beoordeeld; desktoplobby ook bekeken.
- Werkelijke naam/karakterkeuze en garagekleur gekozen/opgeslagen in de testbrowser. Browser-garagetest: alle20 kleuren met een eigen echte voorvertoning en racekart, geselecteerd vinkje en heropenen. Multitouch/gas/rem/cancel/pauze met synthetische touch geslaagd.
- Offline lobbyfixture uitsluitend gebruikt voor lay-outcontrole vóór publicatie. Deze fixture wordt niet gepubliceerd en is geen bewijs van online multiplayer. Na publicatie volgt de echte kamercontrole.
- Fysieke iPhone/Android niet beschikbaar voor onze test; geen hardwaretest claimen. Safari's browserbalk blijft bij openen als website onderdeel van Safari; deze opdracht wijzigt de game-interface.

## Publicatie

UI-codecommit `5435ea7632448ddd7180b77eadb34ed7b4d0f03a` gepubliceerd. GitHub Pages build/deploy/report én Cloudflare Workers Builds: success. CSS-/helpercache `app-7-1`.

Zes gewijzigde publieke HTML/CSS/JS-bestanden met HTTP200 opgehaald en byte-voor-byte vergeleken met de geteste versie. De zes gebruikte illustratie-/atlasbestanden ook HTTP200 gecontroleerd.

Echte gepubliceerde multiplayer met twee afzonderlijke browserclients gecontroleerd:

1. Organisator maakt een besloten kamer; Kopieer link levert een geldige uitnodiging.
2. Tweede browser opent die uitnodiging en kiest eigen naam, coureur en kleur.
3. Beide clients tonen dezelfde deelnemers, met de juiste kleuren.
4. Beide klaar; Start race wordt actief. Beide krijgen dezelfde IJs-Wereld/level51.
5. Beide karts daadwerkelijk bestuurd: ongeveer79m en54m gereden; gedeelde stand en serververbinding functioneren.
6. De werkelijke productie-QR uit de kamer met Sharp naar pixels omgezet en met jsQR exact teruggelezen naar de gekopieerde uitnodiging. Geen uitnodigingssleutels in de repository opgeslagen.

Een nieuwe volledige live finish-/reconnecttest was voor deze presentatiewijziging niet nodig: de multiplayer-/racecode is ongewijzigd en de bestaande complete racetests zijn geslaagd. Geen nieuwe volledige live race of fysieke telefoontest claimen.

Speellink: https://contact-kaaete.github.io/kart-go-jaylenn/
Samen racen: https://contact-kaaete.github.io/kart-go-jaylenn/multiplayer/
Party: https://contact-kaaete.github.io/kart-go-jaylenn/party/

Laatste kleine tekstcorrectie: de bestaande wereldkaartknop heet ‘Wereldkaart’, zodat de knop geen niet-gewijzigde avonturenmodus belooft nadat eerder Vrij racen is gekozen. De werkelijke spelmodus blijft via de bestaande modekeuze instelbaar.
