/**
 * Inventory Management System - JavaScript Implementation
 * Features: Consistent Hashing, Quadratic Probing, Interactive Demo
 */

// ===== GLOBAL VARIABLES =====
let inventorySystem = null;
let collisionCount = 0;
let totalProducts = 0;
let productTimeline = [];
let yearlyStats = {};

// Global locations with coordinates for world map
const GLOBAL_LOCATIONS = {
    'New York, USA': { x: 25, y: 20, region: 'North America' },
    'London, UK': { x: 45, y: 15, region: 'Europe' },
    'Tokyo, Japan': { x: 75, y: 20, region: 'Asia' },
    'Sydney, Australia': { x: 70, y: 40, region: 'Oceania' },
    'Dubai, UAE': { x: 50, y: 25, region: 'Middle East' },
    'Singapore': { x: 60, y: 30, region: 'Asia' },
    'Mumbai, India': { x: 55, y: 25, region: 'Asia' },
    'São Paulo, Brazil': { x: 30, y: 35, region: 'South America' },
    'Toronto, Canada': { x: 20, y: 15, region: 'North America' },
    'Berlin, Germany': { x: 47, y: 18, region: 'Europe' }
};

// ===== CONSISTENT HASHING IMPLEMENTATION =====
class ConsistentHash {
    constructor() {
        this.nodes = ['Warehouse-A', 'Warehouse-B', 'Warehouse-C'];
        this.hashRing = new Map();
        this.initializeRing();
    }

    /**
     * Initialize the hash ring with nodes
     */
    initializeRing() {
        this.nodes.forEach(node => {
            const hash = this.hashFunction(node);
            this.hashRing.set(hash, node);
        });
    }

    /**
     * Simple hash function using djb2 algorithm
     * @param {string} key - The key to hash
     * @returns {number} - Hash value
     */
    hashFunction(key) {
        let hash = 5381;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) + hash) + key.charCodeAt(i);
        }
        return Math.abs(hash) % 360; // Return angle in degrees (0-359)
    }

    /**
     * Get the node responsible for a given key
     * @param {string} key - The key to find node for
     * @returns {string} - Node name
     */
    getNode(key) {
        const keyHash = this.hashFunction(key);
        let closestNode = null;
        let minDistance = Infinity;

        // Find the closest node clockwise
        for (const [nodeHash, nodeName] of this.hashRing) {
            let distance = nodeHash - keyHash;
            if (distance < 0) distance += 360; // Handle wraparound
            
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = nodeName;
            }
        }

        return closestNode;
    }

    /**
     * Get all nodes and their hash positions
     * @returns {Array} - Array of {node, hash, angle}
     */
    getRingData() {
        return Array.from(this.hashRing.entries()).map(([hash, node]) => ({
            node,
            hash,
            angle: hash
        }));
    }
}

// ===== QUADRATIC PROBING HASH TABLE =====
class HashTable {
    constructor(size = 16) {
        this.size = size;
        this.table = new Array(size).fill(null);
        this.collisionCount = 0;
    }

    /**
     * Hash function for product codes
     * @param {string} key - Product code
     * @returns {number} - Hash index
     */
    hash(key) {
        let hash = 0;
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) - hash + key.charCodeAt(i)) & 0xffffffff;
        }
        return Math.abs(hash) % this.size;
    }

    /**
     * Quadratic probing to find next available slot
     * @param {string} key - Product code
     * @param {number} startIndex - Starting index
     * @returns {number} - Available index
     */
    quadraticProbe(key, startIndex) {
        let index = startIndex;
        let i = 1;
        
        while (this.table[index] !== null && this.table[index].code !== key) {
            index = (startIndex + i * i) % this.size;
            i++;
            this.collisionCount++;
            
            // Prevent infinite loop
            if (i > this.size) {
                throw new Error('Hash table is full');
            }
        }
        
        return index;
    }

    /**
     * Insert a product into the hash table
     * @param {Object} product - Product object
     * @returns {boolean} - Success status
     */
    insert(product) {
        const hashIndex = this.hash(product.code);
        const index = this.quadraticProbe(product.code, hashIndex);
        
        this.table[index] = product;
        return true;
    }

    /**
     * Search for a product by code
     * @param {string} code - Product code
     * @returns {Object|null} - Product object or null
     */
    search(code) {
        const hashIndex = this.hash(code);
        let index = hashIndex;
        let i = 1;
        
        while (this.table[index] !== null) {
            if (this.table[index].code === code) {
                return this.table[index];
            }
            index = (hashIndex + i * i) % this.size;
            i++;
            
            if (i > this.size) break;
        }
        
        return null;
    }

    /**
     * Update product quantity
     * @param {string} code - Product code
     * @param {number} quantity - New quantity
     * @returns {boolean} - Success status
     */
    updateQuantity(code, quantity) {
        const product = this.search(code);
        if (product) {
            product.quantity = quantity;
            return true;
        }
        return false;
    }

    /**
     * Get table data for visualization
     * @returns {Array} - Array of table cells
     */
    getTableData() {
        return this.table.map((item, index) => ({
            index,
            product: item,
            isEmpty: item === null
        }));
    }

    /**
     * Get collision count
     * @returns {number} - Number of collisions
     */
    getCollisionCount() {
        return this.collisionCount;
    }
}

// ===== INVENTORY SYSTEM MAIN CLASS =====
class InventorySystem {
    constructor() {
        this.consistentHash = new ConsistentHash();
        this.hashTable = new HashTable(16);
        this.products = new Map();
        this.stats = {
            totalProducts: 0,
            storageUtilization: 0,
            collisionCount: 0
        };
    }

    /**
     * Add a new product to the inventory
     * @param {string} code - Product code
     * @param {string} name - Product name
     * @param {number} quantity - Product quantity
     * @param {string} location - Warehouse location
     * @returns {boolean} - Success status
     */
    addProduct(code, name, quantity, location) {
        // Validate inputs
        if (!code || !name || quantity < 0) {
            return false;
        }

        // Check if product already exists
        if (this.products.has(code)) {
            return false;
        }

        // Create product object
        const product = {
            code: code.toUpperCase(),
            name: name,
            quantity: parseInt(quantity),
            location: location,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Add to hash table
        try {
            this.hashTable.insert(product);
            this.products.set(code.toUpperCase(), product);
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error adding product:', error);
            return false;
        }
    }

    /**
     * Search for a product by code
     * @param {string} code - Product code
     * @returns {Object|null} - Product object or null
     */
    searchProduct(code) {
        return this.hashTable.search(code.toUpperCase());
    }

    /**
     * Update product quantity
     * @param {string} code - Product code
     * @param {number} quantity - New quantity
     * @returns {boolean} - Success status
     */
    updateQuantity(code, quantity) {
        const success = this.hashTable.updateQuantity(code.toUpperCase(), parseInt(quantity));
        if (success) {
            const product = this.products.get(code.toUpperCase());
            if (product) {
                product.quantity = parseInt(quantity);
            }
            this.updateStats();
        }
        return success;
    }

    /**
     * Delete a product from the inventory
     * @param {string} code - Product code
     * @returns {boolean} - Success status
     */
    deleteProduct(code) {
        const product = this.searchProduct(code);
        if (!product) {
            return false;
        }

        // Add deletion timestamp
        product.deletedAt = new Date().toISOString();

        // Remove from hash table
        const tableData = this.hashTable.getTableData();
        const productIndex = tableData.findIndex(cell => 
            cell.product && cell.product.code === code.toUpperCase()
        );

        if (productIndex !== -1) {
            this.hashTable.table[productIndex] = null;
        }

        // Remove from products map
        this.products.delete(code.toUpperCase());
        this.updateStats();
        return true;
    }

    /**
     * Get node for a product code using consistent hashing
     * @param {string} code - Product code
     * @returns {string} - Node name
     */
    getNodeForProduct(code) {
        return this.consistentHash.getNode(code.toUpperCase());
    }

    /**
     * Update system statistics
     */
    updateStats() {
        this.stats.totalProducts = this.products.size;
        this.stats.storageUtilization = Math.round((this.products.size / this.hashTable.size) * 100);
        this.stats.collisionCount = this.hashTable.getCollisionCount();
    }

    /**
     * Get all products
     * @returns {Array} - Array of products
     */
    getAllProducts() {
        return Array.from(this.products.values());
    }

    /**
     * Get hash table data for visualization
     * @returns {Array} - Hash table data
     */
    getHashTableData() {
        return this.hashTable.getTableData();
    }

    /**
     * Get consistent hash ring data
     * @returns {Array} - Ring data
     */
    getRingData() {
        return this.consistentHash.getRingData();
    }
}

// ===== DOM MANIPULATION AND UI FUNCTIONS =====

/**
 * Initialize the inventory system and UI
 */
function initializeSystem() {
    inventorySystem = new InventorySystem();
    updateStorageVisualization();
    updateHashTableDisplay();
    updateStats();
}

/**
 * Update storage nodes visualization
 */
function updateStorageVisualization() {
    const storageNodesContainer = document.getElementById('storageNodes');
    const warehouseSummaryContainer = document.getElementById('warehouseSummary');
    
    if (!storageNodesContainer) return;

    const nodes = inventorySystem.consistentHash.nodes;
    const products = inventorySystem.getAllProducts();
    
    // Count products per node and calculate statistics
    const nodeCounts = {};
    const nodeQuantities = {};
    const nodeProducts = {};
    
    nodes.forEach(node => {
        nodeCounts[node] = 0;
        nodeQuantities[node] = 0;
        nodeProducts[node] = [];
    });
    
    products.forEach(product => {
        const node = inventorySystem.getNodeForProduct(product.code);
        nodeCounts[node]++;
        nodeQuantities[node] += product.quantity;
        nodeProducts[node].push(product);
    });

    // Calculate percentages
    const totalProducts = products.length;
    const percentages = {};
    nodes.forEach(node => {
        percentages[node] = totalProducts > 0 ? Math.round((nodeCounts[node] / totalProducts) * 100) : 0;
    });

    // Update warehouse summary
    if (warehouseSummaryContainer) {
        warehouseSummaryContainer.innerHTML = nodes.map(node => `
            <div class="summary-item">
                <h5>${node}</h5>
                <div class="count">${nodeCounts[node]}</div>
                <div class="percentage">${percentages[node]}%</div>
            </div>
        `).join('');
    }

    // Update storage nodes with enhanced information
    storageNodesContainer.innerHTML = nodes.map(node => {
        const capacity = Math.min(100, Math.round((nodeCounts[node] / 10) * 100)); // Simulate capacity
        return `
            <div class="storage-node ${nodeCounts[node] > 0 ? 'active' : ''}">
                <h4>${node}</h4>
                <div class="product-count">${nodeCounts[node]} products</div>
                <div class="product-count">Total Qty: ${nodeQuantities[node]}</div>
                <div class="capacity-bar">
                    <div class="capacity-fill" style="width: ${capacity}%"></div>
                </div>
                <div class="capacity-text">${capacity}% capacity</div>
            </div>
        `;
    }).join('');
}

/**
 * Update hash table visualization
 */
function updateHashTableDisplay() {
    const hashTableContainer = document.getElementById('hashTable');
    if (!hashTableContainer) return;

    const tableData = inventorySystem.getHashTableData();
    
    hashTableContainer.innerHTML = tableData.map(cell => {
        if (cell.isEmpty) {
            return `<div class="hash-cell">${cell.index}</div>`;
        } else {
            const product = cell.product;
            const isCollision = cell.index !== inventorySystem.hashTable.hash(product.code);
            return `
                <div class="hash-cell filled ${isCollision ? 'collision' : ''}">
                    <div class="product-code">${product.code}</div>
                    <div class="product-info">${product.name}</div>
                    <div class="product-info">Qty: ${product.quantity}</div>
                </div>
            `;
        }
    }).join('');
}

/**
 * Update statistics display
 */
function updateStats() {
    inventorySystem.updateStats();
    
    const totalProductsEl = document.getElementById('totalProducts');
    const storageUtilizationEl = document.getElementById('storageUtilization');
    const collisionCountEl = document.getElementById('collisionCount');
    
    if (totalProductsEl) totalProductsEl.textContent = inventorySystem.stats.totalProducts;
    if (storageUtilizationEl) storageUtilizationEl.textContent = inventorySystem.stats.storageUtilization + '%';
    if (collisionCountEl) collisionCountEl.textContent = inventorySystem.stats.collisionCount;
    
    // Update analytics
    updateAnalytics();
}

/**
 * Update analytics dashboard
 */
function updateAnalytics() {
    updateProductTimeline();
    updateMonthlyStats();
    updateStockChart();
    updateWarehouseAnalytics();
    updateGlobalLocations();
}

/**
 * Update global locations visualization
 */
function updateGlobalLocations() {
    updateWorldMap();
    updateLocationStats();
}

/**
 * Update world map visualization
 */
function updateWorldMap() {
    const worldMapContainer = document.getElementById('worldMap');
    if (!worldMapContainer) return;

    const products = inventorySystem.getAllProducts();
    
    // Count products per location
    const locationCounts = {};
    Object.keys(GLOBAL_LOCATIONS).forEach(location => {
        locationCounts[location] = 0;
    });
    
    products.forEach(product => {
        if (locationCounts.hasOwnProperty(product.location)) {
            locationCounts[product.location]++;
        }
    });

    // Clear existing markers
    worldMapContainer.innerHTML = '';

    // Add location markers
    Object.entries(GLOBAL_LOCATIONS).forEach(([location, coords]) => {
        const count = locationCounts[location];
        if (count > 0) {
            const marker = document.createElement('div');
            marker.className = `location-marker ${count > 2 ? 'active' : ''}`;
            marker.style.left = `${coords.x}%`;
            marker.style.top = `${coords.y}%`;
            marker.setAttribute('data-count', count);
            marker.title = `${location}: ${count} products`;
            worldMapContainer.appendChild(marker);
        }
    });
}

/**
 * Update location statistics
 */
function updateLocationStats() {
    const locationStatsContainer = document.getElementById('locationStats');
    if (!locationStatsContainer) return;

    const products = inventorySystem.getAllProducts();
    
    // Count products per location
    const locationCounts = {};
    Object.keys(GLOBAL_LOCATIONS).forEach(location => {
        locationCounts[location] = 0;
    });
    
    products.forEach(product => {
        if (locationCounts.hasOwnProperty(product.location)) {
            locationCounts[product.location]++;
        }
    });

    const totalProducts = products.length;
    
    locationStatsContainer.innerHTML = Object.entries(locationCounts)
        .filter(([location, count]) => count > 0)
        .map(([location, count]) => {
            const percentage = totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0;
            const coords = GLOBAL_LOCATIONS[location];
            return `
                <div class="location-item">
                    <h4>${location}</h4>
                    <div class="location-count">${count}</div>
                    <div class="location-percentage">${percentage}% of total</div>
                    <div class="location-region">${coords.region}</div>
                </div>
            `;
        }).join('');
}

/**
 * Update warehouse analytics
 */
function updateWarehouseAnalytics() {
    updateWarehouseChart();
    updateWarehouseDetails();
}

/**
 * Update warehouse distribution chart
 */
function updateWarehouseChart() {
    const chartContainer = document.querySelector('.warehouse-chart-container');
    if (!chartContainer) return;

    const nodes = inventorySystem.consistentHash.nodes;
    const products = inventorySystem.getAllProducts();
    
    // Count products per warehouse
    const warehouseData = {};
    nodes.forEach(node => {
        warehouseData[node] = 0;
    });
    
    products.forEach(product => {
        const node = inventorySystem.getNodeForProduct(product.code);
        warehouseData[node]++;
    });

    const maxProducts = Math.max(...Object.values(warehouseData));
    
    chartContainer.innerHTML = `
        <div class="warehouse-bar-chart">
            ${nodes.map(node => {
                const height = maxProducts > 0 ? (warehouseData[node] / maxProducts) * 150 : 10;
                const percentage = products.length > 0 ? Math.round((warehouseData[node] / products.length) * 100) : 0;
                return `
                    <div class="warehouse-bar-group">
                        <div class="warehouse-bar" style="height: ${height}px;" title="${warehouseData[node]} products (${percentage}%)"></div>
                        <div class="warehouse-bar-label">${node.replace('Warehouse-', 'W')}</div>
                        <div class="warehouse-bar-value">${warehouseData[node]}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

/**
 * Update warehouse details
 */
function updateWarehouseDetails() {
    const detailsContainer = document.getElementById('warehouseDetails');
    if (!detailsContainer) return;

    const nodes = inventorySystem.consistentHash.nodes;
    const products = inventorySystem.getAllProducts();
    
    // Calculate detailed statistics
    const warehouseStats = {};
    nodes.forEach(node => {
        warehouseStats[node] = {
            productCount: 0,
            totalQuantity: 0,
            products: []
        };
    });
    
    products.forEach(product => {
        const node = inventorySystem.getNodeForProduct(product.code);
        warehouseStats[node].productCount++;
        warehouseStats[node].totalQuantity += product.quantity;
        warehouseStats[node].products.push(product);
    });

    detailsContainer.innerHTML = nodes.map(node => {
        const stats = warehouseStats[node];
        const avgQuantity = stats.productCount > 0 ? Math.round(stats.totalQuantity / stats.productCount) : 0;
        
        return `
            <div class="warehouse-item">
                <h5>${node}</h5>
                <div class="warehouse-stats">
                    <span>Products: ${stats.productCount}</span>
                    <span>Total: ${stats.totalQuantity}</span>
                    <span>Avg: ${avgQuantity}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Update product timeline
 */
function updateProductTimeline() {
    const timelineContainer = document.getElementById('productTimeline');
    if (!timelineContainer) return;

    const timelineItems = [];
    
    // Add current products
    inventorySystem.getAllProducts().forEach(product => {
        timelineItems.push({
            type: 'added',
            product: product,
            timestamp: product.createdAt,
            action: 'Product Added'
        });
    });

    // Sort by timestamp (newest first)
    timelineItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    timelineContainer.innerHTML = timelineItems.slice(0, 10).map(item => `
        <div class="timeline-item ${item.type}">
            <h4>${item.action}: ${item.product.code}</h4>
            <p>${item.product.name} (Qty: ${item.product.quantity})</p>
            <div class="timestamp">${formatTimestamp(item.timestamp)}</div>
        </div>
    `).join('');
}

/**
 * Update monthly statistics
 */
function updateMonthlyStats() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let monthlyAdded = 0;
    let monthlyDeleted = 0;
    let totalQuantity = 0;

    inventorySystem.getAllProducts().forEach(product => {
        const createdDate = new Date(product.createdAt);
        if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
            monthlyAdded++;
        }
        totalQuantity += product.quantity;
    });

    const avgStock = inventorySystem.getAllProducts().length > 0 
        ? Math.round(totalQuantity / inventorySystem.getAllProducts().length) 
        : 0;

    const monthlyAddedEl = document.getElementById('monthlyAdded');
    const monthlyDeletedEl = document.getElementById('monthlyDeleted');
    const avgStockEl = document.getElementById('avgStock');

    if (monthlyAddedEl) monthlyAddedEl.textContent = monthlyAdded;
    if (monthlyDeletedEl) monthlyDeletedEl.textContent = monthlyDeleted;
    if (avgStockEl) avgStockEl.textContent = avgStock;
}

/**
 * Update stock chart (simplified bar chart using CSS)
 */
function updateStockChart() {
    const chartContainer = document.querySelector('.chart-container');
    if (!chartContainer) return;

    // Generate sample yearly data
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];
    const stockData = years.map(year => {
        // Simulate stock levels based on current products
        const baseStock = inventorySystem.getAllProducts().length * 10;
        return Math.floor(baseStock * (0.8 + Math.random() * 0.4));
    });

    chartContainer.innerHTML = `
        <div class="bar-chart">
            ${years.map((year, index) => `
                <div class="bar-group">
                    <div class="bar" style="height: ${(stockData[index] / Math.max(...stockData)) * 150}px;"></div>
                    <div class="bar-label">${year}</div>
                    <div class="bar-value">${stockData[index]}</div>
                </div>
            `).join('')}
        </div>
    `;
}

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted timestamp
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Add product from form
 */
function addProduct() {
    const codeInput = document.getElementById('productCode');
    const nameInput = document.getElementById('productName');
    const quantityInput = document.getElementById('productQuantity');
    const locationInput = document.getElementById('productLocation');
    
    const code = codeInput.value.trim();
    const name = nameInput.value.trim();
    const quantity = parseInt(quantityInput.value);
    const location = locationInput.value;
    
    // Validate inputs
    if (!code || !name || isNaN(quantity) || quantity < 0) {
        showNotification('Please fill in all fields with valid values', 'error');
        return;
    }
    
    // Check if product already exists
    if (inventorySystem.searchProduct(code)) {
        showNotification('Product with this code already exists', 'error');
        return;
    }
    
    // Add product
    const success = inventorySystem.addProduct(code, name, quantity, location);
    
    if (success) {
        // Clear form
        codeInput.value = '';
        nameInput.value = '';
        quantityInput.value = '';
        
        // Update visualizations
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
        
        showNotification(`Product ${code} added successfully!`, 'success');
    } else {
        showNotification('Failed to add product', 'error');
    }
}

/**
 * Search product from form
 */
function searchProduct() {
    const searchInput = document.getElementById('searchCode');
    const code = searchInput.value.trim();
    
    if (!code) {
        showNotification('Please enter a product code', 'error');
        return;
    }
    
    const product = inventorySystem.searchProduct(code);
    
    if (product) {
        const node = inventorySystem.getNodeForProduct(code);
        showNotification(`Product found: ${product.name} (Qty: ${product.quantity}) in ${node}`, 'success');
        
        // Highlight the product in visualizations
        highlightProduct(code);
    } else {
        showNotification('Product not found', 'error');
    }
}

/**
 * Update product quantity from form
 */
function updateQuantity() {
    const codeInput = document.getElementById('updateCode');
    const quantityInput = document.getElementById('updateQuantity');
    
    const code = codeInput.value.trim();
    const quantity = parseInt(quantityInput.value);
    
    if (!code || isNaN(quantity) || quantity < 0) {
        showNotification('Please enter valid product code and quantity', 'error');
        return;
    }
    
    const success = inventorySystem.updateQuantity(code, quantity);
    
    if (success) {
        // Clear form
        codeInput.value = '';
        quantityInput.value = '';
        
        // Update visualizations
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
        
        showNotification(`Quantity updated for product ${code}`, 'success');
    } else {
        showNotification('Product not found', 'error');
    }
}

/**
 * Delete product from form
 */
function deleteProduct() {
    const deleteInput = document.getElementById('deleteCode');
    const code = deleteInput.value.trim();
    
    if (!code) {
        showNotification('Please enter a product code to delete', 'error');
        return;
    }
    
    // Confirm deletion
    const product = inventorySystem.searchProduct(code);
    if (!product) {
        showNotification('Product not found', 'error');
        return;
    }
    
    const confirmed = confirm(`Are you sure you want to delete product ${code} (${product.name})?`);
    if (!confirmed) {
        return;
    }
    
    const success = inventorySystem.deleteProduct(code);
    
    if (success) {
        // Clear form
        deleteInput.value = '';
        
        // Update visualizations
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
        
        showNotification(`Product ${code} deleted successfully!`, 'success');
    } else {
        showNotification('Failed to delete product', 'error');
    }
}

/**
 * Highlight a product in visualizations
 * @param {string} code - Product code to highlight
 */
function highlightProduct(code) {
    // Remove existing highlights
    document.querySelectorAll('.hash-cell').forEach(cell => {
        cell.classList.remove('highlighted');
    });
    
    // Find and highlight the product
    const tableData = inventorySystem.getHashTableData();
    const productIndex = tableData.findIndex(cell => 
        cell.product && cell.product.code === code.toUpperCase()
    );
    
    if (productIndex !== -1) {
        const hashTableContainer = document.getElementById('hashTable');
        const cells = hashTableContainer.children;
        if (cells[productIndex]) {
            cells[productIndex].classList.add('highlighted');
            
            // Scroll to the highlighted cell
            cells[productIndex].scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }
    }
}

/**
 * Show notification to user
 * @param {string} message - Notification message
 * @param {string} type - Notification type (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

/**
 * Show Learn More modal
 */
function showLearnMoreModal() {
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
}

/**
 * Close Learn More modal
 */
function closeLearnMoreModal() {
    const modal = document.getElementById('learnMoreModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('learnMoreModal');
    if (event.target === modal) {
        closeLearnMoreModal();
    }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeLearnMoreModal();
        closeFeatureModal();
    }
});

/**
 * Show feature demo - navigates to demo section and highlights specific feature
 * @param {string} feature - The feature to demonstrate
 */
function showFeatureDemo(feature) {
    // Navigate to demo section
    showSection('demo');
    
    // Scroll to specific feature area after a short delay
    setTimeout(() => {
        switch(feature) {
            case 'add':
                document.getElementById('productCode')?.focus();
                showNotification('Try adding a product! Enter a code, name, quantity, and location.', 'info');
                break;
            case 'search':
                document.getElementById('searchCode')?.focus();
                showNotification('Try searching for a product! Enter a product code to find it.', 'info');
                break;
            case 'update':
                document.getElementById('updateCode')?.focus();
                showNotification('Try updating a product quantity! Enter a product code and new quantity.', 'info');
                break;
            case 'delete':
                document.getElementById('deleteCode')?.focus();
                showNotification('Try deleting a product! Enter a product code to remove it.', 'info');
                break;
            case 'analytics':
                showSection('analytics');
                showNotification('View comprehensive analytics including charts and statistics!', 'info');
                break;
            case 'global':
                // Scroll to global locations section
                const globalSection = document.querySelector('.global-locations');
                if (globalSection) {
                    globalSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                showNotification('Explore the interactive world map showing global product distribution!', 'info');
                break;
        }
    }, 500);
}

/**
 * Show feature information modal
 * @param {string} feature - The feature to explain
 */
function showFeatureInfo(feature) {
    let title, content;
    
    switch(feature) {
        case 'storage':
            title = 'Distributed Storage';
            content = `
                <h3>🏢 Consistent Hashing</h3>
                <p>Our system uses <strong>consistent hashing</strong> to distribute products across multiple warehouse nodes. This ensures:</p>
                <ul>
                    <li><strong>Even Distribution:</strong> Products are spread evenly across all warehouses</li>
                    <li><strong>Scalability:</strong> Easy to add or remove warehouse nodes</li>
                    <li><strong>Fault Tolerance:</strong> System continues working even if some nodes fail</li>
                    <li><strong>Minimal Rehashing:</strong> When nodes change, minimal data movement occurs</li>
                </ul>
                <p>The algorithm creates a hash ring where both products and warehouses are mapped, ensuring optimal distribution.</p>
            `;
            break;
        case 'collision':
            title = 'Collision Handling';
            content = `
                <h3>⚡ Quadratic Probing</h3>
                <p>When multiple products hash to the same table position, we use <strong>quadratic probing</strong> to resolve collisions:</p>
                <ul>
                    <li><strong>Formula:</strong> h(k, i) = (h(k) + i²) mod m</li>
                    <li><strong>Reduces Clustering:</strong> Better than linear probing for avoiding clusters</li>
                    <li><strong>Efficient Search:</strong> O(1) average time complexity</li>
                    <li><strong>Collision Tracking:</strong> System monitors and displays collision counts</li>
                </ul>
                <p>This ensures fast product lookups even when hash collisions occur.</p>
            `;
            break;
    }
    
    showFeatureModal(title, content);
}

/**
 * Show feature information modal
 * @param {string} title - Modal title
 * @param {string} content - Modal content
 */
function showFeatureModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('featureModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'featureModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="featureModalTitle"></h2>
                    <span class="close" onclick="closeFeatureModal()">&times;</span>
                </div>
                <div class="modal-body" id="featureModalBody"></div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="showSection('demo'); closeFeatureModal();">Try Demo</button>
                    <button class="btn btn-secondary" onclick="closeFeatureModal();">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Update modal content
    document.getElementById('featureModalTitle').textContent = title;
    document.getElementById('featureModalBody').innerHTML = content;
    
    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

/**
 * Close feature modal
 */
function closeFeatureModal() {
    const modal = document.getElementById('featureModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ===== NAVIGATION FUNCTIONS =====

/**
 * Handle navigation between sections
 * @param {string} sectionId - ID of section to show
 */
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update visualizations when showing demo section
    if (sectionId === 'demo' && inventorySystem) {
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
        updateGlobalLocations();
    }
    
    // Update analytics when showing analytics section
    if (sectionId === 'analytics' && inventorySystem) {
        updateAnalytics();
    }
}

/**
 * Handle mobile menu toggle
 */
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    const hamburger = document.querySelector('.hamburger');
    
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// ===== EVENT LISTENERS =====

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('href').substring(1);
            showSection(sectionId);
            
            // Close mobile menu if open
            const navMenu = document.querySelector('.nav-menu');
            const hamburger = document.querySelector('.hamburger');
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Demo form buttons
    const addProductBtn = document.getElementById('addProductBtn');
    const searchBtn = document.getElementById('searchBtn');
    const updateBtn = document.getElementById('updateBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    
    if (addProductBtn) {
        addProductBtn.addEventListener('click', addProduct);
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', searchProduct);
    }
    
    if (updateBtn) {
        updateBtn.addEventListener('click', updateQuantity);
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteProduct);
    }
    
    // Form enter key handling
    const formInputs = document.querySelectorAll('input[type="text"], input[type="number"]');
    formInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const form = input.closest('.control-group');
                if (form) {
                    const button = form.querySelector('button');
                    if (button) {
                        button.click();
                    }
                }
            }
        });
    });
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const message = document.getElementById('contactMessage').value;
            
            if (name && email && message) {
                showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showNotification('Please fill in all fields', 'error');
            }
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== INITIALIZATION =====

/**
 * Initialize the application when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize system
    initializeSystem();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Show home section by default
    showSection('home');
    
    // Add some sample data for demonstration
    setTimeout(() => {
        inventorySystem.addProduct('P001', 'Laptop', 25, 'Warehouse-A');
        inventorySystem.addProduct('P002', 'Mouse', 100, 'Warehouse-B');
        inventorySystem.addProduct('P003', 'Keyboard', 75, 'Warehouse-C');
        inventorySystem.addProduct('P004', 'Monitor', 30, 'Warehouse-A');
        
        // Update visualizations
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
    }, 1000);
    
    console.log('Inventory Management System initialized successfully!');
});

// ===== UTILITY FUNCTIONS =====

/**
 * Generate random product data for testing
 */
function generateRandomProduct() {
    const codes = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008'];
    const names = ['Laptop', 'Mouse', 'Keyboard', 'Monitor', 'Headphones', 'Webcam', 'Speaker', 'Tablet'];
    const locations = ['Warehouse-A', 'Warehouse-B', 'Warehouse-C'];
    
    const code = codes[Math.floor(Math.random() * codes.length)];
    const name = names[Math.floor(Math.random() * names.length)];
    const quantity = Math.floor(Math.random() * 100) + 1;
    const location = locations[Math.floor(Math.random() * locations.length)];
    
    return { code, name, quantity, location };
}

/**
 * Clear all products (for testing)
 */
function clearAllProducts() {
    if (inventorySystem) {
        inventorySystem.products.clear();
        inventorySystem.hashTable = new HashTable(16);
        updateStorageVisualization();
        updateHashTableDisplay();
        updateStats();
        showNotification('All products cleared', 'info');
    }
}

// Export functions for potential external use
window.InventorySystem = InventorySystem;
window.ConsistentHash = ConsistentHash;
window.HashTable = HashTable;
