// Service worker to intercept requests
let lastToken = null;
let lastTokenTimestamp = null;
let currentUrl = "https://localhost:8080/*";
let listenerCallback = null;

chrome.storage.local.get(["lastToken", "monitoringUrl"], (result) => {
	if (result.lastToken) {
		lastToken = result.lastToken;
		console.log("Previous token loaded from storage");
	}
	if (result.monitoringUrl) {
		currentUrl = result.monitoringUrl;
		console.log("Monitoring URL loaded:", currentUrl);
	}
	setupListener(currentUrl);
});

function setupListener(urlPattern) {
	// Remove the old listener if it exists
	if (listenerCallback) {
		chrome.webRequest.onBeforeSendHeaders.removeListener(listenerCallback);
	}

	// Create the new callback
	listenerCallback = (details) => {
		const authHeader = details.requestHeaders?.find((header) => header.name.toLowerCase() === "authorization");

		if (authHeader?.value) {
			const tokenMatch = authHeader.value.split(" ");
			if (tokenMatch.length === 2 && tokenMatch[0].toLowerCase() === "bearer") {
				const token = tokenMatch[1];

				if (token !== lastToken) {
					lastToken = token;
					lastTokenTimestamp = new Date().toISOString();

					// Save to persistent storage
					chrome.storage.local.set({
						lastToken: token,
						lastUpdate: lastTokenTimestamp,
					});

					chrome.runtime
						.sendMessage({
							type: "TOKEN_CAPTURED",
							token: token,
							timestamp: new Date().toISOString(),
						})
						.catch(() => {});
				}
			}
		}

		return { requestHeaders: details.requestHeaders };
	};

	// Add the new listener
	chrome.webRequest.onBeforeSendHeaders.addListener(listenerCallback, { urls: [urlPattern] }, ["requestHeaders"]);

	console.log("Listener setup for:", urlPattern);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "GET_LAST_TOKEN") {
		// Always fetch from persistent storage to handle service worker restarts
		chrome.storage.local.get(["lastToken", "lastUpdate"], (result) => {
			sendResponse({
				token: result.lastToken || lastToken,
				timestamp: result.lastUpdate || lastTokenTimestamp,
			});
		});
		return true; // Keep the channel open for async response
	} else if (message.type === "UPDATE_URL") {
		currentUrl = message.url;
		chrome.storage.local.set({ monitoringUrl: message.url });
		setupListener(message.url);
		console.log("URL updated to:", message.url);
	}
	return true;
});
