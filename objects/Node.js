import * as THREE from 'three';

export class Node {
    constructor(position, options = {}) {
        this.position = position;
        this.options = {
            type: options.type || 'cube',        // cube, icosahedron, dodecahedron, octahedron, tetrahedron
            size: options.size || 1,             // Grundgröße
            color: options.color || 0xff4500,    // Farbe
            glowFrequency: options.glowFrequency || 4, // Pulsgeschwindigkeit (0.25-5 Hz)
            ...options
        };
        this.originalColor = this.options.color; // Speichere die ursprüngliche Farbe
        
        this.mesh = this.createMesh();
        this.mesh.userData.type = 'node';        // Für spätere Identifikation
    }

    createMesh() {
        const geometry = this.createGeometry();
        const material = new THREE.MeshPhongMaterial({ 
            color: this.options.color,
            shininess: 30,
            emissive: new THREE.Color(0x000000),
            emissiveIntensity: 0
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(this.position);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        return mesh;
    }

    createGeometry() {
        const size = this.options.size;
        
        switch(this.options.type.toLowerCase()) {
            case 'icosahedron':
                return new THREE.IcosahedronGeometry(size/2);
                
            case 'dodecahedron':
                return new THREE.DodecahedronGeometry(size/2);
                
            case 'octahedron':
                return new THREE.OctahedronGeometry(size/2);
                
            case 'tetrahedron':
                return new THREE.TetrahedronGeometry(size/2);
                
            case 'cube':
            default:
                return new THREE.BoxGeometry(size, size, size);
        }
    }

    applyGlow() {
        this.mesh.material.emissiveIntensity = 0.8; // Stärkere Glow-Intensität
        this.mesh.material.emissive.setHex(0xffa500); // Orange Farbe für den Glow
    }

    resetGlow() {
        this.mesh.material.emissiveIntensity = 0; // Kein Glow
        this.mesh.material.emissive.setHex(0x000000); // Keine Emissive Farbe
        this.setColor(this.originalColor); // Zurück zur Originalfarbe
    }


    // Hilfsmethode zum Aktualisieren der Farbe
    setColor(color) {
        this.mesh.material.color.setHex(color);
    }

    // Hilfsmethode zum Aktualisieren der Größe
    setSize(size) {
        this.options.size = size;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }

    // Hilfsmethode zum Ändern der Form
    setType(type) {
        this.options.type = type;
        const newGeometry = this.createGeometry();
        this.mesh.geometry.dispose();
        this.mesh.geometry = newGeometry;
    }
}
