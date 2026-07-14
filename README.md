# Bearer Token Extractor

A Chrome extension that automatically captures bearer tokens from requests to `https://localhost:8080/*`.

## What it does

The extension intercepts requests to your local server, extracts the bearer token from the Authorization header, and saves it to a file in your Downloads folder. You can also view the last captured token in the extension popup.

## How to install

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right corner
3. Click "Load unpacked"
4. Select this folder

For localhost HTTPS to work, you also need to allow self-signed certificates:

1. Go to `chrome://flags/#allow-insecure-localhost`
2. Enable "Allow invalid certificates for resources loaded from localhost"
3. Restart Chrome

## How to use

Once installed, the extension automatically captures tokens from requests. Each token is saved as a timestamped file in your Downloads folder and displayed in the extension popup.
