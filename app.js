// StyleAI v6.0 - Unlimited Fashion Assistant
const { ipcRenderer } = require('electron');

// Data Management
const DataStore = {
    wardrobe: [],
    outfits: [],
    customSections: [],
    currentOutfit: null,
    currentFilter: 'all',
    currentTag: 'all',
    requiredSections: [],
    userSettings: {
        gender: 'female',
        fit: 'regular',
        sizes: { top: 'M', bottom: 'M', shoe: '8' },
        style: 'casual',
        colorPreference: 'neutral',
        autoRecommend: 'enabled',
        smartAlerts: 'all'
    },
    photoAnalysis: null,
    editingItemId: null,

    async load() {
        try {
            const [wardrobeRes, outfitsRes, settingsRes, sectionsRes] = await Promise.all([
                fetch('http://localhost:3456/api/wardrobe'),
                fetch('http://localhost:3456/api/outfits'),
                fetch('http://localhost:3456/api/settings'),
                fetch('http://localhost:3456/api/sections')
            ]);

            this.wardrobe = await wardrobeRes.json();
            this.outfits = await outfitsRes.json();
            const settings = await settingsRes.json();
            const sections = await sectionsRes.json();
            
            if (settings) this.userSettings = { ...this.userSettings, ...settings };
            if (sections) this.customSections = sections;

            localStorage.setItem('wardrobe', JSON.stringify(this.wardrobe));
            localStorage.setItem('outfits', JSON.stringify(this.outfits));
            localStorage.setItem('settings', JSON.stringify(this.userSettings));
            localStorage.setItem('customSections', JSON.stringify(this.customSections));

            this.updateStats();
            this.applySettings();
            this.renderCustomSections();
        } catch (e) {
            console.error('Server not available, loading from localStorage:', e);
            this.wardrobe = JSON.parse(localStorage.getItem('wardrobe') || '[]');
            this.outfits = JSON.parse(localStorage.getItem('outfits') || '[]');
            this.customSections = JSON.parse(localStorage.getItem('customSections') || '[]');
            const savedSettings = localStorage.getItem('settings');
            if (savedSettings) this.userSettings = { ...this.userSettings, ...JSON.parse(savedSettings) };
            this.updateStats();
            this.applySettings();
            this.renderCustomSections();
        }
    },

    async save() {
        try {
            await fetch('http://localhost:3456/api/wardrobe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wardrobe: this.wardrobe })
            });

            await fetch('http://localhost:3456/api/outfits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ outfits: this.outfits })
            });

            localStorage.setItem('wardrobe', JSON.stringify(this.wardrobe));
            localStorage.setItem('outfits', JSON.stringify(this.outfits));
            this.updateStats();
        } catch (e) {
            console.error('Failed to save to server:', e);
            localStorage.setItem('wardrobe', JSON.stringify(this.wardrobe));
            localStorage.setItem('outfits', JSON.stringify(this.outfits));
        }
    },

    async saveSettings() {
        try {
            await fetch('http://localhost:3456/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.userSettings)
            });
            localStorage.setItem('settings', JSON.stringify(this.userSettings));
        } catch (e) {
            localStorage.setItem('settings', JSON.stringify(this.userSettings));
        }
    },

    async saveSections() {
        try {
            await fetch('http://localhost:3456/api/sections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.customSections)
            });
            localStorage.setItem('customSections', JSON.stringify(this.customSections));
        } catch (e) {
            localStorage.setItem('customSections', JSON.stringify(this.customSections));
        }
    },

    async deleteItem(id) {
        try {
            await fetch(`http://localhost:3456/api/wardrobe/${id}`, { method: 'DELETE' });
            this.wardrobe = this.wardrobe.filter(item => item.id !== id);
            await this.save();
            return true;
        } catch (e) {
            console.error('Failed to delete item:', e);
            return false;
        }
    },

    updateStats() {
        const itemsEl = document.getElementById('stat-items');
        const categoriesEl = document.getElementById('stat-categories');
        const customEl = document.getElementById('stat-custom');
        const outfitsEl = document.getElementById('stat-outfits');
        const sidebarWardrobeEl = document.getElementById('sidebar-wardrobe-count');
        const sidebarOutfitsEl = document.getElementById('sidebar-outfits-count');

        const uniqueCategories = [...new Set(this.wardrobe.map(i => i.category))].length;
        const versatility = Math.min(100, Math.max(20, this.wardrobe.length * 3));

        if (itemsEl) itemsEl.textContent = this.wardrobe.length;
        if (categoriesEl) categoriesEl.textContent = uniqueCategories;
        if (customEl) customEl.textContent = this.customSections.length;
        if (outfitsEl) outfitsEl.textContent = this.outfits.length;
        if (sidebarWardrobeEl) sidebarWardrobeEl.textContent = this.wardrobe.length;
        if (sidebarOutfitsEl) sidebarOutfitsEl.textContent = this.outfits.length;
    },

    applySettings() {
        const genderSelect = document.getElementById('setting-gender');
        const fitSelect = document.getElementById('setting-fit');
        const shoeSelect = document.getElementById('setting-shoe');
        const styleSelect = document.getElementById('setting-style');
        const colorSelect = document.getElementById('setting-color');
        const autoSelect = document.getElementById('setting-auto');
        const alertsSelect = document.getElementById('setting-alerts');

        if (genderSelect) genderSelect.value = this.userSettings.gender;
        if (fitSelect) fitSelect.value = this.userSettings.fit;
        if (shoeSelect) shoeSelect.value = this.userSettings.sizes.shoe;
        if (styleSelect) styleSelect.value = this.userSettings.style;
        if (colorSelect) colorSelect.value = this.userSettings.colorPreference;
        if (autoSelect) autoSelect.value = this.userSettings.autoRecommend;
        if (alertsSelect) alertsSelect.value = this.userSettings.smartAlerts;

        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
            const [type, size] = btn.dataset.size.split('-');
            if (this.userSettings.sizes[type] === size) {
                btn.classList.add('active');
            }
        });
    },

    renderCustomSections() {
        const list = document.getElementById('custom-sections-list');
        const filterTabs = document.getElementById('filter-tabs');
        const requiredToggles = document.getElementById('required-toggles');
        
        if (list) {
            list.innerHTML = this.customSections.map(section => `
                <div class="section-tag">
                    ${section}
                    <button onclick="removeCustomSection('${section}')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');
        }

        // Add custom sections to filter tabs
        if (filterTabs) {
            const baseTabs = filterTabs.querySelectorAll('.filter-tab:not([data-custom])');
            const existingCustom = filterTabs.querySelectorAll('[data-custom]');
            existingCustom.forEach(el => el.remove());

            this.customSections.forEach(section => {
                const btn = document.createElement('button');
                btn.className = 'filter-tab';
                btn.dataset.custom = 'true';
                btn.textContent = capitalize(section);
                btn.onclick = () => filterItems(section);
                filterTabs.appendChild(btn);
            });
        }

        // Add custom sections to required toggles
        if (requiredToggles) {
            const existingCustom = requiredToggles.querySelectorAll('[data-custom]');
            existingCustom.forEach(el => el.remove());

            this.customSections.forEach(section => {
                const div = document.createElement('div');
                div.className = 'required-toggle';
                div.dataset.custom = 'true';
                div.dataset.category = section;
                div.onclick = () => toggleRequired(div, section);
                div.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 13l4 4L19 7"></path>
                    </svg>
                    ${capitalize(section)}
                `;
                requiredToggles.appendChild(div);
            });
        }
    }
};

// Window Controls
const windowControls = {
    minimize() { ipcRenderer.invoke('minimize-window'); },
    maximize() { ipcRenderer.invoke('maximize-window'); },
    close() { ipcRenderer.invoke('close-window'); }
};

// Toast Notifications
const Toast = {
    container: document.getElementById('toast-container'),

    show(message, type = 'success') {
        if (!this.container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
            error: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
            warning: `<svg class="toast-icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`
        };

        toast.innerHTML = `${icons[type] || icons.success}<span>${message}</span>`;
        this.container.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    success(message) { this.show(message, 'success'); },
    error(message) { this.show(message, 'error'); },
    warning(message) { this.show(message, 'warning'); }
};

// Navigation
let currentPage = 'wardrobe';

function navigateTo(page) {
    currentPage = page;
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.page === page);
    });
    document.querySelectorAll('.mobile-nav-item').forEach((el, idx) => {
        const pages = ['wardrobe', 'generator', 'photo', 'menu'];
        el.classList.toggle('active', pages[idx] === page);
    });

    const titles = {
        wardrobe: 'Wardrobe',
        generator: 'Outfit Generator',
        photo: 'Photo Analysis',
        barcode: 'Barcode Scanner',
        saved: 'Saved Outfits',
        analytics: 'Style Analytics',
        settings: 'Settings'
    };

    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = titles[page] || 'StyleAI';

    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const targetView = document.getElementById(`view-${page}`);
    if (targetView) targetView.classList.remove('hidden');

    if (page === 'wardrobe') renderWardrobe();
    if (page === 'saved') renderSavedOutfits();
    if (page === 'analytics') renderAnalytics();
    if (page === 'barcode') renderBarcodeSuggestions();
    if (page === 'settings') DataStore.applySettings();

    closeCommandPalette();
}

// Custom Sections
function addCustomSection() {
    const input = document.getElementById('new-section-input');
    const name = input.value.trim().toLowerCase();
    
    if (!name) {
        Toast.error('Please enter a section name');
        return;
    }

    if (DataStore.customSections.includes(name)) {
        Toast.warning('Section already exists');
        return;
    }

    if (['tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'dresses'].includes(name)) {
        Toast.warning('This is a default section');
        return;
    }

    DataStore.customSections.push(name);
    DataStore.saveSections();
    DataStore.renderCustomSections();
    input.value = '';
    Toast.success(`Added section: ${capitalize(name)}`);
}

function removeCustomSection(name) {
    DataStore.customSections = DataStore.customSections.filter(s => s !== name);
    DataStore.saveSections();
    DataStore.renderCustomSections();
    Toast.success(`Removed section: ${capitalize(name)}`);
}

// Filter functions
function filterItems(category) {
    DataStore.currentFilter = category;
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
        if ((category === 'all' && tab.textContent === 'All') || 
            tab.textContent.toLowerCase() === category ||
            tab.dataset.custom === 'true' && tab.textContent.toLowerCase() === category) {
            tab.classList.add('active');
        }
    });
    renderWardrobe();
}

function filterByTag(element, tag) {
    DataStore.currentTag = tag;
    document.querySelectorAll('.tags-container .tag-pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');
    renderWardrobe();
}

function toggleTag(element) {
    element.classList.toggle('active');
}

function toggleRequired(element, category) {
    element.classList.toggle('active');
    if (element.classList.contains('active')) {
        if (!DataStore.requiredSections.includes(category)) {
            DataStore.requiredSections.push(category);
        }
    } else {
        DataStore.requiredSections = DataStore.requiredSections.filter(c => c !== category);
    }
}

// Wardrobe Rendering with Delete and Edit
function getItemIcon(category) {
    const icons = {
        tops: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 4h12M6 4l2 16h8l2-16M6 4l4-2h4l4 2"/>',
        bottoms: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 4h8l-1 16H9L8 4z"/>',
        shoes: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16c0-4 4-4 8-4s8 0 8 4v4H4v-4z"/>',
        outerwear: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 4h12l-2 16H8L6 4z"/>',
        accessories: '<circle cx="12" cy="12" r="8" stroke-width="1.5"/>',
        dresses: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 4h8l2 16H6l2-16z"/>'
    };
    return icons[category] || icons.tops;
}

function renderWardrobe() {
    const grid = document.getElementById('wardrobe-grid');
    const empty = document.getElementById('wardrobe-empty');
    if (!grid) return;

    let filtered = DataStore.wardrobe;

    if (DataStore.currentFilter !== 'all') {
        filtered = filtered.filter(item => item.category === DataStore.currentFilter);
    }

    if (DataStore.currentTag !== 'all') {
        filtered = filtered.filter(item => item.occasions && item.occasions.includes(DataStore.currentTag));
    }

    if (filtered.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = filtered.map(item => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-image">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    ${getItemIcon(item.category)}
                </svg>
                <div class="item-actions">
                    <button class="item-action-btn edit" onclick="openEditItemModal('${item.id}'); event.stopPropagation();">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="item-action-btn" onclick="deleteWardrobeItem('${item.id}'); event.stopPropagation();">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-meta">${item.color} • ${item.category} • Size ${item.size || 'M'}</div>
                <div class="item-tags">
                    ${(item.occasions || []).slice(0, 3).map(o => 
                        `<span class="item-tag">${o}</span>`
                    ).join('')}
                    ${item.link ? `<span class="item-tag" style="background: rgba(0, 212, 170, 0.2); color: var(--accent-500);">Has Link</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

async function deleteWardrobeItem(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const success = await DataStore.deleteItem(id);
    if (success) {
        Toast.success('Item deleted');
        renderWardrobe();
    } else {
        Toast.error('Failed to delete item');
    }
}

// Edit Item Functions
function openEditItemModal(id) {
    const item = DataStore.wardrobe.find(i => i.id === id);
    if (!item) return;

    DataStore.editingItemId = id;
    
    document.getElementById('edit-item-id').value = id;
    document.getElementById('edit-item-name').value = item.name;
    document.getElementById('edit-item-category').value = item.category;
    document.getElementById('edit-item-color').value = item.color;
    document.getElementById('edit-item-size').value = item.size || 'M';
    document.getElementById('edit-item-link').value = item.link || '';

    // Set occasion tags
    document.querySelectorAll('#edit-item-occasions .tag-pill').forEach(pill => {
        pill.classList.remove('active');
        if (item.occasions && item.occasions.includes(pill.textContent.toLowerCase())) {
            pill.classList.add('active');
        }
    });

    document.getElementById('edit-item-overlay').classList.add('active');
    document.getElementById('edit-item-modal').classList.add('active');
}

function closeEditItemModal() {
    document.getElementById('edit-item-overlay').classList.remove('active');
    document.getElementById('edit-item-modal').classList.remove('active');
    DataStore.editingItemId = null;
}

function updateEditSizeOptions() {
    const category = document.getElementById('edit-item-category').value;
    const sizeSelect = document.getElementById('edit-item-size');
    
    if (category === 'shoes') {
        sizeSelect.innerHTML = Array.from({length: 15}, (_, i) => {
            const size = 6 + i * 0.5;
            return `<option value="${size}">${size}</option>`;
        }).join('');
    } else {
        sizeSelect.innerHTML = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => 
            `<option value="${s}">${s}</option>`
        ).join('');
    }
}

async function updateItem() {
    const id = document.getElementById('edit-item-id').value;
    const name = document.getElementById('edit-item-name').value.trim();
    const category = document.getElementById('edit-item-category').value;
    const color = document.getElementById('edit-item-color').value.trim();
    const size = document.getElementById('edit-item-size').value;
    const link = document.getElementById('edit-item-link').value.trim();

    if (!name || !color) {
        Toast.error('Please fill in all fields');
        return;
    }

    const occasions = Array.from(document.querySelectorAll('#edit-item-occasions .tag-pill.active'))
        .map(el => el.textContent.toLowerCase());

    const itemIndex = DataStore.wardrobe.findIndex(i => i.id === id);
    if (itemIndex === -1) {
        Toast.error('Item not found');
        return;
    }

    DataStore.wardrobe[itemIndex] = {
        ...DataStore.wardrobe[itemIndex],
        name,
        category,
        color,
        size,
        link,
        occasions: occasions.length > 0 ? occasions : ['casual']
    };

    await DataStore.save();
    closeEditItemModal();
    Toast.success('Item updated');
    renderWardrobe();
}

// Modal Functions
function openAddItemModal() {
    document.getElementById('add-item-overlay').classList.add('active');
    document.getElementById('add-item-modal').classList.add('active');
    closeCommandPalette();
}

function closeAddItemModal() {
    document.getElementById('add-item-overlay').classList.remove('active');
    document.getElementById('add-item-modal').classList.remove('active');
    document.getElementById('item-name').value = '';
    document.getElementById('item-color').value = '';
    document.getElementById('item-link').value = '';
    document.querySelectorAll('#add-item-modal .tag-pill').forEach(tag => tag.classList.remove('active'));
}

function updateSizeOptions() {
    const category = document.getElementById('item-category').value;
    const sizeSelect = document.getElementById('item-size');
    
    if (category === 'shoes') {
        sizeSelect.innerHTML = Array.from({length: 15}, (_, i) => {
            const size = 6 + i * 0.5;
            return `<option value="${size}">${size}</option>`;
        }).join('');
    } else {
        sizeSelect.innerHTML = ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => 
            `<option value="${s}">${s}</option>`
        ).join('');
    }
}

async function saveItem() {
    const name = document.getElementById('item-name').value.trim();
    const category = document.getElementById('item-category').value;
    const color = document.getElementById('item-color').value.trim();
    const size = document.getElementById('item-size').value;
    const link = document.getElementById('item-link').value.trim();

    if (!name || !color) {
        Toast.error('Please fill in all fields');
        return;
    }

    const occasions = Array.from(document.querySelectorAll('#add-item-modal .tag-pill.active'))
        .map(el => el.textContent.toLowerCase());

    const item = {
        id: Date.now().toString(),
        name,
        category,
        color,
        size,
        link,
        occasions: occasions.length > 0 ? occasions : ['casual'],
        added: new Date().toISOString()
    };

    DataStore.wardrobe.push(item);
    await DataStore.save();

    closeAddItemModal();
    Toast.success(`${name} added to wardrobe`);
    if (currentPage === 'wardrobe') renderWardrobe();
}

// Outfit Generator with Online Shopping
async function generateOutfit() {
    const occasion = document.getElementById('gen-occasion').value;
    const weather = document.getElementById('gen-weather').value;
    const style = document.getElementById('gen-style').value;
    const prompt = document.getElementById('gen-prompt').value.toLowerCase();

    if (DataStore.wardrobe.length < 2) {
        Toast.error('Add more items to generate outfits');
        return;
    }

    const btn = document.querySelector('.generate-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
        </svg>
        Generating...
    `;
    btn.disabled = true;

    try {
        const response = await fetch('http://localhost:3456/api/outfit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                wardrobe: DataStore.wardrobe, 
                occasion, 
                weather, 
                style,
                requiredSections: DataStore.requiredSections,
                prompt,
                userSettings: DataStore.userSettings
            })
        });

        const outfit = await response.json();
        if (outfit.error) {
            Toast.error(outfit.error);
            return;
        }

        DataStore.currentOutfit = outfit;
        displayGeneratedOutfit(outfit);
    } catch (e) {
        generateOutfitLocal(occasion, weather, style, prompt);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function generateOutfitLocal(occasion, weather, style, prompt) {
    const required = DataStore.requiredSections;
    let available = [...DataStore.wardrobe];

    if (prompt.includes('no ')) {
        const restrictions = prompt.match(/no\s+(\w+)/g) || [];
        restrictions.forEach(r => {
            const item = r.replace('no ', '');
            available = available.filter(i => !i.name.toLowerCase().includes(item) && !i.category.toLowerCase().includes(item));
        });
    }

    const categories = {
        tops: available.filter(i => i.category === 'tops'),
        bottoms: available.filter(i => i.category === 'bottoms'),
        shoes: available.filter(i => i.category === 'shoes'),
        outerwear: available.filter(i => i.category === 'outerwear'),
        accessories: available.filter(i => i.category === 'accessories'),
        dresses: available.filter(i => i.category === 'dresses')
    };

    // Add custom sections
    DataStore.customSections.forEach(section => {
        categories[section] = available.filter(i => i.category === section);
    });

    for (const req of required) {
        if (!categories[req] || categories[req].length === 0) {
            Toast.warning(`No items available for required category: ${req}`);
            return;
        }
    }

    let selectedItems = [];
    let reasoningParts = [];

    required.forEach(req => {
        const item = categories[req][Math.floor(Math.random() * categories[req].length)];
        selectedItems.push(item);
        reasoningParts.push(`Required ${req}: "${item.name}"`);
    });

    const outfitNeeds = ['tops', 'bottoms', 'shoes'].filter(cat => !required.includes(cat));
    
    if (!required.includes('dresses') && categories.dresses.length > 0 && 
        (occasion === 'formal' || occasion === 'date') && Math.random() > 0.3) {
        const dress = categories.dresses[Math.floor(Math.random() * categories.dresses.length)];
        selectedItems.push(dress);
        reasoningParts.push(`Complete look with "${dress.name}" dress`);
    } else {
        outfitNeeds.forEach(cat => {
            if (categories[cat] && categories[cat].length > 0) {
                const item = findComplementaryItem(categories[cat], selectedItems);
                selectedItems.push(item);
                reasoningParts.push(`Added ${cat}: "${item.name}" in ${item.color}`);
            }
        });
    }

    if (weather === 'cold' && !required.includes('outerwear') && categories.outerwear.length > 0) {
        const outer = findComplementaryItem(categories.outerwear, selectedItems);
        selectedItems.push(outer);
        reasoningParts.push(`Weather-appropriate outerwear: "${outer.name}"`);
    }

    const recommendations = generateRecommendations(selectedItems, occasion, weather);
    const onlineRecs = generateOnlineRecommendations(selectedItems, occasion, style);

    const outfit = {
        name: `${capitalize(occasion)} ${capitalize(style)} Look`,
        items: selectedItems,
        reasoning: reasoningParts.join('.\n\n') + '.',
        recommendations: recommendations,
        onlineRecommendations: onlineRecs,
        style: style,
        occasion: occasion,
        weather: weather
    };

    DataStore.currentOutfit = outfit;
    displayGeneratedOutfit(outfit);
}

function findComplementaryItem(items, currentItems) {
    if (currentItems.length === 0) return items[Math.floor(Math.random() * items.length)];
    
    const currentColors = currentItems.map(i => i.color.toLowerCase());
    const colorTheory = {
        'navy': ['white', 'beige', 'gray', 'burgundy'],
        'black': ['white', 'gray', 'red'],
        'white': ['navy', 'black', 'beige'],
        'beige': ['navy', 'brown', 'white'],
        'gray': ['navy', 'black', 'white', 'pink']
    };

    for (const color of currentColors) {
        const complements = colorTheory[color] || [];
        for (const comp of complements) {
            const match = items.find(i => i.color.toLowerCase().includes(comp));
            if (match) return match;
        }
    }

    return items[Math.floor(Math.random() * items.length)];
}

function generateRecommendations(items, occasion, weather) {
    const recs = [];
    const colors = items.map(i => i.color.toLowerCase());
    const settings = DataStore.userSettings;

    if (DataStore.photoAnalysis) {
        const skinTone = DataStore.photoAnalysis.skinTone;
        if (skinTone === 'warm' && !colors.some(c => ['peach', 'coral', 'gold', 'olive'].includes(c))) {
            recs.push('Consider adding warm tones like peach or gold to complement your skin undertone');
        } else if (skinTone === 'cool') {
            if (!colors.some(c => ['blue', 'purple', 'silver', 'emerald'].includes(c))) {
                recs.push('Cool tones like sapphire or emerald would enhance your complexion');
            }
        }
    }

    if (settings.fit === 'slim' && !items.some(i => i.category === 'outerwear')) {
        recs.push('A tailored blazer would enhance your preferred slim fit silhouette');
    }

    if (occasion === 'formal' && !items.some(i => i.category === 'accessories')) {
        recs.push('Add a statement accessory to elevate this formal look');
    }

    if (weather === 'cold' && !items.some(i => i.category === 'outerwear')) {
        recs.push('Consider adding a coat or jacket for warmth');
    }

    if (new Set(colors).size === 1) {
        recs.push('Try introducing a complementary color to add visual interest');
    }

    return recs;
}

function generateOnlineRecommendations(items, occasion, style) {
    // Generate contextual online shopping recommendations
    const categories = [...new Set(items.map(i => i.category))];
    const missingCategories = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'].filter(c => !categories.includes(c));
    
    const shops = [
        { name: 'ASOS', url: 'https://www.asos.com', category: 'tops' },
        { name: 'Nordstrom', url: 'https://www.nordstrom.com', category: 'bottoms' },
        { name: 'Zappos', url: 'https://www.zappos.com', category: 'shoes' },
        { name: 'Uniqlo', url: 'https://www.uniqlo.com', category: 'outerwear' },
        { name: 'Etsy', url: 'https://www.etsy.com', category: 'accessories' }
    ];

    return missingCategories.slice(0, 3).map((cat, idx) => {
        const shop = shops.find(s => s.category === cat) || shops[idx % shops.length];
        return {
            name: `${capitalize(cat)} for ${capitalize(occasion)}`,
            price: `$${Math.floor(Math.random() * 100 + 20)}`,
            category: cat,
            match: `${Math.floor(Math.random() * 20 + 80)}% match`,
            url: `${shop.url}/search?q=${occasion}+${cat}`,
            shop: shop.name
        };
    });
}

function displayGeneratedOutfit(outfit) {
    const resultEl = document.getElementById('outfit-result');
    const nameEl = document.getElementById('outfit-name');
    const reasoningEl = document.getElementById('outfit-reasoning');
    const itemsEl = document.getElementById('outfit-items');
    const recsBox = document.getElementById('recommendations-box');
    const recsList = document.getElementById('recommendations-list');
    const onlineBox = document.getElementById('online-recommendations');
    const onlineGrid = document.getElementById('online-shop-grid');

    resultEl.classList.add('show');
    nameEl.textContent = outfit.name;
    reasoningEl.textContent = outfit.reasoning;

    itemsEl.innerHTML = outfit.items.map(item => {
        const isRequired = DataStore.requiredSections.includes(item.category);
        return `
            <div class="outfit-item-slot filled ${isRequired ? 'required' : ''}">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    ${getItemIcon(item.category)}
                </svg>
                <div class="outfit-item-name">${item.name}</div>
                <div class="outfit-item-color">${item.color} ${isRequired ? '• Required' : ''}</div>
                ${item.link ? `<a href="${item.link}" target="_blank" class="btn btn-sm btn-outline" style="margin-top: 8px;">View Item</a>` : ''}
            </div>
        `;
    }).join('');

    if (outfit.recommendations && outfit.recommendations.length > 0) {
        recsBox.style.display = 'block';
        recsList.innerHTML = outfit.recommendations.map(rec => `
            <div class="recommendation-item">
                <span class="recommendation-icon">✦</span>
                <span>${rec}</span>
            </div>
        `).join('');
    } else {
        recsBox.style.display = 'none';
    }

    if (outfit.onlineRecommendations && outfit.onlineRecommendations.length > 0) {
        onlineBox.style.display = 'block';
        onlineGrid.innerHTML = outfit.onlineRecommendations.map(item => `
            <a href="${item.url}" target="_blank" class="online-shop-item">
                <div class="online-shop-image">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                </div>
                <div class="online-shop-info">
                    <div class="online-shop-name">${item.name}</div>
                    <div class="online-shop-price">${item.price}</div>
                    <div class="online-shop-category">${item.category}</div>
                    <div class="online-shop-match">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${item.match} • ${item.shop}
                    </div>
                </div>
            </a>
        `).join('');
    } else {
        onlineBox.style.display = 'none';
    }

    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function regenerateOutfit() {
    const occasion = document.getElementById('gen-occasion').value;
    const weather = document.getElementById('gen-weather').value;
    const style = document.getElementById('gen-style').value;
    const prompt = document.getElementById('gen-prompt').value.toLowerCase();
    generateOutfitLocal(occasion, weather, style, prompt);
    Toast.success('Outfit regenerated');
}

async function saveGeneratedOutfit() {
    if (!DataStore.currentOutfit) return;
    const outfit = {
        ...DataStore.currentOutfit,
        id: Date.now().toString(),
        savedAt: new Date().toISOString()
    };
    DataStore.outfits.push(outfit);
    await DataStore.save();
    Toast.success('Outfit saved to collection');
}

// Photo Analysis Features
function switchPhotoTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'camera') {
        document.getElementById('photo-camera-section').style.display = 'block';
        document.getElementById('photo-upload-section').style.display = 'none';
    } else {
        document.getElementById('photo-camera-section').style.display = 'none';
        document.getElementById('photo-upload-section').style.display = 'block';
    }
}

function openCameraModal() {
    document.getElementById('camera-overlay').classList.add('active');
    document.getElementById('camera-modal').classList.add('active');
    initCamera();
}

function closeCameraModal() {
    document.getElementById('camera-overlay').classList.remove('active');
    document.getElementById('camera-modal').classList.remove('active');
    stopCamera();
}

let cameraStream = null;
let facingMode = 'user';

async function initCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: facingMode } 
        });
        const video = document.createElement('video');
        video.srcObject = cameraStream;
        video.autoplay = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        
        const preview = document.getElementById('camera-preview');
        preview.innerHTML = '';
        preview.appendChild(video);
    } catch (e) {
        Toast.error('Could not access camera');
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
}

function switchCamera() {
    facingMode = facingMode === 'user' ? 'environment' : 'user';
    stopCamera();
    initCamera();
}

function capturePhoto() {
    const video = document.querySelector('#camera-preview video');
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg');
    closeCameraModal();
    analyzePhoto(imageData);
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => analyzePhoto(e.target.result);
    reader.readAsDataURL(file);
}

function analyzePhoto(imageData) {
    const uploadArea = document.getElementById('upload-area') || document.getElementById('camera-area');
    uploadArea.classList.add('has-image');
    uploadArea.innerHTML = `<img src="${imageData}" class="photo-preview" style="max-height: 300px;"><button class="btn btn-secondary" onclick="resetPhoto()" style="margin-top: 12px;">Remove Photo</button>`;

    Toast.success('Analyzing photo...');
    
    setTimeout(() => {
        const skinTones = ['warm', 'cool', 'neutral'];
        const skinTone = skinTones[Math.floor(Math.random() * skinTones.length)];
        
        DataStore.photoAnalysis = {
            skinTone: skinTone,
            colors: analyzeColors(skinTone)
        };

        displayAnalysisResults(skinTone);
    }, 1500);
}

function analyzeColors(skinTone) {
    const palettes = {
        warm: {
            recommended: ['#D2691E', '#FF6347', '#FFD700', '#228B22', '#FFFFFF'],
            avoid: ['#4B0082', '#000080', '#C0C0C0'],
            description: 'Warm Undertone Detected'
        },
        cool: {
            recommended: ['#4169E1', '#9370DB', '#FF69B4', '#20B2AA', '#000000'],
            avoid: ['#FF8C00', '#FFD700', '#D2691E'],
            description: 'Cool Undertone Detected'
        },
        neutral: {
            recommended: ['#808080', '#2F4F4F', '#708090', '#F5F5DC', '#000000'],
            avoid: ['#FF00FF', '#00FF00'],
            description: 'Neutral Undertone Detected'
        }
    };
    return palettes[skinTone];
}

function displayAnalysisResults(skinTone) {
    const results = document.getElementById('analysis-results');
    const badgeText = document.getElementById('skin-tone-text');
    const recColors = document.getElementById('recommended-colors');
    const avoidColors = document.getElementById('avoid-colors');
    const recs = document.getElementById('photo-recommendations');

    const palette = DataStore.photoAnalysis.colors;

    results.style.display = 'block';
    badgeText.textContent = palette.description;

    recColors.innerHTML = palette.recommended.map(color => `
        <div class="color-swatch recommended" style="background: ${color}" title="${color}"></div>
    `).join('');

    avoidColors.innerHTML = palette.avoid.map(color => `
        <div class="color-swatch avoid" style="background: ${color}" title="${color}"></div>
    `).join('');

    const recommendations = generatePhotoRecommendations(skinTone);
    recs.innerHTML = recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="recommendation-icon">✦</span>
            <span>${rec}</span>
        </div>
    `).join('');

    renderPhotoShopSuggestions(skinTone);
}

function generatePhotoRecommendations(skinTone) {
    const recs = {
        warm: [
            'Earth tones and warm jewel tones will enhance your natural glow',
            'Opt for gold accessories over silver',
            'Cream and ivory work better than pure white',
            'Peach and coral lipsticks will complement your undertone'
        ],
        cool: [
            'Jewel tones like sapphire and emerald will make you shine',
            'Silver and platinum accessories suit you best',
            'Pure white and black create striking contrast',
            'Berry and mauve shades flatter your complexion'
        ],
        neutral: [
            'You can wear both warm and cool tones successfully',
            'Most colors work well - experiment with bold choices',
            'Both gold and silver accessories look great',
            'Try muted or soft versions of bright colors'
        ]
    };
    return recs[skinTone] || recs.neutral;
}

function renderPhotoShopSuggestions(skinTone) {
    const grid = document.getElementById('photo-shop-grid');
    const suggestions = [
        { name: 'Silk Blouse', price: '$89', match: '95% match', category: 'tops', url: 'https://www.asos.com/search?q=silk+blouse', shop: 'ASOS', color: skinTone === 'warm' ? 'Coral' : 'Sapphire' },
        { name: 'Tailored Trousers', price: '$120', match: '92% match', category: 'bottoms', url: 'https://www.nordstrom.com/search?q=tailored+trousers', shop: 'Nordstrom', color: 'Charcoal' },
        { name: 'Cashmere Sweater', price: '$150', match: '90% match', category: 'tops', url: 'https://www.uniqlo.com/search?q=cashmere', shop: 'Uniqlo', color: skinTone === 'warm' ? 'Camel' : 'Heather Gray' },
        { name: 'Leather Jacket', price: '$250', match: '88% match', category: 'outerwear', url: 'https://www.nordstrom.com/search?q=leather+jacket', shop: 'Nordstrom', color: 'Black' }
    ];

    grid.innerHTML = suggestions.map(item => `
        <a href="${item.url}" target="_blank" class="online-shop-item">
            <div class="online-shop-image">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            </div>
            <div class="online-shop-info">
                <div class="online-shop-name">${item.name}</div>
                <div class="online-shop-price">${item.price}</div>
                <div class="online-shop-category">${item.color} • ${item.category}</div>
                <div class="online-shop-match">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    ${item.match} • ${item.shop}
                </div>
            </div>
        </a>
    `).join('');
}

function resetPhoto() {
    const uploadArea = document.getElementById('upload-area');
    uploadArea.classList.remove('has-image');
    uploadArea.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        <div class="photo-upload-text">Drop photo here or click to browse</div>
        <div class="photo-upload-hint">Supports JPG, PNG up to 10MB</div>
        <input type="file" id="photo-input" accept="image/*" style="display: none;" onchange="handlePhotoUpload(event)">
    `;
    document.getElementById('analysis-results').style.display = 'none';
    DataStore.photoAnalysis = null;
}

// Barcode Scanner
function scanBarcode() {
    const input = document.getElementById('barcode-input');
    const code = input.value.trim();
    
    if (!code) {
        Toast.error('Please enter a barcode');
        return;
    }

    Toast.success(`Looking up barcode: ${code}`);
    
    setTimeout(() => {
        const mockItems = [
            { name: 'Classic White Tee', brand: 'Uniqlo', category: 'tops', color: 'White', price: '$19.90' },
            { name: 'Slim Fit Jeans', brand: 'Levi\'s', category: 'bottoms', color: 'Indigo', price: '$89.50' },
            { name: 'Running Shoes', brand: 'Nike', category: 'shoes', color: 'Black/White', price: '$120.00' }
        ];
        
        const item = mockItems[Math.floor(Math.random() * mockItems.length)];
        displayBarcodeResult(item, code);
        input.value = '';
    }, 1000);
}

function displayBarcodeResult(item, code) {
    const container = document.getElementById('barcode-results');
    const div = document.createElement('div');
    div.className = 'barcode-item';
    div.innerHTML = `
        <div class="barcode-item-image">
            <svg width="30" height="30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                ${getItemIcon(item.category)}
            </svg>
        </div>
        <div class="barcode-item-info">
            <div class="barcode-item-name">${item.name}</div>
            <div class="barcode-item-meta">${item.brand} • ${item.color} • ${item.price}</div>
        </div>
        <button class="btn btn-primary btn-icon" onclick="addBarcodeItem('${item.name}', '${item.category}', '${item.color}')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
    `;
    container.prepend(div);
}

function addBarcodeItem(name, category, color) {
    const item = {
        id: Date.now().toString(),
        name: name,
        category: category,
        color: color,
        size: DataStore.userSettings.sizes[category === 'bottoms' ? 'bottom' : 'top'],
        occasions: ['casual'],
        added: new Date().toISOString()
    };
    DataStore.wardrobe.push(item);
    DataStore.save();
    Toast.success(`${name} added to wardrobe`);
}

function renderBarcodeSuggestions() {
    const grid = document.getElementById('barcode-shop-grid');
    const suggestions = [
        { name: 'Oxford Shirt', price: '$59', match: 'Popular', category: 'tops', url: 'https://www.asos.com/search?q=oxford+shirt', shop: 'ASOS' },
        { name: 'Chino Pants', price: '$69', match: 'Trending', category: 'bottoms', url: 'https://www.nordstrom.com/search?q=chino+pants', shop: 'Nordstrom' },
        { name: 'Leather Belt', price: '$45', match: 'Essential', category: 'accessories', url: 'https://www.etsy.com/search?q=leather+belt', shop: 'Etsy' },
        { name: 'Cotton Socks', price: '$12', match: 'Bundle', category: 'accessories', url: 'https://www.uniqlo.com/search?q=socks', shop: 'Uniqlo' }
    ];

    if (grid) {
        grid.innerHTML = suggestions.map(item => `
            <a href="${item.url}" target="_blank" class="online-shop-item">
                <div class="online-shop-image">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                </div>
                <div class="online-shop-info">
                    <div class="online-shop-name">${item.name}</div>
                    <div class="online-shop-price">${item.price}</div>
                    <div class="online-shop-category">${item.category}</div>
                    <div class="online-shop-match">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${item.match} • ${item.shop}
                    </div>
                </div>
            </a>
        `).join('');
    }
}

// Settings
function updateSetting(key, value) {
    if (key.includes('.')) {
        const [parent, child] = key.split('.');
        DataStore.userSettings[parent][child] = value;
    } else {
        DataStore.userSettings[key] = value;
    }
    DataStore.saveSettings();
    Toast.success('Settings updated');
}

function selectSize(type, size) {
    DataStore.userSettings.sizes[type] = size;
    DataStore.saveSettings();
    
    document.querySelectorAll(`.size-btn[data-size^="${type}-"]`).forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.size-btn[data-size="${type}-${size}"]`).classList.add('active');
}

// Saved Outfits
function renderSavedOutfits() {
    const grid = document.getElementById('saved-outfits-grid');
    const empty = document.getElementById('saved-empty');
    if (!grid) return;

    if (DataStore.outfits.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    if (empty) empty.style.display = 'none';

    grid.innerHTML = DataStore.outfits.map(outfit => `
        <div class="outfit-card">
            <div class="outfit-card-header">
                <div class="outfit-card-title">${outfit.name}</div>
                <div class="outfit-card-delete" onclick="deleteOutfit('${outfit.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </div>
            </div>
            <div class="outfit-card-items">
                ${outfit.items.map(item => `
                    <div class="outfit-card-item">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            ${getItemIcon(item.category)}
                        </svg>
                    </div>
                `).join('')}
            </div>
            <div class="outfit-card-meta">
                ${outfit.items.length} items • ${new Date(outfit.savedAt).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

async function deleteOutfit(id) {
    DataStore.outfits = DataStore.outfits.filter(o => o.id !== id);
    await DataStore.save();
    renderSavedOutfits();
    Toast.success('Outfit removed');
}

// Analytics
function renderAnalytics() {
    const categories = {};
    const colors = {};
    const occasions = {};

    DataStore.wardrobe.forEach(item => {
        categories[item.category] = (categories[item.category] || 0) + 1;
        colors[item.color] = (colors[item.color] || 0) + 1;
        (item.occasions || []).forEach(occ => {
            occasions[occ] = (occasions[occ] || 0) + 1;
        });
    });

    const catContainer = document.getElementById('category-stats');
    if (catContainer) {
        const total = DataStore.wardrobe.length || 1;
        const sortedCats = Object.entries(categories).sort((a, b) => b[1] - a[1]);
        catContainer.innerHTML = sortedCats.map(([cat, count]) => `
            <div class="stat-row">
                <span class="stat-name">${capitalize(cat)}</span>
                <div class="stat-bar-container">
                    <div class="stat-bar">
                        <div class="stat-bar-fill" style="width: ${(count / total * 100)}%"></div>
                    </div>
                    <span class="stat-value">${count}</span>
                </div>
            </div>
        `).join('');
    }

    const colorContainer = document.getElementById('color-stats');
    if (colorContainer) {
        colorContainer.innerHTML = Object.entries(colors)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([color, count]) => `
                <span class="color-tag">${color} (${count})</span>
            `).join('');
    }

    const insightsList = document.getElementById('insights-list');
    if (insightsList && DataStore.wardrobe.length > 0) {
        const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
        const topColor = Object.entries(colors).sort((a, b) => b[1] - a[1])[0];
        const topOccasion = Object.entries(occasions).sort((a, b) => b[1] - a[1])[0];
        
        const insights = [
            `Your wardrobe is dominated by <span class="insight-highlight">${topCategory ? topCategory[0] : 'tops'}</span> - consider balancing with other categories`,
            `<span class="insight-highlight">${topColor ? topColor[0] : 'Neutral'}</span> is your most frequent color choice`,
            topOccasion ? `You dress most often for <span class="insight-highlight">${topOccasion[0]}</span> occasions` : 'Add occasion tags to get better insights',
            `Your wardrobe has <span class="insight-highlight">${calculateVersatility()}%</span> mix-and-match potential`
        ];
        
        insightsList.innerHTML = insights.map(insight => `
            <div class="insight-item">• ${insight}</div>
        `).join('');
    }
}

function calculateVersatility() {
    const categories = [...new Set(DataStore.wardrobe.map(i => i.category))].length;
    const total = DataStore.wardrobe.length;
    if (total < 5) return Math.min(100, total * 10);
    return Math.min(95, Math.max(30, categories * 15 + (total / 2)));
}

// Command Palette
function toggleCommandPalette() {
    const palette = document.getElementById('command-palette');
    const overlay = document.getElementById('command-overlay');
    const isOpen = palette.classList.contains('active');

    if (isOpen) {
        closeCommandPalette();
    } else {
        palette.classList.add('active');
        overlay.classList.add('active');
        document.getElementById('command-input').focus();
    }
}

function closeCommandPalette() {
    document.getElementById('command-palette').classList.remove('active');
    document.getElementById('command-overlay').classList.remove('active');
    document.getElementById('command-input').value = '';
}

function filterCommands() {
    const query = document.getElementById('command-input').value.toLowerCase();
    const items = document.querySelectorAll('.command-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? 'flex' : 'none';
    });
}

function executeCommand(cmd) {
    closeCommandPalette();

    switch(cmd) {
        case 'add': openAddItemModal(); break;
        case 'generate': navigateTo('generator'); break;
        case 'photo': navigateTo('photo'); break;
        case 'barcode': navigateTo('barcode'); break;
        case 'wardrobe': navigateTo('wardrobe'); break;
        case 'saved': navigateTo('saved'); break;
        case 'settings': navigateTo('settings'); break;
    }
}

// Utility
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await DataStore.load();
    renderWardrobe();

    const uploadArea = document.getElementById('upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', (e) => {
            if (e.target.tagName !== 'INPUT' && !e.target.closest('button')) {
                document.getElementById('photo-input').click();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            toggleCommandPalette();
        }
        if (e.key === 'Escape') {
            closeCommandPalette();
            closeAddItemModal();
            closeEditItemModal();
            closeCameraModal();
        }
    });

    setInterval(async () => {
        try {
            await fetch('http://localhost:3456/api/health');
        } catch (e) {}
    }, 30000);
});

// Export for debugging
window.DataStore = DataStore;
window.Toast = Toast;