# StyleAI v3.0 - AI Fashion Assistant

A fully-featured, 100% local AI-powered wardrobe and fashion assistant built with Electron. No API keys required, no cloud dependencies - everything runs on your machine.

## What's New in v3.0

### Code Signing Support
- Windows installer and executable are now signed to prevent Windows Defender warnings
- No more "Run / Don't Run" prompts for users
- Professional installation experience

### AI Outfit Improvement Suggestions
- After generating an outfit, the AI analyzes it and suggests improvements
- Recommends missing items to complete the look
- Provides shopping links via DuckDuckGo search
- Suggests color enhancements and style upgrades

### Necessary Item Feature
- Force the AI to include specific items in outfit generation
- Select multiple items that MUST be part of the outfit
- Perfect for when you want to wear a specific piece

### Uninclude Feature
- Exclude specific items or entire categories from outfit generation
- Don't want hats? Exclude the entire category
- Want to avoid a specific shirt? Exclude just that item

### Custom Sections
- Create unlimited custom wardrobe sections (Hats, Belts, Jewelry, etc.)
- Organize your wardrobe exactly how you want
- Sections persist across app updates

### Batch Clothes Scanner
- Add multiple clothing items at once
- AI attempts to detect category and color from image filenames
- Perfect for quickly building your wardrobe

### Delete Items
- Remove items from your wardrobe with confirmation
- Clean up your collection easily

### Persistent Wardrobe Across Updates
- Wardrobe data is stored in your home directory (`~/.styleai/`)
- Updating the app never loses your data
- Automatic backup and sync between localStorage and filesystem

### StyleDNA Analysis (Innovative Feature #1)
- AI analyzes your entire wardrobe to determine your style archetype
- Identifies your color preferences and patterns
- Calculates versatility score
- Identifies wardrobe gaps
- Provides personalized recommendations

### Outfit Scheduler (Innovative Feature #2)
- Plan outfits ahead of time for events, trips, or work weeks
- Schedule outfits with specific dates
- Link scheduled events to saved outfits
- Never wonder what to wear again

### Weather Sync (Innovative Feature #3)
- Sync with real-time weather data for your location
- Automatically adapts outfit suggestions based on conditions
- Recommends layers for cold weather
- Suggests waterproof options for rain

## Features

### AI Stylist
- **Smart Outfit Generation**: Creates outfits based on occasion, weather, and style preferences
- **Detailed Reasoning**: AI explains WHY each piece was selected and HOW the outfit works
- **Necessary Items**: Force specific items to be included
- **Uninclude Items**: Exclude specific items or categories
- **2-Message Limit**: Focused, high-quality suggestions per session
- **Shopping Recommendations**: AI suggests items to buy with real search links

### StyleDNA
- **Style Archetype**: Discover if you're "Elegant Classic", "Professional", "Casual Comfort", etc.
- **Color Analysis**: Understand your color preferences
- **Wardrobe Gaps**: Know what you're missing
- **Versatility Score**: See how mix-and-matchable your wardrobe is
- **Personalized Tips**: Get AI recommendations for improvement

### Outfit Scheduler
- **Calendar View**: See your planned outfits by date
- **Event Planning**: Schedule outfits for specific occasions
- **Outfit Linking**: Connect schedules to saved outfits
- **Reminders**: Never forget what you planned to wear

### Weather Sync
- **Real-time Weather**: Get current conditions for any location
- **Outfit Adaptation**: Weather-appropriate suggestions
- **Temperature-based**: Automatically suggests layers for cold weather
- **Condition-aware**: Recommends waterproof gear when raining

### Custom Sections
- **Unlimited Categories**: Create as many sections as you need
- **Flexible Organization**: Hats, Belts, Scarves, Watches, etc.
- **Easy Management**: Add, rename, or delete sections
- **Item Association**: Items stay linked to their sections

### Wardrobe Management
- **Categorization**: Tops, Bottoms, Shoes, Accessories, Outerwear, Dresses + your custom sections
- **Color Tracking**: Organize by color with smart color theory
- **Occasion Tags**: Casual, Work, Formal, Date, Party, Sport
- **Season Management**: Spring, Summer, Fall, Winter
- **Batch Add**: Add multiple items at once
- **Delete Items**: Remove items you no longer own

### Image & Camera Integration
- **Photo Upload**: Drag & drop or click to upload outfit photos
- **Live Camera**: Use your webcam to capture outfits in real-time
- **AI Analysis**: Detects clothing items, colors, and suggests improvements
- **Batch Scanner**: Add multiple items from multiple photos

### Barcode Scanner
- **Camera Scanning**: Point your camera at clothing tags
- **Online Lookup**: Searches databases for exact matches
- **Similar Items**: Finds close matches when exact items aren't found
- **One-Click Add**: Instantly add scanned items to wardrobe

### Data Persistence & Backup
- **Local Storage**: All data saved locally in `~/.styleai/`
- **Cross-Update Persistence**: Wardrobe survives app updates
- **Export/Import**: Backup and restore your entire wardrobe
- **JSON Format**: Easy to view and edit if needed

## Code Signing Setup

### Windows
To sign your Windows installer and executable:

1. Obtain a code signing certificate from a trusted CA (DigiCert, Sectigo, etc.)
2. Update `package.json` with your certificate details:
```json
"win": {
  "certificateFile": "path/to/your/certificate.pfx",
  "certificatePassword": "your-password"
}
```
3. Build with: `npm run build:win`

### macOS
For macOS code signing:

1. Enroll in Apple Developer Program
2. Create a Developer ID certificate
3. Update `package.json`:
```json
"mac": {
  "identity": "Developer ID Application: Your Name (Team ID)"
}
```
4. Build with: `npm run build:mac`

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Clone or extract the project
cd styleai

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

### Build Outputs
The app builds to the `dist/` folder with platform-specific packages:

**Windows:**
- `StyleAI-Setup-3.0.0.exe` - Signed installer
- `StyleAI-Portable-3.0.0.exe` - Portable version

**macOS:**
- `StyleAI-3.0.0.dmg` - Disk image
- `StyleAI-3.0.0.zip` - Portable

**Linux:**
- `StyleAI-3.0.0.AppImage` - Universal package
- `styleai_3.0.0_amd64.deb` - Debian package

## Usage

### Getting Started
1. Launch StyleAI
2. Add items to your wardrobe (Wardrobe tab → Add Item)
3. Go to AI Stylist and generate outfits
4. Check your StyleDNA to understand your style
5. Sync weather for location-based recommendations

### Using Necessary Items
1. Go to AI Stylist → Generate Outfit
2. In "Necessary Items", select items you MUST wear
3. Click Generate - AI will build around your selections

### Using Uninclude
1. Go to AI Stylist → Generate Outfit
2. In "Uninclude Items", select items or categories to exclude
3. Click Generate - AI will avoid those items

### Creating Custom Sections
1. Go to Sections tab
2. Click "Add Section"
3. Enter name (e.g., "Hats", "Jewelry")
4. Start categorizing items into your new section

### Batch Adding Clothes
1. Go to Dashboard → Batch Add
2. Select multiple clothing images
3. AI will detect categories and colors
4. Review and add all items at once

### Scheduling Outfits
1. Go to Scheduler tab
2. Click "Schedule Outfit"
3. Select date and enter event name
4. Optionally link a saved outfit
5. View your schedule anytime

### Syncing Weather
1. Go to Weather Sync tab
2. Enter your location
3. Click Sync
4. Outfit suggestions will automatically adapt

### AI Chat Commands
- `"What goes with beige shorts?"` - Color coordination advice
- `"Create a work outfit"` - Outfit generation
- `"Analyze my style"` - StyleDNA analysis
- `"Recipe with chicken and rice"` - Recipe generation

### Photo Analysis
1. Go to AI Stylist → Photo Analysis tab
2. Upload a photo or use camera
3. AI detects items and suggests improvements
4. Click "Generate Full Outfit" for complete looks

### Barcode Scanning
1. Go to Wardrobe → Scan Barcode
2. Point camera at clothing tag
3. AI looks up item online
4. Click "Add to Wardrobe" to save

### Backup & Restore
1. Go to Dashboard
2. Click "Export" to backup your wardrobe
3. Store the JSON file safely
4. Click "Import" to restore from backup

## AI Features Explained

### Color Theory Engine
The AI uses complementary, analogous, and neutral color relationships:
- **Complementary**: Colors opposite on color wheel (blue ↔ orange)
- **Analogous**: Adjacent colors (blue → blue-green → green)
- **Neutrals**: Black, white, gray, beige, navy, brown

### Occasion Matching
Each occasion has specific rules:
- **Casual**: Relaxed fit, minimal accessories
- **Work**: Professional, layered looks
- **Formal**: High formality, elegant accessories
- **Date**: Stylish but approachable
- **Party**: Bold choices, statement pieces

### StyleDNA Analysis
The AI analyzes:
- Category distribution (tops vs bottoms ratio)
- Color palette preferences
- Occasion coverage
- Brand patterns
- Fit preferences
- Seasonal versatility

### How Outfits Are Generated
1. **Necessary Items**: First includes required pieces
2. **Uninclude Filter**: Removes excluded items/categories
3. **Base Selection**: Chooses foundation piece
4. **Color Matching**: Finds complementary colors
5. **Occasion Filter**: Ensures pieces match the event type
6. **Weather Adaptation**: Adds layers for cold weather
7. **Completeness Check**: Ensures shoes and accessories
8. **Improvement Analysis**: Suggests enhancements with shopping links

## File Structure
```
styleai/
├── main.js              # Electron main process with all APIs
├── index.html           # Main UI with all features
├── app.js               # Frontend logic
├── package.json         # Dependencies & build config with signing
├── assets/              # Icons and resources
│   ├── style.ico        # Windows icon
│   ├── style.icns       # macOS icon
│   ├── style.png        # Linux icon
│   └── entitlements.mac.plist  # macOS entitlements
└── dist/                # Build output (created by npm run build)
```

## Data Storage
All data is stored locally in:
- **Windows**: `%USERPROFILE%\.styleai\`
- **macOS**: `~/.styleai/`
- **Linux**: `~/.styleai/`

Files:
- `wardrobe.json` - Your clothing items
- `outfits.json` - Saved outfits
- `sections.json` - Custom sections
- `styledna.json` - StyleDNA analysis
- `scheduler.json` - Scheduled outfits
- `settings.json` - App settings
- `conversations.json` - Chat history
- `images/` - Uploaded photos

## Keyboard Shortcuts
- `ESC` - Close modals
- `Enter` - Send chat message
- `Ctrl/Cmd + R` - Refresh (dev mode)

## Troubleshooting

### Windows Defender Still Shows Warning
If you see a warning after code signing:
- Ensure your certificate is from a trusted CA
- The certificate must be valid and not expired
- Building with an EV certificate provides immediate trust
- Standard certificates may require SmartScreen reputation building

### Server Not Running
If you see "Server not available" in console:
```bash
# The Express server should auto-start with Electron
# If not, check port 3456 is available
lsof -i :3456  # Check what's using port 3456
```

### Camera Not Working
- Ensure camera permissions are granted
- Try closing other apps using the camera
- Restart StyleAI

### Barcode Scanning Issues
- Ensure good lighting
- Hold steady 4-6 inches from tag
- Clean camera lens

### Wardrobe Data Lost
- Check `~/.styleai/` directory exists
- Look for `wardrobe.json` file
- Use Import feature to restore from backup

## Development

### Adding New Features
1. Edit `main.js` for backend/Electron features
2. Edit `app.js` for frontend logic
3. Edit `index.html` for UI changes

### AI Customization
The AI logic is in `main.js` in the `StyleAI` class. You can modify:
- Color theory relationships
- Occasion rules
- Outfit generation algorithms
- StyleDNA analysis

## License
MIT License - Feel free to modify and distribute.

## Credits
Built with:
- Electron
- Express
- DuckDuckGo Search API
- Open-Meteo Weather API

---

**StyleAI v3.0** - Your personal AI stylist, 100% private and local.
