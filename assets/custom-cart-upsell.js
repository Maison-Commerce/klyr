// @ts-nocheck
class CustomCartUpsell extends HTMLElement {
  constructor() {
    super();
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }
  
  connectedCallback() {
    this.addButtons = this.querySelectorAll('[data-add-to-cart]');
    this.addButtons.forEach(btn => {
      btn.addEventListener('click', this.handleAddToCart);
    });
  }

  disconnectedCallback() {
    this.addButtons.forEach(btn => {
      btn.removeEventListener('click', this.handleAddToCart);
    });
  }
  
  
  handleAddToCart(event) {
    event.preventDefault();

    const item = event.currentTarget.closest('.sd-product-single-slide');
    item.querySelector('.loading-overlay').classList.remove('loader-hidden');

    const variantId = event.currentTarget.dataset.variantId;
    const quantity = item.querySelector('[data-add-to-cart]').dataset.productQty || 1;
    
    fetch('/cart/add.js', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        id: variantId,
        quantity: quantity
      })
    })
      .then(res => res.json())
      .then(data => {
        item.querySelector('.loading-overlay').classList.add('loader-hidden');
        this.emitCartUpdated();
      })
      .catch(() => {
        console.error("Failed to add item to cart.");
      });
  }

  async emitCartUpdated() {
    // dispatch signal again
    const res = await fetch('/cart.js');
    const newCart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
  }
}

if (!customElements.get('custom-cart-upsell')) {
  customElements.define('custom-cart-upsell', CustomCartUpsell);
}
