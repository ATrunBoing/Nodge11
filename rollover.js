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
        // Event-Listener
        this.renderer.domElement.addEventListener('mousemove', this.onMouseMove.bind(this), false);
        // this.renderer.domElement.addEventListener('mouseout', this.onMouseOut.bind(this), false);

        // Animation starten
        this.animate();
    }

    onMouseMove(event) {
        console.log("onMouseMove called");
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Filter scene children to only include Nodes and Edges
        const interactiveObjects = this.scene.children.filter(child => child.userData.type === 'node' || child.userData.type === 'edge');

        let intersects = this.raycaster.intersectObjects(interactiveObjects, true);


         if (intersects.length > 0) {
            const firstIntersected = intersects[0].object;
            // console.log(firstIntersected);
            let nodeMesh = firstIntersected.userData.type === 'node' ? firstIntersected : null;
            let edgeLine = firstIntersected.userData.type === 'edge' ? firstIntersected : null;


            if (nodeMesh) {
                if (this.hoveredObject !== nodeMesh) {
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                    }
                    this.hoveredObject = nodeMesh;
                    this.applyHighlight(this.hoveredObject);
                    console.log("Hover Node");
                }
            } else if (edgeLine) {
                 if (this.hoveredObject !== edgeLine) {
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                    }
                    this.hoveredObject = edgeLine;
                    this.applyHighlight(this.hoveredObject);
                    console.log("Hover Edge");
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
        console.log("mouseOut");
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
