# Online vrienden en races — besluit en concrete vervolgstappen

Status: **niet online aangesloten en niet gerealiseerd**. De live racegame is singleplayer tegen bots. Het vriendenvenster heeft alleen een lokaal opgeslagen willekeurige code en echte lokaal gegenereerde QR. Een code is geen authenticatie en verleent geen toegang. Geen verzoeken, vriendenlijst, lobby, klaarstatus of netwerkposities worden gesimuleerd.

## Wat is onderzocht (11 november 2026)
De repository bevat alleen statische HTML/CSS/JS en GitHub Pages. Er is geen backendconfiguratie, geautoriseerde servertoegang, WebSocket-endpoint of bestaande online identiteit. Dat er elders een KA’AETÉ-website bestaat bewijst niet dat die server deze realtime toepassing ondersteunt. Andere projecten zijn niet aangepast.

| Optie | Gratis mogelijkheden | Beperkingen / besluit |
| --- | --- | --- |
| Cloudflare Workers Free + SQLite Durable Objects | Kleine geautoriseerde privégroep is technisch mogelijk; state per kamer en WebSockets. Free:100.000 DO-requests/dag,13.000 GB-s/dag. Limietoverschrijding faalt in plaats van betaald doorgaan. | Voorkeurskandidaat voor een volgende fase; eigenaar moet account en gegevensverwerking goedkeuren. Geen gegarandeerd gratis onbeperkt gebruik of SLA. Autoritatieve race-loop en room-lifetime moeten worden gemeten, niet verondersteld. |
| Supabase Free | Auth, database, Realtime;200 gelijktijdige verbindingen,100 berichten/s,2 miljoen berichten/maand. | Voor vriendenbeheer bruikbaar, directe6speler broadcasting op20Hz overschrijdt snel berichtlimieten. Server-aggregatie nodig; database-updates per frame vermijden. Gratis projecten kunnen na7dagen inactiviteit pauzeren. |
| Eigen bestaande server | Geen extra abonnement als geschikte hosting al betaald en toegestaan is. | WebSocket-support, runtime, resources, TLS, updates, isolatie en eigenaarstoegang zijn niet vastgesteld. Niet automatisch koppelen aan zakelijke systemen. |
| GitHub Pages alleen | Gratis gamebestanden en HTTPS. | Geen blijvende serverprocessen, geheime sleutels of betrouwbare realtime autoriteit. |
| WebRTC zonder eigen backend | Directe dataverbindingen na koppeling. | Signaling en vaak TURN-relay blijven nodig; host kan uitslag manipuleren. Geen passende betrouwbare €0-oplossing zonder verdere infrastructuur. |

Bronnen (officiële documentatie, geraadpleegd tijdens deze opdracht):
- https://developers.cloudflare.com/durable-objects/platform/pricing/
- https://developers.cloudflare.com/durable-objects/platform/limits/
- https://developers.cloudflare.com/durable-objects/best-practices/websockets/
- https://supabase.com/docs/guides/realtime/limits
- https://supabase.com/docs/guides/platform/manage-your-usage/realtime-messages
- https://supabase.com/docs/guides/deployment/going-into-prod

## Nodig vóór online aansluiten
De gebruiker eist vooraf toestemming voor een nieuwe externe dienst met persoonsgegevens. Ook bijnamen, willekeurige identiteiten, IP-adressen en vriendschappen kunnen aan een kind worden gekoppeld. Daarom geen dienst of account geactiveerd. Geen gegevens verstuurd naar deze opties. Alleen GitHub Pages blijft de bestaande hosting.

Een concrete volgende opdracht kan Cloudflare Free kiezen, met €0-budget en harde stop bij quotum. Eerst een testomgeving met uitsluitend volwassen/testidentiteiten, geen kindergegevens. Bespreek ouderlijke toestemming en gegevensbeheer vóór echte registratie; geen juridisch sluitende toestemming suggereren met alleen een rekensom of leeftijdsvakje.

## Identiteit en privacyontwerp
- Ouder activeert online deelname bewust. Offline racen blijft zonder account werken.
- Device genereert een eigen sleutelpaar; server registreert alleen publieke sleutel en willekeurige ID. Aanmelden via korte servernonce, getekend door device; tokens kortlevend en geroteerd. Geen geheim in GitHub of QR, geen code als wachtwoord. Beveiligde herstelflow/herstelcode uitsluitend voor ouder; voortgangexport is geen online inlogbewijs.
- Lokale voorlopige code bij registratie op uniciteit controleren; bij botsing nieuwe code tonen en bevestiging vragen. Scanbare payload bevat alleen versie en code. QR opent hoogstens een verzoekscherm, accepteert nooit automatisch een vriendschap.
- Verzoeken gebonden aan geauthenticeerde verzender/ontvanger; status pending→accepted alleen door ontvanger. Verwijderen/blokkeren wederzijds doorwerken; uitnodigingen alleen bij accepted.
- Geen globale namenlijst of vrije zoekmachine voor kinderen. Alleen exact gekozen alias binnen een ouder-goedgekeurde gesloten groep; antwoorden niet gebruiken om kinderen buiten die groep te enumereren.
- Strikte limieten op registratie, codezoekacties, verzoeken, sockets en payloads. Serverautorisatie per actie; Origin-allowlist is aanvullend en vervangt authenticatie niet.
- Profiel alleen alias/avatar/kartkleur; geen geboortedatum, echte naam, telefoon, locatie, chat, advertentie-ID of analytics. IP-logs minimaal en kort bewaren; bewaartermijn en providerregio vooraf vastleggen.
- Ouder kan profiel/vriendschappen exporteren, toestemming intrekken en servergegevens verwijderen; lokale racevoortgang blijft apart behouden. Inactieve uitnodigingen automatisch laten vervallen; kamergegevens na race wissen.

## Realtime raceontwerp (nog te bouwen)
1. Server maakt onvoorspelbare tijdelijke kamercode en een aparte, geheime join-capability met vervaltijd. Host inbegrepen in maximaal6; zevende atomaire join weigeren. Geen openbare kamerzoeklijst.
2. Authenticeer socket; server bewaart leden, avatar/kartkeuze, ready-status en eigenaar. Join/leave wist klaarstatus waar nodig; start alleen door host als minimaal2 en alle actuele leden klaar. Starttijd op serverklok met countdown en gemeten latency.
3. Server simuleert originele physics, collision, itemgewichten en wereldregels. Clients sturen begrensde inputs met volgnummer, geen zelfgekozen finishpositie. Monotone ticks, input-rate-limits en vaste max-snelheden. Gebruik een gedeelde deterministische physicsmodule uit bestaande engine; geen los afwijkend multiplayer-rijmodel.
4. Circa20Hz serverphysics en10Hz gebundelde roomsnapshots als beginpunt; client-interpolatie en voorspelling met correcties. Werkelijke bandbreedte/quotum en CPU meten met6 devices. Geen winnaar bepalen op ontvangsttijd van een clientbericht; serverdistance en tick bepalen finish.
5. Itempickup en gebruik door server gecontroleerd (afstand, slot, wereld, cooldown, effectduur). Idempotente action-ID’s voorkomen dubbele inzet na retry. Bevriezen/spin/hypnose eindigen op serverticks.
6. Ping, korte reconnect-grace en gesigneerde rejoin; bij verlies geen teleport naar finish. Afwezige deelnemer als losgekoppeld tonen. Na termijn expliciete DNF; geen automatische zege door vertraagde berichten. Hostwissel alleen in lobby, niet afhankelijk zijn van een kindertelefoon als autoriteit.
7. Foutmeldingen voor offline, quota en verlopen kamers; racevoortgang lokaal niet overschrijven door een netwerkfout.

## Verplichte tests vóór activering
Twee/drie/zes verschillende browsers/apparaten verbinden; zevende weigeren; verborgen rooms/auth afschermen; geweigerde/ingetrokken vriendschap; niet-leden en verlopen tokens/code; alle ready; gezamenlijke start; 100–500ms latency/jitter/verlies; duplicaten/replay; maxsnelheid/finishfraude; alle power-ups per wereld; reconnect/hostverlies; verwijdering/retentie; providerquota. Geen van deze online tests is in V4 uitgevoerd, omdat er geen online implementatie/backend draait.

Vervolgfase is expliciet open in issue #1. V4-singleplayer blijft hierdoor niet liggen.
