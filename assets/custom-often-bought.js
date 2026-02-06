// @ts-nocheck
class customOftenBought extends HTMLElement {
  constructor() {
    super();
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  connectedCallback() {
    this.addButtons = this.querySelectorAll('[data-add-to-cart]');

    this.addButtons.forEach(addButton =>{
      addButton.addEventListener('click', (e) => this.handleAddToCart(e));
    })

    // initialize tabs (inside this component)
    this.initTabs();
  }

  disconnectedCallback() {
    this.addButtons.forEach(addButton => {
      addButton.removeEventListener('click', this.handleAddToCart);
    });
  }

  /* ----------------------------------------------------------
   * TABS METHOD — works only inside this component
   * ---------------------------------------------------------- */
  initTabs() {
    const buttons = this.querySelectorAll("[data-tab-btn]");
    const panels = this.querySelectorAll("[data-tab-panel]");

    buttons.forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-tab-btn");

        // deactivate all
        buttons.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        panels.forEach(p => p.classList.remove("active"));

        // activate selected
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        this.querySelector(`[data-tab-panel="${id}"]`).classList.add("active");
      });
    });
  }

  initUpsellSwiper() {
    const sliderEl = document.querySelector('.sd-product-slider');
    if (!sliderEl) return;

    // destroy old Swiper instance if exists
    if (sliderEl.swiper) {
      sliderEl.swiper.destroy(true, true);
    }

    new Swiper(sliderEl, {
      slidesPerView: 'auto',
      spaceBetween: 4,
      scrollbar: { el: ".sd-scrollbar", draggable: true, snapOnRelease: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" }
    });
  }

  openCartDrawer() {
    const drawerButton = document.querySelector('.cart-drawer .header-actions__action');
    setTimeout(() => {
      drawerButton?.click();
      this.initUpsellSwiper();
    }, 500);
  }

  handleAddToCart(event) {
    event.preventDefault();

    // Show loading overlay
    this.addButton = event.currentTarget;
    this.addButton?.querySelector('.loading-overlay').classList.remove('loader-hidden');
    const variantId = event.currentTarget.dataset.variantId;
    const quantity = event.currentTarget.dataset.quantity || 1;

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
        this.addButton.querySelector('.loading-overlay').classList.add('loader-hidden');
        this.addButton.querySelector('.atc-button-text').textContent = 'Added';
        this.rerenderCart();
        this.emitCartUpdated();
      })
      .catch(() => {
        console.error("Failed to add item to cart.");
      })
      .finally(() => {
        setTimeout(() => {
          this.addButton.querySelector('.atc-button-text').textContent = this.addButton.querySelector('.atc-button-text').dataset.atcText;
        }, 2000);
        const drawer__dialog = document.querySelector('.cart-drawer__dialog');
        if(drawer__dialog) {
          drawer__dialog.classList.remove('cart-drawer--empty');
        }
        this.openCartDrawer();
      })
  }

  async emitCartUpdated() {
    // dispatch signal again
    const res = await fetch('/cart.js');
    const newCart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
  }

  rerenderCart() {
    const sectionId = document.querySelector('#header-component').dataset.sectionId;

    // dynamically fetch the cart drawer section
    fetch(`/?sections=${sectionId}`)
      .then(response => response.json())
      .then(data => {
        const cartDrawerInner = document.querySelector('.cart-drawer__inner');
        if (!cartDrawerInner) {
          return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = data[sectionId];

        const newContent = tempDiv.querySelector('.cart-drawer__inner');
        if (!newContent) {
          return;
        }

        cartDrawerInner.innerHTML = newContent.innerHTML;
      })
      .catch(() => {
        console.error("Failed to update cart drawer.");
      });
  }
}

if (!customElements.get('custom-often-bought')) {
  customElements.define('custom-often-bought', customOftenBought);
}
