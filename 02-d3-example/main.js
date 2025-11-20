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
  console.log("queryString: ", queryString);
  const url = endpoint + queryString;
  const response = await fetch(url, {
    headers: { Accept: "application/sparql-results+json" },
  });

  if (!response.ok) {
    throw new Error("Erreur réseau (" + response.status + ")");
  }

  const json = await response.json();
  console.log("json: ", json);

  const data = json.results.bindings.map((b) => ({
    id: b.river.value,
    name: b.riverLabel?.value || "(sans nom)",
    km: parseFloat(b.length.value),
    surfaceBassinVersant: parseFloat(b.bassinVersant.value),
  }));

  console.log("data: ", data);
  return data;
};

const afficheDiagramme = (data) => {
  const svgns = "http://www.w3.org/2000/svg";

  const svg = document.querySelector("svg");

  const height = 40;
  const gap = 10;
  const width = +svg.getAttribute("width") - 2 * 10;
  const ratio = width / data[0].km;

  for (let i = 0; i < 10; i++) {
    // ajoute un rectangle SVG pour chaque itération
    const rect = document.createElementNS(svgns, "rect");
    rect.setAttribute("x", 10);
    rect.setAttribute("y", 10 + i * (height + gap));
    rect.setAttribute("width", data[i].km * ratio);
    rect.setAttribute("height", height);

    const text = document.createElementNS(svgns, "text");
    text.setAttribute("x", 10 + 10);
    text.setAttribute("y", 10 + i * (height + gap) + height / 2);
    text.setAttribute("dominant-baseline", "middle");
    text.innerHTML = `${data[i].name} (${data[i].km} km)`;

    svg.appendChild(rect);
    svg.appendChild(text);
  }
};

const afficheDiagrammeWithD3 = (data, type) => {
  const svgWidth = 800;
  const textMaxWidth = 80;
  const textWidth = 90;
  const svg = d3.select("svg");

  const height = 40;
  const gap = 10;
  const marginWidth = 10;
  const maxBarWith = svgWidth - 2 * marginWidth - textMaxWidth - textWidth;
  const ratio = maxBarWith / data[0][type];

  const groupes = svg.selectAll("g.bar-group").data(data, (d) => d.id);

  // Le groupe de ceux qui entrent (les enters)
  const groupesEnter = groupes
    .enter()
    .append("g")
    .classed("bar-group", true)
    .attr("transform", (d, i) => `translate(0, ${10 + i * (height + gap)})`);

  groupesEnter
    .append("rect")
    .attr("x", 10 + textMaxWidth)
    .attr("width", (d) => {
      return d[type] * ratio;
    })
    .attr("height", height)
    .attr("fill", "coral")
    .attr("fill", (d) => d3.interpolateViridis(d[type] / data[0][type]));

  groupesEnter
    .append("text")
    .classed("name", true)
    .attr("x", textMaxWidth)
    .attr("y", height / 2)
    .attr("dominant-baseline", "middle")
    .attr("text-anchor", "end")
    .text((d) => `${d.name}`);

  const gValue = groupesEnter
    .append("g")
    .classed("value-group", true)
    .attr(
      "transform",
      (d) => `translate(${d[type] * ratio + 10 + textMaxWidth + 10}, 0)`,
    );

  gValue
    .append("text")
    .classed("value", true)
    .attr("x", 0)
    .attr("y", height / 2)
    .attr("dominant-baseline", "middle")
    .text((d) => `${d[type]} ${type === "km" ? "km" : "km²"}`);

  // Le groupe de ceux qui sortent (les exits)
  const groupeExit = groupes.exit();
  groupeExit.remove();

  // Le groupe de ceux qui restent (les updates)
  const groupesUpdate = groupes;
  groupesUpdate
    .transition()
    .duration(750)
    .attr("transform", (d, i) => `translate(0, ${10 + i * (height + gap)})`);

  groupesUpdate
    .select("rect")
    .transition()
    .duration(750)
    .attr("width", (d) => d[type] * ratio);

  groupesUpdate
    .select("text.name")
    .transition()
    .duration(750)
    .text((d) => `${d.name}`);

  groupesUpdate
    .select("g.value-group")
    .transition()
    .duration(750)
    .attr(
      "transform",
      (d) => `translate(${d[type] * ratio + 10 + textMaxWidth + 10}, 0)`,
    );

  const t = groupesUpdate.select("text.value");

  // Fade-out
  t.transition()
    .duration(375)
    .style("opacity", 0)
    .on("end", () => {
      // Mise à jour de la valeur
      t.text((d) => `${d[type]} ${type === "km" ? "km" : "km²"}`);

      // Fade-in
      t.style("opacity", 0) // point de départ
        .transition()
        .duration(375)
        .style("opacity", 1); // fin (complètement visible)
    });
};

const main = async () => {
  const data = await recupererDonnees();

  setupButtons(data, afficheDiagrammeWithD3);
  afficheDiagrammeWithD3(data.slice(0, 10), "km");
};

main();
