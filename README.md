# Bearer Token Extractor - Chrome Extension

A Chrome extension (Manifest V3) to automatically capture bearer tokens from requests to `https://localhost:8080/*`.

## Features

✅ Intercepts all requests to `https://localhost:8080/*`
✅ Automatically extracts the bearer token from the `Authorization` header
✅ Saves the token in a text file (in the Downloads folder)
✅ Popup interface to view the last captured token
✅ Compatible with Manifest V3

## Installation

### 1. Load the extension in developer mode

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right corner)
3. Click "Load unpacked"
4. Select the `bearer-token-extension` folder

### 2. Allow self-signed certificates (for localhost HTTPS)

Since you're using `https://localhost:8080`, Chrome blocks self-signed certificates by default. You need to:

1. Go to `chrome://flags/#allow-insecure-localhost`
2. Enable "Allow invalid certificates for resources loaded from localhost"
3. Restart Chrome

## Usage

1. Once the extension is installed, it automatically listens for requests
2. When a bearer token is detected in a request to `https://localhost:8080/*`, it will be:
   - Automatically saved in a `bearer-token-[timestamp].txt` file in your Downloads folder
   - Displayed in the extension's popup
3. Click the extension icon to view the last captured token

## File Structure

```
bearer-token-extension/
├── manifest.json          # Manifest V3 configuration
├── background.js          # Service worker that intercepts requests
├── popup.html            # User interface
├── popup.js              # Popup logic
├── icon16.png            # 16x16 icon
├── icon48.png            # 48x48 icon
├── icon128.png           # 128x128 icon
└── README.md             # This file
```

## Notes techniques

- **Manifest V3** : Utilise un service worker au lieu d'une background page
- **webRequest API** : Intercepte les requêtes avec `onBeforeSendHeaders`
- **Downloads API** : Sauvegarde automatiquement les tokens sans demander confirmation
- Les tokens ne sont sauvegardés que s'ils changent (évite les doublons)

## Personnalisation

Tu peux modifier l'URL cible dans `manifest.json` :

```json
"host_permissions": [
  "https://localhost:8080/*"  // Change ici pour d'autres URLs
]
```

Et dans `background.js` :

```javascript
{ urls: ["https://localhost:8080/*"] }
```

## Dépannage

**L'extension ne capture rien ?**
- Vérifie que l'URL correspond bien à `https://localhost:8080/*`
- Vérifie que les certificats auto-signés sont autorisés
- Ouvre la console du service worker : `chrome://extensions/` > Détails de l'extension > "Inspecter les vues : service worker"

**Les fichiers ne se téléchargent pas ?**
- Vérifie les permissions de ton dossier Téléchargements
- Regarde dans `chrome://downloads/` pour voir les erreurs éventuelles
