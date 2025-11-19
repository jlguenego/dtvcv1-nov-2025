console.log("Hello, Jean-Louis!");


console.log('d3: ', d3);

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

    const url = endpoint + "?query=" + encodeURIComponent(query);
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
    console.log('svg: ', svg);
    const height = 40;
    const gap = 10;
    const width = +svg.getAttribute("width") - 2*10;
    const ratio =  width / data[0].km; 
    console.log('ratio: ', ratio);

    for (let i = 0; i < 10; i++) {
        console.log(`Iteration number: ${i}`);

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

const afficheDiagrammeWithD3 = (data) => {
    const textMaxWidth = 70;
    const kmTextWidth = 50;
    const svg = d3.select("svg");
    console.log('svg: ', svg);
    const height = 40;
    const gap = 10;
    const maxBarWith = +svg.attr("width") - 2*10 - textMaxWidth - kmTextWidth;
    const ratio =  maxBarWith / data[0].km; 

    const groupes = svg.selectAll("g")
        .data(data.slice(0,10))
        .enter()
        .append("g")
        .attr("transform", (d,i) => `translate(0, ${10 + i * (height + gap)})`);

    groupes.append("rect")
        .attr("x", 10 + textMaxWidth)
        .attr("width", d => d.km * ratio)
        .attr("height", height)
        .attr("fill", "coral")
        .attr("fill", d => 
            d3.interpolateViridis(d.km / data[0].km)
        );

    groupes.append("text")
        .attr("x", 10 + 10)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .text(d => `${d.name}`);

    groupes.append("text")
        .attr("x", d => d.km * ratio + 10 + textMaxWidth + 10)
        .attr("y", height / 2)
        .attr("dominant-baseline", "middle")
        .text(d => `${d.km}`);
}

const main = async () => {
    const data = await recupererDonnees();
    console.log('Données récupérées :', data);
    afficheDiagrammeWithD3(data)
}

main();

