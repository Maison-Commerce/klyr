// @ts-nocheck
let productId, variantId;

// Get product line ID
function getProductLineId(productId) {
  return fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      const productLine = cart.items.find(item => item.product_id === parseInt(productId));
      return productLine ? productLine.id : null;
    })
    .catch(error => {
      console.error('Error fetching cart:', error);
      return null;
    });
}

// Check if the product already exists
function eligibleProduct(productId) {
  return getProductLineId(productId).then(lineId => lineId === null);
}

// Update cart drawer
function updateCartDrawer() {
  const sectionId = document.querySelector('#header-component').dataset.sectionId;
  fetch(`/?sections=${sectionId}`)
    .then(res => {
      if (!res.ok) throw new Error(`Cart fetch failed with ${res.status}`);
      return res.json();
    })
    .then(data => {
      const cartDrawer = document.querySelector('.cart-drawer__inner');
      if (!cartDrawer) return;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = data[sectionId];

      const newContent = tempDiv.querySelector('.cart-drawer__inner');
      if (!newContent) return;

      cartDrawer.innerHTML = newContent.innerHTML;
    })
    .then(() => {
      console.log("cart drawer updated");
    })
    .catch(error => console.error('Error updating cart drawer:', error));
}

// Add product to cart
function addProductToCart(variantId) {
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [{ id: variantId, quantity: 1 }],
    }),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to add product to cart');
      console.log("product added to cart, ekhon cart update request pathano hocche");
      updateCartDrawer();
    })
    .then(() => {})
    .catch(error => console.error('Error adding product to cart:', error));
}

// Remove product from cart 
function removeProductFromCart(productLineId) {
  fetch('/cart/update.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates: { [productLineId]: 0 } }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Failed to remove product from cart');
      console.log("product removed from cart, ekhon cart update request pathano hocche");
      updateCartDrawer();
    })
    .then(() => {console.log("product removed");})
    .catch(error => console.error('Error removing product from cart:', error));
}

// Update cart total logic
function updateCartTotal() {
  return fetch('/cart.js')
    .then(res => res.json())
    .then(cart => {
      const cartValue = cart.total_price / 100; // Convert from cents to currency
      const threshold = document.querySelector('[data-free-product-threshold]').getAttribute('data-free-product-threshold') || 75;
      console.log("cart value is", cartValue, "and threshold is", threshold);
      if (cartValue >= parseInt(threshold)) {
        console.log("product add kora jabe");
        eligibleProduct(productId).then(isEligible => {
          console.log("check kora hocche already ase kina", isEligible);
          if (isEligible) {
            console.log("free product nai, tai add korar request pathano hocche");
            addProductToCart(variantId);
          }
        });
      }
      else {
        console.log("cart value kom, product thakle remove kora jabe");
        getProductLineId(productId).then(lineId => {
          console.log("line id check kora hocche", lineId);
          if (lineId) {
            console.log("free product ase, tai remove korar request pathano hocche");
            document.querySelector(`[data-id="${lineId}"]`)?.querySelector(`.loading-overlay`)?.classList.remove('hidden');
            removeProductFromCart(lineId);
          }
        });
      }
    })
    .catch(error => console.error('Error updating cart total:', error));
}

// Main function to handle cart updates
function handleCartUpdate() {
  updateCartTotal().catch(error => console.error('Error handling cart update:', error));
}

document.addEventListener('DOMContentLoaded', () => {
  // Retrieve productId and variantId from a specific element
  const freeProduct = document.querySelector('[data-free-product-id]');
  if (freeProduct) {
    productId = freeProduct.getAttribute('data-free-product-id');
    variantId = freeProduct.getAttribute('data-free-variant-id');
    console.log(productId, variantId);
  }
  // Perform the initial cart update check
  handleCartUpdate();

  const parentContainer = document.querySelector('.cart-drawer');
  if (parentContainer) {
    // Observe changes in the parent container's DOM
    const observer = new MutationObserver(() => {
      handleCartUpdate(); // Rebind logic when changes are detected
    });
    observer.observe(parentContainer, { childList: true, subtree: true });
  }
});
