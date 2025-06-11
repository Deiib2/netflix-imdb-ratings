chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'fetchImdb') {
    fetch(`https://www.imdb.com/find/?q=${request.title}&s=tt&exact=true&ref_=fn_ttl_ex`)
      .then(res => res.text())
      .then(htmlText => {
        sendResponse({ html: htmlText });
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        sendResponse({ error: 'Failed to fetch IMDb data' });
      });
    return true; // Needed to use sendResponse asynchronously
  } else if (request.type === 'fetchRating') {
    fetch('https://graph.imdbapi.dev/v1', {
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
      return res.json();
    })
      .then(data => {
        console.log(JSON.stringify(data, null, 2));
        sendResponse({ json: data });
      })
      .catch(err => {
        console.error("Error fetching graphQL:", err);
        sendResponse({ error: 'Failed to fetch IMDb ratings from imdbapi.dev' });
      });
    return true;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tab);
  if (tab.url && (tab.url.includes("netflix.com/browse") || tab.url.includes("netflix.com/latest"))) {
    console.log("HII");
    chrome.tabs.sendMessage(tabId, {
      type: "browse",
      querySelect: ".slider-item",
      secondParent: ".lolomo"
    });
  } else if (tab.url && tab.url.includes("netflix.com/search")) {
    chrome.tabs.sendMessage(tabId, {
      type: "search",
      querySelect: ".ltr-1cjyscz",
      secondParent: ".ltr-gncw81"
    });
  }
});
