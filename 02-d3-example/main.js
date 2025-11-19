import { setupButtons } from "./buttons.js";

const recupererDonnees = async () => {
    const endpoint = "https://query.wikidata.org/sparql";
    const query = `
      SELECT ?river ?riverLabel ?length ?bassinVersant
WHERE {
  ?river wdt:P403 wd:Q1471 .  # embouchure = Seine
  ?river wdt:P2043 ?length .  # longueur (en km)
  ?river wdt:P2053 ?bassinVersant .  # Surface du bassin versant (en km2)
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "fr,en".
  }
}
ORDER BY DESC(?length)
    `;

    
    const queryString = "?query=" + encodeURIComponent(query);
    console.log('queryString: ', queryString);
    const url = endpoint + queryString;
    const response = await fetch(url, {
        headers: { "Accept": "application/sparql-results+json" }
    });

    if (!response.ok) {
        throw new Error("Erreur réseau (" + response.status + ")");
    }

    const json = await response.json();
    console.log('json: ', json);
    

    const data = json.results.bindings.map(b => ({
        name: b.riverLabel?.value || "(sans nom)",
        km: parseFloat(b.length.value),
        surfaceBassinVersant: parseFloat(b.bassinVersant.value)
    }));

    console.log('data: ', data);
    return data;
}


const afficheDiagramme = (data) => {
    const svgns = "http://www.w3.org/2000/svg";

    const svg = document.querySelector("svg");
    
    const height = 40;
    const gap = 10;
    const width = +svg.getAttribute("width") - 2*10;
    const ratio =  width / data[0].km; 
    

    for (let i = 0; i < 10; i++) {
        

        // ajoute un rectangle SVG pour chaque itération
        const rect = document.createElementNS(svgns, "rect");
        rect.setAttribute("x", 10);
        rect.setAttribute("y", 10 + i * (height+gap));
        rect.setAttribute("width", data[i].km * ratio);
        rect.setAttribute("height", height);

        const text = document.createElementNS(svgns, "text");
        text.setAttribute("x", 10 + 10);
        text.setAttribute("y", 10 + i * (height+gap) + height / 2);
        text.setAttribute("dominant-baseline", "middle");
        text.innerHTML = `${data[i].name} (${data[i].km} km)`;
        
        svg.appendChild(rect);
        svg.appendChild(text);

    }
}

const afficheDiagrammeWithD3 = (data, type) => {
    

    const textMaxWidth = 70;
    const textWidth = 90;
    const svg = d3.select("svg");
    
    const height = 40;
    const gap = 10;
    const maxBarWith = +svg.attr("width") - 2*10 - textMaxWidth - textWidth;
    const ratio =  maxBarWith / data[0][type]; 
    

    const groupes = svg.selectAll("g")
        .data(data, d => d.name);


    const groupesEnter =  groupes.enter()
        .append("g")
        .attr("transform", (d,i) => `translate(0, ${10 + i * (height + gap)})`);

    groupesEnter.append("rect")
        .attr("x", 10 + textMaxWidth)
        .attr("width", d => {
            return d[type] * ratio;
        })
        .attr("height", height)
        .attr("fill", "coral")
        .attr("fill", d => 
            d3.interpolateViridis(d[type] / data[0][type])
        );

    groupesEnter.append("text")
        .attr("x", 10 + 10)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .text(d => `${d.name}`);

    groupesEnter.append("text")
        .attr("x", d => d[type] * ratio + 10 + textMaxWidth + 10)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .text(d => `${d[type]} ${type === "km" ? "km" : "km²"}`);

    const groupeExit = groupes.exit()
    groupeExit.remove();

    const groupesUpdate = groupes;
    groupesUpdate.transition().duration(750)
    .attr("transform", (d,i) => `translate(0, ${10 + i * (height + gap)})`);


    groupesUpdate.select("rect")
        .transition()
        .duration(750)
        .attr("width", d => d[type] * ratio)
        .attr("fill", d => 
            d3.interpolateViridis(d[type] / data[0][type])
        );

    groupesUpdate.select("text:nth-of-type(1)")
        .transition()
        .duration(750)
        .text(d => `${d.name}`);

    groupesUpdate.select("text:nth-of-type(2)")
        .transition()
        .duration(750)
        .attr("x", d => d[type] * ratio + 10 + textMaxWidth + 10)
        .text(d => `${d[type]} ${type === "km" ? "km" : "km²"}`);
}

const main = async () => {
    const data = await recupererDonnees();
    
    setupButtons(data, afficheDiagrammeWithD3);
    afficheDiagrammeWithD3(data.slice(0,10), "km");
}

main();

