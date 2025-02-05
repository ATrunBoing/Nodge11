import * as THREE from 'three';

export class Rollover {
    constructor(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null;
        this.glowIntensity = 0;
        this.glowDirection = 1;
        this.lastTime = performance.now();
        this.currentOpenObject = null; // Track the currently open object
        this.selectedObject = null; // Für den Glow-Effekt

        // Event-Listener
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        this.renderer.domElement.addEventListener('mouseout', this.onMouseOut.bind(this), false);

        // Animation starten
        this.animate();
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects(this.scene.children, true);

         if (intersects.length > 0) {
            const firstIntersected = intersects[0].object;
            let nodeMesh = firstIntersected.type === 'Mesh' && firstIntersected.parent.type === 'Node' ? firstIntersected.parent : null;
            let edgeLine = firstIntersected.type === 'Line' && firstIntersected.parent.type === 'Edge' ? firstIntersected.parent : null;


            if (nodeMesh) {
                if (this.hoveredObject !== nodeMesh) {
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                    }
                    this.hoveredObject = nodeMesh;
                    this.applyHighlight(this.hoveredObject);
                }
            } else if (edgeLine) {
                 if (this.hoveredObject !== edgeLine) {
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                    }
                    this.hoveredObject = edgeLine;
                    this.applyHighlight(this.hoveredObject);
                }
            }
             else {
                if (this.hoveredObject) {
                    this.resetHighlight(this.hoveredObject);
                    this.hoveredObject = null;
                }
            }
        } else {
            if (this.hoveredObject) {
                this.resetHighlight(this.hoveredObject);
                this.hoveredObject = null;
            }
        }
    }


    onMouseOut() {
        if (this.hoveredObject) {
            this.resetHighlight(this.hoveredObject);
            this.hoveredObject = null;
        }
    }

    applyHighlight(object) {
        if (object.type === 'Node') {
            object.applyGlow();
        } else if (object.type === 'Edge') {
            object.applyHighlight();
        }
    }

    resetHighlight(object) {
        if (object.type === 'Node') {
            object.resetGlow();
        } else if (object.type === 'Edge') {
            object.resetHighlight();
        }
    }

    animate() {
        requestAnimationFrame( this.animate.bind(this) );
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
