// Fertige Karteien: Französische Revolution (Geschichte, inkl. Hefteinträge) und Sozialstaat (PoWi).
// Werden einmal angelegt. Gelöschte Karteien kommen nicht zurück.

const PRESET_FOLDERS = [
  { id: 'preset-frzrev', name: 'Französische Revolution', color: '#b7791f', subject: 'geschichte' },
  { id: 'preset-heft', name: 'Frz. Revolution – Unterricht (Heft)', color: '#2b7aaf', subject: 'geschichte' },
  { id: 'preset-sozialstaat', name: 'Sozialstaat', color: '#c43d65', subject: 'powi' },
  { id: 'preset-hindu', name: 'Hinduismus', color: '#8a6d3b', subject: 'religion' }
];

const PRESET_DECKS = [
 {"id":"preset-frzrev-d","name":"Frz. Revolution – Jahreszahlen","cards":[
  {"id":"preset-frzrev-c0","term":"5. Mai 1789","translation":"Eröffnung der Generalstände in Versailles\n(erstmals seit 175 Jahren)"},
  {"id":"preset-frzrev-c1","term":"17. Juni 1789","translation":"Der 3. Stand erklärt sich zur Nationalversammlung"},
  {"id":"preset-frzrev-c2","term":"20. Juni 1789","translation":"Ballhausschwur: nicht trennen, bis eine Verfassung steht"},
  {"id":"preset-frzrev-c3","term":"14. Juli 1789","translation":"Sturm auf die Bastille\n(heute Nationalfeiertag)"},
  {"id":"preset-frzrev-c4","term":"17. Juli 1789","translation":"Der König stimmt der Verfassungsberatung zu"},
  {"id":"preset-frzrev-c5","term":"4./5. August 1789","translation":"Abschaffung der Vorrechte des Adels / des Feudalsystems\n(„Opfernacht des Adels“)"},
  {"id":"preset-frzrev-c6","term":"26. August 1789","translation":"Erklärung der Menschen- und Bürgerrechte"},
  {"id":"preset-frzrev-c7","term":"5./6. Oktober 1789","translation":"Marktfrauen ziehen nach Versailles und zwingen den König nach Paris"},
  {"id":"preset-frzrev-c8","term":"2. November 1789","translation":"Kirche verliert ihre Vorrechte,\nKirchengüter werden verstaatlicht"},
  {"id":"preset-frzrev-c9","term":"Juni 1791","translation":"Flucht nach Varennes: Ludwig XVI. flieht verkleidet, wird erkannt und gestoppt"},
  {"id":"preset-frzrev-c10","term":"3. September 1791","translation":"Erste Verfassung:\nFrankreich wird konstitutionelle Monarchie"},
  {"id":"preset-frzrev-c11","term":"September 1791","translation":"Olympe de Gouges: „Erklärung der Rechte der Frau und Bürgerin“"},
  {"id":"preset-frzrev-c12","term":"April 1792","translation":"Kriegserklärung an Österreich (mit Preußen verbündet)"},
  {"id":"preset-frzrev-c13","term":"10. August 1792","translation":"Sturm auf die Tuilerien:\nKönig abgesetzt und gefangen"},
  {"id":"preset-frzrev-c14","term":"21. September 1792","translation":"Ausrufung der Republik"},
  {"id":"preset-frzrev-c15","term":"21. Januar 1793","translation":"Hinrichtung Ludwigs XVI. (Guillotine)\n→ europäische Koalition gegen Frankreich"},
  {"id":"preset-frzrev-c16","term":"1793 – 1794","translation":"Schreckensherrschaft (Terreur) der Jakobiner"},
  {"id":"preset-frzrev-c17","term":"28. Juli 1794","translation":"Hinrichtung Robespierres (9. Thermidor)"},
  {"id":"preset-frzrev-c18","term":"1795 – 1799","translation":"Direktorium: Herrschaft des Großbürgertums"},
  {"id":"preset-frzrev-c19","term":"9. November 1799","translation":"Staatsstreich Napoleons (18. Brumaire)\n→ Ende der Revolution"},
  {"id":"preset-frzrev-c20","term":"Die 3 Phasen der Revolution?","translation":"1789–1792 moderat (konst. Monarchie)\n1792–1794 radikal (Republik, Terror)\n1794–1799 bürgerlich (Direktorium)"}
 ]},
 {"id":"preset-frzrev-u","name":"Frz. Revolution – Ursachen","cards":[
  {"id":"preset-frzrev-c21","term":"Wirtschaftliche Gründe?","translation":"Missernten · hohe Abgaben an Grundherren · Staatsschulden → hohe Steuerlast · Importe & Bevölkerungsanstieg → Arbeitsplätze fallen weg → Verarmung"},
  {"id":"preset-frzrev-c22","term":"Politische Gründe?","translation":"König kaum durchsetzungsfähig (von Verwaltung abhängig) · Staatsschulden → fast Staatsbankrott · Ämterkauf → unfähige Beamte · Steuerbefreiung für Klerus & Adel"},
  {"id":"preset-frzrev-c23","term":"Kulturelle Gründe?","translation":"Aufklärung: Bürgertum hinterfragt Absolutismus und Gottesgnadentum und denkt über neue Gesellschaftsformen nach"},
  {"id":"preset-frzrev-c24","term":"Soziale Gründe?","translation":"Ständegesellschaft: 98 % (3. Stand) tragen die Lasten, 2 % (Klerus & Adel) haben die Privilegien"},
  {"id":"preset-frzrev-c25","term":"Wofür gab der absolutistische König so viel Geld aus?","translation":"Hofhaltung · Staatsverwaltung · stehendes Heer\n→ Schulden → Erhöhung der Steuern"},
  {"id":"preset-frzrev-c26","term":"Missernten führen zu …?","translation":"Missernten (Land) → steigende Brotpreise (Städte) → Hunger bei den armen Schichten → zunächst Aufstände auf dem Land"},
  {"id":"preset-frzrev-c27","term":"Wie wird aus Aufständen eine Revolution?","translation":"Hunger allein reicht nicht: Das Bürgertum mit den Ideen der Aufklärung gibt Ziele und Führung, die Generalstände bieten die Bühne"},
  {"id":"preset-frzrev-c28","term":"Warum war der Staat pleite?","translation":"Teure Hofhaltung in Versailles + Unterstützung des US-Unabhängigkeitskriegs; fast die Hälfte der Ausgaben ging für Zinsen drauf"},
  {"id":"preset-frzrev-c29","term":"Bevölkerungswachstum vor 1789?","translation":"Von 20 auf 25 Millionen → mehr Brotbedarf"},
  {"id":"preset-frzrev-c30","term":"Missernten wann?","translation":"1788/89: Unwetter → Nahrungsmangel und explodierende Brotpreise"}
 ]},
 {"id":"preset-frzrev-s","name":"Frz. Revolution – Stände & Schichten","cards":[
  {"id":"preset-frzrev-c31","term":"1. Stand","translation":"Klerus (Geistliche), ca. 0,5 % (130.000–140.000)\nsteuerfrei, kassiert den Zehnten, 10 % des Bodens"},
  {"id":"preset-frzrev-c32","term":"2. Stand","translation":"Adel, ca. 1,5 % (370.000–425.000)\nsteuerfrei, reich, Spitzenämter, vom König abhängig"},
  {"id":"preset-frzrev-c33","term":"3. Stand","translation":"ca. 98 %: Bürger & Bauern (vom Großbürger bis zum Bettler)\ntragen alle Steuern, keine Mitsprache, ca. 12 Mio. verarmt"},
  {"id":"preset-frzrev-c34","term":"Oberschicht","translation":"Stadt: Adel, reiche Kaufleute\nLand: Adel"},
  {"id":"preset-frzrev-c35","term":"Mittelschicht","translation":"Stadt: kleines & mittleres Bürgertum (Händler, Handwerker, Beamte, Gelehrte)\nLand: Klein- & mittlere Bauern, Handwerker"},
  {"id":"preset-frzrev-c36","term":"Unterschicht","translation":"Bettler, Tagelöhner, Ungelehrte, Hilfsarbeiter"},
  {"id":"preset-frzrev-c37","term":"„Was ist der Dritte Stand?“","translation":"„Alles. Was war er bisher? Nichts. Was verlangt er? Etwas zu sein.“\n– Abbé Sieyès, Januar 1789"},
  {"id":"preset-frzrev-c38","term":"Der Zehnte","translation":"Abgabe (ein Zehntel der Ernte) an die Kirche"},
  {"id":"preset-frzrev-c39","term":"Karikatur: Bauer trägt Geistlichen und Adligen","translation":"Symbol für die ungleiche Lastenverteilung der Ständegesellschaft"}
 ]},
 {"id":"preset-frzrev-a","name":"Frz. Revolution – Aufklärung","cards":[
  {"id":"preset-frzrev-c40","term":"Montesquieu","translation":"Gewaltenteilung"},
  {"id":"preset-frzrev-c41","term":"Rousseau","translation":"Volkssouveränität (Gesellschaftsvertrag): Die Macht geht vom Volk aus"},
  {"id":"preset-frzrev-c42","term":"Voltaire","translation":"Toleranz und Religionsfreiheit, Kritik an der Kirche"},
  {"id":"preset-frzrev-c43","term":"Gottesgnadentum","translation":"Der König herrscht durch Gottes Willen – von den Aufklärern abgelehnt"},
  {"id":"preset-frzrev-c44","term":"Absolutismus","translation":"Der König hat alle Macht allein, ohne Parlament"},
  {"id":"preset-frzrev-c45","term":"Kernideen der Aufklärung","translation":"Vernunft als Maßstab, Gleichheit vor dem Gesetz, Gewaltenteilung, Religionsfreiheit"}
 ]},
 {"id":"preset-frzrev-b","name":"Frz. Revolution – 1789 Begriffe","cards":[
  {"id":"preset-frzrev-c46","term":"Generalstände","translation":"Versammlung der drei Stände; Abgeordnete: 300 (Klerus) / 300 (Adel) / 600 (3. Stand)"},
  {"id":"preset-frzrev-c47","term":"Abstimmung nach Ständen oder nach Köpfen?","translation":"Nach Ständen: 1 Stand = 1 Stimme → Adel + Klerus gewinnen 2 : 1\nNach Köpfen: 600 : 600 → 3. Stand + niederer Klerus haben die Mehrheit"},
  {"id":"preset-frzrev-c48","term":"Nationalversammlung","translation":"Der 3. Stand erklärt sich zur Vertretung des ganzen Volkes (17. Juni 1789)"},
  {"id":"preset-frzrev-c49","term":"Ballhausschwur","translation":"„sich niemals zu trennen, bis eine Verfassung ausgearbeitet ist“ – erster revolutionärer Akt"},
  {"id":"preset-frzrev-c50","term":"Bastille","translation":"Staatsgefängnis in Paris, Symbol der königlichen Willkürherrschaft"},
  {"id":"preset-frzrev-c51","term":"Grande Peur („Große Furcht“)","translation":"Bauern stürmen Schlösser und verbrennen die Urkunden über Feudalabgaben"},
  {"id":"preset-frzrev-c52","term":"Feudalsystem","translation":"Bauern sind von Grundherren abhängig: Abgaben, Frondienste, Leibeigenschaft"},
  {"id":"preset-frzrev-c53","term":"Liberté, Égalité, Fraternité","translation":"Freiheit, Gleichheit, Brüderlichkeit"},
  {"id":"preset-frzrev-c54","term":"Zug der Frauen nach Versailles","translation":"Okt. 1789: Marktfrauen marschieren wegen Brotmangel nach Versailles und zwingen den König nach Paris"}
 ]},
 {"id":"preset-frzrev-m","name":"Frz. Revolution – Menschenrechte","cards":[
  {"id":"preset-frzrev-c55","term":"Art. 1","translation":"Die Menschen werden frei und gleich an Rechten geboren und bleiben es."},
  {"id":"preset-frzrev-c56","term":"Art. 2","translation":"Ziel jedes Staates: natürliche Rechte erhalten – Freiheit, Eigentum, Sicherheit, Widerstand gegen Unterdrückung"},
  {"id":"preset-frzrev-c57","term":"Art. 3","translation":"Der Ursprung jeder Souveränität liegt in der Nation → Volkssouveränität"},
  {"id":"preset-frzrev-c58","term":"Art. 4","translation":"Freiheit = alles tun können, was einem anderen nicht schadet"},
  {"id":"preset-frzrev-c59","term":"Art. 6","translation":"Das Gesetz ist Ausdruck des allgemeinen Willens, für alle gleich; Ämter nach Fähigkeit"},
  {"id":"preset-frzrev-c60","term":"Art. 9","translation":"Jeder gilt als unschuldig, bis er verurteilt ist (Unschuldsvermutung)"},
  {"id":"preset-frzrev-c61","term":"Art. 10","translation":"Niemand darf wegen seiner Meinung oder Religion verfolgt werden"},
  {"id":"preset-frzrev-c62","term":"Art. 11","translation":"Frei reden, schreiben, drucken → Meinungs- und Pressefreiheit"},
  {"id":"preset-frzrev-c63","term":"Art. 17","translation":"Eigentum ist unverletzlich und heilig (Enteignung nur mit Entschädigung)"},
  {"id":"preset-frzrev-c64","term":"Gemälde von 1790 (M4): Was zeigt es?","translation":"Rechte wie Gesetzestafeln in Stein · links Frau (Frankreich) mit zerbrochenen Ketten · rechts Engel/Vernunft zeigt auf die Rechte · oben Auge der Vorsehung"},
  {"id":"preset-frzrev-c65","term":"Vorbilder der Menschenrechte","translation":"Aufklärung und US-Unabhängigkeitserklärung (1776)"},
  {"id":"preset-frzrev-c66","term":"Olympe de Gouges","translation":"Schrieb 1791 die „Erklärung der Rechte der Frau und Bürgerin“; 1793 selbst hingerichtet"},
  {"id":"preset-frzrev-c67","term":"„Die Frau hat das Recht, das Schafott zu besteigen …“","translation":"„… sie muss gleichermaßen das Recht haben, die Rednerbühne zu besteigen.“ – Olympe de Gouges"}
 ]},
 {"id":"preset-frzrev-v","name":"Frz. Revolution – Verfassung 1791","cards":[
  {"id":"preset-frzrev-c68","term":"Legislative","translation":"gesetzgebende Gewalt\n1791: Nationalversammlung (745 Abgeordnete, für 2 Jahre gewählt)"},
  {"id":"preset-frzrev-c69","term":"Exekutive","translation":"ausführende Gewalt\n1791: König + Minister · heute: Kanzler + Minister"},
  {"id":"preset-frzrev-c70","term":"Judikative","translation":"richterliche Gewalt\nKassationshof, Hochgericht, Richter & Geschworene, Friedensrichter"},
  {"id":"preset-frzrev-c71","term":"Rechte des Königs 1791","translation":"nicht gewählt · aufschiebendes Veto gegen Gesetze · ernennt und entlässt Minister · Oberbefehl über das Militär"},
  {"id":"preset-frzrev-c72","term":"Konstitutionelle Monarchie","translation":"Es gibt noch einen König, aber er ist an die Verfassung gebunden"},
  {"id":"preset-frzrev-c73","term":"Was ist eine Verfassung?","translation":"Gesetz über den Staatsaufbau (bei uns: Grundgesetz); enthält z. B. Menschenrechte und regelt die Gewaltenteilung"},
  {"id":"preset-frzrev-c74","term":"Heute: Wer macht, wer setzt um, wer kontrolliert Gesetze?","translation":"Parlament (Bundestag + Bundesrat) beschließt\nRegierung setzt um (Verwaltung, Polizei, Militär, Verordnungen)\nGerichte kontrollieren"},
  {"id":"preset-frzrev-c75","term":"Zwei Arten von Recht in Deutschland","translation":"Bundesrecht und Landesrecht"},
  {"id":"preset-frzrev-c76","term":"Wen wählen die Aktivbürger?","translation":"45.000 Wahlmänner, Friedensrichter, Gemeindeverwaltungen"},
  {"id":"preset-frzrev-c77","term":"Wen wählen die Wahlmänner?","translation":"Nationalversammlung (745), Richter & Geschworene, Departementsverwaltungen, Bischöfe & Priester"},
  {"id":"preset-frzrev-c78","term":"Was darf die Nationalversammlung 1791?","translation":"Gesetze machen, Aufsicht über das Militär, Antrag an das Hochgericht"},
  {"id":"preset-frzrev-c79","term":"War die Verfassung von 1791 demokratisch?","translation":"Teilweise: + Gewaltenteilung, König gebunden\n– Zensuswahlrecht, Frauen ausgeschlossen, Veto des Königs\n→ Fortschritt, aber keine echte Demokratie"}
 ]},
 {"id":"preset-frzrev-w","name":"Frz. Revolution – Wahlrecht","cards":[
  {"id":"preset-frzrev-c80","term":"Aktivbürger","translation":"Männer über 25 mit Mindeststeuer (Wert von 3 Arbeitstagen), ca. 4 Mio. – nur sie dürfen wählen"},
  {"id":"preset-frzrev-c81","term":"Passivbürger","translation":"ca. 3 Mio. ärmere Männer ohne genug Steuerleistung – kein Wahlrecht"},
  {"id":"preset-frzrev-c82","term":"Zensuswahlrecht","translation":"Wahlrecht hängt von der Steuerleistung / vom Besitz ab"},
  {"id":"preset-frzrev-c83","term":"Indirekte Wahl","translation":"Bürger wählen Wahlmänner, und erst die wählen die Abgeordneten"},
  {"id":"preset-frzrev-c84","term":"Wie viele durften 1791 wählen?","translation":"ca. 4 von 25 Mio. ≈ jeder Sechste\nüber ⅔ der Bevölkerung ausgeschlossen"},
  {"id":"preset-frzrev-c85","term":"Wer war 1791 ausgeschlossen?","translation":"Passivbürger, alle Frauen, Männer unter 25"},
  {"id":"preset-frzrev-c86","term":"Wahlrecht bei den Generalständen 1789","translation":"Abstimmung nach Ständen 1 : 1 : 1 – keine echte Volkswahl"},
  {"id":"preset-frzrev-c87","term":"1792","translation":"Erstmals allgemeines Männerwahlrecht (Wahl des Nationalkonvents), unabhängig vom Einkommen"},
  {"id":"preset-frzrev-c88","term":"Verfassung von 1793","translation":"Direkte Demokratie + Sozialrechte – trat wegen Krieg und Terror nie in Kraft"},
  {"id":"preset-frzrev-c89","term":"Wahlrecht im Direktorium (ab 1795)","translation":"Wieder eingeschränktes Zensuswahlrecht"},
  {"id":"preset-frzrev-c90","term":"Frauenwahlrecht in der Revolution?","translation":"Gab es nie – Frauen waren im gesamten Zeitraum ausgeschlossen"},
  {"id":"preset-frzrev-c91","term":"Ziel des Zensuswahlrechts","translation":"Macht des wohlhabenden Bürgertums gegenüber den Unterschichten sichern"}
 ]},
 {"id":"preset-frzrev-t","name":"Frz. Revolution – Terror & Personen","cards":[
  {"id":"preset-frzrev-c92","term":"Ludwig XVI.","translation":"König; Flucht nach Varennes 1791; 1792 abgesetzt; 21. 1. 1793 hingerichtet"},
  {"id":"preset-frzrev-c93","term":"Maximilien de Robespierre","translation":"Jakobiner-Führer, „der Unbestechliche“; Terror als Mittel der Tugend; 28. 7. 1794 hingerichtet"},
  {"id":"preset-frzrev-c94","term":"Georges Danton","translation":"Großer Redner, forderte Mäßigung → 1794 geköpft"},
  {"id":"preset-frzrev-c95","term":"Jean-Paul Marat","translation":"Radikales Volksblatt („Ami du peuple“), rief zur Gewalt auf; 1793 in der Badewanne ermordet (Charlotte Corday)"},
  {"id":"preset-frzrev-c96","term":"Jakobiner","translation":"Radikale Revolutionäre um Robespierre"},
  {"id":"preset-frzrev-c97","term":"Wohlfahrtsausschuss","translation":"Diktatorische Notstandsregierung unter Robespierre; hob die Verfassung auf"},
  {"id":"preset-frzrev-c98","term":"Gesetz über die Verdächtigen","translation":"Verhaftung und Hinrichtung ohne Beweise als „Feind der Freiheit“"},
  {"id":"preset-frzrev-c99","term":"Sansculotten","translation":"Pariser Arbeiter und Handwerker (lange Hosen statt Kniebundhosen), radikale Basis"},
  {"id":"preset-frzrev-c100","term":"Entchristianisierung","translation":"Kirchen geschlossen, Priester verfolgt, Kult des „Höchsten Wesens“, Revolutionskalender"},
  {"id":"preset-frzrev-c101","term":"Opfer des Terrors","translation":"ca. 40.000, davon ca. 17.000 offizielle Todesurteile"},
  {"id":"preset-frzrev-c102","term":"Vendée","translation":"Region mit Aufstand gegen die Revolution (Bedrohung im Inneren)"},
  {"id":"preset-frzrev-c103","term":"Napoleon Bonaparte","translation":"Staatsstreich 9. 11. 1799 → Erster Konsul; 1804 Kaiser; Code civil sichert Errungenschaften"},
  {"id":"preset-frzrev-c104","term":"Direktorium","translation":"Regierung aus 5 Direktoren (1795–1799), Großbürgertum, politisch instabil"},
  {"id":"preset-frzrev-c105","term":"„Die Revolution frisst ihre Kinder“","translation":"Revolutionäre wie Danton und Robespierre wurden selbst hingerichtet"}
 ]},
 {"id":"preset-heft-ursachen","folder":"preset-heft","name":"Heft – Ursachen der Revolution","cards":[
  {"id": "preset-heft-ursachen-0", "term": "Absolutismus: Wofür gab der König viel Geld aus?", "translation": "Hofhaltung, Staatsverwaltung und stehendes Heer"},
  {"id": "preset-heft-ursachen-1", "term": "Absolutismus: Welche Folge hatten die hohen Ausgaben?", "translation": "Schulden → Erhöhung der Steuern"},
  {"id": "preset-heft-ursachen-2", "term": "Was lösten Missernten auf dem Land aus?", "translation": "Steigende Brotpreise in den Städten"},
  {"id": "preset-heft-ursachen-3", "term": "Was erzeugten Steuererhöhungen und steigende Brotpreise zusammen?", "translation": "Existenziellen Druck (z. B. Hunger) bei den armen Schichten"},
  {"id": "preset-heft-ursachen-4", "term": "Wozu führte der existenzielle Druck zunächst?", "translation": "Zu Aufständen auf dem Land"},
  {"id": "preset-heft-ursachen-5", "term": "Frage aus dem Heft: Wie wird aus Aufständen eine Revolution?", "translation": "Hunger allein führt nur zu Aufständen. Erst das Bürgertum mit den Ideen der Aufklärung gibt Ziele (Gleichheit, Verfassung) und Führung; die Generalstände 1789 bieten die Bühne."},
  {"id": "preset-heft-ursachen-6", "term": "Ursachen-Kette komplett (Absolutismus + Missernten)", "translation": "Hofhaltung, Verwaltung, Heer → Schulden → Steuererhöhung\nMissernten → Brotpreise steigen\n→ Hunger bei den Armen → Aufstände auf dem Land"},
  {"id": "preset-heft-ursachen-7", "term": "Wirtschaftliche Gründe (4)", "translation": "1. Missernten\n2. hohe Abgaben an Grundherren\n3. hohe Staatsschulden → hohe Steuerlast\n4. Importe & Bevölkerungsanstieg → Wegfall von Arbeitsplätzen → Verarmung"},
  {"id": "preset-heft-ursachen-8", "term": "Was bewirkten Importe und Bevölkerungsanstieg?", "translation": "Wegfall von Arbeitsplätzen → Verarmung"},
  {"id": "preset-heft-ursachen-9", "term": "Politische Gründe (4)", "translation": "1. geringe Durchsetzungsfähigkeit des Königs (von Verwaltung abhängig)\n2. hohe Staatsschulden → fast Staatsbankrott\n3. Ämterkauf → unfähige Beamte\n4. Steuerbefreiung für Klerus & Adel"},
  {"id": "preset-heft-ursachen-10", "term": "Warum war der König politisch schwach?", "translation": "Geringe Durchsetzungsfähigkeit – er war von seiner Verwaltung abhängig"},
  {"id": "preset-heft-ursachen-11", "term": "Was ist Ämterkauf und was war die Folge?", "translation": "Ämter wurden gekauft statt nach Können vergeben → unfähige Beamte"},
  {"id": "preset-heft-ursachen-12", "term": "Wozu führten die hohen Staatsschulden politisch?", "translation": "Fast zum Staatsbankrott"},
  {"id": "preset-heft-ursachen-13", "term": "Kulturelle Gründe", "translation": "Aufklärung: Hauptvertreter aus dem Bürgertum hinterfragten Absolutismus und Gottesgnadentum und machten sich Gedanken über neue Gesellschaftsformen"},
  {"id": "preset-heft-ursachen-14", "term": "Soziale Gründe", "translation": "Ständegesellschaft: 1. Stand (Klerus) und 2. Stand (Adel) steuerbefreit, 3. Stand (98 %) trägt die Lasten, ca. 12 Mio. verarmt"},
  {"id": "preset-heft-ursachen-15", "term": "Die 4 Arten von Gründen", "translation": "wirtschaftlich · politisch · kulturell · sozial"}
 ]},
 {"id":"preset-heft-gesellschaft","folder":"preset-heft","name":"Heft – Stände & Schichten","cards":[
  {"id": "preset-heft-gesellschaft-0", "term": "1. Stand", "translation": "Klerus (= 0,5 %), ca. 140.000\nhoher & niedriger Klerus"},
  {"id": "preset-heft-gesellschaft-1", "term": "2. Stand", "translation": "Adel (= 1,5 %), ca. 425.000\nreich, vom König abhängig"},
  {"id": "preset-heft-gesellschaft-2", "term": "3. Stand", "translation": "Bürgertum & Bauern (≈ 98 %)\nStadt & Land: Großbürger, reiche Bürger, „freie“ Bauern usw.\nca. 12 Mio. verarmt"},
  {"id": "preset-heft-gesellschaft-3", "term": "Wie viele Menschen im 3. Stand waren verarmt?", "translation": "ca. 12 Millionen"},
  {"id": "preset-heft-gesellschaft-4", "term": "Welche Stände waren steuerbefreit?", "translation": "Klerus (1. Stand) und Adel (2. Stand)"},
  {"id": "preset-heft-gesellschaft-5", "term": "Oberschicht – Stadt", "translation": "Adel, reiche Kaufleute"},
  {"id": "preset-heft-gesellschaft-6", "term": "Oberschicht – Land", "translation": "Adel"},
  {"id": "preset-heft-gesellschaft-7", "term": "Mittelschicht – Stadt", "translation": "Kleines & mittleres Bürgertum: Händler, Handwerker, Beamte, Gelehrte"},
  {"id": "preset-heft-gesellschaft-8", "term": "Mittelschicht – Land", "translation": "Bauern: Kleinbauern, mittlere Bauern; Handwerker"},
  {"id": "preset-heft-gesellschaft-9", "term": "Unterschicht", "translation": "Bettler, Tagelöhner, Ungelehrte, Hilfsarbeiter"},
  {"id": "preset-heft-gesellschaft-10", "term": "Was ist ein Tagelöhner?", "translation": "Jemand ohne feste Arbeit, der nur tageweise bezahlt wird (Unterschicht)"},
  {"id": "preset-heft-gesellschaft-11", "term": "Unterschied Stände vs. Schichten", "translation": "Stände = rechtliche Ordnung nach Geburt (Klerus, Adel, 3. Stand)\nSchichten = Einteilung nach Besitz/Lebenslage (Ober-, Mittel-, Unterschicht)"}
 ]},
 {"id":"preset-heft-zeitstrahl","folder":"preset-heft","name":"Heft – Zeitstrahl 1789","cards":[
  {"id": "preset-heft-zeitstrahl-0", "term": "5. Mai 1789", "translation": "Versammlung der Generalstände in Versailles"},
  {"id": "preset-heft-zeitstrahl-1", "term": "17. Juni 1789", "translation": "Ausrufung der Nationalversammlung"},
  {"id": "preset-heft-zeitstrahl-2", "term": "20. Juni 1789", "translation": "Ballhausschwur"},
  {"id": "preset-heft-zeitstrahl-3", "term": "14. Juli 1789", "translation": "Bastille wird gewaltsam erobert"},
  {"id": "preset-heft-zeitstrahl-4", "term": "17. Juli 1789", "translation": "König stimmt zu: Verfassungsberatung"},
  {"id": "preset-heft-zeitstrahl-5", "term": "4. August 1789", "translation": "Abschaffung der Vorrechte des Adels"},
  {"id": "preset-heft-zeitstrahl-6", "term": "26. August 1789", "translation": "Erklärung der Menschen- & Bürgerrechte"},
  {"id": "preset-heft-zeitstrahl-7", "term": "5./6. Oktober 1789", "translation": "König wird von Marktfrauen nach Paris gezwungen"},
  {"id": "preset-heft-zeitstrahl-8", "term": "2. November 1789", "translation": "Kirchliche Würdenträger verlieren Vorrechte; Verstaatlichung der Kirche(ngüter)"},
  {"id": "preset-heft-zeitstrahl-9", "term": "Wann wurde die Bastille erobert?", "translation": "14. Juli 1789"},
  {"id": "preset-heft-zeitstrahl-10", "term": "Wann wurde die Nationalversammlung ausgerufen?", "translation": "17. Juni 1789"},
  {"id": "preset-heft-zeitstrahl-11", "term": "Wann verlor der Adel seine Vorrechte?", "translation": "4. August 1789"},
  {"id": "preset-heft-zeitstrahl-12", "term": "Wann wurden die Menschenrechte erklärt?", "translation": "26. August 1789"},
  {"id": "preset-heft-zeitstrahl-13", "term": "Wer zwang den König im Oktober 1789 nach Paris?", "translation": "Die Marktfrauen (5./6. Oktober 1789)"},
  {"id": "preset-heft-zeitstrahl-14", "term": "Was passierte am 2. November 1789?", "translation": "Kirchliche Würdenträger verloren ihre Vorrechte, die Kirche(ngüter) wurde(n) verstaatlicht"}
 ]},
 {"id":"preset-heft-menschenrechte","folder":"preset-heft","name":"Heft – Menschenrechte (M4/M5)","cards":[
  {"id": "preset-heft-menschenrechte-0", "term": "Wann wurde die Erklärung der Menschenrechte verabschiedet?", "translation": "Im August 1789 (26. August)"},
  {"id": "preset-heft-menschenrechte-1", "term": "Art. 1", "translation": "Die Menschen werden frei und gleich an Rechten geboren und bleiben es für immer. Standesunterschiede dürfen nur im allgemeinen Nutzen begründet sein."},
  {"id": "preset-heft-menschenrechte-2", "term": "Art. 2", "translation": "Ziel jeder politischen Vereinigung ist die Erhaltung der natürlichen und unveräußerlichen Rechte: Freiheit, Eigentum, Sicherheit und Widerstand gegen Unterdrückung."},
  {"id": "preset-heft-menschenrechte-3", "term": "Die 4 natürlichen Rechte (Art. 2)", "translation": "Freiheit · Eigentum · Sicherheit · Widerstand gegen Unterdrückung"},
  {"id": "preset-heft-menschenrechte-4", "term": "Art. 3", "translation": "Der Ursprung jeder Souveränität liegt in der Nation. Keine Person und keine Körperschaft darf Gewalt ausüben, die nicht von ihr ausgeht. (→ Volkssouveränität)"},
  {"id": "preset-heft-menschenrechte-5", "term": "Art. 4", "translation": "Freiheit heißt, alles tun zu können, was einem anderen nicht schadet. Grenzen kann nur das Gesetz bestimmen."},
  {"id": "preset-heft-menschenrechte-6", "term": "Art. 6", "translation": "Das Gesetz ist Ausdruck des allgemeinen Willens. Alle Bürger können daran mitwirken; es ist für alle gleich. Alle haben gleichen Zugang zu Ämtern – nur nach Fähigkeiten."},
  {"id": "preset-heft-menschenrechte-7", "term": "Art. 9", "translation": "Jeder gilt als unschuldig, bis er schuldig gesprochen ist. Unnötige Härte bei einer Verhaftung wird bestraft. (Unschuldsvermutung)"},
  {"id": "preset-heft-menschenrechte-8", "term": "Art. 10", "translation": "Niemand darf wegen seiner Meinung, auch in religiösen Fragen, belästigt werden – solange er die öffentliche Ordnung nicht stört."},
  {"id": "preset-heft-menschenrechte-9", "term": "Art. 11", "translation": "Freier Austausch von Gedanken und Meinungen: Jeder darf frei reden, schreiben, drucken – muss aber für Missbrauch nach dem Gesetz einstehen. (Meinungs- & Pressefreiheit)"},
  {"id": "preset-heft-menschenrechte-10", "term": "Art. 17", "translation": "Eigentum ist unverletzlich und heilig. Enteignung nur bei öffentlicher Notwendigkeit und nur gegen gerechte Entschädigung."},
  {"id": "preset-heft-menschenrechte-11", "term": "Welcher Artikel: Unschuldsvermutung?", "translation": "Art. 9"},
  {"id": "preset-heft-menschenrechte-12", "term": "Welcher Artikel: Pressefreiheit?", "translation": "Art. 11"},
  {"id": "preset-heft-menschenrechte-13", "term": "Welcher Artikel: Volkssouveränität?", "translation": "Art. 3"},
  {"id": "preset-heft-menschenrechte-14", "term": "Welcher Artikel: Eigentum ist heilig?", "translation": "Art. 17"},
  {"id": "preset-heft-menschenrechte-15", "term": "Welcher Artikel: Religions- und Meinungsfreiheit?", "translation": "Art. 10"},
  {"id": "preset-heft-menschenrechte-16", "term": "Gemälde von 1790 (M4): Was ist zu sehen?", "translation": "Die Erklärung wie Gesetzestafeln in Stein · links eine Frau (Frankreich) mit zerbrochenen Ketten · rechts ein Engel (Vernunft), der auf die Rechte zeigt · oben das Auge der Vorsehung"},
  {"id": "preset-heft-menschenrechte-17", "term": "M4: Was bedeuten die zerbrochenen Ketten?", "translation": "Frankreich hat die Unterdrückung (Absolutismus, Ständeordnung) abgeschüttelt"},
  {"id": "preset-heft-menschenrechte-18", "term": "M4: Was soll das Auge der Vorsehung zeigen?", "translation": "Die Rechte gelten als heilig und ewig – unter dem Schutz des „Höchsten Wesens“"},
  {"id": "preset-heft-menschenrechte-19", "term": "Verfassung: Gibt es Menschenrechte immer?", "translation": "Nein – laut Heft sind sie nicht immer vorhanden bzw. werden nicht immer durchgeführt"}
 ]},
 {"id":"preset-heft-gewalten","folder":"preset-heft","name":"Heft – Verfassung & Gewaltenteilung","cards":[
  {"id": "preset-heft-gewalten-0", "term": "Was ist eine Verfassung?", "translation": "Gesetz über den Staatsaufbau (bei uns: Grundgesetz)"},
  {"id": "preset-heft-gewalten-1", "term": "Was regelt bzw. enthält eine Verfassung?", "translation": "Sie regelt die Gewaltenteilung und enthält z. B. auch die Menschenrechte"},
  {"id": "preset-heft-gewalten-2", "term": "Zwei Arten von Recht", "translation": "Bundesrecht und Landesrecht"},
  {"id": "preset-heft-gewalten-3", "term": "Wer beschließt bei uns die Gesetze?", "translation": "Das Parlament (Bundestag + Bundesrat)"},
  {"id": "preset-heft-gewalten-4", "term": "Wer setzt die Gesetze um?", "translation": "Die Regierung mit Verwaltung (Polizei, Militär) – sie erlässt auch Verordnungen"},
  {"id": "preset-heft-gewalten-5", "term": "Wer kontrolliert die Rechtmäßigkeit?", "translation": "Richter und andere Gerichte"},
  {"id": "preset-heft-gewalten-6", "term": "Legislative", "translation": "Gesetzgebende Gewalt\n→ Abgeordnete der Nationalversammlung (Parlament)"},
  {"id": "preset-heft-gewalten-7", "term": "Exekutive", "translation": "Ausführende Gewalt\n→ Minister, (heute) Bundeskanzler, andere Untergeordnete\n→ damals: + König (kein Bundeskanzler)"},
  {"id": "preset-heft-gewalten-8", "term": "Judikative", "translation": "Richterliche Gewalt\n→ Kassationshof, Hochgericht, Richter & Geschworene der Gerichte, Friedensrichter"},
  {"id": "preset-heft-gewalten-9", "term": "Besonderheit des Königs (1791)", "translation": "Er wurde nicht gewählt und hatte ein Vetorecht"},
  {"id": "preset-heft-gewalten-10", "term": "Aktivbürger", "translation": "Wahlrecht aufgrund der Steuerleistung (Zensuswahlrecht)\nMänner über 25 Jahre (ca. 4 Mio.)"},
  {"id": "preset-heft-gewalten-11", "term": "Wen wählten die Aktivbürger?", "translation": "Wahlmänner (45.000), Friedensrichter, Gemeindeverwaltungen"},
  {"id": "preset-heft-gewalten-12", "term": "Wen wählten die Wahlmänner?", "translation": "Richter & Geschworene, Bischöfe & Priester, Departementsverwaltungen, Abgeordnete der Nationalversammlung"},
  {"id": "preset-heft-gewalten-13", "term": "Gesamtbevölkerung Frankreichs um 1791", "translation": "ca. 25 Millionen"},
  {"id": "preset-heft-gewalten-14", "term": "Was ist das Ergebnis des „Erfolgs der Revolutionäre“?", "translation": "Die Verfassung von 1791 → konstitutionelle Monarchie"},
  {"id": "preset-heft-gewalten-15", "term": "Konstitutionelle Monarchie", "translation": "Es gibt weiter einen König, aber seine Macht ist durch die Verfassung begrenzt"}
 ]},
 {"id":"preset-heft-schaubild","folder":"preset-heft","name":"Heft – Verfassung 1791 (Schaubild M1)","cards":[
  {"id": "preset-heft-schaubild-0", "term": "M1: Wie viele Abgeordnete hatte die Nationalversammlung?", "translation": "745"},
  {"id": "preset-heft-schaubild-1", "term": "M1: Für wie lange wurde die Nationalversammlung gewählt?", "translation": "Für 2 Jahre"},
  {"id": "preset-heft-schaubild-2", "term": "M1: Wer wählte die Nationalversammlung?", "translation": "Die 45.000 Wahlmänner"},
  {"id": "preset-heft-schaubild-3", "term": "M1: Was macht die Nationalversammlung?", "translation": "Gesetzgebung, Aufsicht über das Militär, Antrag an das Hochgericht"},
  {"id": "preset-heft-schaubild-4", "term": "M1: Rechte des Königs", "translation": "Veto gegen Gesetze · ernennt & entlässt Minister · Oberbefehl über das Militär"},
  {"id": "preset-heft-schaubild-5", "term": "M1: Was beaufsichtigen die Minister?", "translation": "Die Departementsverwaltungen"},
  {"id": "preset-heft-schaubild-6", "term": "M1: Kassationshof – wie entsteht er, was macht er?", "translation": "Wird gewählt; Einspruch gegen Urteile der Gerichte"},
  {"id": "preset-heft-schaubild-7", "term": "M1: Wer wird direkt von den Aktivbürgern gewählt?", "translation": "Wahlmänner, Friedensrichter, Gemeindeverwaltungen"},
  {"id": "preset-heft-schaubild-8", "term": "M1: Wer wird von den Wahlmännern gewählt?", "translation": "Nationalversammlung, Richter & Geschworene, Departementsverwaltungen, Bischöfe & Priester"},
  {"id": "preset-heft-schaubild-9", "term": "Wie viele Passivbürger gab es?", "translation": "ca. 3 Millionen (ohne Stimmrecht)"},
  {"id": "preset-heft-schaubild-10", "term": "Wer hatte 1791 kein Stimmrecht?", "translation": "3 Mio. Passivbürger, alle Frauen und Männer unter 25"},
  {"id": "preset-heft-schaubild-11", "term": "Welcher Anteil war von politischer Mitwirkung ausgeschlossen?", "translation": "Über zwei Drittel der Bevölkerung"},
  {"id": "preset-heft-schaubild-12", "term": "Wie viele der 25 Mio. durften wählen?", "translation": "ca. 4 Mio. (Aktivbürger) ≈ jeder Sechste"},
  {"id": "preset-heft-schaubild-13", "term": "War die Verfassung von 1791 demokratisch?", "translation": "Nur teilweise: + Gewaltenteilung, gewählte Nationalversammlung\n– Zensuswahlrecht, indirekte Wahl, Frauen ausgeschlossen, König nicht gewählt mit Veto"}
 ]},
 {"id":"preset-heft-wichtig","folder":"preset-heft","name":"Heft – Wichtigste Daten & Phasen","cards":[
  {"id": "preset-heft-wichtig-0", "term": "Mai 1789", "translation": "Einberufung der Generalstände durch den König zur Lösung der Finanzkrise (5. Mai)"},
  {"id": "preset-heft-wichtig-1", "term": "Warum berief der König die Generalstände ein?", "translation": "Zur Lösung der Finanzkrise: Frankreich war pleite und der König brauchte neue Steuern"},
  {"id": "preset-heft-wichtig-2", "term": "Problem bei der Abstimmung in den Generalständen", "translation": "Jeder Stand hatte 1 Stimme → Klerus + Adel gewinnen immer 2 : 1 gegen den 3. Stand (98 % der Bevölkerung)"},
  {"id": "preset-heft-wichtig-3", "term": "17. Juni 1789", "translation": "Der Dritte Stand erklärt sich zur Nationalversammlung"},
  {"id": "preset-heft-wichtig-4", "term": "Warum war der 17. Juni 1789 revolutionär?", "translation": "Der 3. Stand beansprucht, das ganze Volk zu vertreten → Macht kommt vom Volk, nicht vom König (Volkssouveränität)"},
  {"id": "preset-heft-wichtig-5", "term": "20. Juni 1789", "translation": "Ballhausschwur: Die Abgeordneten schwören, erst nach einer neuen Verfassung auseinanderzugehen"},
  {"id": "preset-heft-wichtig-6", "term": "Wie kam es zum Ballhausschwur?", "translation": "Der König ließ den Sitzungssaal sperren → die Abgeordneten zogen ins Ballhaus (Sporthalle) und schworen dort"},
  {"id": "preset-heft-wichtig-7", "term": "14. Juli 1789", "translation": "Sturm auf die Bastille – Symbol der königlichen Willkürherrschaft (heute französischer Nationalfeiertag)"},
  {"id": "preset-heft-wichtig-8", "term": "Warum stürmten die Pariser die Bastille?", "translation": "Der König zog Truppen um Paris zusammen; das Volk fürchtete, er löse die Nationalversammlung mit Gewalt auf"},
  {"id": "preset-heft-wichtig-9", "term": "4./11. August 1789", "translation": "Aufhebung der feudalen Lasten; Adel und Klerus verzichten auf ihre Privilegien"},
  {"id": "preset-heft-wichtig-10", "term": "Warum „4./11.“ August?", "translation": "Beschluss in der Nacht vom 4. auf den 5. August, die Gesetze wurden bis zum 11. August ausgearbeitet"},
  {"id": "preset-heft-wichtig-11", "term": "Worauf verzichteten Adel und Klerus im August 1789?", "translation": "Steuerbefreiung, Abgaben und Frondienste der Bauern, Kirchenzehnt → Ende der Ständegesellschaft"},
  {"id": "preset-heft-wichtig-12", "term": "26. August 1789", "translation": "Verkündung der Erklärung der Menschen- und Bürgerrechte"},
  {"id": "preset-heft-wichtig-13", "term": "Die 3 Phasen der Revolution", "translation": "1. Konstitutionelle Monarchie (1789–1792)\n2. Schreckensherrschaft der Jakobiner (1792–1794)\n3. Direktorium und Aufstieg Napoleons (1795–1799)"},
  {"id": "preset-heft-wichtig-14", "term": "Phase 1 (1789–1792)", "translation": "Konstitutionelle Monarchie: 1791 neue Verfassung; der König bleibt im Amt, seine Macht wird durch ein Parlament eingeschränkt"},
  {"id": "preset-heft-wichtig-15", "term": "Was bedeutet konstitutionelle Monarchie?", "translation": "Es gibt einen König, aber seine Macht ist durch Verfassung und Parlament eingeschränkt"},
  {"id": "preset-heft-wichtig-16", "term": "Wann bekam Frankreich seine erste Verfassung?", "translation": "1791"},
  {"id": "preset-heft-wichtig-17", "term": "Phase 2 (1792–1794)", "translation": "Schreckensherrschaft der Jakobiner: Sturz der Monarchie, Republik (1792), Hinrichtung Ludwigs XVI. (1793), Terreur unter Robespierre, Ende Juli 1794"},
  {"id": "preset-heft-wichtig-18", "term": "1792", "translation": "Sturz der Monarchie und Ausrufung der Republik"},
  {"id": "preset-heft-wichtig-19", "term": "1793", "translation": "Hinrichtung von König Ludwig XVI. per Guillotine"},
  {"id": "preset-heft-wichtig-20", "term": "Terreur", "translation": "Radikaldemokratische Diktatur unter Maximilien de Robespierre mit tausenden Hinrichtungen"},
  {"id": "preset-heft-wichtig-21", "term": "Wer führte die Schreckensherrschaft an?", "translation": "Maximilien de Robespierre (Jakobiner)"},
  {"id": "preset-heft-wichtig-22", "term": "Juli 1794", "translation": "Sturz und Hinrichtung Robespierres → Ende der Schreckensherrschaft"},
  {"id": "preset-heft-wichtig-23", "term": "Warum wurde die Revolution ab 1792 radikaler?", "translation": "Fluchtversuch des Königs (1791), Krieg gegen Österreich/Preußen, König galt als Verräter"},
  {"id": "preset-heft-wichtig-24", "term": "Was ist eine Republik?", "translation": "Ein Staat ohne König"},
  {"id": "preset-heft-wichtig-25", "term": "Phase 3 (1795–1799)", "translation": "Direktorium und Aufstieg Napoleons: besitzendes Bürgertum an der Macht (5 Direktoren), Instabilität und Kriege, 1799 Staatsstreich Napoleons"},
  {"id": "preset-heft-wichtig-26", "term": "Direktorium", "translation": "Regierung aus fünf Direktoren; Machtübernahme des besitzenden Bürgertums"},
  {"id": "preset-heft-wichtig-27", "term": "Probleme des Direktoriums", "translation": "Politische Instabilität und anhaltende Kriege"},
  {"id": "preset-heft-wichtig-28", "term": "1799", "translation": "Staatsstreich durch Napoleon Bonaparte → Ende der Revolution"},
  {"id": "preset-heft-wichtig-29", "term": "Wie endete die Französische Revolution?", "translation": "1799 mit dem Staatsstreich Napoleon Bonapartes"},
  {"id": "preset-heft-wichtig-30", "term": "Die Revolution in 5 Sätzen", "translation": "1. Frankreich pleite, Volk hungert, 3. Stand ohne Rechte\n2. 1789: 3. Stand nimmt sich die Macht\n3. 1791: Verfassung, König eingeschränkt\n4. 1792–94: Republik, König tot, Terror\n5. 1795–99: Bürger regieren schwach → Napoleon"}
 ]},
 {"id":"preset-sozial-ziele","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Ziele & Prinzipien","cards":[
  {"id": "preset-sozial-ziele-0", "term": "Grundidee des Sozialstaats", "translation": "Niemand ist allein: Der Staat schützt Menschen vor sozialen Risiken (Krankheit, Arbeitslosigkeit, Alter) und hilft Bedürftigen"},
  {"id": "preset-sozial-ziele-1", "term": "Die 4 Ziele des Sozialstaats", "translation": "Soziale Sicherheit · soziale Gerechtigkeit · Chancengleichheit · Solidarität"},
  {"id": "preset-sozial-ziele-2", "term": "Soziale Sicherheit", "translation": "Schutz vor finanziellen Notlagen"},
  {"id": "preset-sozial-ziele-3", "term": "Soziale Gerechtigkeit", "translation": "Menschen sollen faire Chancen haben"},
  {"id": "preset-sozial-ziele-4", "term": "Chancengleichheit", "translation": "Alle sollen möglichst ähnliche Möglichkeiten haben"},
  {"id": "preset-sozial-ziele-5", "term": "Solidarität", "translation": "Menschen helfen sich gegenseitig"},
  {"id": "preset-sozial-ziele-6", "term": "Solidarprinzip – Kerngedanke", "translation": "Menschen unterstützen sich gegenseitig: Wer Hilfe braucht, wird durch die Beiträge der anderen Versicherten unterstützt"},
  {"id": "preset-sozial-ziele-7", "term": "Solidarprinzip: Wonach richtet sich der Beitrag?", "translation": "Nach der individuellen Leistungsfähigkeit (wer mehr verdient, zahlt mehr)"},
  {"id": "preset-sozial-ziele-8", "term": "Solidarprinzip: Wonach richten sich die Leistungen?", "translation": "Nach dem Bedarf – nicht danach, wie viel jemand eingezahlt hat"},
  {"id": "preset-sozial-ziele-9", "term": "Solidarprinzip in einem Satz", "translation": "Alle zahlen gemeinsam ein; wer Hilfe braucht, bekommt sie – unabhängig davon, wie viel er selbst eingezahlt hat"},
  {"id": "preset-sozial-ziele-10", "term": "Beispiel Solidarprinzip (Krankenversicherung)", "translation": "Ein Gutverdiener zahlt hohe Beiträge, ist aber selten krank; ein Geringverdiener zahlt wenig, bekommt aber die gleiche Behandlung, wenn er krank ist"},
  {"id": "preset-sozial-ziele-11", "term": "Wie wird der Sozialstaat finanziert?", "translation": "Über Steuern und Sozialabgaben (Beiträge von Arbeitnehmern und Arbeitgebern)"}
 ]},
 {"id":"preset-sozial-versicherungen","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Die 5 Sozialversicherungen (M4)","cards":[
  {"id": "preset-sozial-versicherungen-0", "term": "Die 5 gesetzlichen Sozialversicherungen", "translation": "Kranken-, Unfall-, Renten-, Arbeitslosen- und Pflegeversicherung"},
  {"id": "preset-sozial-versicherungen-1", "term": "Gesetzliche Krankenversicherung – Aufgaben", "translation": "Erhaltung, Wiederherstellung oder Verbesserung der Gesundheit · zahlt medizinisch notwendige Hilfe bei Krankheit (außer Arbeitsunfällen) · zahlt Krankengeld, wenn der Arbeitgeber das Gehalt nicht mehr weiterzahlt"},
  {"id": "preset-sozial-versicherungen-2", "term": "Wann zahlt die Krankenversicherung Krankengeld?", "translation": "Wenn der Arbeitgeber das Gehalt während einer Arbeitsunfähigkeit nicht mehr weiterzahlt"},
  {"id": "preset-sozial-versicherungen-3", "term": "Was zahlt die Krankenversicherung NICHT?", "translation": "Arbeitsunfälle – dafür ist die Unfallversicherung zuständig"},
  {"id": "preset-sozial-versicherungen-4", "term": "Gesetzliche Unfallversicherung – Aufgaben", "translation": "Verhütung von Arbeitsunfällen, Berufskrankheiten und Gesundheitsgefahren · nach Arbeitsunfällen Gesundheit und Leistungsfähigkeit wiederherstellen · Geldleistungen an Versicherte oder Hinterbliebene"},
  {"id": "preset-sozial-versicherungen-5", "term": "Gesetzliche Rentenversicherung – Aufgaben", "translation": "Zahlt Altersrenten · sichert ab bei verminderter Erwerbsfähigkeit und beim Tod von Ehepartner oder Eltern · Reha-Maßnahmen, um die Erwerbsfähigkeit kranker und behinderter Menschen zu verbessern"},
  {"id": "preset-sozial-versicherungen-6", "term": "Was ist Erwerbsfähigkeit?", "translation": "Die Fähigkeit, durch Arbeit Geld zu verdienen"},
  {"id": "preset-sozial-versicherungen-7", "term": "Gesetzliche Arbeitslosenversicherung – Aufgaben", "translation": "Integration von Menschen in Berufsausbildung und Arbeit · Sicherung des Lebensunterhalts während der Arbeitslosigkeit"},
  {"id": "preset-sozial-versicherungen-8", "term": "Gesetzliche Pflegeversicherung – Aufgaben", "translation": "Pflegebedürftigen ein selbstbestimmtes Leben ermöglichen · je nach Pflegegrad Geld- oder Sachleistungen für Grundpflege und Haushalt"},
  {"id": "preset-sozial-versicherungen-9", "term": "Wovon hängt die Höhe der Pflegeleistungen ab?", "translation": "Vom Grad der Pflegebedürftigkeit (Pflegegrad)"},
  {"id": "preset-sozial-versicherungen-10", "term": "Welche Versicherung zahlt nach einem Arbeitsunfall?", "translation": "Die gesetzliche Unfallversicherung"},
  {"id": "preset-sozial-versicherungen-11", "term": "Welche Versicherung zahlt Hinterbliebenenrente (Tod der Eltern/des Ehepartners)?", "translation": "Die gesetzliche Rentenversicherung"},
  {"id": "preset-sozial-versicherungen-12", "term": "Welche Versicherung hilft bei der Jobsuche?", "translation": "Die gesetzliche Arbeitslosenversicherung"}
 ]},
 {"id":"preset-sozial-bewertung","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Vor- & Nachteile","cards":[
  {"id": "preset-sozial-bewertung-0", "term": "Vorteile des Sozialstaats", "translation": "Hilfe bei Krankheit, Arbeitslosigkeit und Alter · weniger Armut · Zugang für alle zu Krankenversicherung und Rente · fördert sozialen Frieden"},
  {"id": "preset-sozial-bewertung-1", "term": "Warum fördert der Sozialstaat den sozialen Frieden?", "translation": "Weil niemand völlig ohne Unterstützung bleibt"},
  {"id": "preset-sozial-bewertung-2", "term": "Nachteile des Sozialstaats", "translation": "Muss über Steuern und Beiträge finanziert werden · hohe Kosten belasten den Staat · manche verlassen sich zu sehr auf staatliche Hilfe · hohe Abgaben für Arbeitnehmer und Unternehmen"},
  {"id": "preset-sozial-bewertung-3", "term": "Kurzfassung: Sozialstaat", "translation": "Er schützt vor sozialen Risiken und hilft Bedürftigen. Dafür zahlen die Bürger Steuern und Sozialabgaben."},
  {"id": "preset-sozial-bewertung-4", "term": "Größtes Problem des Sozialstaats", "translation": "Seine Leistungen kosten sehr viel Geld. Reichen Steuern und Abgaben nicht, muss der Staat Schulden machen."},
  {"id": "preset-sozial-bewertung-5", "term": "Lohnt sich der Sozialstaat? (Fazit)", "translation": "Ja, wenn er Sicherheit und Frieden schafft – aber er muss bezahlbar bleiben und darf nicht zu sehr zur Abhängigkeit führen"}
 ]},
 {"id":"preset-sozial-modelle","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Die 3 Sozialstaatsmodelle","cards":[
  {"id": "preset-sozial-modelle-0", "term": "Die 3 Sozialstaatsmodelle", "translation": "Konservativ (kontinentaleuropäisch) · liberal (angelsächsisch) · sozialdemokratisch (skandinavisch)"},
  {"id": "preset-sozial-modelle-1", "term": "Konservatives Modell – anderer Name & Beispiel", "translation": "Kontinentaleuropäischer Sozialstaat, z. B. Deutschland, Frankreich"},
  {"id": "preset-sozial-modelle-2", "term": "Konservatives Modell – Finanzierung", "translation": "Über Sozialabgaben, die Arbeitnehmer und Arbeitgeber bezahlen"},
  {"id": "preset-sozial-modelle-3", "term": "Konservatives Modell – Merkmale", "translation": "Bringt Ausgleich und Sicherheit · umverteilendes Steuersystem · Grundsicherung für jeden Bürger"},
  {"id": "preset-sozial-modelle-4", "term": "Liberales Modell – anderer Name & Beispiele", "translation": "Angelsächsischer Sozialstaat, v. a. USA und Großbritannien"},
  {"id": "preset-sozial-modelle-5", "term": "Liberales Modell – Merkmale", "translation": "Große Bereiche privat organisiert (z. B. Bildung, Gesundheit) · finanziert über Steuern · Vertrauen in den Markt und Eigenverantwortung · Sicherheit vor Armut gering"},
  {"id": "preset-sozial-modelle-6", "term": "Kritik am liberalen Modell", "translation": "In den USA ging die Finanzkrise aus, und viele Menschen haben keine Krankenversicherung"},
  {"id": "preset-sozial-modelle-7", "term": "Sozialdemokratisches Modell – anderer Name & Beispiele", "translation": "Skandinavisches Modell, z. B. Dänemark und Schweden"},
  {"id": "preset-sozial-modelle-8", "term": "Sozialdemokratisches Modell – Merkmale", "translation": "Gegenmodell zum liberalen Sozialstaat · größtenteils über Steuern finanziert · umfassende Sozialleistungen für alle"},
  {"id": "preset-sozial-modelle-9", "term": "Was verlangt das skandinavische Modell im Gegenzug?", "translation": "Ein hohes Maß an Flexibilität von den Arbeitnehmern, z. B. ist der Kündigungsschutz stark eingeschränkt"},
  {"id": "preset-sozial-modelle-10", "term": "Welches Modell hat Deutschland?", "translation": "Das konservative (kontinentaleuropäische) Modell – beitragsfinanzierte Sozialversicherungen"},
  {"id": "preset-sozial-modelle-11", "term": "Schweden – Kernmerkmal", "translation": "Universelle, steuerfinanzierte Leistungen für alle Bürger (sozialdemokratisch)"},
  {"id": "preset-sozial-modelle-12", "term": "Schweden – Übernahme-Idee für Deutschland", "translation": "Elternzeit mit festen „Vätermonaten“ und mehr Kinderbetreuung"},
  {"id": "preset-sozial-modelle-13", "term": "USA – Kernmerkmal", "translation": "Markt und Eigenverantwortung, keine Pflichtversicherungen (liberal)"},
  {"id": "preset-sozial-modelle-14", "term": "USA – Übernahme-Idee für Deutschland", "translation": "Mehr Wettbewerb zwischen Versicherungen als Anreiz – aber mit Pflichtversicherung für alle kombiniert"},
  {"id": "preset-sozial-modelle-15", "term": "Frankreich – Kernmerkmal", "translation": "Beitragsfinanzierte Sozialversicherungen wie in Deutschland (konservativ)"},
  {"id": "preset-sozial-modelle-16", "term": "Frankreich – Übernahme-Idee für Deutschland", "translation": "Kostenlose, flächendeckende Vorschule ab 3 Jahren"}
 ]},
 {"id":"preset-sozial-rente","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Rente","cards":[
  {"id": "preset-sozial-rente-0", "term": "Umlageverfahren", "translation": "Die heutigen Arbeitnehmer zahlen Beiträge, damit werden die heutigen Rentner bezahlt. Wenn sie selbst in Rente gehen, zahlt die nächste Generation."},
  {"id": "preset-sozial-rente-1", "term": "Nach welchem Verfahren funktioniert die gesetzliche Rente?", "translation": "Nach dem Umlageverfahren (Generationenvertrag)"},
  {"id": "preset-sozial-rente-2", "term": "Die 3 Säulen der Altersvorsorge", "translation": "1. gesetzliche · 2. betriebliche · 3. private Altersvorsorge"},
  {"id": "preset-sozial-rente-3", "term": "Warum gerät die Rente unter Druck?", "translation": "Immer weniger Arbeitnehmer finanzieren immer mehr Rentner, die länger leben und länger Rente beziehen"},
  {"id": "preset-sozial-rente-4", "term": "Wie viele Beschäftigte kommen auf einen Rentner?", "translation": "Früher etwa sechs, heute nur noch zwei"},
  {"id": "preset-sozial-rente-5", "term": "Pro höheres Rentenalter (4 Argumente)", "translation": "Menschen leben länger und können länger arbeiten · weniger Arbeitnehmer finanzieren mehr Rentner · Rentner beziehen länger Rente → Kosten steigen · ohne Änderung steigen die Beiträge weiter"},
  {"id": "preset-sozial-rente-6", "term": "Contra höheres Rentenalter (4 Argumente)", "translation": "Viele schaffen es schon jetzt nicht bis 67 (v. a. körperliche Berufe) · Renten sind für viele schon zu niedrig, längere Arbeit = weniger Rente genießen · in Pflege- und Bauberufen steigt im Alter das Unfallrisiko · nicht alle bleiben gesund – manche erreichen die Rente nicht oder sind dann krank"},
  {"id": "preset-sozial-rente-7", "term": "Bis zu welchem Alter muss man in Deutschland arbeiten?", "translation": "Bis 67 (Regelaltersgrenze)"},
  {"id": "preset-sozial-rente-8", "term": "Lösungsvorschlag 1 für die Rente", "translation": "Mehr Zuwanderung: Mehr Menschen arbeiten hier und zahlen in die Rentenkasse ein → mehr Geld für Renten"},
  {"id": "preset-sozial-rente-9", "term": "Lösungsvorschlag 2 für die Rente", "translation": "Alle Berufsgruppen einzahlen lassen: auch Selbstständige und Beamte → mehr Geld in der Rentenversicherung"},
  {"id": "preset-sozial-rente-10", "term": "Wer zahlt bisher NICHT in die gesetzliche Rente ein?", "translation": "Vor allem Beamte und viele Selbstständige"}
 ]},
 {"id":"preset-sozial-pkv","folder":"preset-sozialstaat","subject":"powi","name":"Sozialstaat – Gesetzliche & private Krankenversicherung","cards":[
  {"id": "preset-sozial-pkv-0", "term": "GKV und PKV", "translation": "GKV = gesetzliche Krankenversicherung · PKV = private Krankenversicherung"},
  {"id": "preset-sozial-pkv-1", "term": "Was passiert, wenn GKV und PKV getrennt würden?", "translation": "Die PKV müsste eigene Arztpraxen und Krankenhäuser finanzieren – das wäre sehr teuer"},
  {"id": "preset-sozial-pkv-2", "term": "Wer bezahlt heute größtenteils Praxen und Krankenhäuser?", "translation": "Größtenteils die gesetzlich Versicherten"},
  {"id": "preset-sozial-pkv-3", "term": "Was würde dem Gesundheitssystem bei einer Trennung fehlen?", "translation": "Das Geld der Privatversicherten – Leistungen und Service würden sich wahrscheinlich nicht verbessern"},
  {"id": "preset-sozial-pkv-4", "term": "Was wäre, wenn die PKV wegfiele?", "translation": "Leistungen und Service würden sich wahrscheinlich nicht verbessern, weil Geld von den Privatversicherten fehlt"}
 ]},
 {"id":"preset-hindu-wichtig","name":"Hinduismus: Wichtige Begriffe","subject":"religion","folder":"preset-hindu","cards":[
  {"id":"preset-hindu-w0","term":"Ahimsa","translation":"Nicht verletzen, Gewaltlosigkeit"},
  {"id":"preset-hindu-w1","term":"Karma","translation":"Das Prinzip von Ursache und Wirkung: Jede Handlung hat Folgen"},
  {"id":"preset-hindu-w2","term":"Reinkarnation","translation":"Wiedergeburt in ein neues Leben, basierend auf Karma"},
  {"id":"preset-hindu-w3","term":"Veden","translation":"Ältere heilige Texte der indischen Literatur"},
  {"id":"preset-hindu-w4","term":"Moksha","translation":"Befreiung aus dem Kreislauf der Wiedergeburt"},
  {"id":"preset-hindu-w5","term":"Brahmana","translation":"Priester. Außerdem eine Textgattung mit Erklärungen zu den Ritualen der Veden"},
  {"id":"preset-hindu-w6","term":"Mahabharata","translation":"Umfangreichstes Epos der Welt mit rund 110.000 Doppelversen"}
 ]},
 {"id":"preset-hindu-rest","name":"Hinduismus: Weitere Begriffe","subject":"religion","folder":"preset-hindu","cards":[
  {"id":"preset-hindu-r0","term":"Manu-Samhita","translation":"Uraltes Gesetzbuch"},
  {"id":"preset-hindu-r1","term":"Bandha","translation":"Karmische Konsequenzen, die an den Kreislauf binden"},
  {"id":"preset-hindu-r2","term":"Atharva Veda","translation":"Teil der Veden"},
  {"id":"preset-hindu-r3","term":"Padma Purana","translation":"Erzählwerk über die Götter"},
  {"id":"preset-hindu-r4","term":"Shrimad Bhagavatam","translation":"Schrift der Hindus, ein Purana über Krishna als Form Vishnus"},
  {"id":"preset-hindu-r5","term":"Mahatma","translation":"Große Seele"}
 ]},
 {"id":"preset-hindu-goetter","name":"Hinduismus: Götter und Göttinnen","subject":"religion","folder":"preset-hindu","cards":[
  {"id":"preset-hindu-g0","term":"Brahman","translation":"Die unpersönliche, absolute Wirklichkeit. Merksatz: Brahma ist nicht Brahman."},
  {"id":"preset-hindu-g1","term":"Brahma","translation":"Der Schöpfergott, erschafft die Welt und alle Lebewesen. Symbole: Veden, Lotus, Gebetsschnur, Wasserkrug. Reittier: Hamsa (Schwan oder Gans)."},
  {"id":"preset-hindu-g2","term":"Sarasvati","translation":"Göttin des Wissens, der Musik, der Kunst und der Sprache. Brahmas Partnerin."},
  {"id":"preset-hindu-g3","term":"Vishnu","translation":"Erhalter der Welt und der Weltordnung (Dharma). Blaue Haut, vier Arme, Muschel, Diskus, Keule, Lotus. Reittier: Garuda."},
  {"id":"preset-hindu-g4","term":"Avatare","translation":"Irdische Inkarnationen Vishnus, um die Welt zu retten, zum Beispiel Rama und Krishna."},
  {"id":"preset-hindu-g5","term":"Lakshmi","translation":"Göttin des Reichtums, des Glücks und des Wohlstands. Vishnus Partnerin."},
  {"id":"preset-hindu-g6","term":"Shiva","translation":"Verwandler und Zerstörer: Auflösung, Verwandlung und Neuschöpfung. Symbole: Dreizack, Trommel, Schlange. Reittier: Nandi (Stier)."},
  {"id":"preset-hindu-g7","term":"Parvati","translation":"Göttin der Liebe und der Kraft. Shivas Partnerin."},
  {"id":"preset-hindu-g8","term":"Shakti","translation":"Die göttliche weibliche Energie und Kraft der Göttinnen."},
  {"id":"preset-hindu-g9","term":"Trimurti","translation":"Die Dreiheit Brahma (Schöpfung), Vishnu (Erhaltung) und Shiva (Auflösung). Sie bilden einen Kreislauf."},
  {"id":"preset-hindu-g10","term":"Puja","translation":"Verehrung der Götter im Alltag: Opfergaben wie Blumen, Früchte, Licht und Wasser, meist im Tempel oder am Hausaltar, mit Gebeten."},
  {"id":"preset-hindu-g11","term":"Hinduismus ist vielfältig","translation":"Es gibt viele Gottesvorstellungen. Je nach Tradition ist Vishnu, Shiva oder eine Göttin die höchste Gottheit."}
 ]},
 {"id":"preset-hindu-purushartha","name":"Hinduismus: Die vier Purushartha","subject":"religion","folder":"preset-hindu","cards":[
  {"id":"preset-hindu-p0","term":"Dharma","translation":"Pflicht, rechtes Handeln und die Ordnung der Welt"},
  {"id":"preset-hindu-p1","term":"Artha","translation":"Besitz, Wohlstand, Erfolg und materielle Sicherheit"},
  {"id":"preset-hindu-p2","term":"Kama","translation":"Lust, Liebe, sinnlicher Genuss und Lebensfreude"},
  {"id":"preset-hindu-p3","term":"Moksha","translation":"Befreiung aus dem Kreislauf der Wiedergeburt, das höchste Ziel"}
 ]}
];

function addPresetDecks(data) {
  const deleted = data.deleted || {};
  PRESET_FOLDERS.forEach(f => {
    if (!deleted[f.id] && !data.folders.some(x => x.id === f.id)) data.folders.push({ ...f });
  });
  PRESET_DECKS.forEach(p => {
    const ex = data.decks.find(d => d.id === p.id);
    if (ex && p.id.startsWith('preset-voc-')) {
      p.cards.forEach(pc => { const c = (ex.cards || []).find(x => x.id === pc.id); if (c) { c.term = pc.term; c.translation = pc.translation; } });
      ex.cards = (ex.cards || []).filter(c => p.cards.some(pc => pc.id === c.id));
    }
    if (deleted[p.id] || ex) return;
    data.decks.push({
      id: p.id, name: p.name, subject: p.subject || 'geschichte', type: p.type || 'facts', sourceLang: p.sourceLang || 'de', targetLang: p.targetLang || 'de',
      folderId: deleted[p.folder || 'preset-frzrev'] ? null : (p.folder || 'preset-frzrev'),
      cards: p.cards.map(c => ({ ...c, masteryLevel: 0, box: 0 })),
      quiz: [], pages: [], createdAt: '2026-10-27T18:00:00.000Z'
    });
  });
}

// Nach dem Laden und nach jedem Cloud-Abgleich die fertigen Karteien ergänzen
const normalizeDataBase = normalizeData;
normalizeData = function (raw) {
  const data = normalizeDataBase(raw);
  addPresetDecks(data);
  return data;
};

// Englisch-Vokabeln aus dem Schulbuch (Unit 1 & 2), Anzeige in Handschrift
PRESET_FOLDERS.push({ id: 'preset-voc-englisch', name: 'Englisch Vokabeln (Unit 1–2)', color: '#2b7aaf', subject: 'englisch' });
PRESET_DECKS.push(
 {"id": "preset-voc-0", "name": "Unit 1 – Australia (S. 178–179)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-0-c0", "term": "region", "translation": "Region"}, {"id": "preset-voc-0-c1", "term": "bush", "translation": "Busch"}, {"id": "preset-voc-0-c2", "term": "coral", "translation": "Koralle"}, {"id": "preset-voc-0-c3", "term": "kangaroo", "translation": "Känguru"}, {"id": "preset-voc-0-c4", "term": "the outback", "translation": "das Hinterland Australiens"}, {"id": "preset-voc-0-c5", "term": "spider", "translation": "Spinne"}, {"id": "preset-voc-0-c6", "term": "coastal", "translation": "Küsten-"}, {"id": "preset-voc-0-c7", "term": "exotic", "translation": "exotisch"}, {"id": "preset-voc-0-c8", "term": "humid", "translation": "feucht"}, {"id": "preset-voc-0-c9", "term": "remote", "translation": "abgelegen"}, {"id": "preset-voc-0-c10", "term": "stunning", "translation": "atemberaubend"}, {"id": "preset-voc-0-c11", "term": "tropical", "translation": "tropisch"}, {"id": "preset-voc-0-c12", "term": "the tropics (pl)", "translation": "die Tropen"}, {"id": "preset-voc-0-c13", "term": "urban", "translation": "städtisch"}, {"id": "preset-voc-0-c14", "term": "Aboriginal", "translation": "Aborigine-"}, {"id": "preset-voc-0-c15", "term": "camel", "translation": "Kamel"}, {"id": "preset-voc-0-c16", "term": "convict", "translation": "Sträfling"}, {"id": "preset-voc-0-c17", "term": "koala", "translation": "Koala"}, {"id": "preset-voc-0-c18", "term": "poisonous", "translation": "giftig"}, {"id": "preset-voc-0-c19", "term": "exchange", "translation": "Austausch"}, {"id": "preset-voc-0-c20", "term": "flight", "translation": "Flug"}, {"id": "preset-voc-0-c21", "term": "lively", "translation": "lebendig"}, {"id": "preset-voc-0-c22", "term": "historical", "translation": "historisch"}, {"id": "preset-voc-0-c23", "term": "quarter", "translation": "Viertel"}, {"id": "preset-voc-0-c24", "term": "(to) settle", "translation": "sich niederlassen"}, {"id": "preset-voc-0-c25", "term": "trendy", "translation": "modisch"}, {"id": "preset-voc-0-c26", "term": "business", "translation": "Geschäft"}, {"id": "preset-voc-0-c27", "term": "district", "translation": "Gegend"}, {"id": "preset-voc-0-c28", "term": "flying fox", "translation": "Flughund"}, {"id": "preset-voc-0-c29", "term": "fox", "translation": "Fuchs"}, {"id": "preset-voc-0-c30", "term": "opera", "translation": "Oper"}, {"id": "preset-voc-0-c31", "term": "quay", "translation": "Kai"}, {"id": "preset-voc-0-c32", "term": "a half-hour ride", "translation": "eine halbstündige Fahrt"}, {"id": "preset-voc-0-c33", "term": "waterfront", "translation": "Hafenviertel"}, {"id": "preset-voc-0-c34", "term": "(to) guide", "translation": "führen"}, {"id": "preset-voc-0-c35", "term": "honest", "translation": "ehrlich"}, {"id": "preset-voc-0-c36", "term": "take (on sth.)", "translation": "Einstellung"}, {"id": "preset-voc-0-c37", "term": "(to) catch a bus/ferry/…", "translation": "einen Bus/eine Fähre nehmen"}, {"id": "preset-voc-0-c38", "term": "scenic", "translation": "schön"}, {"id": "preset-voc-0-c39", "term": "(to) transform", "translation": "verwandeln"}, {"id": "preset-voc-0-c40", "term": "landmark", "translation": "Wahrzeichen"}, {"id": "preset-voc-0-c41", "term": "paradise", "translation": "Paradies"}]},
 {"id": "preset-voc-1", "name": "Unit 1 (S. 180–181)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-1-c0", "term": "bay", "translation": "Bucht"}, {"id": "preset-voc-1-c1", "term": "back then", "translation": "damals"}, {"id": "preset-voc-1-c2", "term": "Aussie (infml)", "translation": "Australier/in"}, {"id": "preset-voc-1-c3", "term": "barbecue", "translation": "Grill"}, {"id": "preset-voc-1-c4", "term": "board", "translation": "Surfbrett"}, {"id": "preset-voc-1-c5", "term": "(to) swallow", "translation": "schlucken"}, {"id": "preset-voc-1-c6", "term": "ton", "translation": "Tonne"}, {"id": "preset-voc-1-c7", "term": "private", "translation": "privat"}, {"id": "preset-voc-1-c8", "term": "(to) accept", "translation": "akzeptieren"}, {"id": "preset-voc-1-c9", "term": "talkative", "translation": "gesprächig"}, {"id": "preset-voc-1-c10", "term": "photography", "translation": "Fotografie"}, {"id": "preset-voc-1-c11", "term": "in the end", "translation": "schließlich"}, {"id": "preset-voc-1-c12", "term": "(to) be/get homesick", "translation": "Heimweh haben/bekommen"}, {"id": "preset-voc-1-c13", "term": "Christmas Eve", "translation": "Heiligabend"}, {"id": "preset-voc-1-c14", "term": "self-confident", "translation": "selbstbewusst"}, {"id": "preset-voc-1-c15", "term": "easy-going", "translation": "locker"}, {"id": "preset-voc-1-c16", "term": "the very first/last/best …", "translation": "der/die/das allererste/allerletzte/allerbeste …"}, {"id": "preset-voc-1-c17", "term": "though", "translation": "obwohl"}, {"id": "preset-voc-1-c18", "term": "sunscreen", "translation": "Sonnenschutzmittel"}, {"id": "preset-voc-1-c19", "term": "No worries, mate.", "translation": "Kein Problem!"}, {"id": "preset-voc-1-c20", "term": "mate (infml)", "translation": "Kumpel"}, {"id": "preset-voc-1-c21", "term": "(to) argue", "translation": "argumentieren"}, {"id": "preset-voc-1-c22", "term": "argument", "translation": "Argument"}, {"id": "preset-voc-1-c23", "term": "argumentative", "translation": "argumentativ"}, {"id": "preset-voc-1-c24", "term": "(to) brainstorm", "translation": "brainstormen"}, {"id": "preset-voc-1-c25", "term": "(to) oppose sth.", "translation": "etwas ablehnen"}, {"id": "preset-voc-1-c26", "term": "(to) state sth.", "translation": "etwas äußern"}, {"id": "preset-voc-1-c27", "term": "abroad", "translation": "im/ins"}, {"id": "preset-voc-1-c28", "term": "in addition to …", "translation": "neben …"}, {"id": "preset-voc-1-c29", "term": "personally", "translation": "persönlich"}, {"id": "preset-voc-1-c30", "term": "(to) discuss sth.", "translation": "über etwas diskutieren"}, {"id": "preset-voc-1-c31", "term": "furthermore", "translation": "außerdem"}, {"id": "preset-voc-1-c32", "term": "in my view", "translation": "meiner Ansicht nach"}, {"id": "preset-voc-1-c33", "term": "On the one hand, … / On the other hand, …", "translation": "Einerseits … / Andererseits …"}, {"id": "preset-voc-1-c34", "term": "(to) take a different view", "translation": "einen anderen Standpunkt vertreten"}, {"id": "preset-voc-1-c35", "term": "advantage", "translation": "Vorteil"}, {"id": "preset-voc-1-c36", "term": "comparison", "translation": "Vergleich"}]},
 {"id": "preset-voc-2", "name": "Unit 1 Part B (S. 182–183)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-2-c0", "term": "To start with, … / To begin with, …", "translation": "Erstens …; Zunächst …"}, {"id": "preset-voc-2-c1", "term": "Firstly, …", "translation": "Erstens …"}, {"id": "preset-voc-2-c2", "term": "Secondly, …", "translation": "Zweitens …"}, {"id": "preset-voc-2-c3", "term": "Thirdly, …", "translation": "Drittens …"}, {"id": "preset-voc-2-c4", "term": "reef", "translation": "Riff"}, {"id": "preset-voc-2-c5", "term": "(to) flood", "translation": "überfluten"}, {"id": "preset-voc-2-c6", "term": "(to) be determined to do sth.", "translation": "entschlossen sein"}, {"id": "preset-voc-2-c7", "term": "insect", "translation": "Insekt"}, {"id": "preset-voc-2-c8", "term": "python", "translation": "Python"}, {"id": "preset-voc-2-c9", "term": "luckily", "translation": "glücklicherweise"}, {"id": "preset-voc-2-c10", "term": "(to) prefer sth. (to sth.)", "translation": "etwas vorziehen"}, {"id": "preset-voc-2-c11", "term": "human", "translation": "Mensch"}, {"id": "preset-voc-2-c12", "term": "mainly", "translation": "hauptsächlich"}, {"id": "preset-voc-2-c13", "term": "(to) provoke", "translation": "provozieren"}, {"id": "preset-voc-2-c14", "term": "(to) injure sb.", "translation": "jn. verletzen"}, {"id": "preset-voc-2-c15", "term": "moth", "translation": "Nachtfalter"}, {"id": "preset-voc-2-c16", "term": "crocodile", "translation": "Krokodil"}, {"id": "preset-voc-2-c17", "term": "(to) bump into sb. (infml)", "translation": "jn. zufällig treffen"}, {"id": "preset-voc-2-c18", "term": "(to) snorkel", "translation": "schnorcheln"}, {"id": "preset-voc-2-c19", "term": "greenhouse", "translation": "Gewächshaus"}, {"id": "preset-voc-2-c20", "term": "coastline", "translation": "Küste"}, {"id": "preset-voc-2-c21", "term": "dramatic", "translation": "dramatisch"}, {"id": "preset-voc-2-c22", "term": "facilities (pl)", "translation": "Einrichtungen"}, {"id": "preset-voc-2-c23", "term": "overcrowded", "translation": "überfüllt"}, {"id": "preset-voc-2-c24", "term": "rural", "translation": "ländlich"}, {"id": "preset-voc-2-c25", "term": "suburban", "translation": "Vorort-"}, {"id": "preset-voc-2-c26", "term": "vast", "translation": "riesig"}, {"id": "preset-voc-2-c27", "term": "inland", "translation": "Binnen-"}, {"id": "preset-voc-2-c28", "term": "mild", "translation": "mild"}, {"id": "preset-voc-2-c29", "term": "mountainous", "translation": "bergig"}, {"id": "preset-voc-2-c30", "term": "old-fashioned", "translation": "altmodisch"}, {"id": "preset-voc-2-c31", "term": "flat", "translation": "flach"}, {"id": "preset-voc-2-c32", "term": "descriptive", "translation": "beschreibend"}, {"id": "preset-voc-2-c33", "term": "collocation", "translation": "Kollokation"}, {"id": "preset-voc-2-c34", "term": "(to) disagree (with)", "translation": "anderer Meinung sein"}, {"id": "preset-voc-2-c35", "term": "rude", "translation": "unhöflich"}, {"id": "preset-voc-2-c36", "term": "hurtful", "translation": "verletzend"}, {"id": "preset-voc-2-c37", "term": "nonsense", "translation": "Unsinn"}, {"id": "preset-voc-2-c38", "term": "(to) share sth.", "translation": "etwas teilen"}, {"id": "preset-voc-2-c39", "term": "totally", "translation": "völlig"}, {"id": "preset-voc-2-c40", "term": "I'm afraid …", "translation": "Leider …"}]},
 {"id": "preset-voc-3", "name": "Unit 1 Part C (S. 184–185)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-3-c0", "term": "(to) have a point", "translation": "nicht ganz Unrecht haben"}, {"id": "preset-voc-3-c1", "term": "gift voucher", "translation": "Geschenkgutschein"}, {"id": "preset-voc-3-c2", "term": "sort (of)", "translation": "Art"}, {"id": "preset-voc-3-c3", "term": "painting", "translation": "Gemälde"}, {"id": "preset-voc-3-c4", "term": "soccer", "translation": "Fußball"}, {"id": "preset-voc-3-c5", "term": "(to) dig (for sth.)", "translation": "graben"}, {"id": "preset-voc-3-c6", "term": "opportunity", "translation": "Gelegenheit"}, {"id": "preset-voc-3-c7", "term": "work experience (no pl)", "translation": "Praktikum"}, {"id": "preset-voc-3-c8", "term": "health", "translation": "Gesundheit"}, {"id": "preset-voc-3-c9", "term": "clinic", "translation": "Klinik"}, {"id": "preset-voc-3-c10", "term": "patient", "translation": "Patient/in"}, {"id": "preset-voc-3-c11", "term": "(to) debate sth.", "translation": "über etwas debattieren"}, {"id": "preset-voc-3-c12", "term": "racism", "translation": "Rassismus"}, {"id": "preset-voc-3-c13", "term": "racist", "translation": "Rassist/in"}, {"id": "preset-voc-3-c14", "term": "professional", "translation": "professionell"}, {"id": "preset-voc-3-c15", "term": "swan", "translation": "Schwan"}, {"id": "preset-voc-3-c16", "term": "medal", "translation": "Medaille"}, {"id": "preset-voc-3-c17", "term": "award", "translation": "Preis"}, {"id": "preset-voc-3-c18", "term": "(to) stand up (for sth./sb.)", "translation": "eintreten/sich einsetzen"}, {"id": "preset-voc-3-c19", "term": "recognition", "translation": "Anerkennung"}, {"id": "preset-voc-3-c20", "term": "stand against sth.", "translation": "Haltung gegenüber etwas"}, {"id": "preset-voc-3-c21", "term": "(to) be named sth.", "translation": "zu etwas ernannt werden"}, {"id": "preset-voc-3-c22", "term": "(to) criticise sb. (for)", "translation": "jn. kritisieren"}, {"id": "preset-voc-3-c23", "term": "opposing", "translation": "gegnerisch"}, {"id": "preset-voc-3-c24", "term": "ape", "translation": "Menschenaffe"}, {"id": "preset-voc-3-c25", "term": "row", "translation": "Reihe"}, {"id": "preset-voc-3-c26", "term": "upset", "translation": "aufgebracht"}, {"id": "preset-voc-3-c27", "term": "victory", "translation": "Sieg"}, {"id": "preset-voc-3-c28", "term": "comment", "translation": "Bemerkung"}, {"id": "preset-voc-3-c29", "term": "innocent", "translation": "unschuldig"}, {"id": "preset-voc-3-c30", "term": "(to) put the blame (for sth.) on sb.", "translation": "jm. die Schuld geben"}, {"id": "preset-voc-3-c31", "term": "unfortunately", "translation": "leider"}, {"id": "preset-voc-3-c32", "term": "(to) bully sb.", "translation": "jn. tyrannisieren"}, {"id": "preset-voc-3-c33", "term": "appearance", "translation": "Erscheinung"}, {"id": "preset-voc-3-c34", "term": "industry", "translation": "Industrie"}, {"id": "preset-voc-3-c35", "term": "society", "translation": "Gesellschaft"}]},
 {"id": "preset-voc-4", "name": "Unit 2 Relationships (S. 186–187)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-4-c0", "term": "incident", "translation": "Vorfall"}, {"id": "preset-voc-4-c1", "term": "(to) boo", "translation": "buhen"}, {"id": "preset-voc-4-c2", "term": "achievement", "translation": "Errungenschaft"}, {"id": "preset-voc-4-c3", "term": "series, pl series", "translation": "Reihe"}, {"id": "preset-voc-4-c4", "term": "setting", "translation": "Schauplatz"}, {"id": "preset-voc-4-c5", "term": "photographer", "translation": "Fotograf/in"}, {"id": "preset-voc-4-c6", "term": "novel", "translation": "Roman"}, {"id": "preset-voc-4-c7", "term": "I reckon …", "translation": "Ich schätze …"}, {"id": "preset-voc-4-c8", "term": "promise", "translation": "Versprechen"}, {"id": "preset-voc-4-c9", "term": "salty", "translation": "salzig"}, {"id": "preset-voc-4-c10", "term": "(to) treat", "translation": "behandeln"}, {"id": "preset-voc-4-c11", "term": "haircut", "translation": "Haarschnitt"}, {"id": "preset-voc-4-c12", "term": "That's fine by me.", "translation": "Das soll mir recht sein."}, {"id": "preset-voc-4-c13", "term": "(to) vote (for sb./sth.)", "translation": "stimmen"}, {"id": "preset-voc-4-c14", "term": "elections (pl)", "translation": "Wahlen"}, {"id": "preset-voc-4-c15", "term": "subject", "translation": "Thema"}, {"id": "preset-voc-4-c16", "term": "politics", "translation": "Politik"}, {"id": "preset-voc-4-c17", "term": "sensitive", "translation": "empfindlich"}, {"id": "preset-voc-4-c18", "term": "issue", "translation": "Thema"}, {"id": "preset-voc-4-c19", "term": "once (conj)", "translation": "sobald"}, {"id": "preset-voc-4-c20", "term": "waste", "translation": "Verschwendung"}, {"id": "preset-voc-4-c21", "term": "tree trunk", "translation": "Baumstamm"}, {"id": "preset-voc-4-c22", "term": "chin", "translation": "Kinn"}, {"id": "preset-voc-4-c23", "term": "(to) tear, tore, torn", "translation": "reißen"}, {"id": "preset-voc-4-c24", "term": "key", "translation": "Taste"}, {"id": "preset-voc-4-c25", "term": "(to) shake, shook, shaken", "translation": "zittern"}, {"id": "preset-voc-4-c26", "term": "first aid", "translation": "Erste Hilfe"}, {"id": "preset-voc-4-c27", "term": "(to) breathe", "translation": "atmen"}, {"id": "preset-voc-4-c28", "term": "skin", "translation": "Haut"}, {"id": "preset-voc-4-c29", "term": "cheek", "translation": "Wange"}, {"id": "preset-voc-4-c30", "term": "pulse", "translation": "Puls"}, {"id": "preset-voc-4-c31", "term": "brain", "translation": "Gehirn"}, {"id": "preset-voc-4-c32", "term": "oxygen", "translation": "Sauerstoff"}, {"id": "preset-voc-4-c33", "term": "distant", "translation": "entfernt"}, {"id": "preset-voc-4-c34", "term": "(to) sink, sank, sunk", "translation": "sinken"}, {"id": "preset-voc-4-c35", "term": "intelligent", "translation": "intelligent"}, {"id": "preset-voc-4-c36", "term": "occasionally", "translation": "gelegentlich"}, {"id": "preset-voc-4-c37", "term": "dreamy", "translation": "verträumt"}, {"id": "preset-voc-4-c38", "term": "immigrant", "translation": "Einwanderer/Einwanderin"}, {"id": "preset-voc-4-c39", "term": "university", "translation": "Universität"}]},
 {"id": "preset-voc-5", "name": "Unit 2 (S. 188–189)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-5-c0", "term": "soap", "translation": "Seife"}, {"id": "preset-voc-5-c1", "term": "deodorant", "translation": "Deodorant"}, {"id": "preset-voc-5-c2", "term": "toothbrush", "translation": "Zahnbürste"}, {"id": "preset-voc-5-c3", "term": "toothpaste", "translation": "Zahnpasta"}, {"id": "preset-voc-5-c4", "term": "fridge", "translation": "Kühlschrank"}, {"id": "preset-voc-5-c5", "term": "can", "translation": "Dose"}, {"id": "preset-voc-5-c6", "term": "pretty", "translation": "ziemlich"}, {"id": "preset-voc-5-c7", "term": "anyway", "translation": "jedenfalls"}, {"id": "preset-voc-5-c8", "term": "familiar", "translation": "vertraut"}, {"id": "preset-voc-5-c9", "term": "awkward", "translation": "peinlich"}, {"id": "preset-voc-5-c10", "term": "next door (adv)", "translation": "nebenan"}, {"id": "preset-voc-5-c11", "term": "muscle", "translation": "Muskel"}, {"id": "preset-voc-5-c12", "term": "hand", "translation": "Uhrzeiger"}, {"id": "preset-voc-5-c13", "term": "(to) mean to do sth.", "translation": "etwas wollen"}, {"id": "preset-voc-5-c14", "term": "because of (prep)", "translation": "wegen"}, {"id": "preset-voc-5-c15", "term": "serious", "translation": "ernst"}, {"id": "preset-voc-5-c16", "term": "first-person narrative", "translation": "Ich-Erzählung"}, {"id": "preset-voc-5-c17", "term": "request", "translation": "Bitte"}, {"id": "preset-voc-5-c18", "term": "informal", "translation": "informell"}, {"id": "preset-voc-5-c19", "term": "(to) be attracted to sb.", "translation": "sich zu jm. hingezogen fühlen"}, {"id": "preset-voc-5-c20", "term": "(to) be seeing sb.", "translation": "mit jm. zusammen sein"}, {"id": "preset-voc-5-c21", "term": "(to) fall in love (with sb.)", "translation": "sich verlieben"}, {"id": "preset-voc-5-c22", "term": "(to) date sb.", "translation": "mit jm. gehen"}, {"id": "preset-voc-5-c23", "term": "(to) break up (with sb.)", "translation": "Schluss machen"}, {"id": "preset-voc-5-c24", "term": "(to) get to know sb.", "translation": "jn. kennenlernen"}, {"id": "preset-voc-5-c25", "term": "annoyed (with sb./about sth.)", "translation": "verärgert"}, {"id": "preset-voc-5-c26", "term": "confused", "translation": "verwirrt"}, {"id": "preset-voc-5-c27", "term": "cross (with sb.)", "translation": "böse"}, {"id": "preset-voc-5-c28", "term": "frightened", "translation": "verängstigt"}, {"id": "preset-voc-5-c29", "term": "hopeful", "translation": "zuversichtlich"}, {"id": "preset-voc-5-c30", "term": "hopefully", "translation": "hoffnungsvoll"}, {"id": "preset-voc-5-c31", "term": "pessimistic", "translation": "pessimistisch"}, {"id": "preset-voc-5-c32", "term": "pleased", "translation": "froh"}, {"id": "preset-voc-5-c33", "term": "furious (with/at sb.)", "translation": "wütend"}, {"id": "preset-voc-5-c34", "term": "heartbroken", "translation": "todunglücklich"}, {"id": "preset-voc-5-c35", "term": "terrified", "translation": "entsetzt"}, {"id": "preset-voc-5-c36", "term": "thrilled", "translation": "begeistert"}]},
 {"id": "preset-voc-6", "name": "Unit 2 Part B (S. 190–191)", "subject": "englisch", "folder": "preset-voc-englisch", "type": "vocab", "sourceLang": "en", "targetLang": "de", "cards": [{"id": "preset-voc-6-c0", "term": "absolutely", "translation": "völlig"}, {"id": "preset-voc-6-c1", "term": "ex-", "translation": "Ex-"}, {"id": "preset-voc-6-c2", "term": "male", "translation": "männlich"}, {"id": "preset-voc-6-c3", "term": "female", "translation": "weiblich"}, {"id": "preset-voc-6-c4", "term": "acquaintance", "translation": "Bekannte"}, {"id": "preset-voc-6-c5", "term": "(to) enter sth.", "translation": "etwas eingeben"}, {"id": "preset-voc-6-c6", "term": "password", "translation": "Passwort"}, {"id": "preset-voc-6-c7", "term": "(to) update sth.", "translation": "etwas aktualisieren"}, {"id": "preset-voc-6-c8", "term": "status", "translation": "Status"}, {"id": "preset-voc-6-c9", "term": "account", "translation": "Account"}, {"id": "preset-voc-6-c10", "term": "murder", "translation": "Mord"}, {"id": "preset-voc-6-c11", "term": "(to) declare sth.", "translation": "etwas erklären"}, {"id": "preset-voc-6-c12", "term": "husband", "translation": "Ehemann"}, {"id": "preset-voc-6-c13", "term": "wife, pl wives", "translation": "Ehefrau"}, {"id": "preset-voc-6-c14", "term": "you ought to stop …", "translation": "du solltest aufhören"}, {"id": "preset-voc-6-c15", "term": "diet", "translation": "Ernährung"}, {"id": "preset-voc-6-c16", "term": "protein", "translation": "Protein"}, {"id": "preset-voc-6-c17", "term": "healthy", "translation": "gesund"}, {"id": "preset-voc-6-c18", "term": "(to) be supposed to do sth.", "translation": "etwas tun sollen"}, {"id": "preset-voc-6-c19", "term": "pasta (no pl)", "translation": "Nudeln"}, {"id": "preset-voc-6-c20", "term": "cultural", "translation": "kulturell"}, {"id": "preset-voc-6-c21", "term": "communication", "translation": "Kommunikation"}]}
);
