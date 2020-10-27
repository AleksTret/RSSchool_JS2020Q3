window.onscroll = function() {myFunction()};

let header = document.getElementById("pets__header");
let sticky = header.offsetTop;

function myFunction() {
    if (window.pageYOffset > sticky) {
    header.classList.add("sticky");
    } else {
    header.classList.remove("sticky");
    }
}