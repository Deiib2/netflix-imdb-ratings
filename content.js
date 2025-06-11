function createIMDbRatingElement(topmargin) {
    const newdiv = document.createElement('div');

    //const ratingClass = rating >= 8.5 ? 'rating-num-gold' : rating >= 5.5 ? 'rating-num-white' : 'rating-num-red';
    const imdbratinglowered = topmargin ? 'imdb-rating-lowered' : '';

    newdiv.innerHTML = `<div class="imdb-rating ${imdbratinglowered}">
<svg xmlns="http://www.w3.org/2000/svg" aria-label="IMDb" role="img" viewBox="64 184 384 144" width="32px" height="12px" fill="#f5c518" stroke="#f5c518" stroke-width="0.00512" preserveAspectRatio="none">
  <path d="M104 328V184H64v144zM189 184l-9 67-5-36-5-31h-50v144h34v-95l14 95h25l13-97v97h34V184zM256 328V184h62c15 0 26 11 26 25v94c0 14-11 25-26 25zm47-118l-9-1v94c5 0 9-1 10-3 2-2 2-8 2-18v-56-12l-3-4zM419 220h3c14 0 26 11 26 25v58c0 14-12 25-26 25h-3c-8 0-16-4-21-11l-2 9h-36V184h38v46c5-6 13-10 21-10zm-8 70v-34l-1-11c-1-2-4-3-6-3s-5 1-6 3v57c1 2 4 3 6 3s6-1 6-3l1-12z"></path>
</svg><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" class="imdb-star" viewBox="0 0 24 24" role="presentation"><path d="M12 17.27l4.15 2.51c.76.46 1.69-.22 1.49-1.08l-1.1-4.72 3.67-3.18c.67-.58.31-1.68-.57-1.75l-4.83-.41-1.89-4.46c-.34-.81-1.5-.81-1.84 0L9.19 8.63l-4.83.41c-.88.07-1.24 1.17-.57 1.75l3.67 3.18-1.1 4.72c-.2.86.73 1.54 1.49 1.08l4.15-2.5z"></path></svg>
<div class="skeleton-square"></div>
/10
    
</div>`;
    return newdiv.firstElementChild;
}

function addImdbRating(params) {
    const imdbRatingDiv = params.doc.querySelector('.skeleton-square');
    console.log(imdbRatingDiv);
    if (imdbRatingDiv) {
        imdbRatingDiv.classList.remove('skeleton-square');
        if (params.rating >= 8.5) {
            imdbRatingDiv.classList.add('rating-num-gold');
        } else if (params.rating >= 5.5) {
            imdbRatingDiv.classList.add('rating-num-white');
        } else {
            imdbRatingDiv.classList.add('rating-num-red');
        }
        imdbRatingDiv.textContent = params.rating;
    }

}

function addIMDbRatings() {
    const parents = document.querySelectorAll('.slider-item');

    if (parents) {
        parents.forEach((parent) => {
            if (!parent.querySelector('.imdb-rating')) {
                //console.log("firstChild!: ", parent.firstElementChild);
                //console.log(parent.firstElementChild.querySelector('.progress'));
                if (!parent.firstElementChild.firstElementChild.querySelector('.boxart-rounded--mobile-game')) {
                    let imdbRating;
                    if (parent.firstElementChild.querySelector('.progress')) {
                        imdbRating = createIMDbRatingElement(true);
                        parent.appendChild(imdbRating);
                    } else {
                        imdbRating = createIMDbRatingElement(false);
                        parent.appendChild(imdbRating);
                    }
                    const aElement = parent.querySelector('a');
                    if (aElement) {
                        const title = aElement.getAttribute('aria-label');
                        console.log(title);
                        if (title) {
                            //fetchImdbDocument({ title });
                            console.log('yes title');
                            addImdbRating({ doc: imdbRating, rating: 8.4 });
                        } else {
                            console.log('no title');
                            //addImdbRating({doc: imdbRating, rating: 0.0});
                        }
                    }

                }
            }
        });
    }
}

function fetchImdbDocument(params) {
    chrome.runtime.sendMessage({ type: "fetchImdb", title: params.title }, response => {
        if (response.error) {
            console.error(response.error);
        } else {
            const parser = new DOMParser();
            const doc = parser.parseFromString(response.html, "text/html");
            console.log(doc);
            console.log("with ID: ", doc.querySelector('a.ipc-metadata-list-summary-item__t'));
        }
    });
}

//((3 + Math.random()*7).toFixed(1))

const parentElement = document.querySelector('#main-view');

const observer = new MutationObserver((entries, obs) => {
    addIMDbRatings();
    console.log("entries: ", entries);
    const lolomo = document.querySelector('.lolomo');
    if (lolomo) {
        obs.disconnect();
        observer.observe(lolomo, { childList: true });
    }
});

observer.observe(parentElement, { childList: true });
