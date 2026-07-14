let lastTokenData = {
	token: null,
	timestamp: null,
};

// Charger l'URL et le token au démarrage
chrome.storage.local.get(["monitoringUrl", "lastToken", "lastUpdate"], (result) => {
	const url = result.monitoringUrl || "https://localhost:8080/*";
	document.getElementById("urlInput").value = url;
	
	if (result.lastToken) {
		displayToken(result.lastToken, result.lastUpdate);
	}
});

// Ajouter un écouteur sur le champ URL
document.getElementById("urlInput").addEventListener("change", (e) => {
	const url = e.target.value.trim();
	if (url) {
		chrome.storage.local.set({ monitoringUrl: url }, () => {
			console.log("URL mise à jour:", url);
			updateStatusDisplay(url);
			// Notifier le background script de la nouvelle URL
			chrome.runtime.sendMessage({ type: "UPDATE_URL", url: url }).catch(() => {});
		});
	}
});

// Demander le dernier token au service worker (fallback)
chrome.runtime.sendMessage({ type: "GET_LAST_TOKEN" }, (response) => {
	if (response?.token) {
		displayToken(response.token, response.timestamp);
	}
});

// Écouter les nouveaux tokens
chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "TOKEN_CAPTURED") {
		lastTokenData.token = message.token;
		lastTokenData.timestamp = message.timestamp;
		displayToken(message.token, message.timestamp);
	}
});

function updateStatusDisplay(url) {
	const statusDiv = document.getElementById("statusDiv");
	statusDiv.textContent = `✓ Extension active - Écoute de ${url}`;
}

function displayToken(token, timestamp = null) {
	const tokenDiv = document.getElementById("lastToken");
	const timestampHtml = timestamp ? `<span class="timestamp">à ${new Date(timestamp).toLocaleString("fr-FR")}</span>` : "";

	tokenDiv.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
      <strong>Dernier token capturé ${timestampHtml}</strong>
      <button id="copyBtn" class="copy-btn">Copier</button>
    </div>
    <div class="token-info">
      ${token}
    </div>
  `;

	document.getElementById("copyBtn").addEventListener("click", () => {
		navigator.clipboard.writeText(token).then(() => {
			const btn = document.getElementById("copyBtn");
			btn.textContent = "Copié !";
			btn.classList.add("copied");
			setTimeout(() => {
				btn.textContent = "Copier";
				btn.classList.remove("copied");
			}, 2000);
		});
	});
}
