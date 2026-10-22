
var selectedColor = "blue";

function changeColor(color) {

    selectedColor = color;

    document.getElementById("message").innerHTML = "";

    var bg, main, box, input, text;

    if (color == "blue") {
        bg = "#EAF3FA";
        main = "#527DA8";
        box = "#F5FAFF";
        input = "#DCEBF7";
        text = "#315C85";

    } else if (color == "green") {
        bg = "#EDF4EA";
        main = "#66876A";
        box = "#F7FBF5";
        input = "#E1ECDD";
        text = "#426844";

    } else if (color == "yellow") {
        bg = "#FFF8E5";
        main = "#C4A64B";
        box = "#FFFCF2";
        input = "#FFF0BF";
        text = "#80651C";
    }

    document.body.style.backgroundColor = bg;
    document.getElementById("header").style.backgroundColor = main;
    document.getElementById("footer").style.backgroundColor = main;
    document.getElementById("loginBox").style.backgroundColor = box;
    document.getElementById("loginBox").style.borderColor = main;

    document.querySelector(".login-box h2").style.color = text;

    document.getElementById("username").style.backgroundColor = input;
    document.getElementById("password").style.backgroundColor = input;

    document.getElementById("username").style.borderColor = main;
    document.getElementById("password").style.borderColor = main;

    document.querySelector(".login-box button").style.backgroundColor = main;
}

function login() {

    if (selectedColor == "blue") {
        document.getElementById("message").style.color = "green";
        document.getElementById("message").innerHTML = "Login Successfully!";
    } else {
        document.getElementById("message").style.color = "red";
        document.getElementById("message").innerHTML =
            "Warning! Login allowed in Blue theme only.";
    }
}
