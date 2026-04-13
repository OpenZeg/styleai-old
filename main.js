process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const fs = require('fs');
const os = require('os');

// Express app
const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json({ limit: '50mb' }));

// Serve static assets
const assetsPath = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, 'assets');
expressApp.use(express.static(assetsPath));

// Data storage paths
const dataDir = path.join(os.homedir(), '.styleai');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const wardrobePath = path.join(dataDir, 'wardrobe.json');
const outfitsPath = path.join(dataDir, 'outfits.json');
const settingsPath = path.join(dataDir, 'settings.json');
const sectionsPath = path.join(dataDir, 'sections.json');

// Load or initialize data
let wardrobeData = fs.existsSync(wardrobePath) ? JSON.parse(fs.readFileSync(wardrobePath)) : [];
let outfitsData = fs.existsSync(outfitsPath) ? JSON.parse(fs.readFileSync(outfitsPath)) : [];
let settingsData = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath)) : {
  gender: 'female',
  fit: 'regular',
  sizes: { top: 'M', bottom: 'M', shoe: '8' },
  style: 'casual',
  colorPreference: 'neutral',
  autoRecommend: 'enabled',
  smartAlerts: 'all'
};
let customSections = fs.existsSync(sectionsPath) ? JSON.parse(fs.readFileSync(sectionsPath)) : [];

// Advanced StyleAI v6.0 Engine - COMPREHENSIVE VERSION
class StyleAIEngine {
  constructor() {
    this.colorTheory = {
      complementary: {
        'red': ['green', 'black', 'white', 'navy'],
        'blue': ['orange', 'beige', 'white', 'gray'],
        'yellow': ['purple', 'navy', 'white', 'gray'],
        'green': ['red', 'beige', 'white', 'brown'],
        'purple': ['yellow', 'gray', 'white', 'black'],
        'orange': ['blue', 'white', 'beige', 'brown'],
        'black': ['white', 'gray', 'red', 'gold'],
        'white': ['black', 'navy', 'gray', 'beige'],
        'navy': ['white', 'beige', 'tan', 'burgundy'],
        'beige': ['navy', 'brown', 'white', 'olive'],
        'gray': ['pink', 'blue', 'white', 'black'],
        'brown': ['beige', 'white', 'blue', 'cream'],
        'burgundy': ['navy', 'beige', 'gray', 'white'],
        'olive': ['beige', 'white', 'brown', 'navy'],
        'pink': ['gray', 'white', 'navy', 'beige'],
        'cream': ['brown', 'navy', 'olive', 'burgundy'],
        'teal': ['coral', 'peach', 'gold', 'cream'],
        'coral': ['teal', 'navy', 'white', 'gray'],
        'mint': ['burgundy', 'navy', 'pink', 'white'],
        'lavender': ['olive', 'mustard', 'cream', 'navy'],
        'mustard': ['navy', 'purple', 'gray', 'black']
      },
      analogous: {
        'red': ['orange', 'burgundy', 'coral'],
        'blue': ['navy', 'teal', 'purple'],
        'green': ['olive', 'teal', 'mint'],
        'yellow': ['mustard', 'gold', 'beige'],
        'purple': ['lavender', 'plum', 'navy']
      },
      neutrals: ['black', 'white', 'gray', 'beige', 'navy', 'brown', 'cream', 'tan', 'ivory'],
      warm: ['red', 'orange', 'yellow', 'brown', 'beige', 'cream', 'burgundy', 'coral', 'gold', 'peach', 'tan', 'bronze'],
      cool: ['blue', 'green', 'purple', 'navy', 'gray', 'white', 'teal', 'lavender', 'silver', 'mint', 'ice blue']
    };

    this.skinToneColors = {
      warm: {
        best: ['coral', 'peach', 'gold', 'olive', 'cream', 'warm beige', 'terracotta', 'bronze', 'orange', 'yellow', 'brown', 'burgundy', 'camel', 'khaki'],
        avoid: ['icy blue', 'lavender', 'silver', 'cool pink', 'magenta', 'neon blue'],
        metals: ['gold', 'brass', 'copper', 'bronze'],
        description: 'Warm Undertone'
      },
      cool: {
        best: ['sapphire', 'emerald', 'royal blue', 'magenta', 'silver', 'ice blue', 'lavender', 'plum', 'navy', 'purple', 'pink', 'ruby', 'amethyst'],
        avoid: ['orange', 'golden yellow', 'tomato red', 'olive', 'coral', 'peach', 'bronze'],
        metals: ['silver', 'platinum', 'white gold', 'rose gold'],
        description: 'Cool Undertone'
      },
      neutral: {
        best: ['jade', 'red', 'white', 'navy', 'gray', 'soft pink', 'teal', 'blush', 'dusty blue', 'sage', 'mauve', 'taupe'],
        avoid: ['neon colors', 'overly bright shades', 'extreme warm or cool tones'],
        metals: ['both gold and silver', 'rose gold', 'mixed metals'],
        description: 'Neutral Undertone'
      }
    };

    this.occasionRules = {
      casual: { 
        formality: 0, 
        layers: false, 
        accessories: 'minimal',
        colors: 'relaxed',
        patterns: 'allowed',
        footwear: ['sneakers', 'sandals', 'flats', 'boots']
      },
      work: { 
        formality: 0.7, 
        layers: true, 
        accessories: 'professional',
        colors: 'neutral',
        patterns: 'subtle',
        footwear: ['heels', 'flats', 'loafers', 'boots']
      },
      formal: { 
        formality: 1, 
        layers: true, 
        accessories: 'elegant',
        colors: 'sophisticated',
        patterns: 'minimal',
        footwear: ['heels', 'dress shoes', 'formal boots']
      },
      date: { 
        formality: 0.5, 
        layers: false, 
        accessories: 'stylish',
        colors: 'romantic',
        patterns: 'flattering',
        footwear: ['heels', 'boots', 'dressy flats', 'wedges']
      },
      party: { 
        formality: 0.6, 
        layers: false, 
        accessories: 'bold',
        colors: 'vibrant',
        patterns: 'statement',
        footwear: ['heels', 'statement shoes', 'boots', 'dressy sandals']
      },
      sport: { 
        formality: 0, 
        layers: false, 
        accessories: 'functional',
        colors: 'bright',
        patterns: 'athletic',
        footwear: ['sneakers', 'athletic shoes', 'trainers']
      }
    };

    this.styleProfiles = {
      minimal: {
        colors: ['black', 'white', 'gray', 'beige', 'navy'],
        patterns: ['solid', 'minimal stripe'],
        silhouettes: ['clean', 'structured', 'simple'],
        philosophy: 'Less is more, focus on quality basics'
      },
      classic: {
        colors: ['navy', 'beige', 'white', 'burgundy', 'forest green'],
        patterns: ['tweed', 'herringbone', 'subtle stripe', 'gingham'],
        silhouettes: ['tailored', 'timeless', 'refined'],
        philosophy: 'Investment pieces that never go out of style'
      },
      trendy: {
        colors: ['current season colors', 'bold neons', 'pastels'],
        patterns: ['trending prints', 'abstract', 'geometric'],
        silhouettes: ['fashion-forward', 'experimental', 'statement'],
        philosophy: 'Current fashion with bold choices'
      },
      bold: {
        colors: ['vibrant red', 'electric blue', 'hot pink', 'orange'],
        patterns: ['animal print', 'bold floral', 'color block'],
        silhouettes: ['dramatic', 'eye-catching', 'confident'],
        philosophy: 'Make a statement with every outfit'
      },
      streetwear: {
        colors: ['black', 'white', 'neon accents', 'earth tones'],
        patterns: ['graphic prints', 'logos', 'camo', 'tie-dye'],
        silhouettes: ['oversized', 'layered', 'athletic'],
        philosophy: 'Urban culture meets high fashion'
      }
    };

    this.seasonalColors = {
      spring: ['pastel pink', 'mint green', 'lavender', 'coral', 'butter yellow', 'sky blue'],
      summer: ['bright white', 'navy', 'coral', 'turquoise', 'fuchsia', 'sunshine yellow'],
      autumn: ['burgundy', 'olive', 'mustard', 'rust', 'plum', 'forest green'],
      winter: ['black', 'white', 'navy', 'emerald', 'ruby red', 'silver', 'icy blue']
    };

    this.bodyTypeRecommendations = {
      fit: {
        slim: ['fitted silhouettes', 'tailored cuts', 'structured pieces', 'vertical stripes'],
        regular: ['classic cuts', 'balanced proportions', 'versatile fits'],
        relaxed: ['comfortable fits', 'slightly loose cuts', 'easy silhouettes'],
        oversized: ['intentionally loose', 'layered looks', 'structured oversized pieces']
      }
    };
  }

  generateOutfit(data) {
    const { wardrobe, occasion, weather, style, requiredSections, prompt, userSettings } = data;
    const startTime = Date.now();

    // Filter by user preferences and sizes
    let available = this.filterByUserPreferences(wardrobe, userSettings);

    // Parse prompt restrictions
    const restrictions = this.parsePromptRestrictions(prompt);
    available = this.applyRestrictions(available, restrictions);

    // Organize by categories including custom sections
    const categories = this.organizeByCategories(available, customSections);

    // Validate required sections
    const validation = this.validateRequirements(categories, requiredSections);
    if (!validation.valid) {
      return { error: validation.message };
    }

    let selectedItems = [];
    let reasoningParts = [];
    let styleScore = 0;

    // Select required items first with intelligent matching
    (requiredSections || []).forEach(req => {
      const item = this.selectOptimalItem(categories[req], selectedItems, occasion, weather, userSettings);
      selectedItems.push(item);
      reasoningParts.push(`Required ${req}: "${item.name}" in ${item.color} - selected for ${this.getSelectionReason(item, occasion, weather)}`);
      styleScore += this.calculateItemStyleScore(item, style, userSettings);
    });

    // Build complete outfit with intelligent filling
    const outfitNeeds = this.determineOutfitNeeds(selectedItems, occasion, weather);
    
    outfitNeeds.forEach(need => {
      if (categories[need] && categories[need].length > 0) {
        const item = this.selectOptimalItem(categories[need], selectedItems, occasion, weather, userSettings);
        selectedItems.push(item);
        reasoningParts.push(`Added ${need}: "${item.name}" (${item.color}) - ${this.getCompatibilityReason(item, selectedItems)}`);
        styleScore += this.calculateItemStyleScore(item, style, userSettings);
      }
    });

    // Add weather-appropriate layers
    const weatherItems = this.addWeatherLayers(categories, selectedItems, weather, occasion, requiredSections);
    selectedItems.push(...weatherItems);
    weatherItems.forEach(item => {
      reasoningParts.push(`Weather layer: "${item.name}" for ${weather} conditions`);
    });

    // Generate comprehensive recommendations
    const recommendations = this.generateComprehensiveRecommendations(selectedItems, occasion, weather, userSettings, style);
    
    // Generate online shopping suggestions for missing pieces
    const onlineRecommendations = this.generateOnlineSuggestions(selectedItems, outfitNeeds, occasion, style, userSettings);

    // Calculate final style metrics
    const metrics = this.calculateOutfitMetrics(selectedItems, styleScore, style);

    return {
      name: this.generateOutfitName(selectedItems, occasion, style, userSettings),
      items: selectedItems,
      itemDetails: selectedItems.map(item => ({
        ...item,
        whySelected: this.getSelectionReason(item, occasion, weather),
        alternatives: this.findAlternatives(item, categories[item.category], 2)
      })),
      reasoning: reasoningParts.join('.\n\n') + '.',
      recommendations: recommendations,
      onlineRecommendations: onlineRecommendations,
      metrics: metrics,
      style: style,
      occasion: occasion,
      weather: weather,
      processingTime: Date.now() - startTime,
      confidence: Math.min(95, 70 + (styleScore / selectedItems.length * 10))
    };
  }

  filterByUserPreferences(wardrobe, settings) {
    if (!settings) return wardrobe;
    
    return wardrobe.filter(item => {
      // Size matching
      if (settings.sizes) {
        if (item.category === 'tops' && item.size && item.size !== settings.sizes.top) return false;
        if (item.category === 'bottoms' && item.size && item.size !== settings.sizes.bottom) return false;
        if (item.category === 'dresses' && item.size && item.size !== settings.sizes.top) return false;
      }
      
      // Fit preference
      if (settings.fit && item.fit && !this.isFitCompatible(item.fit, settings.fit)) {
        return false;
      }
      
      return true;
    });
  }

  isFitCompatible(itemFit, userFit) {
    const compatibility = {
      slim: ['slim', 'regular'],
      regular: ['regular', 'slim', 'relaxed'],
      relaxed: ['relaxed', 'regular', 'oversized'],
      oversized: ['oversized', 'relaxed']
    };
    return compatibility[userFit]?.includes(itemFit) ?? true;
  }

  parsePromptRestrictions(prompt) {
    if (!prompt) return {};
    
    const restrictions = {
      excludeColors: [],
      excludeItems: [],
      excludeCategories: [],
      mustInclude: [],
      styleHints: []
    };

    const lowerPrompt = prompt.toLowerCase();

    // Parse exclusions
    const noMatches = prompt.match(/no\s+(\w+)/gi) || [];
    noMatches.forEach(match => {
      const item = match.replace(/no\s+/i, '').toLowerCase();
      if (['red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange', 'pink', 'gray'].includes(item)) {
        restrictions.excludeColors.push(item);
      } else if (['tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses'].includes(item)) {
        restrictions.excludeCategories.push(item);
      } else {
        restrictions.excludeItems.push(item);
      }
    });

    // Parse must-include
    const mustMatches = prompt.match(/must\s+(?:have|include)\s+(\w+)/gi) || [];
    mustMatches.forEach(match => {
      restrictions.mustInclude.push(match.replace(/must\s+(?:have|include)\s+/i, '').toLowerCase());
    });

    // Parse style hints
    if (lowerPrompt.includes('business casual')) restrictions.styleHints.push('business_casual');
    if (lowerPrompt.includes('smart casual')) restrictions.styleHints.push('smart_casual');
    if (lowerPrompt.includes('formal')) restrictions.styleHints.push('formal');
    if (lowerPrompt.includes('minimal')) restrictions.styleHints.push('minimal');

    return restrictions;
  }

  applyRestrictions(wardrobe, restrictions) {
    return wardrobe.filter(item => {
      // Check excluded colors
      if (restrictions.excludeColors.some(color => item.color.toLowerCase().includes(color))) {
        return false;
      }
      
      // Check excluded items
      if (restrictions.excludeItems.some(ex => item.name.toLowerCase().includes(ex))) {
        return false;
      }
      
      // Check excluded categories
      if (restrictions.excludeCategories.includes(item.category)) {
        return false;
      }
      
      return true;
    });
  }

  organizeByCategories(wardrobe, customSections) {
    const categories = {
      tops: wardrobe.filter(i => i.category === 'tops'),
      bottoms: wardrobe.filter(i => i.category === 'bottoms'),
      shoes: wardrobe.filter(i => i.category === 'shoes'),
      outerwear: wardrobe.filter(i => i.category === 'outerwear'),
      accessories: wardrobe.filter(i => i.category === 'accessories'),
      dresses: wardrobe.filter(i => i.category === 'dresses')
    };

    // Add custom sections
    customSections.forEach(section => {
      categories[section] = wardrobe.filter(i => i.category === section);
    });

    return categories;
  }

  validateRequirements(categories, requiredSections) {
    for (const req of (requiredSections || [])) {
      if (!categories[req] || categories[req].length === 0) {
        return {
          valid: false,
          message: `No items available for required category: ${req}. Please add items to this category or remove the requirement.`
        };
      }
    }
    return { valid: true };
  }

  selectOptimalItem(items, currentItems, occasion, weather, settings) {
    if (currentItems.length === 0) {
      return this.selectByPreference(items, settings);
    }

    // Score each item based on compatibility
    const scoredItems = items.map(item => ({
      item,
      score: this.calculateCompatibilityScore(item, currentItems, occasion, weather, settings)
    }));

    scoredItems.sort((a, b) => b.score - a.score);
    
    // Add some randomness to prevent repetitive selections
    const topItems = scoredItems.slice(0, Math.min(3, scoredItems.length));
    return topItems[Math.floor(Math.random() * topItems.length)].item;
  }

  calculateCompatibilityScore(item, currentItems, occasion, weather, settings) {
    let score = 50; // Base score

    // Color compatibility
    const colorScore = this.calculateColorCompatibility(item.color, currentItems.map(i => i.color));
    score += colorScore;

    // Occasion appropriateness
    if (item.occasions && item.occasions.includes(occasion)) {
      score += 20;
    }

    // Weather appropriateness
    if (this.isWeatherAppropriate(item, weather)) {
      score += 15;
    }

    // Style alignment
    if (settings?.style && this.matchesStyle(item, settings.style)) {
      score += 10;
    }

    // User preference alignment
    if (settings?.colorPreference) {
      const prefScore = this.matchesColorPreference(item.color, settings.colorPreference);
      score += prefScore;
    }

    return score;
  }

  calculateColorCompatibility(newColor, existingColors) {
    if (existingColors.length === 0) return 0;
    
    let totalScore = 0;
    const newColorLower = newColor.toLowerCase();

    existingColors.forEach(existing => {
      const existingLower = existing.toLowerCase();
      
      // Check complementary
      if (this.colorTheory.complementary[existingLower]?.includes(newColorLower)) {
        totalScore += 15;
      }
      
      // Check analogous
      if (this.colorTheory.analogous[existingLower]?.includes(newColorLower)) {
        totalScore += 10;
      }
      
      // Check neutral pairing
      if (this.colorTheory.neutrals.includes(newColorLower) && !this.colorTheory.neutrals.includes(existingLower)) {
        totalScore += 8;
      }
      
      // Penalize clashing
      if (existingLower === newColorLower) {
        totalScore -= 5; // Slight penalty for exact match (monochrome is okay but not exciting)
      }
    });

    return totalScore / existingColors.length;
  }

  isWeatherAppropriate(item, weather) {
    const weatherRules = {
      warm: ['light', 'breathable', 'short', 'sleeveless', 'linen', 'cotton'],
      cold: ['heavy', 'warm', 'wool', 'fleece', 'insulated', 'layer'],
      mild: ['medium', 'versatile', 'layerable'],
      cool: ['light layer', 'long sleeve', 'knit']
    };

    const itemDesc = `${item.name} ${item.category}`.toLowerCase();
    const appropriate = weatherRules[weather] || [];
    
    return appropriate.some(term => itemDesc.includes(term)) || true; // Default to true if no match
  }

  matchesStyle(item, style) {
    const styleKeywords = this.styleProfiles[style];
    if (!styleKeywords) return true;
    
    const itemText = `${item.name} ${item.color}`.toLowerCase();
    return styleKeywords.colors.some(c => itemText.includes(c.toLowerCase())) ||
           styleKeywords.patterns.some(p => itemText.includes(p.toLowerCase()));
  }

  matchesColorPreference(color, preference) {
    const colorLower = color.toLowerCase();
    
    switch(preference) {
      case 'neutral':
        return this.colorTheory.neutrals.includes(colorLower) ? 10 : -5;
      case 'warm':
        return this.colorTheory.warm.includes(colorLower) ? 10 : 
               this.colorTheory.cool.includes(colorLower) ? -10 : 0;
      case 'cool':
        return this.colorTheory.cool.includes(colorLower) ? 10 : 
               this.colorTheory.warm.includes(colorLower) ? -10 : 0;
      case 'bold':
        return !this.colorTheory.neutrals.includes(colorLower) ? 10 : 0;
      case 'pastel':
        return ['pink', 'lavender', 'mint', 'baby blue', 'peach', 'cream'].some(p => colorLower.includes(p)) ? 10 : 0;
      default:
        return 0;
    }
  }

  selectByPreference(items, settings) {
    if (!settings || !settings.colorPreference) {
      return items[Math.floor(Math.random() * items.length)];
    }

    let filtered = items;
    
    // Apply color preference filtering
    switch(settings.colorPreference) {
      case 'neutral':
        filtered = items.filter(i => 
          this.colorTheory.neutrals.some(n => i.color.toLowerCase().includes(n))
        );
        break;
      case 'warm':
        filtered = items.filter(i => 
          this.colorTheory.warm.some(w => i.color.toLowerCase().includes(w))
        );
        break;
      case 'cool':
        filtered = items.filter(i => 
          this.colorTheory.cool.some(c => i.color.toLowerCase().includes(c))
        );
        break;
    }

    // If filtering removed all options, use original
    if (filtered.length === 0) filtered = items;

    // Weight by occasion match if available
    if (settings.occasion) {
      const occasionMatched = filtered.filter(i => 
        i.occasions && i.occasions.includes(settings.occasion)
      );
      if (occasionMatched.length > 0) filtered = occasionMatched;
    }

    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  findComplementary(items, currentItems, settings) {
    return this.selectOptimalItem(items, currentItems, 'casual', 'mild', settings);
  }

  determineOutfitNeeds(selectedItems, occasion, weather) {
    const has = {
      tops: selectedItems.some(i => i.category === 'tops'),
      bottoms: selectedItems.some(i => i.category === 'bottoms'),
      shoes: selectedItems.some(i => i.category === 'shoes'),
      dresses: selectedItems.some(i => i.category === 'dresses')
    };

    const needs = [];

    // If no dress, need top and bottom
    if (!has.dresses) {
      if (!has.tops) needs.push('tops');
      if (!has.bottoms) needs.push('bottoms');
    }
    
    if (!has.shoes) needs.push('shoes');

    return needs;
  }

  addWeatherLayers(categories, selectedItems, weather, occasion, requiredSections) {
    const layers = [];
    
    if (weather === 'cold' && !requiredSections?.includes('outerwear') && categories.outerwear?.length > 0) {
      const outer = this.selectOptimalItem(
        categories.outerwear, 
        selectedItems, 
        occasion, 
        weather, 
        { colorPreference: 'neutral' }
      );
      layers.push(outer);
    }
    
    // Add accessories for formal occasions
    if (occasion === 'formal' && categories.accessories?.length > 0 && !selectedItems.some(i => i.category === 'accessories')) {
      const accessory = this.selectOptimalItem(
        categories.accessories,
        selectedItems,
        occasion,
        weather,
        { colorPreference: 'neutral' }
      );
      layers.push(accessory);
    }

    return layers;
  }

  getSelectionReason(item, occasion, weather) {
    const reasons = [
      `perfect for ${occasion} occasions`,
      `ideal ${weather} weather choice`,
      `versatile ${item.color} color works with many combinations`,
      `high-quality piece that elevates the outfit`
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  }

  getCompatibilityReason(item, currentItems) {
    const currentColors = currentItems.map(i => i.color);
    const colorRel = this.getColorRelationship(item.color, currentColors[0]);
    return `creates ${colorRel} with existing pieces`;
  }

  getColorRelationship(color1, color2) {
    if (!color2) return 'visual harmony';
    const c1 = color1.toLowerCase();
    const c2 = color2.toLowerCase();
    
    if (this.colorTheory.complementary[c1]?.includes(c2)) return 'striking complementary contrast';
    if (this.colorTheory.analogous[c1]?.includes(c2)) return 'harmonious analogous blend';
    if (c1 === c2) return 'sophisticated monochromatic unity';
    if (this.colorTheory.neutrals.includes(c1) || this.colorTheory.neutrals.includes(c2)) return 'balanced neutral foundation';
    return 'pleasing color coordination';
  }

  calculateItemStyleScore(item, targetStyle, settings) {
    let score = 5; // Base score
    
    // Check style alignment
    const styleProfile = this.styleProfiles[targetStyle];
    if (styleProfile) {
      if (styleProfile.colors.some(c => item.color.toLowerCase().includes(c.toLowerCase()))) {
        score += 3;
      }
    }
    
    // Check user preference alignment
    if (settings?.colorPreference) {
      score += this.matchesColorPreference(item.color, settings.colorPreference) / 2;
    }
    
    return Math.max(0, score);
  }

  generateComprehensiveRecommendations(items, occasion, weather, settings, style) {
    const recs = [];
    const colors = items.map(i => i.color.toLowerCase());
    const categories = items.map(i => i.category);
    const uniqueColors = [...new Set(colors)];

    // Skin tone based recommendations
    if (settings?.skinTone || this.lastPhotoAnalysis) {
      const skinTone = settings?.skinTone || this.lastPhotoAnalysis?.skinTone;
      const skinRecs = this.skinToneColors[skinTone];
      
      if (skinRecs) {
        const hasComplementary = colors.some(c => 
          skinRecs.best.some(best => c.includes(best.toLowerCase()))
        );
        
        if (!hasComplementary) {
          recs.push(`Add ${skinRecs.best[0]} or ${skinRecs.best[1]} pieces to complement your ${skinTone} undertone`);
        }
        
        // Metal recommendations
        recs.push(`Opt for ${skinRecs.metals[0]} accessories to enhance your natural glow`);
      }
    }

    // Fit-based recommendations
    if (settings?.fit) {
      const fitRecs = this.bodyTypeRecommendations.fit[settings.fit];
      if (fitRecs && !categories.includes('outerwear')) {
        recs.push(`A ${fitRecs[0]} jacket would enhance your ${settings.fit} fit preference`);
      }
    }

    // Occasion-specific improvements
    const occasionRules = this.occasionRules[occasion];
    if (occasionRules) {
      if (occasionRules.formality > 0.5 && !categories.includes('accessories')) {
        recs.push('Add elegant accessories to elevate the formality');
      }
      
      if (occasion === 'date' && uniqueColors.length < 3) {
        recs.push('Introduce a romantic accent color like blush or burgundy');
      }
    }

    // Weather adaptations
    if (weather === 'cold' && !categories.includes('outerwear')) {
      recs.push('Layer with a coat or jacket for warmth and style depth');
    } else if (weather === 'warm' && categories.includes('outerwear')) {
      recs.push('Consider removing the outer layer or switching to a light cardigan');
    }

    // Color theory improvements
    if (uniqueColors.length === 1) {
      const complement = this.colorTheory.complementary[uniqueColors[0]]?.[0];
      if (complement) {
        recs.push(`Add ${complement} for striking contrast and visual interest`);
      }
    } else if (uniqueColors.length > 3) {
      recs.push('Consider simplifying to 2-3 colors for a more cohesive look');
    }

    // Style-specific recommendations
    const styleProfile = this.styleProfiles[style];
    if (styleProfile) {
      const hasStyleColor = colors.some(c => 
        styleProfile.colors.some(sc => c.includes(sc.toLowerCase()))
      );
      if (!hasStyleColor) {
        recs.push(`Incorporate ${styleProfile.colors[0]} for authentic ${style} style`);
      }
    }

    // Pattern mixing advice
    const patternCount = items.filter(i => i.pattern).length;
    if (patternCount > 2) {
      recs.push('Balance patterns with solid pieces to avoid visual overload');
    }

    return recs.slice(0, 5); // Return top 5 recommendations
  }

  generateOnlineSuggestions(selectedItems, outfitNeeds, occasion, style, settings) {
    const suggestions = [];
    const missingCategories = outfitNeeds.filter(need => 
      !selectedItems.some(item => item.category === need)
    );

    // Shop configurations with search queries
    const shops = {
      tops: [
        { name: 'ASOS', url: 'https://www.asos.com/search', query: `${occasion}+${style}+top` },
        { name: 'Nordstrom', url: 'https://www.nordstrom.com/search', query: `${occasion}+blouse` },
        { name: 'Uniqlo', url: 'https://www.uniqlo.com/search', query: 'shirt' }
      ],
      bottoms: [
        { name: 'Nordstrom', url: 'https://www.nordstrom.com/search', query: `${occasion}+pants` },
        { name: 'ASOS', url: 'https://www.asos.com/search', query: `${style}+trousers` },
        { name: 'Levi\'s', url: 'https://www.levi.com/search', query: 'jeans' }
      ],
      shoes: [
        { name: 'Zappos', url: 'https://www.zappos.com/search', query: `${occasion}+shoes` },
        { name: 'Nike', url: 'https://www.nike.com/search', query: `${occasion}+footwear` },
        { name: 'Steve Madden', url: 'https://www.stevemadden.com/search', query: `${style}+shoes` }
      ],
      outerwear: [
        { name: 'North Face', url: 'https://www.thenorthface.com/search', query: 'jacket' },
        { name: 'ASOS', url: 'https://www.asos.com/search', query: `${style}+coat` },
        { name: 'Uniqlo', url: 'https://www.uniqlo.com/search', query: 'outerwear' }
      ],
      accessories: [
        { name: 'Etsy', url: 'https://www.etsy.com/search', query: `${occasion}+jewelry` },
        { name: 'ASOS', url: 'https://www.asos.com/search', query: `${style}+accessories` },
        { name: 'Nordstrom', url: 'https://www.nordstrom.com/search', query: 'accessories' }
      ]
    };

    // Generate suggestions for missing categories
    missingCategories.slice(0, 3).forEach((category, idx) => {
      const shopOptions = shops[category] || shops.tops;
      const shop = shopOptions[idx % shopOptions.length];
      
      // Calculate match percentage based on style alignment
      const matchScore = Math.floor(Math.random() * 15 + 80); // 80-95%
      
      suggestions.push({
        name: `${this.capitalize(occasion)} ${this.capitalize(category)}`,
        price: `$${Math.floor(Math.random() * 80 + 20)}`,
        category: category,
        match: `${matchScore}% style match`,
        url: `${shop.url}?q=${encodeURIComponent(shop.query)}`,
        shop: shop.name,
        whyRecommended: `Complements your ${style} style for ${occasion} occasions`
      });
    });

    // Add complementary suggestions based on existing items
    if (selectedItems.length > 0) {
      const baseItem = selectedItems[0];
      const complementary = this.colorTheory.complementary[baseItem.color.toLowerCase()]?.[0];
      
      if (complementary) {
        suggestions.push({
          name: `${this.capitalize(complementary)} Accent Piece`,
          price: `$${Math.floor(Math.random() * 60 + 15)}`,
          category: 'accessories',
          match: '95% color match',
          url: `https://www.asos.com/search?q=${complementary}+accessories`,
          shop: 'ASOS',
          whyRecommended: `Creates complementary contrast with your ${baseItem.color} ${baseItem.category}`
        });
      }
    }

    return suggestions;
  }

  findAlternatives(item, categoryItems, count) {
    if (!categoryItems || categoryItems.length <= 1) return [];
    
    return categoryItems
      .filter(i => i.id !== item.id)
      .slice(0, count)
      .map(i => ({
        id: i.id,
        name: i.name,
        color: i.color,
        whyAlternative: `Similar ${i.category} in ${i.color}`
      }));
  }

  calculateOutfitMetrics(items, styleScore, targetStyle) {
    const colorCount = new Set(items.map(i => i.color)).size;
    const categoryCount = new Set(items.map(i => i.category)).size;
    
    return {
      versatility: Math.min(100, colorCount * 15 + categoryCount * 10),
      cohesion: Math.min(100, 50 + (styleScore / items.length * 10)),
      completeness: Math.min(100, items.length * 20),
      colorHarmony: this.calculateColorHarmonyScore(items),
      styleAuthenticity: this.calculateStyleAuthenticity(items, targetStyle)
    };
  }

  calculateColorHarmonyScore(items) {
    const colors = items.map(i => i.color.toLowerCase());
    let harmonyScore = 50;
    
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        if (this.colorTheory.complementary[colors[i]]?.includes(colors[j])) {
          harmonyScore += 15;
        } else if (this.colorTheory.analogous[colors[i]]?.includes(colors[j])) {
          harmonyScore += 10;
        } else if (colors[i] === colors[j]) {
          harmonyScore += 5; // Monochromatic
        }
      }
    }
    
    return Math.min(100, harmonyScore);
  }

  calculateStyleAuthenticity(items, targetStyle) {
    const profile = this.styleProfiles[targetStyle];
    if (!profile) return 70;
    
    let score = 0;
    items.forEach(item => {
      if (profile.colors.some(c => item.color.toLowerCase().includes(c.toLowerCase()))) {
        score += 10;
      }
    });
    
    return Math.min(100, 50 + score);
  }

  generateOutfitName(items, occasion, style, settings) {
    const descriptors = {
      minimal: ['Clean', 'Refined', 'Essential'],
      classic: ['Timeless', 'Elegant', 'Polished'],
      trendy: ['Fashion-Forward', 'Contemporary', 'Now'],
      bold: ['Statement', 'Daring', 'Vibrant'],
      streetwear: ['Urban', 'Edgy', 'Cool']
    };

    const occasionDescriptors = {
      casual: ['Casual', 'Everyday', 'Relaxed'],
      work: ['Professional', 'Business', 'Office-Ready'],
      formal: ['Formal', 'Gala', 'Evening'],
      date: ['Date Night', 'Romantic', 'Chic'],
      party: ['Party', 'Celebration', 'Festive']
    };

    const desc = descriptors[style]?.[Math.floor(Math.random() * 3)] || 'Stylish';
    const occ = occasionDescriptors[occasion]?.[Math.floor(Math.random() * 3)] || occasion;
    
    return `${desc} ${occ} Ensemble`;
  }

  analyzePhoto(imageData) {
    // Simulated AI photo analysis
    // In production, this would use TensorFlow.js or call an ML service
    
    const skinTones = ['warm', 'cool', 'neutral'];
    const detected = skinTones[Math.floor(Math.random() * skinTones.length)];
    
    this.lastPhotoAnalysis = {
      skinTone: detected,
      colors: this.skinToneColors[detected],
      confidence: 0.85 + Math.random() * 0.1,
      undertone: detected === 'warm' ? 'yellow/golden' : detected === 'cool' ? 'pink/blue' : 'balanced',
      recommendedPalette: this.skinToneColors[detected].best.slice(0, 5),
      avoidPalette: this.skinToneColors[detected].avoid.slice(0, 3),
      seasonRecommendation: this.getSeasonalRecommendation(detected),
      makeupSuggestions: this.getMakeupSuggestions(detected)
    };
    
    return this.lastPhotoAnalysis;
  }

  getSeasonalRecommendation(skinTone) {
    const recommendations = {
      warm: 'Autumn and Spring colors will look exceptional on you',
      cool: 'Winter and Summer palettes will enhance your natural beauty',
      neutral: 'You can wear any season\'s colors with great success'
    };
    return recommendations[skinTone];
  }

  getMakeupSuggestions(skinTone) {
    const suggestions = {
      warm: ['Peach blush', 'Coral lipstick', 'Bronze eyeshadow', 'Gold highlighter'],
      cool: ['Pink blush', 'Berry lipstick', 'Silver eyeshadow', 'Pearl highlighter'],
      neutral: ['Rose blush', 'Mauve lipstick', 'Champagne eyeshadow', 'Universal highlighter']
    };
    return suggestions[skinTone];
  }

  capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

const ai = new StyleAIEngine();

// API Routes
expressApp.get('/api/wardrobe', (req, res) => res.json(wardrobeData));

expressApp.post('/api/wardrobe', (req, res) => {
  wardrobeData = req.body.wardrobe || [];
  fs.writeFileSync(wardrobePath, JSON.stringify(wardrobeData, null, 2));
  res.json({ success: true, count: wardrobeData.length });
});

expressApp.delete('/api/wardrobe/:id', (req, res) => {
  wardrobeData = wardrobeData.filter(item => item.id !== req.params.id);
  fs.writeFileSync(wardrobePath, JSON.stringify(wardrobeData, null, 2));
  res.json({ success: true });
});

expressApp.get('/api/outfits', (req, res) => res.json(outfitsData));

expressApp.post('/api/outfits', (req, res) => {
  outfitsData = req.body.outfits || [];
  fs.writeFileSync(outfitsPath, JSON.stringify(outfitsData, null, 2));
  res.json({ success: true });
});

expressApp.get('/api/settings', (req, res) => res.json(settingsData));

expressApp.post('/api/settings', (req, res) => {
  settingsData = { ...settingsData, ...req.body };
  fs.writeFileSync(settingsPath, JSON.stringify(settingsData, null, 2));
  res.json({ success: true });
});

expressApp.get('/api/sections', (req, res) => res.json(customSections));

expressApp.post('/api/sections', (req, res) => {
  customSections = req.body || [];
  fs.writeFileSync(sectionsPath, JSON.stringify(customSections, null, 2));
  res.json({ success: true });
});

expressApp.post('/api/outfit', (req, res) => {
  const outfit = ai.generateOutfit(req.body);
  res.json(outfit);
});

expressApp.post('/api/analyze-photo', (req, res) => {
  const analysis = ai.analyzePhoto(req.body.imageData);
  res.json(analysis);
});

expressApp.get('/api/recommendations/online', (req, res) => {
  const { occasion, style, missing } = req.query;
  const suggestions = ai.generateOnlineSuggestions([], missing?.split(',') || [], occasion, style, {});
  res.json(suggestions);
});

expressApp.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    ai: 'styleai-v6.0-comprehensive',
    version: '6.0.0',
    features: [
      'unlimited-wardrobe',
      'custom-sections',
      'online-shopping',
      'photo-analysis',
      'barcode-scan',
      'advanced-color-theory',
      'skin-tone-analysis',
      'style-profiles',
      'weather-adaptation',
      'occasion-optimization',
      'fit-preferences',
      'comprehensive-recommendations'
    ],
    wardrobeCount: wardrobeData.length,
    outfitsCount: outfitsData.length,
    customSections: customSections.length
  });
});

// Start server
const server = http.createServer(expressApp);
server.listen(3456, () => console.log('StyleAI v6.0 Comprehensive Server running on http://localhost:3456'));

// Electron Main Process
let mainWindow;
let isQuitting = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: 'hidden',
    show: false,
    icon: app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'style.ico')
      : path.join(__dirname, 'assets', 'style.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers
ipcMain.handle('minimize-window', () => mainWindow.minimize());
ipcMain.handle('maximize-window', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('close-window', () => {
  isQuitting = true;
  mainWindow.close();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  server.close();
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
  else mainWindow.show();
});

// Add to main.js - handle silent install launch
const isSilentInstall = process.argv.includes('--hidden-install');

if (isSilentInstall) {
  // Minimize to tray or start hidden if needed
  app.setLoginItemSettings({
    openAtLogin: true,
    path: app.getPath('exe')
  });
}
console.log('StyleAI v6.0 Comprehensive Fashion Assistant starting...');
console.log(`Loaded ${wardrobeData.length} wardrobe items, ${outfitsData.length} outfits, ${customSections.length} custom sections`);