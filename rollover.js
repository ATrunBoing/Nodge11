import * as THREE from 'three';
import { RaycastManager } from './src/utils/RaycastManager.js';

export class Rollover {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.raycastManager = new RaycastManager(camera, scene);
        this.hoveredObject = null;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.lastTime = performance.now();
        this.currentOpenObject = null;
        this.selectedObject = null;
        this.hoverTimeout = null;
        this.panelCloseTimeout = null;

        // Konfiguration
        this.hoverDelay = 100; // Verzögerung in ms bevor das Panel angezeigt wird
        this.panelCloseDelay = 500; // Verzögerung in ms bevor das Panel geschlossen wird
        this.hoverAreaSize = 5; // Größe der Hover-Area um das Objekt

        // Event-Listener
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.renderer.domElement.addEventListener('click', this.onSceneClick.bind(this), false);

        // Animation starten
        this.animate();

        // Event-Listener für das Info-Panel
        const infoPanel = document.getElementById('infoPanel');
        infoPanel.addEventListener('click', this.onInfoPanelClick.bind(this));
        infoPanel.addEventListener('mouseenter', () => {
            // Wenn die Maus über dem Panel ist, verhindern, dass es geschlossen wird
            if (this.panelCloseTimeout) {
                clearTimeout(this.panelCloseTimeout);
                this.panelCloseTimeout = null;
            }
        });
        infoPanel.addEventListener('mouseleave', () => {
            // Wenn die Maus das Panel verlässt, Panel mit Verzögerung schließen
            this.panelCloseTimeout = setTimeout(() => {
                this.hideInfoPanel();
            }, this.panelCloseDelay);
        });
    }

    onInfoPanelClick(event) {
        const infoPanelContent = document.getElementById('infoPanelContent');

		// KEINE Raycasting-Logik hier, da Klicks auf das Panel den Inhalt nicht schließen sollen
        
        if (infoPanelContent.style.display === 'none') {
            infoPanelContent.style.display = 'block';
        } else {
            infoPanelContent.style.display = 'none';
        }
    }

	onSceneClick(event) {
        this.raycastManager.updateMousePosition(event);
        const intersectedObject = this.raycastManager.findIntersectedObject();

        if (intersectedObject) {
			this.applyHighlight(intersectedObject);
			this.showInfoPanel(intersectedObject, event);
        }
    }

    onMouseMove(event) {
        // Aktualisiere die Mausposition im RaycastManager
        this.raycastManager.updateMousePosition(event);
        
        // Finde das Objekt unter dem Mauszeiger
        const intersectedObject = this.raycastManager.findIntersectedObject();

        // Prüfe, ob das Info-Panel die Maus enthält
        const infoPanel = document.getElementById('infoPanel');
        const rect = infoPanel.getBoundingClientRect();
        const isMouseOverPanel = (
            event.clientX >= rect.left && 
            event.clientX <= rect.right && 
            event.clientY >= rect.top && 
            event.clientY <= rect.bottom &&
            infoPanel.style.display !== 'none'
        );
        
        // Wenn die Maus über dem Panel ist, nichts tun
        if (isMouseOverPanel) {
            return;
        }

        // Wenn ein Objekt gefunden wurde
        if (intersectedObject) {
            // Wenn es ein neues Objekt ist
            if (this.hoveredObject !== intersectedObject) {
                // Entferne Highlight vom vorherigen Objekt
                if (this.hoveredObject) {
                    this.resetHighlight(this.hoveredObject);
                }
                
                // Setze das neue Objekt als hovered
                this.hoveredObject = intersectedObject;
                
                // Wende Highlight an
                this.applyHighlight(intersectedObject);
                
                // Zeige das Info-Panel mit Verzögerung
                if (this.hoverTimeout) {
                    clearTimeout(this.hoverTimeout);
                }
                
                this.hoverTimeout = setTimeout(() => {
                    this.showInfoPanel(intersectedObject, event);
                }, this.hoverDelay);
            } else {
                // Wenn es das gleiche Objekt ist, aktualisiere nur die Position des Panels
                const infoPanel = document.getElementById('infoPanel');
                if (infoPanel.style.display === 'block') {
                    infoPanel.style.left = (event.clientX) + 20 + 'px';
                    infoPanel.style.top = (event.clientY) + 20 + 'px';
                }
            }
        } else {
            // Wenn kein Objekt gefunden wurde und vorher eines markiert war
            if (this.hoveredObject) {
                // Entferne Highlight
                this.resetHighlight(this.hoveredObject);
                this.hoveredObject = null;
                
                // Schließe das Panel mit Verzögerung
                if (this.panelCloseTimeout) {
                    clearTimeout(this.panelCloseTimeout);
                }
                
                this.panelCloseTimeout = setTimeout(() => {
                    this.hideInfoPanel();
                }, this.panelCloseDelay);
                
                // Breche Hover-Timeout ab, falls vorhanden
                if (this.hoverTimeout) {
                    clearTimeout(this.hoverTimeout);
                    this.hoverTimeout = null;
                }
            }
        }
    }

   applyHighlight(object) {
        if (object.userData.type === 'node') {
            object.material.emissiveIntensity = 0.8;
            object.material.emissive.setHex(0xffa500);
        } else if (object.userData.type === 'edge') {
            const edge = object.userData.edge;
            edge.line.material.color.setHex(0xffa500);
            edge.line.material.linewidth = 3;
        }
    }

    resetHighlight(object) {
        if (object.userData.type === 'node') {
            object.material.emissiveIntensity = 0;
            object.material.emissive.setHex(0x000000);
        } else if (object.userData.type === 'edge') {
            const edge = object.userData.edge;
            edge.line.material.color.setHex(edge.options.color);
            edge.line.material.linewidth = 3;
        }
    }

    showInfoPanel(object, event) {
        const infoPanel = document.getElementById('infoPanel');
        const infoPanelTitle = document.getElementById('infoPanelTitle');
        const infoPanelContent = document.getElementById('infoPanelContent');

        try {
            if (object.userData.type === 'node') {
                // Für Knoten
                const nodeName = object.name || 'Unbenannter Knoten';
                infoPanelTitle.textContent = nodeName;
                
                // Sammle alle verfügbaren Metadaten
                let metadataHtml = '';
                
                // Geometrie-Typ
                if (object.geometry && object.geometry.type) {
                    metadataHtml += `<strong>Geometrie:</strong> ${object.geometry.type}<br>`;
                }
                
                // Position
                if (object.position) {
                    const x = object.position.x.toFixed(2);
                    const y = object.position.y.toFixed(2);
                    const z = object.position.z.toFixed(2);
                    metadataHtml += `<strong>Position:</strong> (${x}, ${y}, ${z})<br>`;
                }
                
                // Zusätzliche Metadaten aus dem ursprünglichen Knoten
                if (object.metadata) {
                    const excludeKeys = ['name', 'position', 'x', 'y', 'z'];
                    Object.entries(object.metadata).forEach(([key, value]) => {
                        if (!excludeKeys.includes(key) && value !== undefined && value !== null) {
                            // Formatiere Arrays und Objekte
                            let displayValue = value;
                            if (typeof value === 'object') {
                                displayValue = JSON.stringify(value);
                            }
                            metadataHtml += `<strong>${key}:</strong> ${displayValue}<br>`;
                        }
                    });
                }
                
                infoPanelContent.innerHTML = metadataHtml || 'Keine weiteren Informationen verfügbar';
                
            } else if (object.userData.type === 'edge') {
                // Für Kanten
                const edgeName = object.name || 'Unbenannte Kante';
                infoPanelTitle.textContent = edgeName;
                
                let edgeHtml = '';
                
                // Versuche, Start- und Endknoten zu ermitteln
                if (object.userData.edge) {
                    const edge = object.userData.edge;
                    
                    // Start-Knoten
                    if (edge.startNode && edge.startNode.mesh) {
                        const startName = edge.startNode.mesh.name || 'Unbenannter Startknoten';
                        edgeHtml += `<strong>Start:</strong> ${startName}<br>`;
                    }
                    
                    // End-Knoten
                    if (edge.endNode && edge.endNode.mesh) {
                        const endName = edge.endNode.mesh.name || 'Unbenannter Endknoten';
                        edgeHtml += `<strong>End:</strong> ${endName}<br>`;
                    }
                    
                    // Kantentyp
                    if (edge.options && edge.options.style) {
                        edgeHtml += `<strong>Stil:</strong> ${edge.options.style}<br>`;
                    }
                    
                    // Offset
                    if (edge.options && edge.options.offset !== undefined) {
                        edgeHtml += `<strong>Offset:</strong> ${edge.options.offset}<br>`;
                    }
                }
                
                infoPanelContent.innerHTML = edgeHtml || 'Keine weiteren Informationen verfügbar';
            }

            // Positioniere das Panel neben dem Mauszeiger
            infoPanel.style.left = (event.clientX) + 20 + 'px';
            infoPanel.style.top = (event.clientY) + 20 + 'px';
            infoPanel.style.display = 'block';
            
        } catch (error) {
            console.error('Fehler beim Anzeigen des Info-Panels:', error);
            
            // Zeige eine Fehlermeldung im Panel an
            infoPanelTitle.textContent = 'Fehler';
            infoPanelContent.innerHTML = `
                <strong>Fehler beim Anzeigen der Informationen:</strong><br>
                ${error.message}
            `;
            
            infoPanel.style.left = (event.clientX) + 20 + 'px';
            infoPanel.style.top = (event.clientY) + 20 + 'px';
            infoPanel.style.display = 'block';
        }
    }

    hideInfoPanel() {
        const infoPanel = document.getElementById('infoPanel');
        infoPanel.style.display = 'none';
    }

    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.render();
    }

    render() {
        // Animation und Rendering-Logik hier, falls benötigt
    }


    hideRollover() {
        if (this.currentOpenObject) {
            this.resetHighlight(this.currentOpenObject);
            this.currentOpenObject = null;
        }
        if (this.hoveredObject) {
            this.resetHighlight(this.hoveredObject);
            this.hoveredObject = null;
        }
    }
}
