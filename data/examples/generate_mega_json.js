const fs = require('fs');

function generateRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function generateNodes(numNodes) {
  const nodes = [];
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: generateRandomNumber(-10, 10),
      y: generateRandomNumber(-5, 5),
      z: generateRandomNumber(-10, 10),
    });
  }
  return nodes;
}

function generateEdges(numEdges, numNodes) {
  const edges = [];
  for (let i = 0; i < numEdges; i++) {
    const start = Math.floor(Math.random() * numNodes);
    const end = Math.floor(Math.random() * numNodes);
    edges.push({
      start: start,
      end: end,
      offset: generateRandomNumber(0, 1),
    });
  }
  return edges;
}

const numNodes = 200;
const numEdges = 700;

const nodes = generateNodes(numNodes);
const edges = generateEdges(numEdges, numNodes);

const data = {
  nodes: nodes,
  edges: edges,
};

fs.writeFileSync('data/mega.json', JSON.stringify(data, null, 2));

console.log('mega.json wurde generiert');
