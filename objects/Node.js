import * as THREE from 'three';

export class Node {
    // Statische Caches für Geometrien und Materialien
    static geometryCache = new Map();
    static materialCache = new Map();

    constructor(position, options = {}) {
        this.position = position;
        this.options = {
            type: options.type || 'cube',        // cube, icosahedron, dodecahedron, octahedron, tetrahedron, male_icon, female_icon, diverse_icon
            size: options.size || 1,             // Grundgröße
            color: options.color || 0xff4500,    // Farbe
            glowFrequency: options.glowFrequency || 4, // Pulsgeschwindigkeit (0.25-5 Hz)
            ...options
        };
        this.originalColor = this.options.color; // Speichere die ursprüngliche Farbe
        
        this.mesh = this.createMesh();
        this.mesh.userData.type = 'node';        // Für spätere Identifikation
        this.mesh.userData.node = this;          // Referenz auf das Node-Objekt
        this.mesh.glow = null;
        
        // Übertrage wichtige Eigenschaften vom position-Objekt auf das Mesh
        if (position) {
            // Übertrage den Namen
            this.mesh.name = position.name || 'Unbenannter Knoten';
            
            // Übertrage die ID auf das Node-Objekt
            this.id = position.id;
            
            // Übertrage Metadaten
            this.mesh.metadata = position.metadata || {};
            
            // Wenn position selbst Metadaten hat, füge diese hinzu
            if (position.metadata === undefined) {
                // Extrahiere alle Eigenschaften außer position und name als Metadaten
                const { x, y, z, position: pos, ...otherProps } = position;
                this.mesh.metadata = { ...otherProps };
            }
        }
    }

    createMesh() {
        const geometry = this.createGeometry();
        const color = this.options.color;
        const cacheKey = `material-${color}`;

        let material = Node.materialCache.get(cacheKey);
        if (!material) {
            material = new THREE.MeshPhongMaterial({ 
                color: color,
                shininess: 30,
                emissive: new THREE.Color(0x000000),
                emissiveIntensity: 0
            });
            Node.materialCache.set(cacheKey, material);
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // Kopiere die Position
        if (this.position && this.position.x !== undefined) {
            mesh.position.set(
                this.position.x,
                this.position.y,
                this.position.z
            );
        }
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    createGeometry() {
        const size = this.options.size;
        const type = this.options.type.toLowerCase();
        const cacheKey = `${type}-${size}`;

        if (Node.geometryCache.has(cacheKey)) {
            return Node.geometryCache.get(cacheKey);
        }

        const depth = size / 4; // Dicke des 2D-Icons
        const extrudeSettings = {
            steps: 1,
            depth: depth,
            bevelEnabled: false
        };
        
        let geometry;

        switch(type) {
            case 'male_icon':
                {
                    const shape = new THREE.Shape();
                    // Body (rectangle)
                    shape.moveTo(-size / 4, -size / 2);
                    shape.lineTo(size / 4, -size / 2);
                    shape.lineTo(size / 4, size / 4);
                    shape.lineTo(-size / 4, size / 4);
                    shape.lineTo(-size / 4, -size / 2);

                    // Head (circle)
                    const headRadius = size / 4;
                    shape.absarc(0, size / 4 + headRadius, headRadius, 0, Math.PI * 2, false);

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'female_icon':
                {
                    const shape = new THREE.Shape();
                    // Body (rectangle, similar to male icon)
                    shape.moveTo(-size / 4, -size / 2);
                    shape.lineTo(size / 4, -size / 2);
                    shape.lineTo(size / 4, size / 4);
                    shape.lineTo(-size / 4, size / 4);
                    shape.lineTo(-size / 4, -size / 2);

                    // Head (circle)
                    const headRadius = size / 4;
                    shape.absarc(0, size / 4 + headRadius, headRadius, 0, Math.PI * 2, false);

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'diverse_icon':
                {
                    const shape = new THREE.Shape();
                    shape.absarc(0, 0, size / 2, 0, Math.PI * 2, false); // Simple circle

                    geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                }
                break;
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(size/2);
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(size/2);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(size/2);
                break;
            case 'tetrahedron':
                geometry = new THREE.TetrahedronGeometry(size/2);
                break;
            case 'cube':
            default:
                geometry = new THREE.BoxGeometry(size, size, size);
                break;
        }
        Node.geometryCache.set(cacheKey, geometry);
        return geometry;
    }

    // Hilfsmethoden zum Aktualisieren der Eigenschaften
    setColor(color) {
        this.mesh.material.color.setHex(color);
    }

    setSize(size) {
        this.options.size = size;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }

    setType(type) {
        this.options.type = type;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }
}
