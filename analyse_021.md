# Analyse der Maus-Interaktionen und Wertveränderungen

## 1. Hover-Events

### Wenn Mauszeiger über ein Objekt bewegt wird:

#### StateManager Änderungen:
- `hoveredObject`: → aktuelles Objekt
- `tooltipVisible`: → true (nur wenn kein Objekt ausgewählt ist)
- `tooltipContent`: → Basis-Informationen
- `tooltipPosition`: → aktuelle Mausposition {x, y}

### Wenn Mauszeiger das Objekt verlässt:

#### StateManager Änderungen:
- `hoveredObject`: → null
- `tooltipVisible`: → false (nur wenn kein Objekt ausgewählt ist)

## 2. Klick-Events

### Erster Klick auf ein Objekt:

#### StateManager Änderungen:
- `selectedObject`: → geklicktes Objekt
- `tooltipVisible`: → true
- `tooltipContent`: → detaillierte Informationen
- `tooltipPosition`: → Klickposition {x, y}

#### Animations-States:
- `glowIntensity`: → 0 (Start)
- `glowDirection`: → 1 (aufwärts)
- `glowFrequency`: → aus Objektoptionen (Nodes: Standard 4)

### Zweiter Klick auf ausgewähltes Objekt:

#### StateManager Änderungen:
- `selectedObject`: → null
- `tooltipVisible`: → false
- Glow-Effekte werden deaktiviert

## 3. Objekt-spezifische Werte

### Nodes:
```javascript
{
    originalColor: 0xff4500,  // Wird für Reset gespeichert
    position: Vector3,        // Bleibt unverändert
    options: {
        type: 'cube',        // Geometrieform
        size: 1,             // Grundgröße
        color: 0xff4500,     // Aktuelle Farbe
        glowFrequency: 4     // Pulsgeschwindigkeit
    }
}
```

### Edges:
```javascript
{
    options: {
        color: 0x0000ff,     // Standardfarbe: Blau
        width: 3,            // Liniendicke
        style: 'solid',      // solid/dashed/dotted
        curveHeight: 2,      // Kurvenwölbung
        segments: 50,        // Kurvensegmente
        dashSize: 0.5,       // Für gestrichelte Linien
        gapSize: 0.3        // Für gestrichelte Linien
    },
    startNode: Node,         // Verbindungsreferenz
    endNode: Node           // Verbindungsreferenz
}
```

## 4. Spezielle Effekte

### Glow-Animation (bei ausgewählten Objekten):
- Kontinuierliche Pulsierung zwischen 0 und 1
- Frequenz durch `glowFrequency` bestimmt
- Läuft bis zur Objekt-Abwahl
- Richtungswechsel bei Erreichen der Extremwerte

### Verbundene Objekte:
- Bei Node-Auswahl: Alle verbundenen Edges und Nodes werden hervorgehoben
- Speicherung in `activeEffects` (Set) im StateManager
- Automatische Aktualisierung bei Zustandsänderungen

## 5. Interaktionsfluss

1. **Hover-Start**:
   - Raycast erkennt Objekt
   - InteractionManager verarbeitet Event
   - StateManager aktualisiert Zustand
   - UI-Updates werden ausgelöst

2. **Hover-Ende**:
   - Raycast verliert Objekt
   - Zustand wird zurückgesetzt
   - UI wird aktualisiert

3. **Klick**:
   - Objekt wird selektiert/deselektiert
   - Tooltip wird aktualisiert
   - Glow-Animation startet/stoppt
   - Verbundene Objekte werden markiert/demarkiert

4. **Hintergrund-Klick**:
   - Alle Selektionen werden aufgehoben
   - UI wird zurückgesetzt
   - Effekte werden deaktiviert
