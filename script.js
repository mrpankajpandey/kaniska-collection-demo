(() => {
  // Store WhatsApp contact number (digits with country code).
  const WHATSAPP_NUMBER = "919792929364";
  const CART_STORAGE_KEY = "kanishka_cart_v1";

  // Elements
  const nav = document.querySelector(".nav");
  const menuToggle = document.querySelector(".menu-toggle");
  const toast = document.getElementById("siteToast") || document.querySelector(".toast");
  const yearEl = document.getElementById("year");

  // Cart DOM elements
  const openCartBtn = document.getElementById("openCartBtn");
  const floatingCartBtn = document.getElementById("floatingCartBtn");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartBackdrop = document.getElementById("cartBackdrop");
  const cartBody = document.getElementById("cartBody");
  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartCountBadge = document.getElementById("cartCountBadge");
  const floatingCartBadge = document.getElementById("floatingCartBadge");
  const floatingCartTotal = document.getElementById("floatingCartTotal");
  const cartHeaderCount = document.getElementById("cartHeaderCount");
  const cartCheckoutCount = document.getElementById("cartCheckoutCount");
  const cartCheckoutTotal = document.getElementById("cartCheckoutTotal");
  const whatsappCheckoutBtn = document.getElementById("whatsappCheckoutBtn");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");
  const customerNameInput = document.getElementById("orderCustomerName");
  const customerNotesInput = document.getElementById("orderCustomerNotes");

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // Mobile navigation
  menuToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  });

  nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  // Toast Notification with optional Action button
  let toastTimer;
  function showToast(message, actionLabel = null, actionHandler = null) {
    if (!toast) return;
    toast.innerHTML = "";

    const textSpan = document.createElement("span");
    textSpan.textContent = message;
    toast.appendChild(textSpan);

    if (actionLabel && typeof actionHandler === "function") {
      const actionBtn = document.createElement("button");
      actionBtn.type = "button";
      actionBtn.className = "toast-action-btn";
      actionBtn.textContent = actionLabel;
      actionBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        actionHandler();
        toast.classList.remove("show");
      });
      toast.appendChild(actionBtn);
    }

    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // Open WhatsApp Helper
  function openWhatsApp(message) {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Generic WhatsApp links across the page
  document.querySelectorAll(".whatsapp-link").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      openWhatsApp(link.dataset.message || "Hello Kanishka Collection! I'd like to know more about your latest collection.");
    });
  });

  // Category Label Mapping
  const CATEGORY_LABELS = {
    "Suits": "Suits & Kurti Sets",
    "Sarees": "Sarees & Lehengas",
    "Co-ords": "Co-ords & Indo-Western",
    "Kids": "Kidswear"
  };

  // Product Filtering
  const filterButtons = document.querySelectorAll(".filter");
  const productCards = document.querySelectorAll(".product-card");

  function setFilter(filter) {
    let activeFilter = filter;
    if (filter === "Women" || filter === "Ladieswear") {
      activeFilter = "All"; // or highlight All
    }

    filterButtons.forEach(button => {
      const bFilter = button.dataset.filter;
      button.classList.toggle("active", bFilter === filter || (filter === "Women" && bFilter === "All"));
    });

    productCards.forEach(card => {
      const cat = card.dataset.category;
      let matches = false;
      if (filter === "All") {
        matches = true;
      } else if (filter === "Women" || filter === "Ladieswear") {
        matches = cat !== "Kids";
      } else {
        matches = cat === filter;
      }
      card.classList.toggle("is-hidden", !matches);
    });
  }

  filterButtons.forEach(button => button.addEventListener("click", () => setFilter(button.dataset.filter)));

  document.querySelectorAll("[data-filter-link]").forEach(link => {
    link.addEventListener("click", (e) => {
      const targetFilter = link.dataset.filterLink;
      setFilter(targetFilter);
      const productsSection = document.getElementById("products");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Direct single item order button
  document.querySelectorAll(".order-product").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const productName = card.dataset.name;
      const price = card.dataset.price;
      const rawCategory = card.dataset.category;
      const categoryName = CATEGORY_LABELS[rawCategory] || rawCategory;
      openWhatsApp(`Hello Kanishka Collection! 🛍️\n\nI'd like to enquire/order this item directly:\n\n• *Product:* ${productName}\n• *Category:* ${categoryName}\n• *Listed Price:* ${price}\n• *Size:* Please share available sizes\n• *Colour:* Please share available colours\n\nPlease confirm availability and final price with delivery in Gonda.`);
    });
  });

  // Wishlist Heart toggle with minimal spring animation
  document.querySelectorAll(".heart").forEach(button => {
    button.addEventListener("click", () => {
      const saved = button.classList.toggle("saved");
      button.textContent = saved ? "♥" : "♡";
      button.setAttribute("aria-pressed", String(saved));
      showToast(saved ? "Saved to your favourites." : "Removed from favourites.");
    });
  });

  // =========================================================================
  // SHOPPING CART & MULTI-ITEM WHATSAPP ORDERING
  // =========================================================================

  function parsePrice(priceStr) {
    if (!priceStr) return 0;
    const digits = priceStr.replace(/[^0-9]/g, "");
    return parseInt(digits, 10) || 0;
  }

  function formatCurrency(amount) {
    return "₹" + amount.toLocaleString("en-IN");
  }

  function getCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // localStorage disabled or full
    }
  }

  function getCartSummary() {
    const cart = getCart();
    let totalItems = 0;
    let subtotal = 0;

    cart.forEach(item => {
      totalItems += item.quantity;
      subtotal += item.numericPrice * item.quantity;
    });

    return { cart, totalItems, subtotal };
  }

  function triggerBadgeBump(element) {
    if (!element) return;
    element.classList.remove("bump");
    void element.offsetWidth; // Trigger reflow
    element.classList.add("bump");
  }

  function renderCart() {
    const { cart, totalItems, subtotal } = getCartSummary();
    const formattedSubtotal = formatCurrency(subtotal);

    // Update badges
    if (cartCountBadge) {
      cartCountBadge.textContent = totalItems;
      triggerBadgeBump(cartCountBadge);
    }
    if (floatingCartBadge) {
      floatingCartBadge.textContent = totalItems;
      triggerBadgeBump(floatingCartBadge);
    }
    if (floatingCartTotal) {
      floatingCartTotal.textContent = formattedSubtotal;
    }
    if (cartHeaderCount) {
      cartHeaderCount.textContent = `(${totalItems} ${totalItems === 1 ? "item" : "items"})`;
    }
    if (cartCheckoutCount) {
      cartCheckoutCount.textContent = totalItems;
    }
    if (cartCheckoutTotal) {
      cartCheckoutTotal.textContent = formattedSubtotal;
    }
    if (cartSubtotal) {
      cartSubtotal.textContent = formattedSubtotal;
    }

    // Toggle checkout button disabled state if empty
    if (whatsappCheckoutBtn) {
      whatsappCheckoutBtn.disabled = totalItems === 0;
      whatsappCheckoutBtn.style.opacity = totalItems === 0 ? "0.6" : "1";
      whatsappCheckoutBtn.style.cursor = totalItems === 0 ? "not-allowed" : "pointer";
    }

    if (!cartBody) return;

    if (cart.length === 0) {
      cartBody.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛍️</div>
          <h4>Your bag is currently empty</h4>
          <p>Explore our trending traditional and everyday styles for the family and add items to order together!</p>
          <button class="btn btn-primary" id="emptyCartShopBtn" type="button">Explore Styles ↗</button>
        </div>
      `;
      document.getElementById("emptyCartShopBtn")?.addEventListener("click", () => {
        closeCart();
        const productsEl = document.getElementById("products");
        if (productsEl) {
          productsEl.scrollIntoView({ behavior: "smooth" });
        }
      });
      return;
    }

    // Render items list
    let html = '<div class="cart-items-list">';
    cart.forEach(item => {
      const itemTotal = formatCurrency(item.numericPrice * item.quantity);
      html += `
        <div class="cart-item" data-name="${item.name}">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy">
          <div class="cart-item-info">
            <div>
              <div class="cart-item-top">
                <h4 class="cart-item-title">${item.name}</h4>
                <button class="cart-item-remove" data-action="remove" aria-label="Remove ${item.name}">&times;</button>
              </div>
              <p class="cart-item-cat">${item.category}</p>
            </div>
            <div class="cart-item-bottom">
              <div class="cart-qty-ctrl">
                <button class="qty-btn" data-action="decrease" aria-label="Decrease quantity of ${item.name}">−</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" data-action="increase" aria-label="Increase quantity of ${item.name}">+</button>
              </div>
              <div class="cart-item-price">${itemTotal}</div>
            </div>
          </div>
        </div>
      `;
    });
    html += "</div>";

    cartBody.innerHTML = html;

    // Attach event listeners for item actions
    cartBody.querySelectorAll(".cart-item").forEach(itemEl => {
      const name = itemEl.dataset.name;

      itemEl.querySelector('[data-action="increase"]')?.addEventListener("click", () => {
        updateItemQuantity(name, 1);
      });
      itemEl.querySelector('[data-action="decrease"]')?.addEventListener("click", () => {
        updateItemQuantity(name, -1);
      });
      itemEl.querySelector('[data-action="remove"]')?.addEventListener("click", () => {
        removeItemFromCart(name);
      });
    });
  }

  function addItemToCart(product) {
    const cart = getCart();
    const existingIndex = cart.findIndex(item => item.name === product.name);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        name: product.name,
        priceText: product.priceText,
        numericPrice: parsePrice(product.priceText),
        category: product.category,
        image: product.image,
        quantity: 1
      });
    }

    saveCart(cart);
    renderCart();
  }

  function updateItemQuantity(name, change) {
    let cart = getCart();
    const index = cart.findIndex(item => item.name === name);

    if (index > -1) {
      cart[index].quantity += change;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
        showToast(`Removed "${name}" from bag.`);
      }
      saveCart(cart);
      renderCart();
    }
  }

  function removeItemFromCart(name) {
    let cart = getCart();
    cart = cart.filter(item => item.name !== name);
    saveCart(cart);
    renderCart();
    showToast(`Removed "${name}" from bag.`);
  }

  function clearCart() {
    saveCart([]);
    renderCart();
    showToast("Shopping bag cleared.");
  }

  function openCart() {
    cartDrawer?.classList.add("open");
    cartBackdrop?.classList.add("open");
    document.body.classList.add("cart-open");
    cartDrawer?.setAttribute("aria-hidden", "false");
    cartBackdrop?.setAttribute("aria-hidden", "false");
  }

  function closeCart() {
    cartDrawer?.classList.remove("open");
    cartBackdrop?.classList.remove("open");
    document.body.classList.remove("cart-open");
    cartDrawer?.setAttribute("aria-hidden", "true");
    cartBackdrop?.setAttribute("aria-hidden", "true");
  }

  // Open & Close event handlers
  openCartBtn?.addEventListener("click", openCart);
  floatingCartBtn?.addEventListener("click", openCart);
  closeCartBtn?.addEventListener("click", closeCart);
  cartBackdrop?.addEventListener("click", closeCart);
  continueShoppingBtn?.addEventListener("click", closeCart);
  clearCartBtn?.addEventListener("click", () => {
    if (getCart().length > 0) {
      clearCart();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && cartDrawer?.classList.contains("open")) {
      closeCart();
    }
  });

  // "Add to Bag" button handlers with micro-animation feedback
  document.querySelectorAll(".btn-add-cart").forEach(button => {
    button.addEventListener("click", () => {
      const card = button.closest(".product-card");
      const name = card.dataset.name;
      const priceText = card.dataset.price;
      const rawCategory = card.dataset.category;
      const category = CATEGORY_LABELS[rawCategory] || rawCategory;
      const img = card.querySelector(".product-image img");
      const image = img ? img.src : "";

      addItemToCart({ name, priceText, category, image });

      // Visual feedback on button
      const originalText = button.innerHTML;
      button.classList.add("added");
      button.innerHTML = `
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>Added!</span>
      `;

      setTimeout(() => {
        button.classList.remove("added");
        button.innerHTML = originalText;
      }, 1400);

      showToast(`Added "${name}" to your bag.`, "View Bag ↗", openCart);
    });
  });

  // WhatsApp Multi-Item Checkout
  whatsappCheckoutBtn?.addEventListener("click", () => {
    const { cart, totalItems, subtotal } = getCartSummary();
    if (totalItems === 0) {
      showToast("Your bag is empty! Add styles to order.");
      return;
    }

    const customerName = customerNameInput ? customerNameInput.value.trim() : "";
    const customerNotes = customerNotesInput ? customerNotesInput.value.trim() : "";

    let message = `Hello Kanishka Collection! 🛍️\nI would like to place an order from your website:\n\n*ORDER DETAILS:*`;

    cart.forEach((item, idx) => {
      const lineTotal = formatCurrency(item.numericPrice * item.quantity);
      message += `\n\n${idx + 1}. *${item.name}* (${item.category})`;
      message += `\n   • Quantity: ${item.quantity}`;
      message += `\n   • Unit Price: ${item.priceText}`;
      if (item.quantity > 1) {
        message += `\n   • Item Subtotal: ${lineTotal}`;
      }
    });

    message += `\n\n────────────────────`;
    message += `\n📦 *Total Items:* ${totalItems}`;
    message += `\n💰 *Estimated Subtotal:* ${formatCurrency(subtotal)}`;
    if (customerName) {
      message += `\n👤 *Customer:* ${customerName}`;
    }
    if (customerNotes) {
      message += `\n📝 *Notes/Sizes:* ${customerNotes}`;
    } else {
      message += `\n📝 *Notes:* Please confirm available sizes and colours.`;
    }
    message += `\n────────────────────`;
    message += `\nPlease confirm item availability, final price, and home delivery / store pickup in Gonda. Thank you!`;

    openWhatsApp(message);
  });

  // Initialize cart on load
  renderCart();

  // Scroll reveal with fallback
  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }
})();
