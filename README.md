# Bearer Token Extractor - Extension Chrome

Extension Chrome (Manifest V3) pour capturer automatiquement les bearer tokens des requêtes vers `https://localhost:8080/*`.

## Fonctionnalités

✅ Intercepte toutes les requêtes vers `https://localhost:8080/*`
✅ Extrait automatiquement le bearer token du header `Authorization`
✅ Sauvegarde le token dans un fichier texte (dans le dossier Téléchargements)
✅ Interface popup pour voir le dernier token capturé
✅ Compatible Manifest V3

## Installation

### 1. Charger l'extension en mode développeur

1. Ouvre Chrome et va dans `chrome://extensions/`
2. Active le "Mode développeur" (toggle en haut à droite)
3. Clique sur "Charger l'extension non empaquetée"
4. Sélectionne le dossier `bearer-token-extension`

### 2. Autoriser les certificats auto-signés (pour localhost HTTPS)

Comme tu utilises `https://localhost:8080`, Chrome bloque par défaut les certificats auto-signés. Tu dois :

1. Va sur `chrome://flags/#allow-insecure-localhost`
2. Active "Allow invalid certificates for resources loaded from localhost"
3. Redémarre Chrome

## Utilisation

1. Une fois l'extension installée, elle écoute automatiquement les requêtes
2. Quand un bearer token est détecté dans une requête vers `https://localhost:8080/*`, il est :
   - Automatiquement sauvegardé dans un fichier `bearer-token-[timestamp].txt` dans ton dossier Téléchargements
   - Affiché dans le popup de l'extension
3. Clique sur l'icône de l'extension pour voir le dernier token capturé

## Structure des fichiers

```
bearer-token-extension/
├── manifest.json          # Configuration Manifest V3
├── background.js          # Service worker qui intercepte les requêtes
├── popup.html            # Interface utilisateur
├── popup.js              # Logique du popup
├── icon16.png            # Icône 16x16
├── icon48.png            # Icône 48x48
├── icon128.png           # Icône 128x128
└── README.md             # Ce fichier
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
