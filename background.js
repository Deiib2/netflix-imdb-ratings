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
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log(tab);
  if (tab.url && (tab.url.includes("netflix.com/browse") || tab.url.includes("netflix.com/latest"))){
    console.log("HII");
    chrome.tabs.sendMessage(tabId, {
      type: "browse",
      querySelect: ".slider-item",
      secondParent: ".lolomo"
    });
  } else if (tab.url && tab.url.includes("netflix.com/search")){
    chrome.tabs.sendMessage(tabId, {
      type: "search",
      querySelect: ".ltr-1cjyscz",
      secondParent: ".ltr-gncw81"
    });
  }
});
