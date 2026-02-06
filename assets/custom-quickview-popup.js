// @ts-nocheck
class CustomQuickviewPopup extends HTMLElement {
  constructor() {
    super();
  }
  
  connectedCallback() {
    this.content = this.querySelector('.quickview-sidebar__content');
    this.openButtons = document.querySelectorAll('[data-upsell-opener]');
    this.closeButtons = this.querySelectorAll('[data-quickview-close], .quickview_overlay');

    this.openButtons.forEach(button => {
      button.addEventListener('click', this.handleClick.bind(this));
    });

    this.closeButtons.forEach(button => {
      button.addEventListener('click', this.closeDrawer.bind(this));
    });
  }

  disconnectedCallback() {
    this.openButtons.forEach(button => {
      button.removeEventListener('click', this.handleClick.bind(this));
    });

    this.closeButtons.forEach(button => {
      button.removeEventListener('click', this.closeDrawer.bind(this));
    });
  }

  // handleClick(event) {
  //   const button = event.currentTarget;
  //   const productHandle = button.dataset.productHandle;
  //   const url = `${window.Shopify.routes.root}products/${productHandle}?section_id=custom-quickview-product`;

  //   fetch(url)
  //     .then(response => response.text())
  //     .then(html => {
  //       const tempDiv = document.createElement('div');
  //       tempDiv.innerHTML = html;
  //       console.log(temp);

  //       const quickviewEl = tempDiv.querySelector('.quickview-product');
  //       console.log(quickviewEl);
  //       this.content.innerHTML = quickviewEl.innerHTML;
  //       this.openDrawer();
  //     })
  //     .catch(error => {
  //       console.error("Error fetching quickview product:", error);
  //     });
  // }

  handleClick(event) {
    const button = event.currentTarget;
    button?.querySelector('.loading-overlay').classList.remove('loader-hidden');
    const productHandle = button.dataset.productHandle;
    const url = `${window.Shopify.routes.root}products/${productHandle}?section_id=custom-quickview-product`;

    fetch(url)
      .then(response => response.text())
      .then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        this.content.innerHTML = tempDiv.querySelector('#shopify-section-custom-quickview-product').innerHTML;

        // Force browser to upgrade the custom element (if not auto-upgraded)
        const quickviewEl = this.content.querySelector('custom-quickview-product');
        if (quickviewEl && typeof quickviewEl.connectedCallback === 'function') {
          quickviewEl.connectedCallback();
        }

        this.openDrawer();
        button?.querySelector('.loading-overlay').classList.add('loader-hidden');
      })
      .catch(error => {
        console.error("Error fetching quickview product:", error);
      });
  }

  openDrawer() {
    this.querySelector('.quickview-sidebar').classList.add('active');
    this.querySelector('.quickview_overlay').classList.add('active');
    document.body.classList.add('scroll_hidden');
  }

  closeDrawer() {
    this.querySelector('.quickview-sidebar').classList.remove('active');
    this.querySelector('.quickview_overlay').classList.remove('active');
    document.body.classList.remove('scroll_hidden');
  }
}

if (!customElements.get('custom-quickview-popup')) {
  customElements.define('custom-quickview-popup', CustomQuickviewPopup);
}
