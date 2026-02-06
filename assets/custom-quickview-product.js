// @ts-nocheck
class QuickviewProduct extends HTMLElement {
  constructor() {
    super();
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  connectedCallback() {
    this.updateSelectedValue();
    this.addButton = this.querySelector('[data-add-to-cart]');
    this.closeButtons = this.querySelectorAll('[data-quickview-close], .quickview_overlay');

    // Hide + sync variants of bundle product
    this.applyVariantFilteringAndSync();

    if (!this.addButton) {
      return;
    }

    this.addButton.addEventListener('click', this.handleAddToCart);
    this.closeButtons.forEach(button => {
      button.addEventListener('click', this.closeDrawer.bind(this));
    });
  }

  disconnectedCallback() {
    if (this.addButton) {
      this.addButton.removeEventListener('click', this.handleAddToCart);
    }
    this.closeButtons.forEach(button => {
      button.removeEventListener('click', this.closeDrawer.bind(this));
    })
  }
  
  updateSelectedValue() {
    const inputs = this.querySelectorAll('.variant-option__button-label input');
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

  applyVariantFilteringAndSync() {
    const mainOptions = [];
    const addonFieldsets = [];

    /* ----------------------------------------------------------
    * 1. Collect MAIN product options + allowed values
    * ---------------------------------------------------------- */
    this.querySelectorAll(".quickview-product__variants [quickview-variant-picker] fieldset").forEach(fieldset => {
      const legend = fieldset.querySelector("legend");
      if (!legend) return;

      const optionName = legend.dataset.productOption.toLowerCase();
      const values = [...fieldset.querySelectorAll("input[type='radio']")].map(i => i.value.trim());

      mainOptions.push({
        name: optionName,
        values: values
      });
    });

    /* ----------------------------------------------------------
    * 2. Collect ADDON variant fieldsets
    * ---------------------------------------------------------- */
    this.querySelectorAll("[component-variant-picker] fieldset").forEach(fieldset => {
      const legend = fieldset.querySelector("legend");
      if (!legend) return;

      addonFieldsets.push({
        name: legend.dataset.productOption.toLowerCase(),
        fieldset: fieldset
      });
    });

    /* ----------------------------------------------------------
    * 3. Hide mismatched addon options (substring match)
    * ---------------------------------------------------------- */
    addonFieldsets.forEach(addon => {
      const addonName = addon.name;

      const matchedMain = mainOptions.find(main =>
        main.name.includes(addonName)
      );

      if (!matchedMain) return; // No match → skip hiding

      const allowedValues = matchedMain.values;

      addon.fieldset.querySelectorAll(".variant-option__button-label").forEach(label => {
        const input = label.querySelector("input[type='radio']");
        const value = input?.value.trim();

        if (!allowedValues.includes(value)) {
          label.style.display = "none";
        } else {
          label.style.display = "";
        }
      });
    });

    /* ----------------------------------------------------------
    * 4. Sync ADDON click → MAIN click
    * addon input[data-id="x"] → main input#x
    * ---------------------------------------------------------- */
    this.querySelectorAll("[component-variant-picker] input[type='radio']").forEach(addonInput => {

      addonInput.addEventListener("click", () => {
        const id = addonInput.dataset.id;
        if (!id) return;

        const mainInput = this.querySelector(`[quickview-variant-picker] input#${CSS.escape(id)}`);

        if (mainInput) {
          mainInput.click(); // triggers Shopify logic + updates UI
        }
      });

    });
  }

  openCartDrawer() {
    const drawerButton = document.querySelector('.cart-drawer .header-actions__action');
    setTimeout(() => {
      drawerButton?.click();
    }, 400);
  }

  closeDrawer() {
    document.querySelector('.quickview-sidebar').classList.remove('active');
    document.querySelector('.quickview_overlay').classList.remove('active');
    document.body.classList.remove('scroll_hidden');
    this.openCartDrawer();
  }

  handleAddToCart(event) {
    event.preventDefault();

    const checked = this.querySelector('.new-variant-picker__form input[type="radio"]:checked');
    
    const variantId = checked?.dataset.variantId || this.addButton.dataset.variantId;
    const quantity = this.addButton.dataset.quantity || 1;

    this.addButton.innerHTML = 'Adding';

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
      .then(res => {
        return res.json();
      })
      .then(data => {
        this.addButton.innerHTML = 'Added to cart';
        this.emitCartUpdated();
        // this.rerenderCart();
      })
      .catch(() => {
        console.error("Failed to add item to cart.");
      })
      .finally(()=> {
        const drawer__dialog = document.querySelector('.cart-drawer__dialog');
        if(drawer__dialog) {
          drawer__dialog.classList.remove('cart-drawer--empty');
        }
        this.closeDrawer();
      })
  }

  async emitCartUpdated() {
    // dispatch signal again
    const res = await fetch('/cart.js');
    const newCart = await res.json();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: newCart }));
  }

  // rerenderCart() {
  //   const sectionId = document.querySelector('#header-component').dataset.sectionId;
  //   fetch(`/?sections=${sectionId}`)
  //     .then(res => {
  //       if (!res.ok) throw new Error(`Cart fetch failed with ${res.status}`);
  //       return res.json();
  //     })
  //     .then(data => {
  //       const cartDrawer = document.querySelector('.cart-drawer__inner');
  //       if (!cartDrawer) {
  //         return;
  //       }

  //       const tempDiv = document.createElement('div');
  //       tempDiv.innerHTML = data[sectionId];

  //       const newContent = tempDiv.querySelector('.cart-drawer__inner');
  //       if (!newContent) {
  //         return;
  //       }

  //       // Update the cart drawer content
  //       cartDrawer.innerHTML = newContent.innerHTML;
  //     })
  //     .catch(() => {
  //       console.error("Failed to update cart drawer.");
  //     })
  //     .finally(() => {
  //       this.closeDrawer();
  //     });
  // }
}

if(!customElements.get('custom-quickview-product')) {
  customElements.define('custom-quickview-product', QuickviewProduct);
}
