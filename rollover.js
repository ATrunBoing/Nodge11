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
        //console.log("onMouseMove called");
        this.mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Filter scene children to only include Nodes and Edges
        const interactiveObjects = this.scene.children.filter(child => child.userData.type === 'node' || child.userData.type === 'edge');

        let intersects = this.raycaster.intersectObjects(interactiveObjects, false);

        if (intersects.length > 0) {
            // Filter intersects to only include objects with unique names
            const uniqueIntersects = [];
            const names = new Set();
            for (const intersect of intersects) {
                const name = intersect.object.name;
                if (!names.has(name)) {
                    uniqueIntersects.push(intersect);
                    names.add(name);
                }
            }

            console.log("intersectsListe: ", uniqueIntersects.map(i => {
                const obj = i.object;
                return {
                    type: obj.userData.type,
                    id: obj.id,
                    name: obj.name
                };
            }));
       
            const firstIntersected = uniqueIntersects[0].object;
            const isNode = firstIntersected.userData.type === 'node';
            const nodeInIntersects = uniqueIntersects.some(intersect => intersect.object.userData.type === 'node');

            if (isNode || nodeInIntersects) {
                // Node hervorheben
                console.log("jetzt node ist!")
                let node = isNode ? firstIntersected : intersects.find(intersect => intersect.object.userData.type === 'node').object;

                if (this.hoveredObject !== node) {
                    console.log("Es ist ein anderer gehoverert node");
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                        console.log("gehighlighted ist reset");
                    }
                    this.hoveredObject = node;
                    this.applyHighlight(this.hoveredObject);
                }
            } else {
                // Edge hervorheben
                 if (this.hoveredObject !== firstIntersected) {
                    if (this.hoveredObject) {
                        this.resetHighlight(this.hoveredObject);
                    }
                    this.hoveredObject = firstIntersected;
                    this.applyHighlight(this.hoveredObject);
                }
            }
        } else {
            // Kein Objekt schneidet den Strahl
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
        if (object.userData.type === 'node') {
            object.material.emissiveIntensity = 0.8; // Stärkere Glow-Intensität
            object.material.emissive.setHex(0xffa500); // Orange Farbe für den Glow
        } else if (object.userData.type === 'edge') {
            const edge = object.userData.edge;
            edge.applyHighlight();
        }
    }

    resetHighlight(object) {
        if (object.userData.type === 'node') {
            object.material.emissiveIntensity = 0; // Kein Glow
            object.material.emissive.setHex(0x000000); // Keine Emissive Farbe
        } else if (object.userData.type === 'edge') {
            const edge = object.userData.edge;
            edge.resetHighlight();
        }
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
