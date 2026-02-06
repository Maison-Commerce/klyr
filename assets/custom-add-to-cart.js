// @ts-nocheck
class CustomAddToCart extends HTMLElement {
  constructor() {
    super();
    // hold references (better than re-querying every time)
    this.atcButton = this.querySelector('[data-atc-button]'); // ✅ scoped to inside custom element
    this.productForm = document.querySelector('#product_data');
    this.productData = null;
    if(this.productForm)
      this.productData = JSON.parse(this.productForm.textContent); // ✅ from outside
  }

  connectedCallback() {
    this.initQtyChoice();
    this.updateSelectedValue();
    this.initAtcClick();
    this.initializeGroups();
  }

  disconnectedCallback() {
    this.atcButton?.removeEventListener('click', this.handleAtcClick);
  }

  // -------------------
  // Helpers
  // -------------------

  initQtyChoice() {
    const qtyChoiceInputs = document.querySelectorAll('#product-quantity-choice input');
    const groups = document.querySelectorAll('.custom-variant-picker .new-variant-picker__form[data-toggle="true"]');
    const shadeOne = document.querySelector('#shade_1');

    qtyChoiceInputs.forEach(input => {
      input.addEventListener('change', () => {
        if (input.checked && input.getAttribute('id') == 'qty_choice_1') {
          groups.forEach((group, idx) => {
            if (idx > 0)
              group.style.display = 'none';
          });
          if (shadeOne)
            shadeOne.textContent = 'Classic Shades:';
        } else if (input.checked && input.getAttribute('id') == 'qty_choice_2') {
          groups.forEach((group, idx) => {
            if (idx <= 1)
              group.style.display = 'block';
            else
              group.style.display = 'none';
          });
          if (shadeOne)
            shadeOne.textContent = 'Shade 1:'
        } else {
          groups.forEach((group) => {
            group.style.display = 'block';
          });
          if (shadeOne)
            shadeOne.textContent = 'Shade 1:'
        }
      });
    });
  }

  initializeGroups() {
    const qtyChoiceInputs = document.querySelectorAll('#product-quantity-choice input');
    const groups = document.querySelectorAll('.custom-variant-picker .new-variant-picker__form[data-toggle="true"]');
    const shadeOne = document.querySelector('#shade_1');

    qtyChoiceInputs.forEach(input => {
      if (input.checked && input.getAttribute('id') == 'qty_choice_1') {
        if (shadeOne)
          shadeOne.textContent = 'Classic Shades:';
      }
    });
  }

  // Update the selected value beside option name e.g Color: Red
  updateSelectedValue() {
    const inputs = document.querySelectorAll('.variant-option__button-label input');
    inputs.forEach(input => {
      input.addEventListener('change', ()=> {
        const fieldset = input.closest('.custom-variant-picker .variant-option');
        const selectedValue = fieldset.querySelector('.variant-option__selected-value');
        if (selectedValue) {
          selectedValue.textContent = input.value;
        }
      })
    })
  }

  getSelectedOptions(groupNumber) {
    const group = document.querySelector(`.new-variant-picker__form[data-group="${groupNumber}"]`);
    const fieldsets = group?.querySelectorAll('fieldset');
    if (!fieldsets) {
      return null;
    }
    let selected = [];
    fieldsets.forEach(fieldset => {
      const checked = fieldset.querySelector('input:checked');
      if (checked) selected.push(checked.value.trim());
    });
    return selected;
  }

  findVariantIdByTitle(optionsArray) {
    if (this.productData.variants.length === 1) {
      return this.productData.variants[0].id;
    }

    const title = optionsArray.join(' / ');
    const variant = this.productData?.variants.find(v => v.title === title);
    return variant ? variant.id : null;
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
    if (this.atcButton.getAttribute('skip-upsell-drawer') === 'true') {
      setTimeout(() => {
        drawerButton?.click();
        this.initUpsellSwiper();
      }, 500);
    }
  }

  // -------------------
  // Main ATC click
  // -------------------

  initAtcClick() {
    this.atcButton.addEventListener('click', (e) => this.handleAtcClick(e));
  }

  pushItems(itemsToAdd, idx) {
    const opts = this.getSelectedOptions(idx);
    const variantId = this.findVariantIdByTitle(opts);
    if (!variantId) {
      alert('Please select all options for Product ' + idx);
      return;
    }
    itemsToAdd.push({ id: variantId, quantity: 1 });
  }

  handleAtcClick(e) {
    e.preventDefault();

    // Show loading overlay
    this.atcButton.querySelector('.loading-overlay').classList.remove('loader-hidden');

    // Get selected option and variant IDs
    const qtyChoice = document.querySelector('#product-quantity-choice input:checked')?.value;
    let itemsToAdd = [];

    // Group 1
    const opts1 = this.getSelectedOptions(1);
    const variantId1 = this.findVariantIdByTitle(opts1);
    if (!variantId1) {
      alert('Please select all options for Product 1');
      return;
    }
    itemsToAdd.push({ id: variantId1, quantity: 1 });

    // Group 2 if needed
    if (qtyChoice === "2") {
      this.pushItems(itemsToAdd, 2)
    }
    else if(qtyChoice === "3") {
      this.pushItems(itemsToAdd, 2);
      this.pushItems(itemsToAdd, 3);
    }

    // Send to cart in one request
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: itemsToAdd })
    })
      .then(res => res.json())
      .then(data => {
        // Hide loading overlay
        this.atcButton.querySelector('.loading-overlay').classList.add('loader-hidden');
        this.atcButton.classList.add('atc-added');
        this.emitCartUpdated();
      })
      .catch(err => console.error('Error adding to cart:', err))
      .finally(() => {
        setTimeout(() => {
          this.atcButton.classList.remove('atc-added');
        }, 1000);
        const drawer__dialog = document.querySelector('.cart-drawer__dialog');
        if(drawer__dialog) {
          drawer__dialog.classList.remove('cart-drawer--empty');
        }
        this.openCartDrawer();
      });
  }

  async emitCartUpdated() {
    // dispatch signal again
    const res = await fetch('/cart.js');
    const newCart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
  }
}

// ✅ Register once
if (!customElements.get('custom-add-to-cart')) {
  customElements.define('custom-add-to-cart', CustomAddToCart);
}
