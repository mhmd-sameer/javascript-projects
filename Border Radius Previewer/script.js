const container = document.getElementById("container");

const tl = document.getElementById("tl");
const tr = document.getElementById("tr");
const bl = document.getElementById("bl");
const br = document.getElementById("br");

const tlValue = document.getElementById("tl-value");
const trValue = document.getElementById("tr-value");
const blValue = document.getElementById("bl-value");
const brValue = document.getElementById("br-value");

document.addEventListener("input",()=>{
    updateRadius(tl.value, tr.value, bl.value, br.value);
});

function updateRadius(topLeft, topRight, bottomLeft, bottomRight)
{
    const value = `${topLeft}px ${topRight}px ${bottomLeft}px ${bottomRight}px`;
    container.style.borderRadius = value;

    tlValue.textContent = `${topLeft}px`;
    trValue.textContent = `${topRight}px`;
    blValue.textContent = `${bottomLeft}px`;
    brValue.textContent = `${bottomRight}px`;
}