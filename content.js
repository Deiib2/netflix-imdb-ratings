//Notes: handle the back button (span.handle.handlePrev.active)

















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
    if (imdbRatingDiv) {
        imdbRatingDiv.classList.remove('skeleton-square');
        if (!numericRegex.test(params.rating)) {
            imdbRatingDiv.classList.add('rating-num-white');
        }
        else if (params.rating >= 8.5) {
            imdbRatingDiv.classList.add('rating-num-gold');
        } else if (params.rating >= 5.5) {
            imdbRatingDiv.classList.add('rating-num-white');
        } else {
            imdbRatingDiv.classList.add('rating-num-red');
        }
        imdbRatingDiv.textContent = Number(params.rating).toFixed(1);
    }

}

function addIMDbRatings(params) {
    const parents = document.querySelectorAll(params.querySelect);

    if (parents) {
        parents.forEach((parent) => {
            if (!parent.querySelector('.imdb-rating')) {
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
                        if (title) {
                            chrome.storage.local.get([title]).then((result) => {
                                console.log("cache result: ", result);
                                if (result && result[title]) {
                                    addImdbRating({ doc: imdbRating, rating: result[title] });
                                } else {
                                    getRatingFromTitle({ title: title, imdbRating: imdbRating });
                                }
                            });
                        } else {
                            addImdbRating({ doc: imdbRating, rating: 'NA' });
                        }
                    }

                }
            }
        });
    }
}

function getRatingFromTitle(props) {
    fetchImdbRating({ title: props.title })
        .then(rating => {
            addImdbRating({ doc: props.imdbRating, rating: rating });
            chrome.storage.local.set({ [props.title]: rating }).then(() => {
                console.log(props.title, ' added to cache');
            });
        })
        .catch(error => {
            console.log('Bla Bla Adham', error);
            if (error.Error === "Movie not found!") {
                addImdbRating({ doc: props.imdbRating, rating: 'NA' });
                chrome.storage.local.set({ [props.title]: 'Not Found' }).then(() => {
                    console.error(props.title, ' added to cache with ERROR');
                });
            } else {
                addImdbRating({ doc: props.imdbRating, rating: 'ER' });
            }

        });
}

function fetchImdbRating(params) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ type: "fetchImdbRating", title: encodeURIComponent(params.title) }, response => {
                console.log('hello adhoom', response);
            if (response.error) {
                console.error('Hi Adham IMDB: ', response.error);
                reject(response.error);
            } else {
                resolve(response.rating);
            }
        });
    });
}

chrome.storage.local.get(null, function(items) {
  console.log(items); // All cached key-value pairs
});

//((3 + Math.random()*7).toFixed(1))
const numericRegex = /^-?\d+(\.\d+)?$/;

let querySelect, secondParent, nextButtonSpans;
if (window.location.pathname.includes('/browse')) {
    querySelect = ".slider-item";
    secondParent = ".lolomo";
} else if (window.location.pathname.includes('/search')) {
    querySelect = ".ltr-1cjyscz";
    secondParent = ".ltr-gncw81";
}

var firstChangeFlag = false;

const parentElement = document.querySelector('#main-view');
const observer = new MutationObserver((entries, obs) => {
    addIMDbRatings({ querySelect });
    console.log("entries: ", entries);

    const parentDiv = document.querySelector(secondParent);
    if (parentDiv && !firstChangeFlag) {
        firstChangeFlag = true;
        obs.disconnect();
        observer.observe(parentDiv, { childList: true });
    }
    nextButtonSpans = document.querySelectorAll('span.handle.handleNext.active, span.handle.handlePrev.active');
    if (nextButtonSpans) {
        var i = 0;
        nextButtonSpans.forEach((nbs) => {
            nbs.addEventListener('click', () => {
                addIMDbRatings({ querySelect: querySelect });
            });
        })
    }
});



const secondParentElement = document.querySelector(secondParent);
if (secondParentElement) {
    observer.observe(secondParentElement, { childList: true });
} else {
    observer.observe(parentElement, { childList: true });
}

(() => {
    chrome.runtime.onMessage.addListener((request, sender, response) => {
        const type = request.type;
        if (type !== "browse" && type !== "search") return;
        console.log(type);
        querySelect = request.querySelect;
        secondParent = request.secondParent;
        observer.disconnect();
        firstChangeFlag = false;
        const parentElement = document.querySelector('#main-view');
        const secondParentElement = document.querySelector(secondParent);
        if (secondParentElement) {
            observer.observe(secondParentElement, { childList: true });
        } else {
            observer.observe(parentElement, { childList: true });
        }
        addIMDbRatings({ querySelect });
        if (type === "browse") {
            nextButtonSpans = document.querySelectorAll('span.handle.handleNext.active, span.handle.handlePrev.active');
            if (nextButtonSpans) {
                nextButtonSpans.forEach((nbs) => {
                    nbs.parentElement.children[0];
                    nbs.addEventListener('click', () => {
                        addIMDbRatings({ querySelect: querySelect });
                    });
                })
            }
        }

    })
})();

