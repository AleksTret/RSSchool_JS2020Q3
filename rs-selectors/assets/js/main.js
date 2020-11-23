var levels = [
    {
      helpTitle : "Select elements by their type",
      selectorName : "Type Selector",
      doThis : "Select the plates",
      selector : "plate",
      syntax : "A",
      help : "Selects all elements of type <strong>A</strong>. Type refers to the type of tag, so <tag>div</tag>, <tag>p</tag> and <tag>ul</tag> are all different element types.",
      examples : [
        '<strong>div</strong> selects all <tag>div</tag> elements.',
        '<strong>p</strong> selects all <tag>p</tag> elements.',
      ],
      boardMarkup: `
      <plate/>
      <plate/>
      `
    }
]

const plate = {
    init(){
        const plate =  document.createElement("div");
        plate.classList.add("plate");

        return plate;
    },
}

const game = {
    init(){
        const table = document.getElementById("table");

        table.appendChild(plate.init());
        table.appendChild(plate.init());
    }
}


window.addEventListener("DOMContentLoaded",  () => game.init());