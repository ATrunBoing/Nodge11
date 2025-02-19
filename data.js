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
let allNodes = []; // Definiere allNodes im globalen Scope

export const createNodes = async (filename) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];

    let nodes = [];
    if (data.members) {
        nodes = data.members;
    } else if (data.nodes) {
        nodes = data.nodes;
    } else {
        console.warn('Invalid data format: nodes array is missing.');
        return [];
    }

    allNodes = nodes.map(node => { // Speichere die Knoten in allNodes
        let x, y, z;
        if (node.position) {
            x = node.position.x;
            y = node.position.y;
            z = node.position.z;
        } else {
            x = node.x;
            y = node.y;
            z = node.z;
        }
        const vector = new THREE.Vector3(x, y, z);
        vector.name = node.name || '';
        return vector;
    });
    return allNodes;
};

// Erstelle Kantendefinitionen aus JSON-Daten
export const createEdgeDefinitions = async (filename, nodes) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];
    return data.edges.map(edge => {
		let start = nodes[edge.start];
		let end = nodes[edge.end];

        if (!start || !end) {
            console.warn(`Ungültiger Knotenindex in Kantendefinition: start=${edge.start}, end=${edge.end}, Knotenanzahl=${nodes.length}`);
            return null; // Überspringe diese Kante
        }

        const startNode = start;
        const endNode = end;
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
    }).filter(edge => edge !== null); // Filtere übersprungene Kanten heraus
};

// Exportiere die Dateinamen für einfachen Zugriff
export const dataFiles = {
    small: 'data/small.json',
    medium: 'data/medium.json',
    large: 'data/large.json',
    mega: 'data/mega.json',
    mini: 'data/mini.json',
	family: 'family.json',
	julioIglesias: 'julioIglesias.json',
	architektur: 'architektur.json'
};
