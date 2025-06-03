import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createNodes, createEdgeDefinitions, dataFiles, loadNetworkData } from './data.js';
import { Node } from './objects/Node.js';
import { Edge } from './objects/Edge.js';
import { EventManager } from './src/core/EventManager.js';
import { StateManager } from './src/core/StateManager.js';
import { UIManager } from './src/core/UIManager.js';
import { GlowEffect } from './src/effects/GlowEffect.js';
import { HighlightManager } from './src/effects/HighlightManager.js';
import { RaycastManager } from './src/utils/RaycastManager.js';
import { Rollover } from './rollover.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5dc); // Beige background

// Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 15, 15);
camera.lookAt(0, 0, 0);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Ground plane for shadows
const groundGeometry = new THREE.PlaneGeometry(40, 40);
const groundMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xfefeee,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.81;
ground.receiveShadow = true;
scene.add(ground);

// Grid helper
const gridHelper = new THREE.GridHelper(20, 20, 0xffa500, 0xffa500);
scene.add(gridHelper);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(10, 10, 10);
directionalLight.castShadow = true;

// Optimierte Schatten-Einstellungen
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

scene.add(directionalLight);

// Netzwerk-Verwaltung
let currentNodes = [];
let currentEdges = [];

function clearNetwork() {
    currentNodes.forEach(node => {
        scene.remove(node.mesh);
        node.mesh.geometry.dispose();
        node.mesh.material.dispose();
    });
    currentNodes = [];

    currentEdges.forEach(edge => {
        scene.remove(edge.line);
        edge.line.geometry.dispose();
        edge.line.material.dispose();
    });
    currentEdges = [];
}

async function loadNetwork(filename) {
    console.log("Loading network:", filename);
    clearNetwork();

    try {
        // Lade die Netzwerkdaten
        const data = await loadNetworkData(filename);
        if (!data) {
            console.error("Fehler beim Laden der Daten:", filename);
            return;
        }

        // Lade und erstelle neue Knoten mit verschiedenen Formen
        const nodePositions = await createNodes(filename);
        console.log("Nodes loaded:", nodePositions.length);
        
        // Erstelle Knoten mit verschiedenen Formen basierend auf Metadaten
        currentNodes = nodePositions.map((pos, index) => {
            // Bestimme Knotentyp basierend auf Metadaten oder Index
            let nodeType = 'cube';
            let nodeSize = 1.2;
            let nodeColor = 0xff4500;
            
            // Verwende Metadaten, falls vorhanden
            if (pos.metadata) {
                if (pos.metadata.type) {
                    nodeType = pos.metadata.type;
                }
                if (pos.metadata.size) {
                    nodeSize = pos.metadata.size;
                }
                if (pos.metadata.color) {
                    nodeColor = pos.metadata.color;
                }
            }
            
            // Variiere die Form basierend auf dem Index für visuelle Unterscheidung
            const nodeTypes = ['cube', 'icosahedron', 'dodecahedron', 'octahedron', 'tetrahedron'];
            if (!pos.metadata || !pos.metadata.type) {
                nodeType = nodeTypes[index % nodeTypes.length];
            }
            
            // Erstelle den Knoten
            const node = new Node(pos, {
                type: nodeType,
                size: nodeSize,
                color: nodeColor
            });
            
            // Füge den Knoten zur Szene hinzu
            scene.add(node.mesh);
            return node;
        });

        // Lade und erstelle neue Kanten mit verschiedenen Stilen
        const edgeDefinitions = await createEdgeDefinitions(filename, nodePositions);
        if (edgeDefinitions && edgeDefinitions.length > 0) {
            console.log("Edges loaded:", edgeDefinitions.length);
            
            currentEdges = edgeDefinitions.map((def, index) => {
                // Finde die entsprechenden Node-Objekte für Start und Ende
                const startNodeObj = currentNodes.find(n => n.position === def.start);
                const endNodeObj = currentNodes.find(n => n.position === def.end);
                
                if (!startNodeObj || !endNodeObj) {
                    console.warn("Konnte Start- oder Endknoten nicht finden:", def);
                    return null;
                }
                
                // Bestimme Kantentyp basierend auf Metadaten oder Index
                let edgeStyle = ['solid', 'dashed', 'dotted'][index % 3];
                let edgeColor = [0x0000ff, 0x00ff00, 0xff0000][index % 3];
                
                // Verwende Typ aus der Definition, falls vorhanden
                if (def.name && def.name.includes('parent')) {
                    edgeStyle = 'solid';
                    edgeColor = 0xff0000; // Rot für Eltern-Kind-Beziehungen
                } else if (def.name && def.name.includes('spouse')) {
                    edgeStyle = 'dashed';
                    edgeColor = 0x00ff00; // Grün für Ehepartner-Beziehungen
                }
                
                // Erstelle die Kante
                const edge = new Edge(startNodeObj, endNodeObj, {
                    style: edgeStyle,
                    color: edgeColor,
                    width: 3,
                    curveHeight: def.offset + 2,
                    offset: def.offset,
                    name: def.name
                });
                
                // Füge die Kante zur Szene hinzu
                scene.add(edge.line);
                return edge;
            }).filter(edge => edge !== null); // Filtere null-Werte heraus
        } else {
            console.log("Keine Kanten geladen");
            currentEdges = [];
        }

        // Bestimme Achsenbeschreibungen basierend auf der Datei
        let xAxis = "unbekannt";
        let yAxis = "unbekannt";
        let zAxis = "unbekannt";

        // Spezifische Achsenbeschreibungen für bestimmte Dateien
        if (filename === "architektur.json") {
            xAxis = "Fortschreitender Ladevorgang";
            yAxis = "Art der Komponente";
            zAxis = "Tiefe";
        } else if (filename.includes("family") || filename.includes("Iglesias")) {
            xAxis = "Horizontale Position";
            yAxis = "Generation";
            zAxis = "Tiefe";
        }

        // Aktualisiere das Dateiinfo-Panel
        updateFileInfoPanel(
            filename, 
            nodePositions.length, 
            edgeDefinitions ? edgeDefinitions.length : 0, 
            xAxis, 
            yAxis, 
            zAxis
        );
        
        console.log("Netzwerk erfolgreich geladen:", filename);
        
    } catch (error) {
        console.error("Fehler beim Laden des Netzwerks:", error);
        // Zeige Fehlermeldung im Dateiinfo-Panel
        updateFileInfoPanel(filename, 0, 0, "Fehler", "Fehler", "Fehler");
    }
}

function updateFileInfoPanel(filename, nodeCount, edgeCount, xAxis, yAxis, zAxis) {
    document.getElementById('fileFilename').textContent = `Dateiname: ${filename}`;
    document.getElementById('fileNodeCount').textContent = `Anzahl Knoten: ${nodeCount}`;
    document.getElementById('fileEdgeCount').textContent = `Anzahl Kanten: ${edgeCount}`;
    document.getElementById('fileXAxis').textContent = `X-Achse: ${xAxis}`;
    document.getElementById('fileYAxis').textContent = `Y-Achse: ${yAxis}`;
    document.getElementById('fileZAxis').textContent = `Z-Achse: ${zAxis}`;
}

// Initialisiere Manager
const stateManager = new StateManager();
const eventManager = new EventManager();
const uiManager = new UIManager(stateManager);
const glowEffect = new GlowEffect();
const highlightManager = new HighlightManager(stateManager, glowEffect);
const raycastManager = new RaycastManager(camera, scene, renderer);

// Initialisiere Rollover
const rollover = new Rollover(camera, scene, renderer);
 
// Initialisiere Event-System
eventManager.init(camera, scene, renderer);

// Starte Animation-Loop des StateManagers
stateManager.animate();

// Button Event-Handler
document.getElementById('smallData').addEventListener('click', () => loadNetwork(dataFiles.small));
document.getElementById('mediumData').addEventListener('click', () => loadNetwork(dataFiles.medium));
document.getElementById('largeData').addEventListener('click', () => loadNetwork(dataFiles.large));
document.getElementById('megaData').addEventListener('click', () => loadNetwork(dataFiles.mega));
document.getElementById('familyData').addEventListener('click', () => loadNetwork(dataFiles.family));
document.getElementById('architektur').addEventListener('click', () => loadNetwork(dataFiles.architektur));
document.getElementById('royalFamilyData').addEventListener('click', () => loadNetwork(dataFiles.royalFamily));

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Window resize handler
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Lade initial das kleine Netzwerk
loadNetwork(dataFiles.small);
