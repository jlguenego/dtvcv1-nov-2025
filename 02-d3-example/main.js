console.log("Hello, Jean-Louis!");

const svgns = "http://www.w3.org/2000/svg";

const svg = document.querySelector("svg");
const height = 40;
const gap = 10;

for (let i = 0; i < 10; i++) {
    console.log(`Iteration number: ${i}`);

    // ajoute un rectangle SVG pour chaque itération
    const rect = document.createElementNS(svgns, "rect");
    rect.setAttribute("x", 10);
    rect.setAttribute("y", 10 + i * (height+gap));
    rect.setAttribute("width", 600);
    rect.setAttribute("height", height);
    svg.appendChild(rect);
}