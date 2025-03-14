const loggedUrls = new Set();
let firstUrlProcessed = false;

chrome.webRequest.onCompleted.addListener(
  async (details) => {
    const requestUrl = details.url;

    if (!requestUrl.endsWith(".vn")) return;
    if (loggedUrls.has(requestUrl)) return;

    loggedUrls.add(requestUrl);
    console.log("🔍 Intercepted request:", requestUrl);

    try {
      const response = await fetch(requestUrl);
      const text = await response.text();

      if (!firstUrlProcessed) {
        firstUrlProcessed = true;
        const extractedText = extractArticleText(text);
        console.log("📝 Extracted Article Text:\n", extractedText);

        // Save the extracted text in chrome.storage.local
        chrome.storage.local.set({ articleText: extractedText }, () => {
          console.log("💾 Saved articleText to local storage!");
        });
      }
    } catch (error) {
      console.error("❌ Error fetching response:", error);
    }

    setTimeout(() => loggedUrls.delete(requestUrl), 60000);
  },
  { urls: ["<all_urls>"] }
);

function extractArticleText(html) {
  const matches = html.match(/<p[^>]*>(.*?)<\/p>/g);
  if (!matches) return "⚠️ No article text found.";
  return matches.map(p => p.replace(/<[^>]+>/g, '')).join("\n\n");
}
