// Service worker pour intercepter les requêtes
let lastToken = null;
let lastTokenTimestamp = null;
let fileHandle = null;
let currentUrl = "https://localhost:8080/*";
let listenerCallback = null;

chrome.storage.local.get(["lastToken", "monitoringUrl"], (result) => {
	if (result.lastToken) {
		lastToken = result.lastToken;
		console.log("Token précédent chargé depuis le storage");
	}
	if (result.monitoringUrl) {
		currentUrl = result.monitoringUrl;
		console.log("URL de monitoring chargée:", currentUrl);
	}
	setupListener(currentUrl);
});

function setupListener(urlPattern) {
	// Enlever l'ancien écouteur s'il existe
	if (listenerCallback) {
		chrome.webRequest.onBeforeSendHeaders.removeListener(listenerCallback);
	}

	// Créer le nouveau callback
	listenerCallback = (details) => {
		const authHeader = details.requestHeaders?.find((header) => header.name.toLowerCase() === "authorization");

		if (authHeader && authHeader.value) {
			const match = authHeader.value.match(/^Bearer\s+(.+)$/i);

			if (match && match[1]) {
				const token = match[1];

				if (token !== lastToken) {
					lastToken = token;
					lastTokenTimestamp = new Date().toISOString();

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

	// Ajouter le nouvel écouteur
	chrome.webRequest.onBeforeSendHeaders.addListener(
		listenerCallback,
		{ urls: [urlPattern] },
		["requestHeaders"],
	);

	console.log("Listener setup pour:", urlPattern);
}

let downloadInProgress = false;
let downloadTimeout = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "GET_LAST_TOKEN") {
		sendResponse({ token: lastToken, timestamp: lastTokenTimestamp });
	} else if (message.type === "UPDATE_URL") {
		currentUrl = message.url;
		chrome.storage.local.set({ monitoringUrl: message.url });
		setupListener(message.url);
		console.log("URL mise à jour vers:", message.url);
	}
	return true;
});
