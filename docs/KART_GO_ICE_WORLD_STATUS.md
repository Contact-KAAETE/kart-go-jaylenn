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

## Nog vóór publicatie
Browsercontrole met echte rasterassets, mobiele formaten, touch, geluid/stoplicht, paleis/secret/king, finale en bestaande garage. Daarna pas samenvoegen naar main, Pages-build en echte HTTPS-link verifiëren. Deze ontwikkelfase is geen claim dat V6 al live is.

## Promptbrief productiebeelden
Winter: premium vrolijke glossy3D-achtergrond met sneeuwbergen, bevroren waterval, ver ijspaleis en aurora; geen weg/UI/karts zodat bestaande engine de echte route tekent. Iceprops:3×3 transparante atlas met sneeuwden/ijspaleis/holle ijsdeur, kristal/vloerspikes/dakpegels, wasmand/slatsunami/IJs Lucky Block. Burger:2kolommen met dezelfde originele vrolijke burgerkoning in burgerkart, kroon/kaascape/sla-snor, voor en achter, geen merknamen/logos. Bestanden geoptimaliseerd naar WebP met behoud van alpha; geen los conceptbeeld als game gepresenteerd.
