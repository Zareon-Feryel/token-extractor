let lastTokenData = {
	token: null,
	timestamp: null,
};

// Load URL and token on startup
chrome.storage.local.get(["monitoringUrl", "lastToken", "lastUpdate"], (result) => {
	const url = result.monitoringUrl || "https://localhost:8080/*";
	document.getElementById("urlInput").value = url;

	if (result.lastToken) {
		displayToken(result.lastToken, result.lastUpdate);
	}
});

// Listen for changes on the URL field
document.getElementById("urlInput").addEventListener("change", (e) => {
	const url = e.target.value.trim();
	if (url) {
		chrome.storage.local.set({ monitoringUrl: url }, () => {
			console.log("URL updated:", url);
			updateStatusDisplay(url);
			// Notify the background script of the new URL
			chrome.runtime.sendMessage({ type: "UPDATE_URL", url: url }).catch(() => {});
		});
	}
});

// Request the last token from the service worker (fallback)
chrome.runtime.sendMessage({ type: "GET_LAST_TOKEN" }, (response) => {
	if (response?.token) {
		displayToken(response.token, response.timestamp);
	}
});

// Listen for new tokens
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "TOKEN_CAPTURED") {
		lastTokenData.token = message.token;
		lastTokenData.timestamp = message.timestamp;
		displayToken(message.token, message.timestamp);
	}
});

function updateStatusDisplay(url) {
	const statusDiv = document.getElementById("statusDiv");
	statusDiv.textContent = `✓ Extension active - Listening on ${url}`;
}

function displayToken(token, timestamp = null) {
	const tokenDiv = document.getElementById("lastToken");
	const timestampHtml = timestamp ? `<span class="timestamp">at ${new Date(timestamp).toLocaleString("en-US")}</span>` : "";

	tokenDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <strong>Last captured token ${timestampHtml}</strong>
      <button id="copyBtn" class="copy-btn">Copy</button>
    </div>
    <div class="token-info">
      ${token}
    </div>
  `;

	document.getElementById("copyBtn").addEventListener("click", () => {
		navigator.clipboard.writeText(token).then(() => {
			const btn = document.getElementById("copyBtn");
			btn.textContent = "Copied!";
			btn.classList.add("copied");
			setTimeout(() => {
				btn.textContent = "Copy";
				btn.classList.remove("copied");
			}, 2000);
		});
	});
}
