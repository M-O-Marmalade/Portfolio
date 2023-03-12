let isACardFlipped = false;
let flipCardUniqueIDCounter = 0;

const cardClass = "project";
const closeButtonClass = "projectXButton";
const frontClass = "projectFront";
const backClass = "projectBack";
const backScrollableClass = "projectBackScrollable";


function openFlipCard(card) {
    if (!card.id) {card.id = "flipCardUniqueID" + flipCardUniqueIDCounter++;}
    
    if (isACardFlipped) {return;}   //exit if a card is already flipped
    isACardFlipped = true;  //record that we have a card flipped

    const origRect = card.getBoundingClientRect();  //store the element's bounding rectangle before any changes are made

    const clone = card.cloneNode(true); //create and add the clone to be flipped
    clone.id = clone.id + "clone";
    clone.querySelector('.' + closeButtonClass).addEventListener('click', function() {
        closeFlipCard(clone);
    });

    document.body.lastChild.after(clone);

    card.style.visibility = 'hidden';   //hide the original element
    
    clone.style.transform = 'translateZ(999px)';
    clone.style.transition = '1s, visibility 0s';
    clone.style.position = 'fixed'; //set the clone's starting position/size to be transitioned from
    clone.style.margin = '0px';
    clone.style.top = origRect.top + 'px';
    clone.style.left = origRect.left + 'px';
    clone.style.width = origRect.width + 'px';
    clone.style.height = origRect.height + 'px';

    
    requestAnimationFrame(function() {  //set the clone's ending position/size to be transitioned to on the next frame, so it will actually transition
        requestAnimationFrame(function() {
            clone.style.top = '5vh'
            clone.style.left = '3vw';
            clone.style.width = '94vw';
            clone.style.height = '90vh';
            clone.style.transform = 'rotateY(180deg) translateZ(-43px)';
            clone.style.zIndex = 10;
            clone.querySelector('.' + frontClass).style.position = 'absolute';
            clone.querySelector('.' + backClass).style.position = 'static';
            
            clone.querySelector('.' + backScrollableClass).style.overflow = 'scroll';
        });
    });
}

document.querySelectorAll('.' + cardClass).forEach(item => {
    item.addEventListener('click', function() {
        openFlipCard(item);
    });
});

function closeFlipCard(card) {
    if (!isACardFlipped) {return;}
    isACardFlipped = false;
    
    // console.log(card.id + "'s close button clicked!");
    // console.log(card.style.position);

    const origCard = document.getElementById(card.id.slice( 0, -5 ));
    const container = origCard.parentElement;

    const cardTop = card.getBoundingClientRect().top;
    const cardLeft = card.getBoundingClientRect().left;
    const origTop = origCard.getBoundingClientRect().top;
    const origLeft = origCard.getBoundingClientRect().left;
    const origWidth = origCard.getBoundingClientRect().width;
    const origHeight = origCard.getBoundingClientRect().height;
    const containerTop = origCard.parentElement.getBoundingClientRect().top;
    const containerLeft = origCard.parentElement.getBoundingClientRect().left;

    card.style.top = '0px';
    card.style.left = '0px';
    card.style.margin = (cardTop - containerTop) + 'px 0px 0px ' + (cardLeft - containerLeft) + 'px';
    card.style.position = 'absolute';
    container.insertBefore(card, container.firstChild);

    requestAnimationFrame(function() {  //set the card's ending position/size to be transitioned to on the next frame, so it will actually transition
        requestAnimationFrame(function() {
            card.style.width = origWidth + 'px';
            card.style.height = origHeight + 'px';
            card.style.margin = card.style.margin = (origTop - containerTop) + 'px 0px 0px ' + (origLeft - containerLeft) + 'px';
            card.style.transform = 'rotateY(0deg)';
            card.addEventListener('transitionend', function() {
                origCard.style.visibility = 'visible';
                card.remove();
            });
        });
    });
};

function switchCard(thisEl, closeID, openID) {
    thisEl.style.transition = '0s';
    closeFlipCard(document.getElementById(closeID + 'clone'));
    setTimeout(function(){openFlipCard(document.getElementById(openID))},347);
}