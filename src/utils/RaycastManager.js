   import * as THREE from 'three';

export class RaycastManager {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.raycaster = new THREE.Raycaster();
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
            // Priorisiere Nodes über Edges
            const nodeIntersect = intersects.find(intersect => 
                intersect.object.userData.type === 'node'
            );
            
            return nodeIntersect ? nodeIntersect.object : intersects[0].object;
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

    // Findet das nächste Objekt in einer bestimmten Richtung
    findNextObjectInDirection(direction, currentObject = null) {
        const objects = [...this.objectsCache];
        if (!currentObject || objects.length === 0) return null;

        const currentPos = new THREE.Vector3();
        currentObject.getWorldPosition(currentPos);

        // Sortiere Objekte nach Distanz in der gewünschten Richtung
        const sortedObjects = objects
            .filter(obj => obj !== currentObject)
            .map(obj => {
                const pos = new THREE.Vector3();
                obj.getWorldPosition(pos);
                const delta = pos.clone().sub(currentPos);
                const distance = delta.dot(direction);
                return { object: obj, distance };
            })
            .filter(item => item.distance > 0) // Nur Objekte in der gewünschten Richtung
            .sort((a, b) => a.distance - b.distance);

        return sortedObjects.length > 0 ? sortedObjects[0].object : null;
    }

    // Findet alle Objekte innerhalb eines bestimmten Radius
    findObjectsInRadius(center, radius) {
        return [...this.objectsCache].filter(object => {
            const pos = new THREE.Vector3();
            object.getWorldPosition(pos);
            return pos.distanceTo(center) <= radius;
        });
    }

    // Findet verbundene Objekte
    findConnectedObjects(startObject) {
        const connected = new Set();
        const toProcess = [startObject];

        while (toProcess.length > 0) {
            const current = toProcess.pop();
            if (!connected.has(current)) {
                connected.add(current);

                // Finde verbundene Edges und deren Endpunkte
                if (current.userData.type === 'node') {
                    [...this.objectsCache]
                        .filter(obj => obj.userData.type === 'edge')
                        .forEach(edge => {
                            if (edge.start === current || edge.end === current) {
                                if (!connected.has(edge)) {
                                    toProcess.push(edge);
                                }
                                const otherNode = edge.start === current ? edge.end : edge.start;
                                if (!connected.has(otherNode)) {
                                    toProcess.push(otherNode);
                                }
                            }
                        });
                }
            }
        }

        return connected;
    }

    // Performance-Optimierungen
    setCacheUpdateInterval(interval) {
        this.cacheUpdateInterval = interval;
    }

    clearCache() {
        this.objectsCache.clear();
        this.lastCacheUpdate = 0;
    }

    // Hilfsmethoden für spezielle Anwendungsfälle
    findObjectsByType(type) {
        return [...this.objectsCache].filter(obj => obj.userData.type === type);
    }

    findNearestObject(position, excludeObject = null) {
        let nearest = null;
        let minDistance = Infinity;

        for (const object of this.objectsCache) {
            if (object === excludeObject) continue;

            const pos = new THREE.Vector3();
            object.getWorldPosition(pos);
            const distance = pos.distanceTo(position);

            if (distance < minDistance) {
                minDistance = distance;
                nearest = object;
            }
        }

        return nearest;
    }
}
