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
