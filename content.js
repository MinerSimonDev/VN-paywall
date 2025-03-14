function forceEnableScrolling() {
    console.log("Aktiviere Scrollen...");
    document.body.style.overflow = "auto"; 
    document.documentElement.style.overflow = "auto";
    document.body.style.position = "relative"; // Reset position if fixed
    document.documentElement.style.position = "relative";

    // Remove any styles that might block scrolling
    let styleTag = document.createElement("style");
    styleTag.innerHTML = `
        body, html { overflow: auto !important; position: relative !important; height: auto !important; }
        * { scroll-behavior: smooth !important; }
    `;
    document.head.appendChild(styleTag);

    // Monitor changes and reapply the scrolling fix if necessary
    new MutationObserver(() => {
        document.body.style.overflow = "auto";
        document.documentElement.style.overflow = "auto";
    }).observe(document.body, { attributes: true, attributeFilter: ["style"] });
}

// Call forceEnableScrolling once immediately...
forceEnableScrolling();
setInterval(forceEnableScrolling, 1000);

// --- Retrieve and insert article text from storage ---
chrome.storage.local.get("articleText", (data) => {
    if (data.articleText) {
        console.log("📩 Retrieved articleText from storage:\n", data.articleText);

        // Locate the target element (the <h4> with the lead text)
        let targetElement = document.querySelector("h4.wp-block-russmedia-nordstern-lead.lead");
        if (targetElement) {
            console.log("✅ Found target element:", targetElement);
            let newParagraph = document.createElement("p");
            newParagraph.textContent = data.articleText;
            newParagraph.style.background = "#f8f9fa";
            newParagraph.style.padding = "10px";
            newParagraph.style.border = "1px solid #ddd";
            newParagraph.style.marginTop = "10px";
            newParagraph.style.fontSize = "16px";
            targetElement.insertAdjacentElement("afterend", newParagraph);
            console.log("✅ Inserted extracted text into page.");
        } else {
            console.warn("⚠️ Target element not found!");
        }
    } else {
        console.warn("⚠️ No articleText found in storage.");
    }
});

// --- Paywall Removal ---
function removePaywall() {
    let checkInterval = setInterval(() => {
        let modal = document.querySelector(".tp-modal");
        let backdrop = document.querySelector(".tp-backdrop");

        if (modal || backdrop) {
            console.log("🚨 Paywall detected, removing...");
            modal?.remove();
            backdrop?.remove();
            forceEnableScrolling();
            clearInterval(checkInterval);

            let targetElement = document.querySelector("h4.wp-block-russmedia-nordstern-lead.lead");
            if (targetElement) {
                let notice = document.createElement("p");
                notice.innerText = "Paywall removed. Content injected below.";
                notice.style.color = "green";
                targetElement.insertAdjacentElement("afterend", notice);
            }
        }
    }, 500);
}

window.addEventListener("load", () => {
    removePaywall();
});
