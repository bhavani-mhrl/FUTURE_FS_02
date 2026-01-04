  // --- 1. MOCK DATA & API SERVICE ---
        // In a real scenario, this would be a database.
        const flowersData = [
            { id: 1, name: "Red Rose Bouquet", category: "Rose", price: 45.00, image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=600&q=80", description: "Classic deep red roses symbolizing love and passion. Perfect for anniversaries." },
            { id: 2, name: "White Lily Arrangement", category: "Lily", price: 55.00, image: "https://images.unsplash.com/photo-1567359781514-3b926c86fb9f?w=600&q=80", description: "Elegant white lilies with a subtle fragrance, representing purity and refined beauty." },
            { id: 3, name: "Pink Tulip Bunch", category: "Tulip", price: 30.00, image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&q=80", description: "Fresh spring pink tulips that bring cheer to any room." },
            { id: 4, name: "Purple Orchid", category: "Orchid", price: 65.00, image: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=600&q=80", description: "Exquisite purple orchid in a ceramic pot. Long-lasting and sophisticated." },
            { id: 5, name: "Sunflower Joy", category: "Sunflower", price: 25.00, image: "https://images.unsplash.com/photo-1580706383485-3bbfd8f7bb09?w=600&q=80", description: "Bright and sunny sunflowers to brighten up someone's day instantly." },
            { id: 6, name: "Yellow Roses", category: "Rose", price: 40.00, image: "https://images.unsplash.com/photo-1599733589046-1c7121a56166?w=600&q=80", description: "Friendship and joy embodied in these stunning yellow roses." },
            { id: 7, name: "Mixed Spring Bouquet", category: "Tulip", price: 35.00, image: "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?w=600&q=80", description: "A colorful mix of seasonal tulips, daffodils, and hyacinths." },
            { id: 8, name: "White Phalaenopsis", category: "Orchid", price: 70.00, image: "https://images.unsplash.com/photo-1595704289529-ce8b101ada41?w=600&q=80", description: "The classic white moth orchid, a symbol of rare beauty." },
        ];

        // Simulating an Async API Call
        const api = {
            getFlowers: () => {
                return new Promise((resolve) => {
                    // Simulate network latency
                    setTimeout(() => {
                        resolve(flowersData);
                    }, 800);
                });
            }
        };

        // --- 2. STATE MANAGEMENT ---
        let cart = [];
        let currentCategory = 'all';

        // --- 3. DOM ELEMENTS ---
        const productGrid = document.getElementById('product-grid');
        const loader = document.getElementById('loader');
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        const cartCountEl = document.getElementById('cart-count');
        const toastEl = document.getElementById('liveToast');
        const toast = new bootstrap.Toast(toastEl);

        // --- 4. RENDER LOGIC ---

        // Initial Load
        async function init() {
            productGrid.innerHTML = ''; // Clear
            loader.style.display = 'flex'; // Show loader
            
            try {
                const data = await api.getFlowers();
                renderProducts(data);
            } catch (error) {
                console.error("Failed to fetch flowers", error);
                productGrid.innerHTML = `<div class="col-12 text-center text-danger">Error loading flowers. Please try again.</div>`;
            } finally {
                loader.style.display = 'none'; // Hide loader
            }
        }

        function renderProducts(products) {
            productGrid.innerHTML = '';
            
            const filtered = currentCategory === 'all' 
                ? products 
                : products.filter(p => p.category === currentCategory);

            if(filtered.length === 0) {
                productGrid.innerHTML = '<div class="col-12 text-center">No flowers found in this category.</div>';
                return;
            }

            filtered.forEach(flower => {
                const col = document.createElement('div');
                col.className = 'col-sm-6 col-lg-3';
                col.innerHTML = `
                    <div class="card product-card h-100">
                        <div class="card-img-wrapper">
                            <img src="${flower.image}" class="card-img-top" alt="${flower.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%25%27 height=%27100%25%27%3E%3Crect fill=%27%23e0e0e0%27 width=%27100%25%27 height=%27100%25%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2724%27 fill=%27%23999%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EImage Not Available%3C/text%3E%3C/svg%3E'">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <div class="mb-2">
                                <small class="text-muted text-uppercase fw-bold">${flower.category}</small>
                                <h5 class="card-title mb-0">${flower.name}</h5>
                            </div>
                            <p class="card-text text-muted small flex-grow-1">${flower.description.substring(0, 60)}...</p>
                            <div class="d-flex justify-content-between align-items-center mt-3">
                                <span class="price-tag">$${flower.price.toFixed(2)}</span>
                                <div>
                                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="openProductDetail(${flower.id})"><i class="fas fa-eye"></i></button>
                                    <button class="btn btn-sm btn-pink" onclick="addToCart(${flower.id})"><i class="fas fa-cart-plus"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                productGrid.appendChild(col);
            });
        }

        // Filter Function
        function filterFlowers(category) {
            currentCategory = category;
            
            // Update buttons visual state
            const buttons = document.querySelectorAll('#filter-container .btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if(btn.innerText.includes(category) || (category === 'all' && btn.innerText === 'All')) {
                    btn.classList.add('active');
                }
            });

            // Re-render (using cached data would be faster, but we recall API simulation here for structure)
            init();
        }

        // --- 5. CART LOGIC ---

        function addToCart(id) {
            const product = flowersData.find(p => p.id === id);
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ ...product, qty: 1 });
            }

            updateCartUI();
            toast.show();
        }

        function removeFromCart(id) {
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
        }

        function updateQuantity(id, change) {
            const item = cart.find(i => i.id === id);
            if (item) {
                item.qty += change;
                if (item.qty <= 0) {
                    removeFromCart(id);
                } else {
                    updateCartUI();
                }
            }
        }

        function updateCartUI() {
            // Update Count
            const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
            cartCountEl.innerText = totalCount;

            // Calculate Total
            const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
            cartTotalEl.innerText = '$' + total.toFixed(2);

            // Render Items
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="text-center mt-5 text-muted empty-msg">
                        <i class="fas fa-shopping-basket fa-3x mb-3 opacity-50"></i>
                        <p>Your basket is empty.</p>
                    </div>`;
                return;
            }

            cartItemsContainer.innerHTML = '';
            cart.forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = 'card mb-3 border-0 shadow-sm';
                itemEl.innerHTML = `
                    <div class="row g-0 align-items-center">
                        <div class="col-3 p-2">
                            <img src="${item.image}" class="img-fluid rounded" alt="${item.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%25%27 height=%27100%25%27%3E%3Crect fill=%27%23e0e0e0%27 width=%27100%25%27 height=%27100%25%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2712%27 fill=%27%23999%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3ENo Image%3C/text%3E%3C/svg%3E'">
                        </div>
                        <div class="col-9">
                            <div class="card-body py-2">
                                <h6 class="card-title mb-0">${item.name}</h6>
                                <div class="d-flex justify-content-between align-items-center">
                                    <span class="small text-muted">$${item.price.toFixed(2)}</span>
                                    <div class="input-group input-group-sm" style="width: 100px;">
                                        <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, -1)">-</button>
                                        <input type="text" class="form-control text-center p-0" value="${item.qty}" readonly>
                                        <button class="btn btn-outline-secondary" onclick="updateQuantity(${item.id}, 1)">+</button>
                                    </div>
                                    <button class="btn btn-sm text-danger" onclick="removeFromCart(${item.id})"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });
        }

        function checkout() {
            if(cart.length === 0) return;
            alert('Thank you for your order! This is a demo, so no actual payment will be processed.');
            cart = [];
            updateCartUI();
            const offcanvasEl = document.getElementById('cartOffcanvas');
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
            offcanvas.hide();
        }

        // --- 6. MODAL DETAIL LOGIC ---
        const productModal = new bootstrap.Modal(document.getElementById('productModal'));
        
        function openProductDetail(id) {
            const product = flowersData.find(p => p.id === id);
            const modalContent = document.getElementById('modal-content');
            
            modalContent.innerHTML = `
                <div class="col-md-6">
                    <img src="${product.image}" class="img-fluid rounded-start w-100" style="object-fit: cover; height: 400px;" alt="${product.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%25%27 height=%27100%25%27%3E%3Crect fill=%27%23e0e0e0%27 width=%27100%25%27 height=%27100%25%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 font-size=%2724%27 fill=%27%23999%27 text-anchor=%27middle%27 dominant-baseline=%27middle%27%3EImage Not Available%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="col-md-6">
                    <div class="p-4">
                        <small class="text-uppercase text-muted fw-bold">${product.category}</small>
                        <h2 class="mb-3">${product.name}</h2>
                        <h3 class="text-primary mb-4">$${product.price.toFixed(2)}</h3>
                        <p>${product.description}</p>
                        <ul class="list-unstyled mb-4">
                            <li><i class="fas fa-check text-success me-2"></i> In Stock</li>
                            <li><i class="fas fa-truck text-success me-2"></i> Free Delivery</li>
                        </ul>
                        <div class="d-grid gap-2">
                            <button class="btn btn-pink btn-lg" onclick="addToCart(${product.id}); productModal.hide();">Add to Cart</button>
                        </div>
                    </div>
                </div>
            `;
            
            productModal.show();
        }

        // Initialize App
        document.addEventListener('DOMContentLoaded', init);