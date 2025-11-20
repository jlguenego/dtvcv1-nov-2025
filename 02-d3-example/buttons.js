let type = "km";

export const setupButtons = (data, updateVisualization) => {
  const status = document.querySelector("div.command span.status");
  const button = document.querySelector("div.command button");
  button.textContent = "Classer par surface du bassin versant";
  button.addEventListener("click", () => {
    if (type === "km") {
      type = "surfaceBassinVersant";
      status.textContent = "surface du bassin versant";
      button.textContent = "Classer par longueur";
      const sortedData = [...data].sort(
        (a, b) => b.surfaceBassinVersant - a.surfaceBassinVersant,
      );
      updateVisualization(sortedData.slice(0, 10), "surfaceBassinVersant");
    } else {
      type = "km";
      status.textContent = "longueur";
      button.textContent = "Classer par surface du bassin versant";
      const sortedData = [...data].sort((a, b) => b.km - a.km);
      updateVisualization(sortedData.slice(0, 10), "km");
    }
  });
};
