import * as THREE from 'three';

export class HighlightManager {
    constructor(stateManager, glowEffect) {
        this.stateManager = stateManager;
        this.glowEffect = glowEffect;
        this.highlightedObjects = new Set();
        
        // State-Änderungen abonnieren
        this.stateManager.subscribe(this.handleStateChange.bind(this));
    }

    handleStateChange(state) {
        this.updateHighlights(state);
    }

    updateHighlights(state) {
        const { hoveredObject, selectedObject } = state;
        
        // Alte Highlights entfernen
        this.clearUnusedHighlights(hoveredObject, selectedObject);

        // Neue Highlights anwenden
        if (selectedObject) {
            this.highlightSelectedObject(selectedObject);
        }

        if (hoveredObject && hoveredObject !== selectedObject) {
            this.highlightHoveredObject(hoveredObject);
        }
    }

    clearUnusedHighlights(hoveredObject, selectedObject) {
        for (const object of this.highlightedObjects) {
            if (object !== hoveredObject && object !== selectedObject) {
                this.removeHighlight(object);
                this.highlightedObjects.delete(object);
            }
        }
    }

    highlightHoveredObject(object) {
        if (!this.highlightedObjects.has(object)) {
            if (object.userData.type === 'node') {
                this.applyNodeHoverHighlight(object);
            } else if (object.userData.type === 'edge') {
                this.applyEdgeHoverHighlight(object);
            }
            this.highlightedObjects.add(object);
        }
    }

    highlightSelectedObject(object) {
        if (!this.highlightedObjects.has(object)) {
            this.glowEffect.applySelectionGlow(object);
            this.highlightedObjects.add(object);
        }
    }

    applyNodeHoverHighlight(node) {
        // Hellere Farbe für Hover-Effekt
        const color = node.material.color;
        const hsl = {};
        color.getHSL(hsl);
        
        // Helligkeit um 20% erhöhen, aber nicht über 1.0
        const newLightness = Math.min(hsl.l + 0.2, 1.0);
        color.setHSL(hsl.h, hsl.s, newLightness);

        // Leichter Glow-Effekt
        this.glowEffect.applyHighlightGlow(node);
    }

    applyEdgeHoverHighlight(edge) {
        // Hellerer Blauton für Hover-Effekt
        const color = new THREE.Color(0x4444ff);
        edge.material.color = color;

        // Leichter Glow-Effekt
        this.glowEffect.applyHighlightGlow(edge);
    }

    removeHighlight(object) {
        if (object.userData.type === 'node') {
            // Ursprüngliche Farbe wiederherstellen
            if (object.parent && object.parent.options) {
                object.material.color.setHex(object.parent.options.color);
            }
        } else if (object.userData.type === 'edge') {
            // Standard-Kantenfarbe wiederherstellen
            object.material.color.setHex(0x0000ff);
        }

        // Glow-Effekt entfernen
        this.glowEffect.removeGlow(object);
    }

    // Spezielle Highlight-Effekte
    highlightPath(objects) {
        objects.forEach(object => {
            if (!this.highlightedObjects.has(object)) {
                const intensity = 0.6;
                if (object.userData.type === 'node') {
                    this.glowEffect.applyNodeGlow(object, intensity, {
                        color: new THREE.Color(0, 1, 1), // Cyan
                        baseIntensity: 0.3,
                        maxIntensity: 0.8
                    });
                } else if (object.userData.type === 'edge') {
                    this.glowEffect.applyEdgeGlow(object, intensity, {
                        hue: 0.5, // Cyan-Bereich
                        saturation: 0.8,
                        baseIntensity: 0.3,
                        maxIntensity: 0.7
                    });
                }
                this.highlightedObjects.add(object);
            }
        });
    }

    highlightGroup(objects, color) {
        objects.forEach(object => {
            if (!this.highlightedObjects.has(object)) {
                const intensity = 0.5;
                if (object.userData.type === 'node') {
                    this.glowEffect.applyNodeGlow(object, intensity, {
                        color: new THREE.Color(color),
                        baseIntensity: 0.2,
                        maxIntensity: 0.7
                    });
                } else if (object.userData.type === 'edge') {
                    const hsl = {};
                    new THREE.Color(color).getHSL(hsl);
                    this.glowEffect.applyEdgeGlow(object, intensity, {
                        hue: hsl.h,
                        saturation: hsl.s,
                        baseIntensity: 0.2,
                        maxIntensity: 0.6
                    });
                }
                this.highlightedObjects.add(object);
            }
        });
    }

    clearAllHighlights() {
        this.highlightedObjects.forEach(object => {
            this.removeHighlight(object);
        });
        this.highlightedObjects.clear();
    }

    destroy() {
        this.clearAllHighlights();
    }
}
