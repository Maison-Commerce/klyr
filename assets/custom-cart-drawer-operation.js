// @ts-nocheck
class CustomCartDrawer {
  constructor(drawerSelector) {
    this.drawer = document.querySelector(drawerSelector);

    if (!this.drawer) {
      console.error("Cart drawer not found.");
      return;
    }

    this.initEvents();

    // Listen to cart updates (from ATCManager, FreeProductManager, or drawer actions)
    document.addEventListener('cart:updated', (e) => {
      this.rerenderCart(e.detail); // <-- rerender cart whenever cart:updated is emitted
    });
  }

  initEvents() {
    this.drawer.addEventListener('click', (e) => {
      // Plus / Minus buttons
      if (e.target.matches('[data-qty-plus], [data-qty-minus]')) {
        const input = e.target.closest('[data-cart-item]')?.querySelector('[data-quantity-input]');
        const lineKey = e.target.closest('[data-cart-item]')?.dataset.lineKey;
        if (!input || !lineKey) return;

        let value = parseInt(input.value, 10) || 1;

        if (e.target.hasAttribute('data-qty-plus')) value++;
        else if (e.target.hasAttribute('data-qty-minus') && value > 0) value--;

        input.value = value;
        this.updateQuantity(lineKey, value);
      }

      // Remove button
      if (e.target.closest('[data-remove-item]')) {
        const lineKey = e.target.closest('[data-cart-item]')?.dataset.lineKey;
        if (lineKey) this.updateQuantity(lineKey, 0);
      }
    });

    // Direct input change
    this.drawer.addEventListener('change', (e) => {
      if (e.target.matches('[data-quantity-input]')) {
        const lineKey = e.target.closest('[data-cart-item]')?.dataset.lineKey;
        const quantity = parseInt(e.target.value, 10);
        if (lineKey && !isNaN(quantity)) this.updateQuantity(lineKey, quantity);
      }
    });
  }

  toggleLoader(lineKey, show) {
    const itemRow = this.drawer.querySelector(`[data-line-key="${lineKey}"]`);
    if (itemRow) {
      const loader = itemRow.querySelector('.loading-overlay');
      if (loader) {
        if (show) loader.classList.remove('loader-hidden');
        else loader.classList.add('loader-hidden');
      }
    }
  }

  updateQuantity(lineKey, quantity) {
    // Show loading overlay
    this.toggleLoader(lineKey, true);

    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lineKey, quantity })
    })
      .then(res => res.json())
      .then(cart => {
        this.emitCartUpdated(cart);
        // Hide loading overlay
        this.toggleLoader(lineKey, false);
      })
      .catch(err => console.error("Update cart failed:", err));
  }

  
  rerenderCart(cart) {
    const sectionId = document.querySelector('#header-component')?.dataset.sectionId;
    if (!sectionId) return;

    fetch(`/?sections=${sectionId}`)
      .then(res => res.json())
      .then(data => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data[sectionId];
        const newContent = tempDiv.querySelector('.cart-drawer__inner');
        const newCartCount = tempDiv.querySelector('.header-cart__icon-text .cart-text');
        if (newContent) this.drawer.innerHTML = newContent.innerHTML;
        if (newCartCount) document.querySelector('.header-cart__icon-text .cart-text').innerHTML = newCartCount.innerHTML;
      })
      .catch(err => console.error("Failed to reload cart drawer:", err));
  }

  emitCartUpdated(cart) {
    // Trigger custom event for other classes to listen
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
  }
}


// ✅ Initialize
const cartDrawer = new CustomCartDrawer('.cart-drawer__inner');

