import * as THREE from 'three';

// Lade Netzwerkdaten aus JSON
export async function loadNetworkData(filename) {
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
    return data.members.map(member => {
		const vector = new THREE.Vector3(member.position.x, member.position.y, member.position.z);
		vector.name = member.name;
		return vector;
    });
};

// Erstelle Kantendefinitionen aus JSON-Daten
export const createEdgeDefinitions = async (filename, nodes) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];
    return data.edges.map(edge => {
        const startNode = nodes[edge.start - 1];
        const endNode = nodes[edge.end - 1];
        const distance = startNode.position.distanceTo(endNode.position);
        const maxOffset = distance / 3;
        const offset = Math.min(edge.offset, maxOffset);

        const edgeDefinition = {
            start: startNode,
            end: endNode,
            offset: offset,
            name: edge.type
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
    mini: 'data/mini.json',
	family: 'family.json',
	julioIglesias: 'julioIglesias.json'
};
