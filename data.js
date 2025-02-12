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
    } else if (Array.isArray(data)) {
        nodes = data;
    }

    allNodes = nodes.map(member => { // Speichere die Knoten in allNodes
        const vector = new THREE.Vector3(member.position.x, member.position.y, member.position.z);
        vector.name = member.name;
        return vector;
    });
    return allNodes;
};

// Erstelle Kantendefinitionen aus JSON-Daten
export const createEdgeDefinitions = async (filename) => {
    const data = await loadNetworkData(filename);
    if (!data) return [];
    return data.edges.map(edge => {
		let start;
		let end;
		if (filename === 'family.json' || filename === 'julioIglesias.json') {
			start = allNodes.find(node => node.position.x === data.members[edge.start - 1].position.x && node.position.y === data.members[edge.start - 1].position.y && node.position.z === data.members[edge.start - 1].position.z);
			end = allNodes.find(node =>  node.position.x === data.members[edge.end - 1].position.x && node.position.y === data.members[edge.end - 1].position.y && node.position.z === data.members[edge.end - 1].position.z);
		} else {
			start = allNodes.find(node => node.position.x === data.nodes[edge.start - 1].x && node.position.y === data.nodes[edge.start - 1].y && node.position.z === data.nodes[edge.start - 1].z);
			end = allNodes.find(node => node.position.x === data.nodes[edge.end - 1].x && node.position.y === data.nodes[edge.end - 1].y && node.position.z === data.nodes[edge.end - 1].z);
		}
        const startIndex = edge.start - 1;
        const endIndex = edge.end - 1;

        if (!start || !end) {
            console.warn(`Ungültiger Knotenindex in Kantendefinition: start=${edge.start}, end=${edge.end}, Knotenanzahl=${allNodes.length}`);
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
	julioIglesias: 'julioIglesias.json'
};
