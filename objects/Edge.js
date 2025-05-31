import * as THREE from 'three';

export class Edge {
    constructor(startNode, endNode, options = {}) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.options = {
            color: options.color || 0x0000ff,
            style: options.style || 'solid',
            curveHeight: options.curveHeight || 2,
            offset: options.offset || 0,
            segments: options.segments || 50,
            dashSize: options.dashSize || 0.5,
            gapSize: 0.3,
            ...options
        };

        // Speichere den Namen der Kante
        this.name = options.name || `Edge ${startNode?.name || 'start'}-${endNode?.name || 'end'}`;
        
        // Erstelle die Linie
        this.line = this.createLine();
        this.line.userData.type = 'edge';
        this.line.userData.edge = this;
        this.line.name = this.name;
        this.line.glow = null;
        
        // Speichere Metadaten
        this.metadata = { ...options };
        this.line.metadata = this.metadata;
    }

    createLine() {
        const curve = this.createCurve();
        const geometry = this.createGeometry(curve);
        const material = this.createMaterial();
        
        const line = new THREE.Mesh(geometry, material);
        line.castShadow = true;
        line.receiveShadow = true;
        return line;
    }

    createCurve() {
        const start = this.startNode.mesh.position.clone();
        const end = this.endNode.mesh.position.clone();
    
        const midPoint = new THREE.Vector3(
            (start.x + end.x) / 2,
            (start.y + end.y) / 2 + this.options.curveHeight,
            (start.z + end.z) / 2
        );
    
        // Seitlichen Versatz hinzufügen
        if (this.options.offset !== 0) {
            const direction = new THREE.Vector3().subVectors(end, start).normalize();
            const offsetDirection = new THREE.Vector3(-direction.z, 0, direction.x).normalize(); // Senkrechte Richtung
            midPoint.addScaledVector(offsetDirection, this.options.offset);
        }
    
        return new THREE.QuadraticBezierCurve3(
            start,
            midPoint,
            end
        );
    }

    createGeometry(curve) {
        const points = curve.getPoints(this.options.segments);
        const geometry = new THREE.TubeGeometry(curve, this.options.segments, 0.1, 3, false);
        return geometry;
    }

    createMaterial() {
        let material;

        switch(this.options.style) {
            case 'dashed':
                material = new THREE.MeshPhongMaterial({
                    color: this.options.color,
                    transparent: true,
                    opacity: 0.5,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
            case 'dotted':
                material = new THREE.MeshPhongMaterial({
                    color: this.options.color,
                    transparent: true,
                    opacity: 0.5,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
            default:
                material = new THREE.MeshPhongMaterial({
                    color: this.options.color,
					side: THREE.DoubleSide,
					shininess: 30
                });
                break;
        }
		return material;
    }

    setColor(color) {
        this.options.color = color;
    }

    setStyle(style) {
        this.options.style = style;
    }

    resetHighlight() {
        this.line.material.color.setHex(this.options.color);
        this.line.transparent = (this.options.style === 'dashed' || this.options.style === 'dotted');
    }
}
