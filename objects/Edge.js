import * as THREE from 'three';

export class Edge {
    constructor(startNode, endNode, options = {}) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.options = {
            color: options.color || 0x0000ff,     // Standardfarbe: Blau
            width: options.width || 3,            // Liniendicke
            style: options.style || 'solid',      // solid, dashed, dotted
            curveHeight: options.curveHeight || 2,// Höhe der Kurvenwölbung
            segments: options.segments || 50,     // Anzahl der Segmente für die Kurve
            dashSize: options.dashSize || 0.5,    // Größe der Striche bei gestrichelten Linien
            gapSize: options.gapSize || 0.3,     // Größe der Lücken bei gestrichelten Linien
            ...options
        };

        this.line = this.createLine();
        this.line.userData.type = 'edge';         // Für spätere Identifikation
    }

    createLine() {
        const curve = this.createCurve();
        const geometry = this.createGeometry(curve);
        const material = this.createMaterial();
        
        const line = new THREE.Line(geometry, material);
        return line;
    }

    createCurve() {
        const midPoint = new THREE.Vector3(
            (this.startNode.mesh.position.x + this.endNode.mesh.position.x) / 2,
            (this.startNode.mesh.position.y + this.endNode.mesh.position.y) / 2 + this.options.curveHeight,
            (this.startNode.mesh.position.z + this.endNode.mesh.position.z) / 2
        );

        return new THREE.QuadraticBezierCurve3(
            this.startNode.mesh.position,
            midPoint,
            this.endNode.mesh.position
        );
    }

    createGeometry(curve) {
        const points = curve.getPoints(this.options.segments);
        return new THREE.BufferGeometry().setFromPoints(points);
    }

    createMaterial() {
        let material;

        switch(this.options.style) {
            case 'dashed':
                material = new THREE.LineDashedMaterial({
                    color: this.options.color,
                    linewidth: this.options.width,
                    dashSize: this.options.dashSize,
                    gapSize: this.options.gapSize
                });
                break;

            case 'dotted':
                material = new THREE.LineDashedMaterial({
                    color: this.options.color,
                    linewidth: this.options.width,
                    dashSize: 0.1,
                    gapSize: 0.1
                });
                break;

            case 'solid':
            default:
                material = new THREE.LineBasicMaterial({
                    color: this.options.color,
                    linewidth: this.options.width
                });
                break;
        }

        return material;
    }

    // Hilfsmethode zum Aktualisieren der Farbe
    setColor(color) {
        this.options.color = color;
        this.line.material.color.setHex(color);
    }

    // Hilfsmethode zum Aktualisieren der Liniendicke
    setWidth(width) {
        this.options.width = width;
        this.line.material.linewidth = width;
    }

    // Hilfsmethode zum Ändern des Linienstils
    setStyle(style) {
        this.options.style = style;
        const oldMaterial = this.line.material;
        this.line.material = this.createMaterial();
        oldMaterial.dispose();
        
        if (style !== 'solid') {
            this.line.computeLineDistances();
        }
    }

    // Hilfsmethode zum Aktualisieren der Kurvenform
    updateCurve(curveHeight) {
        this.options.curveHeight = curveHeight;
        const curve = this.createCurve();
        const newGeometry = this.createGeometry(curve);
        this.line.geometry.dispose();
        this.line.geometry = newGeometry;
        
        if (this.options.style !== 'solid') {
            this.line.computeLineDistances();
        }
    }

    applyHighlight() {
        console.log("applyHighlight Edge");
        this.originalColor = this.options.color; // Sicherstellen, dass wir die Originalfarbe speichern
        this.setColor(0xffa500); // Orange Farbe für Hervorhebung
        this.setWidth(5); // Erhöhe die Linienbreite für Hervorhebung
    }

    resetHighlight() {
        console.log("resetHighlight Edge");
        this.setColor(this.originalColor); // Zurück zur Originalfarbe
        this.setWidth(this.options.width); // Zurück zur ursprünglichen Linienbreite
    }
}
