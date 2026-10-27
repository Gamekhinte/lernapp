// Fertige Karteien zur Französischen Revolution (Geschichte).
// Werden einmal angelegt. Gelöschte Karteien kommen nicht zurück.

const PRESET_FOLDERS = [{ id: 'preset-frzrev', name: 'Französische Revolution', color: '#b7791f', subject: 'geschichte' }];

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
      folderId: deleted['preset-frzrev'] ? null : 'preset-frzrev',
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
