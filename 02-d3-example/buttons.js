export const setupButtons = (data, updateVisualization) => {
    const buttons = document.querySelectorAll("div.command button");
    buttons[0].addEventListener("click", () => {
        const sortedData = [...data].sort((a,b) => b.km - a.km);
        updateVisualization(sortedData);
    });
    buttons[1].addEventListener("click", () => {
        const sortedData = [...data].sort((a,b) => b.surfaceBassinVersant - a.surfaceBassinVersant);
        updateVisualization(sortedData);
    });
}