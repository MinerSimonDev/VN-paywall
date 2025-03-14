function removePaywall() {
    let checkInterval = setInterval(() => {
        let modal = document.querySelector(".tp-modal");
        let backdrop = document.querySelector(".tp-backdrop");

        if (modal || backdrop) {
            console.log("Paywall detected, removing...");
            modal?.remove();
            backdrop?.remove();
            clearInterval(checkInterval);
            enableScrolling();
        }
    }, 500);
}

// Force enable scrolling
function enableScrolling() {
    console.log("Enabling scrolling...");
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    document.body.style.position = "relative";
    document.documentElement.style.position = "relative";

    let styleTag = document.createElement("style");
    styleTag.innerHTML = `
        body, html { overflow: auto !important; position: relative !important; height: auto !important; }
        * { scroll-behavior: smooth !important; }
    `;
    document.head.appendChild(styleTag);

    new MutationObserver(() => {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
    }).observe(document.body, { attributes: true, attributeFilter: ["style"] });
}

// Insert extracted article text
function insertArticleText(articleText) {
    console.log("Inserting extracted article text...");
    
    let targetElement = document.querySelector(".wp-block-russmedia-nordstern-lead.lead");

    if (!targetElement) {
        console.warn("Target element not found. Trying an alternative...");
        targetElement = document.querySelector("article") || document.querySelector("main");
    }

    if (targetElement) {
        let newText = document.createElement("div");
        newText.innerHTML = `<p style="font-size:18px; line-height:1.5; padding:20px; background:#f9f9f9; border-radius:8px;">
            ${articleText.replace(/\n/g, "<br>")}
        </p>`;
        
        targetElement.insertAdjacentElement("afterend", newText);
        console.log("Article text inserted successfully.");
    } else {
        console.error("No suitable element found to insert the text.");
    }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);
    
    if (message.articleText && message.articleText.trim() !== "") {
        insertArticleText(message.articleText);
    } else {
        console.error("No valid article text received.");
    }
});

// Run functions when the page loads
window.addEventListener("load", () => {
    removePaywall();
    enableScrolling();
});
