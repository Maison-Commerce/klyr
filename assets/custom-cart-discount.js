// @ts-nocheck
class CustomCartDiscount extends HTMLElement {
  constructor() {
    super();
    this.handleCartDiscount = this.handleCartDiscount.bind(this);
  }
  
  connectedCallback() {
    this.cartDiscountForm = this.querySelector('.cart-drawer__discount-form');
    this.cartDiscountForm.addEventListener('submit', this.handleCartDiscount);
  }

  disconnectedCallback() {
    this.cartDiscountForm.removeEventListener('submit', this.handleCartDiscount);
  }
  
  async handleCartDiscount(event) {
    event.preventDefault();

    const loader = this.cartDiscountForm.querySelector('.loading-overlay');
    loader.classList.remove('loader-hidden');

    const code = this.cartDiscountForm.querySelector(`[name='cart_discount']`).value.trim();
    if (!code) {
      loader.classList.add('loader-hidden');
      return;
    }

    try {
      const res = await fetch(`${window.Shopify.routes.root}cart/update.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ discount: code })
      });

      let data = null;
      try { data = await res.json(); } catch {}
      console.log('Discount response:', data);

      await this.emitCartUpdated();
    } catch (err) {
      console.error("Failed to apply discount:", err);
    } finally {
      loader.classList.add('loader-hidden');
    }
  }

  async emitCartUpdated() {
    const res = await fetch('/cart.js');
    const newCart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
  }
}

if (!customElements.get('custom-cart-discount')) {
  customElements.define('custom-cart-discount', CustomCartDiscount);
}
