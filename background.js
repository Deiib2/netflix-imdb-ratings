import {apiKey} from './draft.js';
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === 'fetchImdbRating') {
    fetch(`http://www.omdbapi.com/?t=${request.title}&apikey=${apiKey}`)
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
  if (tab.url && (tab.url.includes("netflix.com/browse") || tab.url.includes("netflix.com/latest")) && changeInfo.status && changeInfo.status == 'Complete') {
    console.log("HII");
    chrome.tabs.sendMessage(tabId, {
      type: "browse",
      querySelect: ".slider-item",
      secondParent: ".lolomo"
    });
  } else if (tab.url && tab.url.includes("netflix.com/search") && changeInfo.status && changeInfo.status == 'Complete') {
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
      console.log(request.title, ": ", data.titles[0]);
      if (data.titles) {
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