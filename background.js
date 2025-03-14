const loggedUrls = new Set();
let firstUrlProcessed = false;

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const requestUrl = details.url;

    if (!requestUrl.endsWith(".vn")) return;
    if (loggedUrls.has(requestUrl)) return;

    loggedUrls.add(requestUrl);
    console.log("Intercepted request:", requestUrl);

    try {
      const response = await fetch(requestUrl);
      const text = await response.text();

      if (!firstUrlProcessed) {
        firstUrlProcessed = true;
        const extractedText = extractArticleText(text);

        // Sende den extrahierten Text an content.js
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, { articleText: extractedText });
          }
        });
      }
    } catch (error) {
      console.error("Error fetching response:", error);
    }

    setTimeout(() => loggedUrls.delete(requestUrl), 60000);
  },
  { urls: ["<all_urls>"] }
);

function extractArticleText(html) {
  const matches = html.match(/<p[^>]*>(.*?)<\/p>/g);
  if (!matches) return "Kein Artikeltext gefunden.";
  return matches.map(p => p.replace(/<[^>]+>/g, '')).join("\n\n");
}
