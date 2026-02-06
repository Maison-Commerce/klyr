// @ts-nocheck
class FreeProductManager {
  constructor(drawerSelector) {
    this.drawer = document.querySelector(drawerSelector);

    // Free product info from data attributes
    this.freeVariantId = parseInt(this.drawer?.dataset.freeVariantId, 10);
    // Keep threshold in cents (don't convert)
    this.freeThreshold = parseInt(this.drawer?.dataset.freeProductThreshold, 10) || 0;
    
    document.addEventListener('cart:updated', (e) => {
      const cart = e.detail;
      this.handleFreeProduct(cart);
    });
  }

  async handleFreeProduct(cart) {
    // Compare in cents (don't divide by 100)
    const subtotal = cart.total_price;
    const hasFreeProduct = cart.items.some(item => item.id === this.freeVariantId);

    if (subtotal >= this.freeThreshold && !hasFreeProduct) {
      // add free product
      await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: this.freeVariantId, quantity: 1 })
      });

      // dispatch signal again
      const res = await fetch('/cart.js');
      const newCart = await res.json();
      document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));

    } else if (subtotal < this.freeThreshold && hasFreeProduct) {
      // remove free product by line key
      const freeItem = cart.items.find(item => item.id === this.freeVariantId);

      if (freeItem) {
        await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: freeItem.key, quantity: 0 })
        });

        // dispatch signal again
        const res = await fetch('/cart.js');
        const newCart = await res.json();
        document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
      }
    }
  }
}

// ✅ Initialize
const freeProductManager = new FreeProductManager('.cart-drawer__inner');