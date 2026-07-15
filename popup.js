let lastTokenData = {
	token: null,
	timestamp: null,
};

// Load URL and token on startup
chrome.storage.local.get(["monitoringUrl", "lastToken", "lastUpdate"], (result) => {
	const url = result.monitoringUrl || "https://localhost:8080/*";
	document.getElementById("urlInput").value = url;
	updateStatusDisplay(url);

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
	const statusText = document.getElementById("statusText");

	if (!url) {
		statusDiv.className = "status inactive";
		statusText.textContent = "Extension inactive - No URL configured";
		return;
	}

	try {
		// Try to query tabs with the given pattern
		chrome.tabs.query({ url: url }, (tabs) => {
			if (chrome.runtime.lastError) {
				statusDiv.className = "status inactive";
				statusText.textContent = "Extension inactive - Invalid URL pattern";
				return;
			}

			if (tabs && tabs.length > 0) {
				statusDiv.className = "status active";
				try {
					const hostname = new URL(tabs[0].url).hostname;
					statusText.textContent = `Listening on ${hostname}`;
				} catch (urlError) {
					console.error("URL parsing error:", urlError);
					statusText.textContent = "Extension active - Listening";
				}
			} else {
				statusDiv.className = "status inactive";
				statusText.textContent = "Extension inactive - No matching tab found";
			}
		});
	} catch (patternError) {
		console.error("Invalid match pattern:", patternError);
		statusDiv.className = "status inactive";
		statusText.textContent = "Extension inactive - Invalid URL pattern";
	}
}

function parseJwt(token) {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
				.join(""),
		);

		return JSON.parse(jsonPayload);
	} catch (e) {
		return null;
	}
}

function displayToken(token, timestamp = null) {
	const tokenDiv = document.getElementById("lastToken");
	const timestampHtml = timestamp ? `<span class="timestamp">at ${new Date(timestamp).toLocaleString("en-US")}</span>` : "";

	// Decode token for expiry information
	const payload = parseJwt(token);
	let expiryHtml = "";

	if (payload?.exp) {
		const expiryDate = new Date(payload.exp * 1000);
		const now = new Date();
		const isExpired = now > expiryDate;

		expiryHtml = `
      <div class="expiry-tag ${isExpired ? "expired" : "valid"}">
        <span class="expiry-dot"></span>
        ${isExpired ? "Expired" : "Valid until"}: ${expiryDate.toLocaleString()}
      </div>
    `;
	}

	tokenDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <strong>Last captured token ${timestampHtml}</strong>
      <button id="copyBtn" class="copy-btn">Copy</button>
    </div>
    ${expiryHtml}
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
