// Data Management
class InventoryManager {
    constructor() {
        this.scenes = JSON.parse(localStorage.getItem('scenes')) || [
            { id: 1, name: '客廳', locations: ['電視櫃', '沙發旁', '茶几'] },
            { id: 2, name: '廚房', locations: ['冰箱', '櫥櫃', '流理台'] },
            { id: 3, name: '臥室', locations: ['衣櫃', '床頭櫃', '書桌'] }
        ];
        
        this.tags = JSON.parse(localStorage.getItem('tags')) || [
            { id: 1, name: '食品', color: '#EF4444' },
            { id: 2, name: '日用品', color: '#F59E0B' },
            { id: 3, name: '工具', color: '#10B981' },
            { id: 4, name: '重要', color: '#8B5CF6' }
        ];
        
        this.items = JSON.parse(localStorage.getItem('items')) || [];
        
        this.currentPage = 'home';
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.renderRecentItems();
        this.renderScenes();
        this.renderTags();
        this.populateFormSelects();
        this.renderSceneCards();
        this.renderTagCards();
    }
    
    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateToPage(page);
            });
        });
        
        // Quick access cards
        document.querySelectorAll('.access-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateToPage(page);
            });
        });
        
        // Back buttons
        document.getElementById('scenesBackBtn').addEventListener('click', () => this.navigateToPage('home'));
        document.getElementById('tagsBackBtn').addEventListener('click', () => this.navigateToPage('home'));
        
        // Add buttons
        document.getElementById('addItemNavBtn').addEventListener('click', () => this.openAddItemModal());
        document.getElementById('addSceneBtn').addEventListener('click', () => this.addScene());
        document.getElementById('addTagBtn').addEventListener('click', () => this.addTag());
        
        // Modal
        document.getElementById('closeModalBtn').addEventListener('click', () => this.closeAddItemModal());
        document.getElementById('addItemForm').addEventListener('submit', (e) => this.handleAddItem(e));
        
        // Search
        document.getElementById('searchBtn').addEventListener('click', () => this.searchItems());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchItems();
        });
        
        // Scene selection
        document.getElementById('itemScene').addEventListener('change', (e) => this.updateLocationOptions(e.target.value));
        
        // View all buttons
        document.querySelectorAll('.view-all-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) this.navigateToPage(page);
            });
        });
    }
    
    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Update pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        
        // Show/hide hero section based on page
        const heroSection = document.getElementById('heroSection');
        if (page === 'home') {
            heroSection.style.display = 'block';
        } else {
            heroSection.style.display = 'none';
        }
        
        switch(page) {
            case 'home':
                document.getElementById('homePage').classList.add('active');
                this.renderRecentItems();
                break;
            case 'scenes':
                document.getElementById('scenesPage').classList.add('active');
                break;
            case 'tags':
                document.getElementById('tagsPage').classList.add('active');
                break;
            case 'profile':
                document.getElementById('profilePage').classList.add('active');
                break;
        }
        
        this.currentPage = page;
    }
    
    renderRecentItems() {
        const container = document.getElementById('recentItemsList');
        const recentItems = this.items
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
        
        if (recentItems.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">暫無物品記錄</p>';
            return;
        }
        
        container.innerHTML = recentItems.map(item => {
            const scene = this.scenes.find(s => s.id === item.sceneId);
            const location = scene?.locations[item.locationIndex] || '未知地點';
            const expiryClass = this.getExpiryClass(item.expiryDate);
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-quantity">數量: <span>${item.quantity}</span></div>
                        </div>
                    </div>
                    <div class="item-details">
                        ${item.tags.map(tagId => {
                            const tag = this.tags.find(t => t.id === tagId);
                            return tag ? `<span class="item-tag" style="background-color: ${tag.color}20; color: ${tag.color}">${tag.name}</span>` : '';
                        }).join('')}
                    </div>
                    <div class="item-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${scene?.name || '未知場景'} - ${location}
                    </div>
                    ${item.expiryDate ? `<div class="item-expiry ${expiryClass}">保存期限: ${new Date(item.expiryDate).toLocaleDateString()}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    renderSceneCards() {
        const container = document.getElementById('scenesScrollContent');
        
        if (this.scenes.length === 0) {
            container.innerHTML = '<p class="text-muted">暫無場景記錄</p>';
            return;
        }
        
        container.innerHTML = this.scenes.map(scene => {
            const itemCount = this.items.filter(item => item.sceneId === scene.id).length;
            
            return `
                <div class="scene-card" data-scene-id="${scene.id}">
                    <div class="scene-card-name">${scene.name}</div>
                </div>
            `;
        }).join('');
        
        // Add click events to scene cards
        container.querySelectorAll('.scene-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateToPage('scenes');
            });
        });
    }
    
    renderTagCards() {
        const container = document.getElementById('tagsScrollContent');
        
        if (this.tags.length === 0) {
            container.innerHTML = '<p class="text-muted">暫無標籤記錄</p>';
            return;
        }
        
        container.innerHTML = this.tags.map(tag => {
            const itemCount = this.items.filter(item => item.tags.includes(tag.id)).length;
            
            return `
                <div class="tag-card" data-tag-id="${tag.id}">
                    <div class="tag-card-name" style="color: ${tag.color}">${tag.name}</div>
                    <div class="tag-card-count">${itemCount} 件物品</div>
                </div>
            `;
        }).join('');
        
        // Add click events to tag cards
        container.querySelectorAll('.tag-card').forEach(card => {
            card.addEventListener('click', () => {
                this.navigateToPage('tags');
            });
        });
    }
    
    renderScenes() {
        const container = document.getElementById('scenesList');
        
        if (this.scenes.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">暫無場景記錄</p>';
            return;
        }
        
        container.innerHTML = this.scenes.map(scene => {
            const itemCount = this.items.filter(item => item.sceneId === scene.id).length;
            
            return `
                <div class="scene-item">
                    <div class="scene-header">
                        <div class="scene-name">${scene.name}</div>
                        <div class="scene-count">${itemCount} 件物品</div>
                    </div>
                    <div class="scene-locations">
                        ${scene.locations.map((location, index) => {
                            const locationItemCount = this.items.filter(item => 
                                item.sceneId === scene.id && item.locationIndex === index
                            ).length;
                            return `<span class="location-badge">${location} (${locationItemCount})</span>`;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    renderTags() {
        const container = document.getElementById('tagsList');
        
        if (this.tags.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">暫無標籤記錄</p>';
            return;
        }
        
        container.innerHTML = this.tags.map(tag => {
            const itemCount = this.items.filter(item => item.tags.includes(tag.id)).length;
            
            return `
                <div class="tag-item">
                    <div class="tag-header">
                        <div class="tag-name" style="color: ${tag.color}">${tag.name}</div>
                        <div class="tag-count">${itemCount} 件物品</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    populateFormSelects() {
        const sceneSelect = document.getElementById('itemScene');
        const tagsContainer = document.getElementById('itemTags');
        
        // Populate scenes
        sceneSelect.innerHTML = '<option value="">選擇場景</option>' +
            this.scenes.map(scene => `<option value="${scene.id}">${scene.name}</option>`).join('');
        
        // Populate tags
        tagsContainer.innerHTML = this.tags.map(tag => `
            <label class="tag-checkbox">
                <input type="checkbox" name="tags" value="${tag.id}">
                <span style="color: ${tag.color}">${tag.name}</span>
            </label>
        `).join('');
    }
    
    updateLocationOptions(sceneId) {
        const locationSelect = document.getElementById('itemLocation');
        const scene = this.scenes.find(s => s.id == sceneId);
        
        if (scene) {
            locationSelect.innerHTML = scene.locations.map((location, index) => 
                `<option value="${index}">${location}</option>`
            ).join('');
            locationSelect.disabled = false;
        } else {
            locationSelect.innerHTML = '<option value="">先選擇場景</option>';
            locationSelect.disabled = true;
        }
    }
    
    openAddItemModal() {
        document.getElementById('addItemModal').classList.add('active');
    }
    
    closeAddItemModal() {
        document.getElementById('addItemModal').classList.remove('active');
        document.getElementById('addItemForm').reset();
    }
    
    handleAddItem(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const selectedTags = Array.from(document.querySelectorAll('input[name="tags"]:checked'))
            .map(cb => parseInt(cb.value));
        
        const newItem = {
            id: Date.now(),
            name: document.getElementById('itemName').value,
            quantity: parseInt(document.getElementById('itemQuantity').value),
            sceneId: parseInt(document.getElementById('itemScene').value),
            locationIndex: parseInt(document.getElementById('itemLocation').value),
            tags: selectedTags,
            expiryDate: document.getElementById('itemExpiry').value || null,
            photo: null, // For now, we'll skip photo handling
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.items.push(newItem);
        this.saveData();
        this.closeAddItemModal();
        this.renderRecentItems();
        
        // Show success message (you could add a toast notification here)
        alert('物品添加成功！');
    }
    
    addScene() {
        const name = prompt('請輸入場景名稱：');
        if (name && name.trim()) {
            const locations = prompt('請輸入地點名稱（用逗號分隔）：');
            if (locations && locations.trim()) {
                const newScene = {
                    id: Date.now(),
                    name: name.trim(),
                    locations: locations.split(',').map(l => l.trim())
                };
                
                this.scenes.push(newScene);
                this.saveData();
                this.renderScenes();
                this.populateFormSelects();
            }
        }
    }
    
    addTag() {
        const name = prompt('請輸入標籤名稱：');
        if (name && name.trim()) {
            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const newTag = {
                id: Date.now(),
                name: name.trim(),
                color: randomColor
            };
            
            this.tags.push(newTag);
            this.saveData();
            this.renderTags();
            this.populateFormSelects();
        }
    }
    
    searchItems() {
        const query = document.getElementById('searchInput').value.toLowerCase().trim();
        if (!query) {
            this.renderRecentItems();
            return;
        }
        
        const results = this.items.filter(item => {
            const nameMatch = item.name.toLowerCase().includes(query);
            const tagMatch = item.tags.some(tagId => {
                const tag = this.tags.find(t => t.id === tagId);
                return tag && tag.name.toLowerCase().includes(query);
            });
            const sceneMatch = (() => {
                const scene = this.scenes.find(s => s.id === item.sceneId);
                return scene && scene.name.toLowerCase().includes(query);
            })();
            
            return nameMatch || tagMatch || sceneMatch;
        });
        
        // Display search results
        const container = document.getElementById('recentItemsList');
        if (results.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">找不到相關物品</p>';
            return;
        }
        
        container.innerHTML = results.map(item => {
            const scene = this.scenes.find(s => s.id === item.sceneId);
            const location = scene?.locations[item.locationIndex] || '未知地點';
            const expiryClass = this.getExpiryClass(item.expiryDate);
            
            return `
                <div class="item-card">
                    <div class="item-header">
                        <div>
                            <div class="item-name">${item.name}</div>
                            <div class="item-quantity">數量: <span>${item.quantity}</span></div>
                        </div>
                    </div>
                    <div class="item-details">
                        ${item.tags.map(tagId => {
                            const tag = this.tags.find(t => t.id === tagId);
                            return tag ? `<span class="item-tag" style="background-color: ${tag.color}20; color: ${tag.color}">${tag.name}</span>` : '';
                        }).join('')}
                    </div>
                    <div class="item-location">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${scene?.name || '未知場景'} - ${location}
                    </div>
                    ${item.expiryDate ? `<div class="item-expiry ${expiryClass}">保存期限: ${new Date(item.expiryDate).toLocaleDateString()}</div>` : ''}
                </div>
            `;
        }).join('');
    }
    
    getExpiryClass(expiryDate) {
        if (!expiryDate) return '';
        
        const now = new Date();
        const expiry = new Date(expiryDate);
        const daysUntilExpiry = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0) return 'danger';
        if (daysUntilExpiry <= 7) return 'warning';
        return '';
    }
    
    saveData() {
        localStorage.setItem('scenes', JSON.stringify(this.scenes));
        localStorage.setItem('tags', JSON.stringify(this.tags));
        localStorage.setItem('items', JSON.stringify(this.items));
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new InventoryManager();
});