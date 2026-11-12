# Kart Go V6 — complete IJs-Wereld

Bedenker: Jaylenn. Gebouwd als uitbreiding van de bestaande game, niet als herbouw. Ontwikkeltak `work/world3-ice-v6-20261112`; herstelpunt `backup/v5-2-1-before-ice-world-20261112` → `c6e9d3e35003c04e55c76520d9d25980fb762c83`.

## Fase 1 — spelregels en productieassets gebouwd
- Levels 51–70 toegevoegd, bestaande vijftig levels behouden. Ieder nieuw circuit heeft eigen bochten/hoogtes, moeilijkheid van 16 tot maximaal 29%.
- Drie nieuwe echte rasterassets in assets/graphics: winter-v6.webp, iceprops-v6.webp (9 transparante sprites), burger-v6.webp (voor-/achteraanzicht). Gebouwd met ingebouwde image_gen, zonder externe betaalde dienst. Afmetingen/bytes/gitsha in V6_ASSET_MANIFEST.json; promptbrief hieronder.
- Nieuwe lokale diepe Ho-ho-ho-voice in assets/audio/ho-ho-ho-v6.wav. Gegenereerd met Flite in ffmpeg, lager gestemd en lichte echo. Geen stemdienst/API/account. Web Audio wordt via gebruikersaanraking ontgrendeld; geluid-uit gerespecteerd. Rood/oranje/groen startlicht, ondertitel en TUUS-starttoon. Zandzin via browserstemmen voor NL/EN/DE/FR/ES/IT/PT, andere taal valt terug op NL; stemondersteuning kan per browser verschillen. Geen belofte van een stem in iedere taal.
- Glijden met traagheid; remmen herstelt grip. Echte ijsschansen. Paleis vanaf 53, nog één paleis in de lange finale.
- Paleis-model: oorspronkelijke weg is 12 m breed. Wandlijnen blijven op 12 m links/rechts van de middellijn, dus minimaal 6 m van de baanrand. Weg wordt per drie segmenten .02 smaller, tot 72% (8,64 m); muren komen niet mee naar binnen. Poort is verticaal geprojecteerd op 99 m (300 modelunits per meter).
- Geheim level 63: onthulling na winst in 62, onderdeel van de twintig (geen extra level), exact negen eenmalige IJs Lucky Blocks per race.
- Gekozen wereld-3-kansen: IJs35%, Hypnose20%, Jump20%, Boost10%, Banaan10%, Onweer5%. Alle drie inventarisslots behouden. Originele kansen voor wereld 1 en zandregels voor wereld 2 ongewijzigd.
- Spikes op vloer/dak; vloerspikes ontwijken/springen, bij dakpegels op de grond blijven. Een treffer vertraagt kort; spike groeit na3s terug.
- Jump en Boost maken barsten achter de kart; na2s open, na3s weer dicht. Sommige banen hebben ook aangekondigde barsten vooruit. Een plons geeft2s redding op een veilig baanpunt plus2s bescherming; items/XP/ronde/voortgang blijven behouden. Bots ondervinden dezelfde ijsgevaren.
- Level70: Koning van de Burgers, 104.000 modelunits in één lange ronde (andere races: twee rondes van52.000). Originele Hotdog-Hond en Pizzaman behouden hun regels.
- Sla-golf:2s vooraf een veilige strook tonen; treffer2s maximaal60% snelheid. Wasmand:2s aankondiging,3s maximaal50% snelheid, sturen blijft werken. Minimaal4s tussen gevaaracties; bescherming voorkomt strafstapeling. Geen onvermijdelijke reset.
- Bestaande opslagsleutel en saveversie behouden; parser accepteert nu1–70. Vóór V6 extra lokale back-up. IJstimers, barsten en aanvallen bewaren/hervatten. Bestandsimport/-export blijft werken.

## Uitgevoerde verificatie
`node tests/game.test.cjs` slaagt: eerste50 regressies, daarna20 unieke ijsroutes met begrensde stuurcontroller,20/20 gewonnen en20/20 voltooid. Los getest: glijtraagheid/remmen, Jump/Boost-barsten2s/3s, redding2s/bescherming/paus­­e/heropenen, spike-teruggroei3s, veilige bossstrook, sla2s en wasmand3s, werkelijk lange ene ronde, level70 opslaan. Geen fysieke iPhone-test.

## Fase 2 — echte browsercontrole geslaagd (12 november 2026)
- Chrome met echte game in mobiele iframes390×844,320×568 en844×390. Iedere keer20 levels gestart met echte renderer/geladen beelden; paleisversmalling, geheime blokken, Jump/Boost-barsten, redding/pauze/opslaan/heropenen, beide bossstraffen en lange ronde bevestigd.
- Alle drie besturingen zonder overlap/buitenbeeld; synthetische tweevinger-PointerEvents: sturen+gas, sturen+rem, pointerownership, loslaten/cancel/pauze; stuurwiel/joystick opnieuw bruikbaar na reset. Dit is touchsimulatie, geen fysiek toestel.
- Visuele inspectie sneeuwrace51, reusachtige paleispoort54, Burgerkoning70 met veilige-strookmelding en podium/finish70. Dubbele gevarenmeldingen voorkomen: ijswaarschuwing heeft voorrang, gewone achterwaarschuwing keert vanzelf terug wanneer ijswaarschuwing verdwijnt.
- Alle vijf lakknoppen/garagevoorbeelden/racekarts en opslag/heropenen opnieuw getest zonder Canvas.filter; geslaagd.
- Geluid met echte gebruikersklik aangezet: lokale WAV gedecodeerd1,709s, AudioContext running en bron gestart tijdens ijsstart. Stilte-instelling blijft bewaard; start wordt gestopt bij pauze. Geen fysieke luistertest of Safari-hardwaretest.
-12 geladen atlassen geven75.483.464 bytes geraamde gedecodeerde pixels (exclusief caches). Winter en Burgerkoning laden pas bij relevante race; geen claim van gemeten telefoon-RAM of60FPS.
- Alle Node-regressies opnieuw geslaagd na laatste HUD-aanpassing. QA-rapport: tests/results/ice-world-mobile.txt.
- Fase1 op ontwikkeltak veilig opgeslagen als07760d524c990e67518f50e4059741c300c3a580 (spelregels+productiebeelden+audio).

## Fase 3 — eerste livepublicatie gecontroleerd
- Geteste gamecommit caccc9977584deb1a2f38869ce97252820ff3708 naar main gebracht. Pages-run43183106301 geslaagd.
- Officiële HTTPS-versie toont V6.0/70 levels/3 werelden. In echte gepubliceerde game via normale importknop een fictieve QA-back-up met50 overwinningen ingelezen: alleen51 open,52–70 dicht, geheim63 correct verborgen. Dit is uitsluitend geïsoleerde browser-QA, geen voortgang op Martins iPhone aangepast.
- Live390×844: race51 gestart, lokale assets geladen, bots rijden mee, Lucky Block leverde Hypnose, item gebruikt, sturen en pauze getest, na heropenen naam IJsTester en hervatknop aanwezig. Startlicht/Ho-ho-ho-ondertitel en online race actief. Naar844×390 draaien pauzeert veilig.
- Met tweede fictieve back-up69 overwinningen live70 gestart: Burgerkoning zichtbaar, HUD1/1, IJs-item verzameld, ijspaleis bereikt. Geen testdriver actief in deze livegame.
-13 hoofdgame-/asset-URLs HTTP200 en bytegelijk aan geteste checkout, inclusief alle drie nieuwe WebPs en WAV. Volledig rapport volgt onder tests/results/ice-world-live-assets.json.
- Laatste afwerking V6.0.1: panorama behoudt beeldverhouding op brede schermen (visueel gecontroleerd); bots behouden hun basissnelheid na redding uit een wak en rijden na opslaan/heropenen weer echt verder. Nieuwe regressietest daarvoor slaagt; volledige70-levelset opnieuw geslaagd.
- Cacheversies6.0.1 om eerdere iPhone-scriptcache te vervangen. Definitieve publicatiecontrole van deze kleine afwerking volgt hierna.

## Grenzen en vervolg
Geen fysieke iPhone/Safari- of Android-hardwaretest; mobiele Chrome-frames en synthetische multitouch zijn gecontroleerd. Geen gemeten60FPS-belofte. Wereld4, online vrienden en multiplayer zijn geen onderdeel van deze uitbreiding en blijven open zoals voorheen. Geen betaalde dienst geactiveerd. Volgende concrete stap: V6.0.1 publiceren en alleen de laatste bestanden/livegame opnieuw verifiëren.

## Promptbrief productiebeelden
Winter: premium vrolijke glossy3D-achtergrond met sneeuwbergen, bevroren waterval, ver ijspaleis en aurora; geen weg/UI/karts zodat bestaande engine de echte route tekent. Iceprops:3×3 transparante atlas met sneeuwden/ijspaleis/holle ijsdeur, kristal/vloerspikes/dakpegels, wasmand/slatsunami/IJs Lucky Block. Burger:2kolommen met dezelfde originele vrolijke burgerkoning in burgerkart, kroon/kaascape/sla-snor, voor en achter, geen merknamen/logos. Bestanden geoptimaliseerd naar WebP met behoud van alpha; geen los conceptbeeld als game gepresenteerd.
