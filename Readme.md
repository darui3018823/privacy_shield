# Universal Privacy Shield

A browser extension that automatically hides privacy-sensitive information on web pages.

## Features

- 🛡️ **Multi-Domain Support** - Google Search, Amazon.co.jp
- 🔍 **Flexible Rule Engine** - Hide by CSS selectors, keywords, or regex patterns
- 🎨 **Premium UI** - Dark glassmorphism design
- 🔔 **Toast Notifications** - Visual feedback when privacy is protected
- ⚙️ **Options Page** - Easily manage hiding rules
- 📦 **Import/Export** - Backup and restore your settings

## Installation

### Chrome / Edge

1. Open `chrome://extensions` (or `edge://extensions`)
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select this folder

### Firefox

1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select `manifest.json`

## Usage

### Quick Start

1. Click the extension icon to open the popup
2. Toggle protection ON/OFF
3. Click **Open Settings** to manage rules

### Adding Keywords

1. Open the Options page
2. Go to **Keywords** section
3. Enter a keyword and click **Add**

### Adding Regex Patterns

1. Open the Options page
2. Go to **Patterns** section
3. Enter a regex pattern (e.g., `〒\d{3}-\d{4}` for postal codes)
4. Test your pattern in the preview area
5. Click **Add**

## Supported Sites

| Site | What's Hidden |
|------|---------------|
| Google Search | Location info, footer details |
| Google Gemini | Location info |
| Amazon.co.jp | Header delivery address |

## Configuration

Settings are stored in `chrome.storage.local`. You can export/import settings from the Options page.

## License

BSD 2-Clause License - See [LICENSE](License) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Development

### Project Structure

The project uses a modular ES6 structure for development:

```
privacy_shield/
├── src/
│   ├── config/
│   │   ├── constants.js      # Constants and configuration values
│   │   └── config.js          # Domain configuration
│   ├── utils/
│   │   ├── storage.js         # StorageManager class
│   │   ├── rules.js           # RulesManager class
│   │   ├── logger.js          # Logger utility
│   │   └── helpers.js         # Helper functions
│   ├── content/
│   │   ├── content.js         # Content script (modular)
│   │   └── content.css        # Content styles
│   ├── background/
│   │   └── background.js      # Background service worker (modular)
│   ├── popup/
│   │   ├── popup.js           # Popup script (modular)
│   │   ├── popup.html         # Popup UI
│   │   └── popup.css          # Popup styles
│   └── options/
│       ├── options.js         # Options script (modular)
│       ├── options.html       # Options UI
│       └── options.css        # Options styles
├── build/
│   ├── bundle.js              # Build script
│   └── README.md              # Build documentation
├── content.js                 # Bundled content script
├── background.js              # Bundled background script
├── popup.js                   # Bundled popup script
├── options.js                 # Bundled options script
└── manifest.json              # Extension manifest
```

### Building

The extension requires bundling ES6 modules into standalone files:

```bash
# Build once
npm run build

# Or use node directly
node build/bundle.js
```

### Development Workflow

1. **Edit source files** in `src/` directories
2. **Run build** to generate bundled files: `npm run build`
3. **Reload extension** in browser
4. **Test changes**

### Code Organization

#### Utility Modules

- **StorageManager** (`src/utils/storage.js`) - Unified chrome.storage operations
- **RulesManager** (`src/utils/rules.js`) - Rule loading and processing
- **Logger** (`src/utils/logger.js`) - Unified error handling and logging
- **Helpers** (`src/utils/helpers.js`) - Common utility functions

#### Configuration

- **constants.js** - Magic numbers, delays, and fixed values
- **config.js** - Domain configurations and supported domains list

#### Benefits of This Structure

- ✅ **Modularity** - Each file has a single responsibility
- ✅ **Reusability** - Shared code in utility modules
- ✅ **Maintainability** - Easy to find and update code
- ✅ **Testability** - Small, focused modules are easier to test
- ✅ **Documentation** - JSDoc comments on all functions
- ✅ **Type Safety** - Clear function signatures and return types

### Coding Standards

- Use JSDoc comments for all functions
- Follow single responsibility principle
- Handle errors with try-catch and Logger
- Use constants instead of magic numbers
- Prefer ES6+ syntax (const, arrow functions, async/await)

