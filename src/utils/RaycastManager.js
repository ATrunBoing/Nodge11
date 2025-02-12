import * as THREE from 'three';

export class RaycastManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
        this.raycaster.params.Line.threshold = 7; // Erhöhe den Threshold für die Edge-Erkennung
        this.mouse = new THREE.Vector2();
        
        // Cache für durchsuchbare Objekte
        this.objectsCache = new Set();
        this.lastCacheUpdate = 0;
        this.cacheUpdateInterval = 1000; // Cache-Update-Intervall in ms
    }

    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    // Aktualisiert den Cache der durchsuchbaren Objekte
    updateObjectsCache() {
        const now = performance.now();
        if (now - this.lastCacheUpdate > this.cacheUpdateInterval) {
            this.objectsCache.clear();
            this.scene.traverse((object) => {
                if (object.userData.type === 'node' || object.userData.type === 'edge') {
                    this.objectsCache.add(object);
                }
            });
            this.lastCacheUpdate = now;
        }
    }

   // Findet das erste Objekt unter dem Mauszeiger
    findIntersectedObject() {
        this.updateObjectsCache();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const intersects = this.raycaster.intersectObjects([...this.objectsCache]);

        if (intersects.length > 0) {
            // Priorisiere Nodes über Edges entfernen
            return intersects[0].object;
        }

        return null;
    }

    // Findet alle Objekte unter dem Mauszeiger
    findAllIntersectedObjects() {
        this.updateObjectsCache();
        this.raycaster.setFromCamera(this.mouse, this.camera);

        return this.raycaster.intersectObjects([...this.objectsCache])
            .map(intersect => intersect.object);
    }

    // Performance-Optimierungen
    setCacheUpdateInterval(interval) {
        this.cacheUpdateInterval = interval;
    }

    clearCache() {
        this.objectsCache.clear();
        this.lastCacheUpdate = 0;
    }
}
