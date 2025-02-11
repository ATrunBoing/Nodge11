import * as THREE from 'three';

// Lade Netzwerkdaten aus JSON
async function loadNetworkData(filename) {
    try {
        const response = await fetch(filename);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        return null;
    }
}

// Konvertiere JSON-Daten in Three.js Vektoren
export const createNodes = async (filename) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];
    return data.nodes.map(node => {
        const vector = new THREE.Vector3(node.x, node.y, node.z);
        vector.name = node.name;
        return vector;
    });
};

// Erstelle Kantendefinitionen aus JSON-Daten
export const createEdgeDefinitions = async (filename, nodes) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];
    return data.edges.map(edge => {
        const edgeDefinition = {
            start: nodes[edge.start],
            end: nodes[edge.end],
            offset: edge.offset,
            name: edge.name
        };
        return edgeDefinition;
    });
};

// Exportiere die Dateinamen für einfachen Zugriff
export const dataFiles = {
    small: 'data/small.json',
    medium: 'data/medium.json',
    large: 'data/large.json',
    mega: 'data/mega.json',
    mini: 'data/mini.json'
};
