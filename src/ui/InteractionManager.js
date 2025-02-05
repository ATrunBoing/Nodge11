export class InteractionManager {
    constructor(eventManager, stateManager, uiManager) {
        this.eventManager = eventManager;
        this.stateManager = stateManager;
        this.uiManager = uiManager;
    }

    destroy() {
        // Event-Handler entfernen
        this.eventManager.destroy();
        this.stateManager.destroy();
        this.uiManager.destroy();
    }
}
