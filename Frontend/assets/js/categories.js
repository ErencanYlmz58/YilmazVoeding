// Categories module voor het weergeven van categorieën
const categories = (function() {
    // Private variabelen en functies
    let allCategories = [];
    
    // Categorie HTML element genereren
    function generateCategoryCard(category) {
        return `
            <div class="category-card" data-id="${category.id}">
                <div class="category-image">
                    <img src="${category.imageUrl || '../assets/images/category-placeholder.jpg'}" alt="${category.name}">
                </div>
                <div class="category-content">
                    <h3>${category.name}</h3>
                    <p>${category.description || 'Bekijk onze producten in deze categorie'}</p>
                    <a href="pages/products.html?category=${category.id}" class="btn-outline">Bekijk producten</a>
                </div>
            </div>
        `;
    }
    
    // Categorieën weergeven in container
    function displayCategories(categoriesArray, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        if (categoriesArray.length === 0) {
            container.innerHTML = `
                <div class="no-categories">
                    <p>Geen categorieën gevonden.</p>
                </div>
            `;
            return;
        }
        
        let categoriesHTML = '';
        
        categoriesArray.forEach(category => {
            categoriesHTML += generateCategoryCard(category);
        });
        
        container.innerHTML = categoriesHTML;
    }
    
    // Public API
    return {
        // Alle categorieën ophalen en weergeven
        loadAll: async function(containerId = 'categories-container') {
            try {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(loadingSpinner);
                }
                
                const data = await window.api.category.getAll();
                allCategories = data;
                
                displayCategories(allCategories, containerId);
                return allCategories;
            } catch (error) {
                console.error('Error loading categories:', error);
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de categorieën. Probeer het later opnieuw.</p>
                        </div>
                    `;
                }
                return [];
            }
        },
        
        // Specifieke categorie ophalen
        getById: async function(categoryId) {
            try {
                return await window.api.category.getById(categoryId);
            } catch (error) {
                console.error(`Error loading category ${categoryId}:`, error);
                return null;
            }
        },
        
        // Categorieën voor navigatiemenu laden
        loadForNavigation: async function(containerId = 'nav-categories') {
            try {
                const container = document.getElementById(containerId);
                if (!container) return [];
                
                const data = await window.api.category.getAll();
                
                if (data.length === 0) {
                    container.style.display = 'none';
                    return [];
                }
                
                let navHTML = '';
                data.forEach(category => {
                    navHTML += `<li><a href="pages/products.html?category=${category.id}">${category.name}</a></li>`;
                });
                
                container.innerHTML = navHTML;
                return data;
            } catch (error) {
                console.error('Error loading categories for navigation:', error);
                return [];
            }
        },
        
        // Zichtbare categorieën op de homepage laden
        loadFeaturedCategories: async function(containerId = 'categories-container', limit = 4) {
            try {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.classList.add('loading-spinner');
                loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(loadingSpinner);
                }
                
                const data = await window.api.category.getAll();
                allCategories = data;
                
                // In een echte applicatie zou je een aparte API endpoint hebben voor aanbevolen categorieën
                // Voor nu beperken we gewoon het aantal weergegeven categorieën
                const featuredCategories = allCategories.slice(0, limit);
                
                displayCategories(featuredCategories, containerId);
                return featuredCategories;
            } catch (error) {
                console.error('Error loading featured categories:', error);
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `
                        <div class="error-message">
                            <p>Er is een fout opgetreden bij het laden van de categorieën.</p>
                        </div>
                    `;
                }
                return [];
            }
        }
    };
})();

// Initialiseer categorieën op basis van de huidige pagina
document.addEventListener('DOMContentLoaded', function() {
    // Check op welke pagina we zijn
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('categories.html')) {
        categories.loadAll();
    } else if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        // Op de homepage laden we alleen de aanbevolen categorieën
        categories.loadFeaturedCategories('categories-container', 4);
    }
    
    // Altijd categorieën laden voor de navigatie als het element bestaat
    const navCategoriesElement = document.getElementById('nav-categories');
    if (navCategoriesElement) {
        categories.loadForNavigation('nav-categories');
    }
});