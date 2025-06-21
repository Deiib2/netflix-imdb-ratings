chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === 'fetchImdbRating') {
    fetch(`https://www.omdbapi.com/?t=${request.title}&apikey=`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP response: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log(JSON.stringify(data, null, 2));
        console.log(data.imdbRating);
        if ((data.Error && data.Error == "Movie not found!") || (data.Title && data.Title !== decodeURIComponent(request.title))) {
          //fetch imdb search REST API
          fetchRatingRestv2({ title: request.title })
            .then(res => sendResponse(res.rating ? { rating: res.rating } : { error: res.error }))
            .catch(err => sendResponse(err));
        } else if (data.Error) {
          console.error('Fetch failed:', data.Error);
          sendResponse({ error: data.Error });
        } else {
          if (data.imdbRating == "N/A") {
            fetchRatingGraphQL({ imdbId: data.imdbID })
              .then(res => sendResponse(res.rating ? { rating: res.rating } : { error: res.error }))
              .catch(err => sendResponse(err));
          } else {
            sendResponse({ rating: data.imdbRating });
          }
        }
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        sendResponse(error);
      });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tab);
  console.log(changeInfo);
  tab.url.includes("netflix.com/browse/my-list")
  if (!(tab.url && tab.status && tab.status == 'complete')) return;
  if (tab.url.includes("netflix.com/browse/my-list") ||
    (tab.url.includes("netflix.com/browse/genre") && tab.url.includes("?") && tab.url.split("?")[1].includes("so=")) ||
    tab.url.includes("netflix.com/browse/original-audio") || tab.url.includes("netflix.com/browse/audio") || tab.url.includes("netflix.com/browse/subtitles")
  ) {
    console.log('my-list');
    chrome.tabs.sendMessage(tabId, {
      type: "my-list",
      querySelect: ".slider-item",
      secondParent: ".gallery"
    });
  } else if ((tab.url.includes("netflix.com/browse") || tab.url.includes("netflix.com/latest"))) {
    console.log("HII");
    chrome.tabs.sendMessage(tabId, {
      type: "browse",
      querySelect: ".slider-item",
      secondParent: ".lolomo"
    });
  } else if (tab.url.includes("netflix.com/search")) {
    chrome.tabs.sendMessage(tabId, {
      type: "search",
      querySelect: ".ltr-1cjyscz",
      secondParent: ".ltr-gncw81"
    });
  }
});

function fetchRatingGraphQL(request) {
  console.log("GraphQL v1: ", request);
  return fetch('https://graph.imdbapi.dev/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: 'query Title ($id: ID!){title(id: $id) { rating {aggregate_rating} } }',
      variables: {
        id: request.imdbId
      }
    })
  }).then(res => {
    console.log(res);
    if (!res.ok) {
      throw new Error(`GraphQL response: ${res.status}`);
    }
    return res.json();
  })
    .then(data => {
      console.log(JSON.stringify(data, null, 2));
      if (data.errors) {
        return { error: data.errors[0].message };
      } else {
        return { rating: data.data.title.rating == null ? 'Unrated' : data.data.title.rating.aggregate_rating };
      }
    })
    .catch(err => {
      console.error("Error fetching graphQL:", err);
      return { error: 'Failed to fetch IMDb ratings from imdbapi.dev' };
    });
}

function fetchRatingRestv2(request) {
  console.log("REST v2: ", request);
  return fetch(`https://rest.imdbapi.dev/v2/search/titles?query=${request.title}&page_size=1`)
    .then(res => res.json())
    .then(data => {
      if (data.titles && data.titles.length > 0) {
        console.log(request.title, ": ", data.titles[0]);
        return { rating: data.titles[0].rating.aggregate_rating };
      } else {
        console.warn('No movies Found for title: ', request.title, ' : ', data);
        return { error: { Error: "Movie not found!" } };
      }
    })
    .catch(error => {
      console.error('Fetch failed:', error);
      return { error };
    });
}