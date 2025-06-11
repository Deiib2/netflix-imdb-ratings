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
