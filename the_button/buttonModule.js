
import BombModule from "https://hannes-dev.github.io/YUBOG/ModuleLib.js"


const module = new BombModule();

let isPressed = false;

let bgColor;

let text;

let stripColor;

let clickTimeMs;

let releaseTime;


   
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
    const serial = module.getSerialNumber();
    const moduleCount = module.getTotalModuleAmount();
    const isHeld = (clickTimeMs - module.getTimeRemainingMs()) > 250;
    console.log(releaseHeldButton(isHeld));

    if(bgColor === "blue" && text === "Submit") {
        if(releaseHeldButton(isHeld)){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }else if(batteries > 1 && text === "Launch") {
        if(!isHeld){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
        
    }else if(bgColor === "white" && serial.match(/[AEIOU]/)) {
        if(releaseHeldButton(isHeld)){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }else if(batteries>2 && moduleCount>6){
        if(!isHeld){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }else if(bgColor === "yellow") {
        if(releaseHeldButton(isHeld)){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }else if(bgColor === "red" && text === "Hold") {
      if(!isHeld){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }else{
        if(releaseHeldButton(isHeld)){
            module.sendSolve();
            document.querySelector('#indicator rect').setAttribute("fill", "grey");
            isPressed = false;
            return;
        }
    }

    module.sendStrike();
    document.querySelector('#indicator rect').setAttribute("fill", "grey");
    isPressed = false;

}

function releaseHeldButton(isHeld){
    if(!isHeld) return false;

    console.log(module.getUnsolvedModuleAmount());

    let color_to_statement = {
        "blue": releaseTime.includes("4"),
        "white": releaseTime.includes(module.getSolvedModuleAmount() < module.getTotalModuleAmount()/2 ? "8" : "1"),
        "yellow": releaseTime.includes("5"),
        "purple": releaseTime.includes(module.isPortPresent(module.PORTS.STEREO_RCA) || module.isPortPresent(module.PORTS.SERIAL) ? "2": "5"),
    };

    if(!Object.keys(color_to_statement).includes(stripColor)) return releaseTime.includes("3");

    return color_to_statement[stripColor];
}

// Function to change the button color
function changeButtonColor() {
    const bgcolors = ["yellow","red","white","blue", "black"];
    const colors = ["black", "white","black", "white", "white"];
    const fillColors = ["yellow","blue","white","red","purple"];
    const arr = ["Hit", "Hold", "Submit", "Launch"];

    let randomNumber = Math.floor(Math.random() * bgcolors.length) 
    const button = document.getElementById("Knop");
    bgColor = bgcolors[randomNumber];
    stripColor = fillColors[Math.floor(Math.random() * fillColors.length)];
    text = arr[Math.floor(Math.random() * arr.length)];

     if (button){
        button.style.backgroundColor = bgColor;
        button.style.color = colors[randomNumber];
        button.style.border = "2px solid " + bgColor;
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
  
