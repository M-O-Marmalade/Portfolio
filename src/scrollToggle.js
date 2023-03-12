const scrollButton = document.getElementById("toggleScroll");
const buttonWidth = scrollButton.style.width;
let scrollingEnabled = true;
function toggleScrolling(){
    scrollingEnabled = !scrollingEnabled;
    if (scrollingEnabled) {
        document.body.style.touchAction = 'auto'; // enable touch scroll
        scrollButton.style.width = buttonWidth;
        scrollButton.style.margin = '1rem 10vw 1rem auto';
    }
    else {
        document.body.style.touchAction = 'none'; // disable touch scroll
        scrollButton.style.width = '80px';
        scrollButton.style.margin = '1rem 1rem 1rem auto';
    }
}

// when a touch screen is detected, we will unhide the button
document.body.addEventListener('touchmove', function(){
    document.getElementById("toggleScroll").style.visibility = 'visible';
    document.getElementById("projectCardInstructionsP").innerHTML = 'Tap on a project!';
});