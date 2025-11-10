
import BombModule from "../../YUBOG/ModuleLib.js"


const module = new BombModule();

let isPressed = false;

let bgColor;

let text;

let stripColor;

let clickTimeMs;

let releaseTime;



const randomNum = Math.floor(Math.random() * 4);
   
export function clicked() {
    isPressed = true;
    
    document.querySelector('#indicator rect').setAttribute("fill", stripColor);
    clickTimeMs = module.getTimeRemainingMs();
    console.log(module.getTimeRemainingMs());
}

export function buttonReleased() {
    if (!isPressed) return;
    releaseTime = module.getBombTimeString();
    const batteries = module.getTotalBatteries();
    const isHeld = (clickTimeMs - module.getTimeRemainingMs()) > 250;
    console.log(releaseHeldButton(isHeld));

    if(bgColor === "blue" && text === "Abort" && isHeld) {

    }

    console.log(module.getTimeRemainingMs());
    document.querySelector('#indicator rect').setAttribute("fill", "grey");
    isPressed = false;

}

function releaseHeldButton(isHeld){
    if(!isHeld) return false;

    let color_to_number = {
        "blue": "4",
        "white": "1",
        "yellow": "5",
    };

    if(!Object.keys(color_to_number).includes(stripColor)) return releaseTime.includes("2");

    return releaseTime.includes(color_to_number[stripColor]);
}

// Function to change the button color
function changeButtonColor() {
    const bgcolors = ["yellow","red","white","blue", "black"];
    const colors = ["black", "white","black", "white", "white"];
    const fillColors = ["yellow","blue","white","red"];
    const arr = ["Press", "Hold", "Abort", "Detonate"];

    let randomNumber = Math.floor(Math.random() * bgcolors.length) 
    const button = document.getElementById("Knop");
    bgColor = bgcolors[randomNumber];
    stripColor = fillColors[randomNum];
    text = arr[Math.floor(Math.random() * arr.length)];

     if (button){
        button.style.backgroundColor = bgColor;
        button.style.color = colors[randomNumber];
        button.style.border = "2px solid " + bgcolors[randomNumber];
        button.textContent = text;
     }
}


document.addEventListener("DOMContentLoaded", function() {
    changeButtonColor();

    const button = document.getElementById("Knop");
    if (button) {
        button.addEventListener("mousedown", clicked);
        button.addEventListener("mouseup", buttonReleased);
        button.addEventListener("mouseout", buttonReleased);
    }
});
  
