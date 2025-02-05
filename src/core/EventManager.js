import * as THREE from 'three';

export class EventManager {
    constructor() {
        this.handlers = new Map();
        this.state = {
            selectedObject: null,
        };
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    init(camera, scene, renderer) {
        this.camera = camera;
        this.scene = scene;
        this.renderer = renderer;

        // Event-Listener registrieren
    }

    registerHandler(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, []);
        }
        this.handlers.get(eventType).push(handler);
    }

    emit(eventType, data) {
        const handlers = this.handlers.get(eventType) || [];
        handlers.forEach(handler => handler(data));
    }

    destroy() {
        // Event-Listener entfernen
    }
}
