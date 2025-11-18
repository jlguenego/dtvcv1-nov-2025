console.log("Hello, Jean-Louis!");

const recupererDonnees = async () => {
    const endpoint = "https://query.wikidata.org/sparql";
    const query = `
      SELECT ?river ?riverLabel ?length
      WHERE {
        ?river wdt:P403 wd:Q1471 ;  # embouchure = Seine
               wdt:P2043 ?length .  # longueur (en km)
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

    const data = json.results.bindings.map(b => ({
        name: b.riverLabel?.value || "(sans nom)",
        km: parseFloat(b.length.value)
    }));
    console.log('data: ', data);

    return data;
}

const afficheDiagramme = (data) => {
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
        rect.setAttribute("width", data[i].km);
        rect.setAttribute("height", height);
        svg.appendChild(rect);
    }
}

const main = async () => {
    const data = await recupererDonnees();
    console.log('Données récupérées :', data);
    afficheDiagramme(data)
}

main();

