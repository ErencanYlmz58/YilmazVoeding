// Products module voor het weergeven van producten
const products = (function() {
    // Private variabelen en functies
    let allProducts = [];
    let currentCategory = null;
    
    // Product HTML element genereren
    function generateProductCard(product) {
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-image">
                    <img src="${product.imageUrl || '../assets/images/product-placeholder.jpg'}" alt="${product.name}">
                </div>
                <div class="product-content">
                    <h3>${product.name}</h3>
                    <p class="price">€${product.price.toFixed(2)}</p>
                    <p class="description">${product.description || 'Geen beschrijving beschikbaar'}</p>
                    <div class="product-actions">
                        <a href="product-detail.html?id=${product.id}" class="btn-view-details">
                            <i class="fas fa-eye"></i>
                        </a>
                        <button class="btn-add-cart">
                            <i class="fas fa-shopping-cart"></i> Toevoegen
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Producten weergeven in container
    function displayProducts(productsArray, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (productsArray.length === 0) {
            container.innerHTML = `
                <div class="no-products">
                    <p>Geen producten gevonden.</p>
                </div>
            `;
            return;
        }
        
        let productsHTML = '';
        
        productsArray.forEach(product => {
            productsHTML += generateProductCard(product);
        });
        
        container.innerHTML = productsHTML;
    }
    
    // URL parameters ophalen
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
    
    // Public API
    return {
        // Alle producten ophalen en weergeven
        loadAll: async function(containerId = 'products-container') {
            try {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(loadingSpinner);
                }
                
                const data = await window.api.product.getAll();
                allProducts = data;
                
                displayProducts(allProducts, containerId);
                return allProducts;
            } catch (error) {
                console.error('Error loading products:', error);
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de producten. Probeer het later opnieuw.</p>
                        </div>
                    `;
                }
                return [];
            }
        },
        
        // Producten per categorie ophalen en weergeven
        loadByCategory: async function(categoryId, containerId = 'products-container') {
            try {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(loadingSpinner);
                }
                
                // Categorie naam ophalen en weergeven
                try {
                    const category = await window.api.category.getById(categoryId);
                    currentCategory = category;
                    
                    const categoryTitleElement = document.getElementById('category-title');
                    if (categoryTitleElement) {
                        categoryTitleElement.textContent = category.name;
                    }
                } catch (error) {
                    console.error('Error loading category:', error);
                }
                
                const data = await window.api.product.getByCategory(categoryId);
                
                displayProducts(data, containerId);
                return data;
            } catch (error) {
                console.error('Error loading products by category:', error);
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de producten. Probeer het later opnieuw.</p>
                        </div>
                    `;
                }
                return [];
            }
        },
        
        // Specifiek product ophalen en weergeven
        loadProductDetail: async function() {
            const productId = getUrlParameter('id');
            if (!productId) {
                window.location.href = 'products.html';
                return;
            }
            
            try {
                const productDetailContainer = document.getElementById('product-detail-container');
                if (!productDetailContainer) return;
                
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                productDetailContainer.innerHTML = '';
                productDetailContainer.appendChild(loadingSpinner);
                
                const product = await window.api.product.getById(productId);
                
                // Paginatitel bijwerken
                document.title = `${product.name} - Yilmaz Voeding`;
                
                const productHTML = `
                    <div class="product-detail">
                        <div class="product-detail-image">
                            <img src="${product.imageUrl || '../assets/images/product-placeholder.jpg'}" alt="${product.name}">
                        </div>
                        <div class="product-detail-content">
                            <h1>${product.name}</h1>
                            <p class="price">€${product.price.toFixed(2)}</p>
                            <div class="category-badge">${product.category ? product.category.name : 'Geen categorie'}</div>
                            
                            <div class="product-description">
                                <h3>Productbeschrijving</h3>
                                <p>${product.description || 'Geen beschrijving beschikbaar'}</p>
                            </div>
                            
                            <div class="product-detail-actions">
                                <div class="quantity-selector">
                                    <button class="btn-decrease">-</button>
                                    <input type="number" value="1" min="1" id="product-quantity">
                                    <button class="btn-increase">+</button>
                                </div>
                                
                                <button class="btn-primary" id="add-to-cart-btn">
                                    <i class="fas fa-shopping-cart"></i> Toevoegen aan winkelwagen
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                productDetailContainer.innerHTML = productHTML;
                
                // Event listeners toevoegen
                const quantityInput = document.getElementById('product-quantity');
                const decreaseBtn = document.querySelector('.btn-decrease');
                const increaseBtn = document.querySelector('.btn-increase');
                const addToCartBtn = document.getElementById('add-to-cart-btn');
                
                decreaseBtn.addEventListener('click', function() {
                    const currentValue = parseInt(quantityInput.value);
                    if (currentValue > 1) {
                        quantityInput.value = currentValue - 1;
                    }
                });
                
                increaseBtn.addEventListener('click', function() {
                    const currentValue = parseInt(quantityInput.value);
                    quantityInput.value = currentValue + 1;
                });
                
                addToCartBtn.addEventListener('click', function() {
                    const quantity = parseInt(quantityInput.value);
                    window.cart.addToCart(product, quantity);
                });
                
                return product;
            } catch (error) {
                console.error('Error loading product detail:', error);
                const productDetailContainer = document.getElementById('product-detail-container');
                if (productDetailContainer) {
                    productDetailContainer.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van het product. Probeer het later opnieuw.</p>
                            <a href="products.html" class="btn-primary">Terug naar producten</a>
                        </div>
                    `;
                }
                return null;
            }
        },
        
        // Aanbevolen producten laden (bijvoorbeeld voor op de homepage)
        loadFeaturedProducts: async function(containerId = 'featured-products-container', limit = 4) {
            try {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(loadingSpinner);
                }
                
                // In een echte applicatie zouden we een aparte API endpoint hebben voor aanbevolen producten
                // Voor nu halen we gewoon alle producten op en tonen we de eerste paar
                const data = await window.api.product.getAll();
                const featuredProducts = data.slice(0, limit);
                
                displayProducts(featuredProducts, containerId);
                return featuredProducts;
            } catch (error) {
                console.error('Error loading featured products:', error);
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de aanbevolen producten.</p>
                        </div>
                    `;
                }
                return [];
            }
        },
        
        // Zoekfunctie
        search: function(query, containerId = 'products-container') {
            if (!query || query.trim() === '') {
                displayProducts(allProducts, containerId);
                return allProducts;
            }
            
            query = query.toLowerCase().trim();
            
            const filteredProducts = allProducts.filter(product => {
                return product.name.toLowerCase().includes(query) || 
                       (product.description && product.description.toLowerCase().includes(query));
            });
            
            displayProducts(filteredProducts, containerId);
            return filteredProducts;
        },
        
        // Sorteer opties
        sort: function(option, containerId = 'products-container') {
            if (!allProducts || allProducts.length === 0) return [];
            
            let sortedProducts = [...allProducts];
            
            switch (option) {
                case 'price-asc':
                    sortedProducts.sort((a, b) => a.price - b.price);
                    break;
                case 'price-desc':
                    sortedProducts.sort((a, b) => b.price - a.price);
                    break;
                case 'name-asc':
                    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                    break;
                default:
                    // Standaard sortering op naam
                    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            }
            
            displayProducts(sortedProducts, containerId);
            return sortedProducts;
        }
    };
})();

// Initialiseer producten op basis van de huidige pagina
document.addEventListener('DOMContentLoaded', function() {
    // Check op welke pagina we zijn
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('product-detail.html')) {
        products.loadProductDetail();
    } else if (currentPage.includes('products.html')) {
        // Check of er een categorie parameter is
        const urlParams = new URLSearchParams(window.location.search);
        const categoryId = urlParams.get('category');
        
        if (categoryId) {
            products.loadByCategory(categoryId);
        } else {
            products.loadAll();
            
            // Zoekfunctionaliteit
            const searchInput = document.getElementById('product-search');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    products.search(this.value);
                });
            }
            
            // Sorteerfunctionaliteit
            const sortSelect = document.getElementById('product-sort');
            if (sortSelect) {
                sortSelect.addEventListener('change', function() {
                    products.sort(this.value);
                });
            }
        }
    } else if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        // Op de homepage laden we de aanbevolen producten
        products.loadFeaturedProducts('featured-products-container', 4);
    }
});