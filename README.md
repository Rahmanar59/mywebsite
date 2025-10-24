# Inventory Management System

A modern, responsive web application that demonstrates advanced data structures and algorithms for distributed inventory management. This project showcases the practical implementation of **Consistent Hashing** for distributed storage and **Quadratic Probing** for efficient hash table collision resolution.

## 🚀 Live Demo

Open `index.html` in your web browser to experience the interactive demo.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Core Algorithms](#core-algorithms)
- [Features](#features)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Installation & Usage](#installation--usage)
- [Algorithm Explanations](#algorithm-explanations)
- [JavaScript Simulation Details](#javascript-simulation-details)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

This Inventory Management System is designed to demonstrate the practical application of computer science algorithms in real-world scenarios. The system simulates a distributed warehouse environment where products are stored across multiple nodes using consistent hashing, while individual product lookups are handled through a hash table with quadratic probing collision resolution.

### Key Objectives

- **Educational**: Demonstrate complex algorithms through interactive visualization
- **Practical**: Show real-world applications of distributed systems concepts
- **Interactive**: Provide hands-on experience with data structures and algorithms
- **Modern**: Implement using contemporary web technologies

## 🛠 Technologies Used

### Frontend Technologies
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Advanced styling with Flexbox, Grid, animations, and responsive design
- **JavaScript ES6+**: Modern JavaScript with classes, modules, and async operations

### Design & UI
- **Responsive Design**: Mobile-first approach with breakpoints for all devices
- **Modern UI**: Clean, professional design with blue/grey/white color scheme
- **Animations**: Smooth transitions and hover effects for enhanced UX
- **Typography**: JetBrains Mono for code elements, Inter for UI text

### Algorithms & Data Structures
- **Consistent Hashing**: Distributed storage across multiple nodes
- **Quadratic Probing**: Collision resolution in hash tables
- **Hash Tables**: Efficient key-value storage and retrieval

## 🧮 Core Algorithms

### 1. Consistent Hashing

Consistent hashing is a distributed hashing scheme that operates independently of the number of servers or objects in a distributed hash table. It provides:

- **Even Distribution**: Products are distributed evenly across warehouse nodes
- **Minimal Rehashing**: When nodes are added/removed, minimal data movement occurs
- **Fault Tolerance**: System remains operational even if some nodes fail

#### Implementation Details

```javascript
class ConsistentHash {
    hashFunction(key) {
        let hash = 5381; // djb2 algorithm
        for (let i = 0; i < key.length; i++) {
            hash = ((hash << 5) + hash) + key.charCodeAt(i);
        }
        return Math.abs(hash) % 360; // Return angle in degrees
    }
    
    getNode(key) {
        const keyHash = this.hashFunction(key);
        // Find closest node clockwise on the hash ring
        // ... implementation details
    }
}
```

### 2. Quadratic Probing

Quadratic probing is a collision resolution method in hash tables that uses quadratic increments to find the next available slot:

- **Formula**: `h(k, i) = (h(k) + i²) mod m`
- **Advantages**: Reduces primary clustering compared to linear probing
- **Performance**: Better average-case performance than linear probing

#### Implementation Details

```javascript
quadraticProbe(key, startIndex) {
    let index = startIndex;
    let i = 1;
    
    while (this.table[index] !== null && this.table[index].code !== key) {
        index = (startIndex + i * i) % this.size;
        i++;
        this.collisionCount++;
    }
    
    return index;
}
```

## ✨ Features

### Core Functionality
- **Add Products**: Insert new products with unique codes, names, quantities, and locations
- **Search Products**: O(1) average time complexity product lookup
- **Update Quantities**: Real-time quantity modifications
- **Distributed Storage**: Products automatically distributed across warehouse nodes
- **Collision Handling**: Advanced quadratic probing for efficient collision resolution

### Interactive Features
- **Real-time Visualization**: Live updates of storage nodes and hash table
- **Statistics Dashboard**: Monitor storage utilization, collision rates, and system performance
- **Product Highlighting**: Visual feedback when searching for products
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

### User Experience
- **Modern UI**: Clean, professional interface with smooth animations
- **Form Validation**: Client-side validation with helpful error messages
- **Notification System**: Real-time feedback for user actions
- **Mobile Navigation**: Hamburger menu for mobile devices

## 📁 Project Structure

```
inventory-management-system/
├── index.html          # Main HTML file with all sections
├── style.css          # Complete CSS styling and responsive design
├── script.js          # JavaScript implementation and simulation
└── README.md          # Project documentation
```

### File Descriptions

- **`index.html`**: Contains all website sections (Home, Algorithms, Demo, Features, About, Contact) with semantic HTML5 structure
- **`style.css`**: Comprehensive CSS with modern design, animations, and responsive breakpoints
- **`script.js`**: Complete JavaScript implementation including algorithm classes and UI interactions

## 🔧 How It Works

### System Architecture

1. **Initialization**: System creates a consistent hash ring with 3 warehouse nodes
2. **Product Addition**: When a product is added:
   - Consistent hashing determines the appropriate warehouse node
   - Quadratic probing finds an available slot in the hash table
   - Visualizations update in real-time
3. **Product Search**: Hash table lookup with quadratic probing for collision resolution
4. **Quantity Updates**: Direct hash table modification with visualization updates

### Data Flow

```
User Input → Validation → Consistent Hashing → Hash Table Insertion → Visualization Update
```

### Visualization Components

- **Storage Nodes**: Shows distribution of products across warehouse nodes
- **Hash Table Grid**: Displays hash table with collision highlighting
- **Statistics**: Real-time metrics including utilization and collision counts

## 🚀 Installation & Usage

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely client-side

### Quick Start

1. **Clone or Download**: Get the project files
2. **Open**: Double-click `index.html` or open in your web browser
3. **Explore**: Navigate through different sections using the navigation bar
4. **Demo**: Try the interactive demo to add, search, and update products

### Local Development

```bash
# If using a local server (optional)
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000` in your browser.

## 📚 Algorithm Explanations

### Consistent Hashing Deep Dive

Consistent hashing solves the problem of distributing data across multiple servers in a way that minimizes data movement when servers are added or removed.

**Key Concepts:**
- **Hash Ring**: A circular space where both servers and data keys are mapped
- **Virtual Nodes**: Multiple hash points per server for better distribution
- **Clockwise Search**: Finding the next server by moving clockwise on the ring

**Benefits:**
- Scalability: Easy to add/remove servers
- Load Balancing: Even distribution of data
- Fault Tolerance: System continues working with server failures

### Quadratic Probing Deep Dive

Quadratic probing is a collision resolution technique that uses quadratic increments to find the next available slot in a hash table.

**Mathematical Foundation:**
- **Primary Hash**: `h(k) = k mod m`
- **Probing Sequence**: `h(k, i) = (h(k) + i²) mod m` where i = 0, 1, 2, ...
- **Collision Detection**: When `h(k, i)` slot is occupied, try `h(k, i+1)`

**Advantages over Linear Probing:**
- Reduces primary clustering
- Better average-case performance
- More even distribution of collisions

## 💻 JavaScript Simulation Details

### Class Architecture

```javascript
// Main system class
class InventorySystem {
    constructor() {
        this.consistentHash = new ConsistentHash();
        this.hashTable = new HashTable(16);
        this.products = new Map();
    }
}

// Consistent hashing implementation
class ConsistentHash {
    // Hash ring management
    // Node distribution logic
}

// Hash table with quadratic probing
class HashTable {
    // Collision resolution
    // Insert/search/update operations
}
```

### Key Functions

- **`addProduct()`**: Validates input, applies consistent hashing, inserts into hash table
- **`searchProduct()`**: Uses quadratic probing to find products
- **`updateQuantity()`**: Modifies existing product quantities
- **`updateVisualization()`**: Refreshes UI components with current data

### Performance Characteristics

- **Time Complexity**: O(1) average for insert/search operations
- **Space Complexity**: O(n) where n is the number of products
- **Collision Handling**: Quadratic probing with collision counting

## 🎨 Design Philosophy

### Visual Design
- **Color Scheme**: Professional blue (#2563eb), grey (#64748b), and white palette
- **Typography**: JetBrains Mono for code, Inter for UI text
- **Layout**: Clean, minimal design with focus on functionality
- **Animations**: Subtle transitions and hover effects

### User Experience
- **Intuitive Navigation**: Clear section organization
- **Immediate Feedback**: Real-time notifications and visual updates
- **Responsive Design**: Optimized for all device sizes
- **Accessibility**: Semantic HTML and keyboard navigation support

## 🔍 Technical Implementation Notes

### Hash Function Selection
- **djb2 Algorithm**: Used for consistent hashing due to good distribution properties
- **Simple Hash**: Used for hash table indexing with bit manipulation for efficiency

### Collision Resolution
- **Quadratic Probing**: Implements `(hash + i²) mod size` sequence
- **Collision Counting**: Tracks total collisions for performance monitoring
- **Infinite Loop Prevention**: Safety checks to prevent endless probing

### Data Validation
- **Input Sanitization**: Trim whitespace, validate numeric inputs
- **Duplicate Prevention**: Check for existing product codes before insertion
- **Error Handling**: Graceful error handling with user-friendly messages

## 🚀 Future Enhancements

### Potential Improvements
- **Backend Integration**: Connect to a real database
- **User Authentication**: Add login/registration system
- **Advanced Analytics**: More detailed performance metrics
- **Export Functionality**: CSV/JSON export of inventory data
- **Bulk Operations**: Import/export multiple products
- **Advanced Algorithms**: Implement other collision resolution methods

### Technical Enhancements
- **Web Workers**: Offload heavy computations
- **Service Workers**: Add offline functionality
- **Progressive Web App**: Make it installable
- **Real-time Updates**: WebSocket integration for live updates

## 📊 Performance Metrics

The system tracks several key performance indicators:

- **Storage Utilization**: Percentage of hash table slots used
- **Collision Rate**: Number of collisions per operation
- **Distribution Balance**: Evenness of product distribution across nodes
- **Response Time**: Time taken for operations (client-side)

## 🤝 Contributing

This is an educational project, but contributions are welcome:

1. **Fork** the repository
2. **Create** a feature branch
3. **Commit** your changes
4. **Push** to the branch
5. **Open** a Pull Request

### Areas for Contribution
- Algorithm optimizations
- UI/UX improvements
- Additional features
- Documentation enhancements
- Bug fixes

## 📄 License

This project is created for educational purposes. Feel free to use, modify, and distribute for learning and teaching purposes.

## 👨‍💻 Developer Information

**Student Developer**
- **Course**: Data Structures & Algorithms
- **Institution**: University of Technology
- **Email**: student@university.edu
- **Specialization**: Distributed Systems & Hash Tables

## 📞 Support

For questions or support regarding this project:

- **Email**: student@university.edu
- **Repository**: github.com/student/inventory-system
- **LinkedIn**: linkedin.com/in/student-dev

---

*This project demonstrates the practical application of computer science algorithms in modern web development. The combination of consistent hashing and quadratic probing provides an efficient, scalable solution for distributed inventory management systems.*

