/**
 * Tori & Spice - Combined JavaScript
 * 
 * This file contains all the functionality for the Tori & Spice website:
 * - Mobile menu toggle
 * - Hero slider
 * - Shop page filtering
 * - Shopping cart functionality
 * - Product details page functionality
 * - FAQ accordion functionality
 */

// Wait for the DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  initMobileMenu();
  
  // Hero Slider functionality
  initSlider();
  
  // Shop page functionality
  initShopFilters();
  
  // Shopping Cart Functionality
  initShoppingCart();
  
  // Product page functionality
  initProductPage();
  
  // Contact Form Handling
  initContactForm();
  
  // FAQ Accordion functionality
  initAccordion();
  
  // Load cart data from localStorage to update the cart count
  updateCartCountFromStorage();
});

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }
}

/**
 * Initialize hero slider functionality
 */
function initSlider() {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slider-btn.prev');
  const nextBtn = document.querySelector('.slider-btn.next');
  
  if (slides.length > 0 && prevBtn && nextBtn) {
    let currentSlide = 0;
    
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
    }
    
    nextBtn.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });
    
    prevBtn.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });
    
    // Auto-change slides every 5 seconds
    let sliderInterval = setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
    
    // Pause auto-slide when user interacts
    [prevBtn, nextBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        clearInterval(sliderInterval);
        // Restart after a pause
        setTimeout(() => {
          sliderInterval = setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
          }, 5000);
        }, 10000);
      });
    });
  }
}

/**
 * Initialize shop page filters
 */
function initShopFilters() {
  const productCards = document.querySelectorAll('.product-card');
  const priceSlider = document.getElementById('price-slider');
  const priceValue = document.getElementById('price-value');
  const typeCheckboxes = document.querySelectorAll('.filter-checkbox');
  const tagButtons = document.querySelectorAll('.filter-tag');
  const clearFiltersBtn = document.getElementById('clear-filters');
  
  // Only initialize if we're on the shop page (has product cards and filters)
  if (productCards.length > 0 && (priceSlider || typeCheckboxes.length > 0)) {
    // Price slider functionality
    if (priceSlider && priceValue) {
      priceSlider.addEventListener('input', () => {
        priceValue.textContent = `₦${priceSlider.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        filterProducts();
      });
    }
    
    // Type checkbox filters
    typeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', filterProducts);
    });
    
    // Tag button filters
    tagButtons.forEach(button => {
      button.addEventListener('click', () => {
        button.classList.toggle('active');
        filterProducts();
      });
    });
    
    // Clear filters button
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', clearFilters);
    }
    
    function filterProducts() {
      const selectedTypes = Array.from(typeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);
        
      const selectedTags = Array.from(tagButtons)
        .filter(button => button.classList.contains('active'))
        .map(button => button.dataset.tag);
        
      const maxPrice = parseInt(priceSlider ? priceSlider.value : '10000');
      
      productCards.forEach(card => {
        // Make sure dataset attributes exist before accessing them
        const productType = card.dataset.type || '';
        const productPrice = parseInt(card.dataset.price || '0');
        const productTags = (card.dataset.tags || '').split(',');
        
        const passesTypeFilter = selectedTypes.length === 0 || selectedTypes.includes(productType);
        const passesPriceFilter = productPrice <= maxPrice;
        const passesTagsFilter = selectedTags.length === 0 || 
          selectedTags.some(tag => productTags.includes(tag));
        
        card.style.display = passesTypeFilter && passesPriceFilter && passesTagsFilter ? 'block' : 'none';
      });
    }
    
    function clearFilters() {
      typeCheckboxes.forEach(checkbox => checkbox.checked = false);
      tagButtons.forEach(button => button.classList.remove('active'));
      
      if (priceSlider && priceValue) {
        priceSlider.value = 5000;
        priceValue.textContent = '₦5,000';
      }
      
      productCards.forEach(card => card.style.display = 'block');
    }
  }
}

/**
 * Initialize shopping cart functionality
 */
function initShoppingCart() {
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const cartCount = document.querySelector('.cart-count');
  
  // Only proceed if cart elements exist on the page
  if (addToCartButtons.length > 0 && cartCount) {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', () => {
        const productId = button.dataset.id;
        if (!productId) return;
        
        const productCard = button.closest('.product-card');
        if (!productCard) return;
        
        const productNameEl = productCard.querySelector('.product-name');
        const productPriceEl = productCard.querySelector('.product-price');
        const productImageEl = productCard.querySelector('.product-image');
        
        if (!productNameEl || !productPriceEl || !productImageEl) return;
        
        const productName = productNameEl.textContent;
        const productPrice = productPriceEl.textContent;
        const productImage = productImageEl.src;
        
        // Get cart from localStorage
        let cart = getCartFromStorage();
        
        const existingProduct = cart.find(item => item.id === productId);
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
          });
        }
        
        // Save to localStorage
        saveCartToStorage(cart);
        
        // Update cart count
        updateCartCount(cart);
        
        // Visual feedback
        const originalText = button.textContent;
        button.textContent = 'Added!';
        button.classList.add('added');
        setTimeout(() => {
          button.textContent = originalText;
          button.classList.remove('added');
        }, 2000);
      });
    });
  }
  
  // Cart page functionality
  const cartContainer = document.querySelector('.cart-items');
  if (cartContainer) {
    // This would be where you'd implement the cart page display logic
    // Will be implemented in future updates
  }
}

/**
 * Initialize all functionality for the product details page
 */
function initProductPage() {
  initProductImageGallery();
  initQuantitySelector();
  initAddToCartButton();
  initProductTabs();
}

/**
 * Initialize product image gallery with thumbnail selection
 */
function initProductImageGallery() {
  const thumbnails = document.querySelectorAll('.thumbnail');
  const mainImage = document.getElementById('mainProductImage');
  
  if (!thumbnails.length || !mainImage) return;
  
  // Add click event listeners to all thumbnails
  thumbnails.forEach(thumbnail => {
    thumbnail.addEventListener('click', function() {
      // Set main image src to the clicked thumbnail's src
      mainImage.src = this.src;
      
      // Remove active class from all thumbnails and add it to the clicked one
      thumbnails.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Set the first thumbnail as active by default
  if (thumbnails.length > 0) {
    thumbnails[0].classList.add('active');
  }
}

/**
 * Initialize quantity selector with increment/decrement buttons
 */
function initQuantitySelector() {
  const quantityInput = document.getElementById('quantity');
  const increaseBtn = document.querySelector('.increase-btn');
  const decreaseBtn = document.querySelector('.decrease-btn');
  
  if (!quantityInput || !increaseBtn || !decreaseBtn) return;
  
  // Increment quantity when + button is clicked
  increaseBtn.addEventListener('click', function() {
    // Get current value and convert to number
    let quantity = parseInt(quantityInput.value, 10);
    
    // Increment if below max value
    if (quantity < parseInt(quantityInput.max, 10)) {
      quantityInput.value = quantity + 1;
    }
  });
  
  // Decrement quantity when - button is clicked
  decreaseBtn.addEventListener('click', function() {
    // Get current value and convert to number
    let quantity = parseInt(quantityInput.value, 10);
    
    // Decrement if above min value
    if (quantity > parseInt(quantityInput.min, 10)) {
      quantityInput.value = quantity - 1;
    }
  });
  
  // Ensure quantity stays within valid range when manually edited
  quantityInput.addEventListener('change', function() {
    const min = parseInt(this.min, 10);
    const max = parseInt(this.max, 10);
    let value = parseInt(this.value, 10);
    
    // Handle non-numeric input
    if (isNaN(value)) {
      value = 1;
    }
    
    // Enforce min/max limits
    if (value < min) value = min;
    if (value > max) value = max;
    
    // Update input value
    this.value = value;
  });
}

/**
 * Initialize the Add to Cart button on product details page
 */
function initAddToCartButton() {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', addToCartWithQuantity);
  }
}

/**
 * Add product to cart with selected quantity
 */
function addToCartWithQuantity() {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (!addToCartBtn) return;
  
  const productId = addToCartBtn.dataset.id;
  const quantityInput = document.getElementById('quantity');
  if (!quantityInput) return;
  
  const quantity = parseInt(quantityInput.value, 10);
  
  // Validate quantity
  if (isNaN(quantity) || quantity < 1) {
    console.error('Invalid quantity');
    return;
  }
  
  // Get cart from localStorage
  let cart = getCartFromStorage();
  
  // Find product info from the page
  const productName = document.querySelector('h1')?.textContent;
  const productPrice = document.querySelector('.product-price')?.textContent;
  const productImage = document.getElementById('mainProductImage')?.src;
  
  if (!productName || !productPrice || !productImage) return;
  
  // Add to cart with specified quantity
  const existingProductIndex = cart.findIndex(item => item.id === productId);
  
  if (existingProductIndex !== -1) {
    // Update existing product quantity
    cart[existingProductIndex].quantity += quantity;
  } else {
    // Add new product to cart
    cart.push({
      id: productId,
      name: productName,
      price: productPrice,
      image: productImage,
      quantity: quantity
    });
  }
  
  // Save updated cart to localStorage
  saveCartToStorage(cart);
  
  // Update cart count
  updateCartCount(cart);
  
  // Visual feedback
  showAddedToCartFeedback();
}

/**
 * Initialize product tabs functionality
 */
function initProductTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  if (!tabButtons.length || !tabContents.length) return;
  
  // Add click event listeners to tab buttons
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get the tab name from the data attribute
      const tabName = button.dataset.tab;
      
      // Remove active class from all buttons and contents
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      });
      
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      
      // Add active class to clicked button
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      
      // Show corresponding content
      const tabId = tabName + '-tab';
      const tabContent = document.getElementById(tabId);
      if (tabContent) {
        tabContent.classList.add('active');
      }
    });
  });
}

/**
 * Initialize contact form handling
 */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Basic validation
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      
      if (!nameInput?.value || !emailInput?.value || !messageInput?.value) {
        alert('Please fill out all required fields.');
        return;
      }
      
      // Email validation
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput.value)) {
        alert('Please enter a valid email address.');
        return;
      }
      
      // Form would be submitted to server here
      // For demo purposes, show success message
      const submitButton = contactForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      
      submitButton.textContent = 'Message Sent!';
      submitButton.disabled = true;
      
      setTimeout(() => {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        contactForm.reset();
      }, 3000);
    });
  }
}

/**
 * Initialize FAQ accordion functionality
 */
function initAccordion() {
  const accordionItems = document.querySelectorAll('.accordion-item');
  
  if (accordionItems.length > 0) {
    accordionItems.forEach(item => {
      const header = item.querySelector('.accordion-header');
      const content = item.querySelector('.accordion-content');
      
      header.addEventListener('click', () => {
        // Toggle active class on the clicked item
        const isActive = item.classList.contains('active');
        
        // First close all accordion items
        accordionItems.forEach(accItem => {
          accItem.classList.remove('active');
          const accContent = accItem.querySelector('.accordion-content');
          if (accContent) {
            accContent.style.maxHeight = null;
          }
          
          // Change icon to plus
          const icon = accItem.querySelector('.accordion-icon i');
          if (icon) {
            icon.className = 'fas fa-plus';
          }
        });
        
        // Then open the clicked item if it wasn't active before
        if (!isActive) {
          item.classList.add('active');
          
          // Set max height to enable the animation
          if (content) {
            content.style.maxHeight = content.scrollHeight + "px";
          }
          
          // Change icon to minus
          const icon = item.querySelector('.accordion-icon i');
          if (icon) {
            icon.className = 'fas fa-minus';
          }
        }
      });
    });
  }
}

/**
 * Get cart data from localStorage
 * @returns {Array} Cart items array
 */
function getCartFromStorage() {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (e) {
    console.error('Error loading cart from localStorage:', e);
    return [];
  }
}

/**
 * Save cart data to localStorage
 * @param {Array} cart - Cart items array to save
 */
function saveCartToStorage(cart) {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
  }
}

/**
 * Update cart count display based on current cart data
 * @param {Array} cart - Cart items array
 */
function updateCartCount(cart) {
  const cartCountElement = document.querySelector('.cart-count');
  if (cartCountElement) {
    let totalItems = 0;
    cart.forEach(item => totalItems += item.quantity);
    cartCountElement.textContent = totalItems;
  }
}

/**
 * Load cart data and update cart count on page load
 */
function updateCartCountFromStorage() {
  const cart = getCartFromStorage();
  updateCartCount(cart);
}

/**
 * Show visual feedback when item is added to cart
 */
function showAddedToCartFeedback() {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (!addToCartBtn) return;
  
  const originalText = addToCartBtn.textContent;
  
  // Change text to Added! for visual feedback
  addToCartBtn.textContent = 'Added!';
  addToCartBtn.classList.add('added');
  
  // Set timeout to revert back to original text after 2 seconds
  setTimeout(() => {
    addToCartBtn.textContent = originalText;
    addToCartBtn.classList.remove('added');
  }, 2000);
}