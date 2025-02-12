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

		this.hoverAreaSize = 5; // Größe der Hover-Area um das Objekt
		this.hoverArea = null; // Mesh für die Hover-Area

        // Event-Listener
        // Event-Listener
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
		this.renderer.domElement.addEventListener('click', this.onSceneClick.bind(this), false);

        // Animation starten
        this.animate();

        // Event-Listener für das Info-Panel
        document.getElementById('infoPanel').addEventListener('click', this.onInfoPanelClick.bind(this));

		// Erstelle die Hover-Area (als sichtbarer Quader zur Kontrolle)
		const geometry = new THREE.BoxGeometry( this.hoverAreaSize, this.hoverAreaSize, this.hoverAreaSize );
		const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
		this.hoverArea = new THREE.Mesh( geometry, material );
		this.hoverArea.visible = true; // Sichtbar zur Kontrolle, später auf false setzen
		this.scene.add( this.hoverArea );
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
        this.raycastManager.updateMousePosition(event);
        const intersectedObject = this.raycastManager.findIntersectedObject();

        if (intersectedObject) {
            if (this.hoveredObject !== intersectedObject) {
                if (this.hoveredObject) {
                    this.resetHighlight(this.hoveredObject);
                }
                this.hoveredObject = intersectedObject;
                this.applyHighlight(intersectedObject);
                this.showInfoPanel(intersectedObject, event);

				// Positioniere die Hover-Area um das Objekt
				this.hoverArea.position.copy(intersectedObject.position);
            }
        } else {
            if (this.hoveredObject) {
				// Überprüfe, ob die Maus innerhalb der Hover-Area ist
				const mouse = new THREE.Vector2();
				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera( mouse, this.camera );

				const intersects = raycaster.intersectObject( this.hoverArea );

				if (intersects.length > 0) {
					// Maus ist noch innerhalb der Hover-Area, also nichts tun
					return;
				}

                this.resetHighlight(this.hoveredObject);
                this.hideInfoPanel();
                this.hoveredObject = null;
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

        if (object.userData.type === 'node') {
            infoPanelTitle.textContent = object.name;
            infoPanelContent.innerHTML = `
                <strong>Type:</strong> ${object.geometry.type}<br>
                <strong>Position:</strong> ${object.position.x}, ${object.position.y}, ${object.position.z}
            `;
        } else if (object.userData.type === 'edge') {
            infoPanelTitle.textContent = object.name;
            infoPanelContent.innerHTML = `
                <strong>Start:</strong> ${object.userData.edge.startNode.mesh.name}<br>
                <strong>End:</strong> ${object.userData.edge.endNode.mesh.name}
            `;
        }

        infoPanel.style.left = (event.clientX) + 20 + 'px';
        infoPanel.style.top = (event.clientY) + 20 + 'px';
        infoPanel.style.display = 'block';
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
