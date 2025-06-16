chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.type === 'fetchImdbRating') {
    fetch(`http://www.omdbapi.com/?t=${request.title}&apikey=$apiKey`)
      .then(res => res.json())
      .then(data => {
        console.log(JSON.stringify(data, null, 2));
        console.log(data.imdbRating);
        if (data.Error) {
          console.error('Fetch failed:', data.Error);
          sendResponse({ error: data.Error });
        } else {
          sendResponse({ rating: data.imdbRating });
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
