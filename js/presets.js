// Fertige Karteien zur Französischen Revolution (Geschichte), plus Karteien zu den Hefteinträgen aus dem Unterricht.
// Werden einmal angelegt. Gelöschte Karteien kommen nicht zurück.

const PRESET_FOLDERS = [
  { id: 'preset-frzrev', name: 'Französische Revolution', color: '#b7791f', subject: 'geschichte' },
  { id: 'preset-heft', name: 'Frz. Revolution – Unterricht (Heft)', color: '#2b7aaf', subject: 'geschichte' }
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
 ]}
];

function addPresetDecks(data) {
  const deleted = data.deleted || {};
  PRESET_FOLDERS.forEach(f => {
    if (!deleted[f.id] && !data.folders.some(x => x.id === f.id)) data.folders.push({ ...f });
  });
  PRESET_DECKS.forEach(p => {
    if (deleted[p.id] || data.decks.some(d => d.id === p.id)) return;
    data.decks.push({
      id: p.id, name: p.name, subject: 'geschichte', type: 'facts', sourceLang: 'de', targetLang: 'de',
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
