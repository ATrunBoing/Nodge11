# Bericht zur Nodges Webanwendung

## Beschreibung der Webseite aus Anwendersicht

Die Webseite "Nodges 0.49" dient der Visualisierung von Netzwerken in 3D. Der Benutzer kann verschiedene vordefinierte Netzwerke über Buttons auswählen (Mini, Klein, Mittel, Groß, Mega, Familie, Julio Iglesias). Die Netzwerke werden als Knoten und Kanten in einem 3D-Raum dargestellt. Der Benutzer kann die Ansicht mit der Maus drehen und zoomen (dank OrbitControls). Ein Info-Panel zeigt Details zu ausgewählten Elementen an (diese Funktionalität ist in `rollover.js` implementiert, muss aber noch genauer untersucht werden). Die Anwendung wirkt interaktiv und reaktionsschnell.

## Beschreibung der Webseite aus technischer Sicht

Die Webseite basiert auf HTML, CSS und JavaScript. Die 3D-Visualisierung wird mit der Three.js-Bibliothek realisiert, die über eine Importmap in `index.html` eingebunden wird. Es gibt keine weiteren Abhängigkeiten, die in einer `package.json` Datei definiert sind.

**Dateistruktur:**

*   **`index.html`:** Die Haupt-HTML-Datei, die die Struktur der Seite definiert, Stylesheets und Skripte einbindet und die Buttons für die Netzwerkauswahl enthält.
*   **`main.js`:** Die Haupt-JavaScript-Datei, die die Three.js-Szene, Kamera, Renderer, Beleuchtung, Steuerung (OrbitControls) und die Logik zum Laden und Anzeigen der Netzwerke initialisiert. Sie verwendet Klassen für Knoten (`Node`), Kanten (`Edge`) und verschiedene Manager-Klassen.
*   **`data.js`:** Verantwortlich für das Laden und Verarbeiten der Netzwerkdaten aus JSON-Dateien. Definiert Funktionen zum Erstellen von Knoten (`createNodes`) und Kanten (`createEdgeDefinitions`) aus den JSON-Daten.
*   **`data/`:** Verzeichnis, das die JSON-Dateien mit den Netzwerkdaten enthält (small.json, medium.json, large.json, mega.json, mini.json, family.json, julioIglesias.json).
*   **`objects/`:** Enthält die Klassen `Node.js` und `Edge.js`, die die visuellen Repräsentationen der Knoten und Kanten definieren.
*   **`src/`:** Enthält weitere Module, die in `main.js` importiert werden:
    *   `core/`: Enthält `EventManager.js`, `StateManager.js` und `UIManager.js`.
    *   `effects/`: Enthält `GlowEffect.js` und `HighlightManager.js`.
    *   `utils/`: Enthält `RaycastManager.js`.
*   **`rollover.js`:** Beinhaltet die Logik für das Anzeigen von Informationen, wenn der Mauszeiger über ein Element bewegt wird.
* **`colorscheme.css`:** Beinhaltet vermutlich das Farbschema.
* **`favicon-32x32.png`:** Das Favicon der Seite.

## Beschreibung der Architektur

Die Architektur der Anwendung ist modular aufgebaut. Die Verantwortlichkeiten sind klar getrennt:

*   **Daten:** `data.js` und die JSON-Dateien im `data/`-Verzeichnis.
*   **Kernlogik:** Die Klassen im `src/core/`-Verzeichnis (EventManager, StateManager, UIManager).
*   **Visuelle Effekte:** Die Klassen im `src/effects/`-Verzeichnis (GlowEffect, HighlightManager).
*   **Hilfsfunktionen:** `RaycastManager.js` im `src/utils/`-Verzeichnis.
*   **Objekte:** `Node.js` und `Edge.js` im `objects/`-Verzeichnis.
* **Interaktion:** `rollover.js`

**Vorteile:**

*   **Modularität:** Die klare Trennung von Verantwortlichkeiten erleichtert die Wartung und Erweiterbarkeit.
*   **Wiederverwendbarkeit:** Die Komponenten (Knoten, Kanten, Manager) können in anderen Projekten wiederverwendet werden.
*   **Three.js:** Die Verwendung von Three.js ermöglicht eine leistungsstarke 3D-Visualisierung.
*   **OrbitControls:** Die einfache Kamerasteuerung verbessert die Benutzerfreundlichkeit.

**Nachteile:**

*   **Fehlende `package.json`:** Das Fehlen einer `package.json` erschwert das Management von Abhängigkeiten und die Reproduzierbarkeit der Entwicklungsumgebung.
* **Globale Variable `allNodes`:** Die Verwendung einer globalen Variable in `data.js` kann zu unerwarteten Seiteneffekten führen.
* **Möglicherweise fehlende Fehlerbehandlung:** Die Fehlerbehandlung in `loadNetworkData` ist rudimentär.

**Eigenheiten:**

*   Die Anwendung verwendet eine Importmap anstelle eines Bundlers (wie Webpack oder Parcel).
*   Die Daten werden direkt aus JSON-Dateien geladen, ohne eine Datenbank oder ein Backend zu verwenden.

**Entwicklungsmöglichkeiten:**

*   **Hinzufügen einer `package.json`:** Dies würde das Projektmanagement verbessern.
*   **Entfernen der globalen Variable `allNodes`:** Stattdessen könnte `createNodes` die Knoten direkt zurückgeben.
*   **Verbesserung der Fehlerbehandlung:** Detailliertere Fehlermeldungen und Wiederherstellungsmechanismen.
*   **Backend:** Ein Backend könnte hinzugefügt werden, um Daten dynamisch zu laden und zu speichern.
*   **Datenbank:** Eine Datenbank könnte verwendet werden, um größere Datenmengen zu verwalten.
*   **Benutzeroberfläche:** Die Benutzeroberfläche könnte erweitert werden, um mehr Interaktionsmöglichkeiten zu bieten (z.B. Filterung, Suche).
* **Tests:** Unit-Tests und Integrationstests könnten hinzugefügt werden, um die Qualität des Codes sicherzustellen.

## Zusätzliche Beschreibung der Architektur für KI

Die Anwendung visualisiert Netzwerke, die aus Knoten und Kanten bestehen. Die Daten für die Netzwerke werden aus JSON-Dateien geladen. Jede JSON-Datei enthält ein Array von Knoten (entweder `members` oder `nodes`) und ein Array von Kanten (`edges`).

**Knoten:**

Jeder Knoten hat eine Position (x, y, z-Koordinaten) und einen Namen.

**Kanten:**

Jede Kante verbindet zwei Knoten (Start- und Endknoten, angegeben durch ihre Indizes im Knoten-Array). Kanten können einen Offset haben, um gebogene Linien zu erzeugen. Sie haben auch einen Typ (`name`).

**Datenfluss:**

1.  Der Benutzer wählt ein Netzwerk über einen Button aus.
2.  Die `loadNetwork`-Funktion in `main.js` wird aufgerufen.
3.  `loadNetwork` ruft `createNodes` und `createEdgeDefinitions` in `data.js` auf.
4.  `createNodes` und `createEdgeDefinitions` laden die JSON-Daten und erstellen Three.js-Objekte (Vektoren für Knoten, Objekte für Kanten).
5.  `loadNetwork` erstellt `Node`- und `Edge`-Objekte und fügt sie der Szene hinzu.
6.  Die Szene wird gerendert.

**Flowchart-Darstellung (Textuell):**

```
[Benutzer] --klickt auf Button--> [loadNetwork(filename)]
  |
  V
[createNodes(filename)] --lädt--> [JSON-Datei] --extrahiert--> [Knoten-Daten] --erstellt--> [THREE.Vector3[]]
  |
  V
[createEdgeDefinitions(filename, nodes)] --lädt--> [JSON-Datei] --extrahiert--> [Kanten-Daten] --findet--> [Start- und Endknoten] --erstellt--> [Kantendefinitionen]
  |
  V
[loadNetwork] --erstellt--> [Node-Objekte] --fügt hinzu--> [Szene]
  |
  V
[loadNetwork] --erstellt--> [Edge-Objekte] --fügt hinzu--> [Szene]
  |
  V
[Renderer] --rendert--> [Szene]
