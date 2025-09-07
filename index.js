// https://www.reserved.com/pl/pl/jeansowa-koszula-regular-fit-850em-55j

// =========================== LOCALSTORAGE OPERATIONS =============================================

/**
 * Retrieves the cart from localStorage.
 * Returns an empty array if none exists.
 *
 * @returns {Array} The current cart.
 */
function getCart() {
  let cart = JSON.parse(window.localStorage.getItem("cart")) ?? []
  return cart
}

/**
 * Saves the cart to localStorage.
 *
 * @param {Array} cart - The cart to store.
 */
function setCart(cart) {
  window.localStorage.setItem("cart", JSON.stringify(cart))
}

/**
 * Clears the cart from localStorage.
 */
function clearCart() {
  window.localStorage.setItem("cart", JSON.stringify([]))
}

// ================================== CART OPERATIONS ======================================

/**
 * Adds a product to the cart.
 * Increases quantity if the product already exists.
 *
 * @param {Object} product - The product to add.
 * @param {string} product.name - Product name.
 * @param {string} product.price - Product price string.
 * @param {string} product.image - Product image URL.
 * @param {string} product.url - Product page URL.
 * @returns {Array} Updated cart.
 */
function addProduct(product) {
  let cart = getCart()
  let productIndex = getProductIndex(product, cart)
  if (productIndex == -1) {
    cart.push({ ...product, quantity: 1 })
  } else {
    cart[productIndex].quantity++
  }
  setCart(cart)
  renderCart()
  return cart
}

/**
 * Removes a product from the cart by index.
 *
 * @param {number} productIndex - Index of the product in the cart.
 * @returns {Array} Updated cart.
 */
function removeProduct(productIndex) {
  let cart = getCart()
  cart.splice(productIndex, 1)
  setCart(cart)
  renderCart()
  return cart
}

/**
 * Increases the quantity of a product in the cart.
 *
 * @param {number} productIndex - Index of the product in the cart.
 * @returns {Array} Updated cart.
 */
function increaseQuantity(productIndex) {
  let cart = getCart()
  if (cart[productIndex]) {
    cart[productIndex].quantity++
    setCart(cart)
    renderCart()
  }
  return cart
}

/**
 * Decreases the quantity of a product in the cart.
 * Removes the product if quantity would drop below 1.
 *
 * @param {number} productIndex - Index of the product in the cart.
 * @returns {Array} Updated cart.
 */
function decreaseQuantity(productIndex) {
  let cart = getCart()
  if (cart[productIndex]) {
    if (cart[productIndex].quantity > 1) {
      cart[productIndex].quantity--
      setCart(cart)
      renderCart()
    } else {
      removeProduct(productIndex)
    }
  }
  return cart
}

// ========================== HELPER FUNCTIONS ================================

/**
 * Calculates the total price for a product type.
 *
 * @param {number} quantity - Quantity of the product.
 * @param {number} price - Unit price of the product.
 * @returns {number} Total price.
 */
function calculateProductTotal(quantity, price) {
  return quantity * price
}

/**
 * Parses a price string into numeric value and currency.
 * Handles both spaces and non-breaking spaces.
 *
 * @param {string} price - Price string, e.g. "199,99 PLN".
 * @returns {{ numeric: number, currency: string }} Parsed price object.
 *
 * @example
 * parsePrice("199,99 PLN") // { numeric: 199.99, currency: "PLN" }
 */
function parsePrice(price) {
  let parts = price.split(" ")
  if (parts.length === 1) {
    parts = price.split("\u00A0") // non-breaking space
  }
  let numeric = parseFloat(parts[0].replace(",", "."))
  let currency = parts[1]
  return { numeric, currency }
}

// ============================ PRODUCT DATA ==============================

/**
 * Collects product data from the current page.
 *
 * @returns {{ name: string, price: string, image: string, url: string }} Product data.
 */
function getProductData() {
  let name = document.getElementsByTagName("h1")[0].innerText
  let price = document.getElementsByClassName("basic-price")[0].innerText
  let image = document.getElementsByClassName("sc-hzMMVR")[0].src
  let url = window.location.href
  return { name, price, image, url }
}

/**
 * Finds the index of a product in the cart by URL.
 *
 * @param {Object} product - Product to search for.
 * @param {Array} cart - The cart array.
 * @returns {number} Index of the product, or -1 if not found.
 */
function getProductIndex(product, cart) {
  let object = cart.find((obj) => obj.url == product.url)
  return cart.indexOf(object)
}

// ============================ RENDERING ==============================

/**
 * Renders a single product entry for the cart view.
 *
 * @param {Object} product - Product object.
 * @param {number} index - Index of the product in the cart.
 * @returns {HTMLDivElement} Rendered product element.
 */
function renderProduct(product, index) {
  let productPrice = parsePrice(product.price)
  let productTotal = calculateProductTotal(
    product.quantity,
    productPrice.numeric
  )
  let productDiv = document.createElement("div")
  productDiv.innerHTML += `
      <p>
        ${product.name} 
        <button onClick="removeProduct(${index})"}>x</button>
      </p>
      <p>Unit price: ${productPrice.numeric} ${productPrice.currency}</p>
      <p>
        Quantity: ${product.quantity}
        <button onClick="increaseQuantity(${index})"}>+</button> / <button onClick="decreaseQuantity(${index})"}>-</button>
      </p>
      <p>Total price: ${productTotal.toFixed(2)} ${productPrice.currency}</p>
      <p>[ <a href=${product.image}>image</a> / <a href=${
    product.url
  }>product</a> ]</p>
    `
  productDiv.style.cssText = `
        margin-top: 1rem;
      `
  return productDiv
}

/**
 * Renders the entire cart UI.
 * Creates the cart container if it doesn't exist.
 */
function renderCart() {
  let cartDiv = document.getElementById("cart")
  let productsDiv
  if (!cartDiv) {
    cartDiv = document.createElement("div")
    cartDiv.id = "cart"
    cartDiv.style.cssText = `
      background-color: white;
      position: fixed;
      right: 0;
      bottom: 0;
      z-index: 1000000;
      padding: 1rem;
      margin: 1rem;
      border: 1px solid black;
      border-radius: 8px;
      max-height: 90vh;
      overflow: auto;
    `
    let title = document.createElement("h2")
    title.innerText = "Cart"
    title.style.fontWeight = "bold"
    cartDiv.append(title)
    productsDiv = document.createElement("div")
    productsDiv.id = "products"
    cartDiv.append(productsDiv)
  } else {
    productsDiv = document.getElementById("products")
    if (productsDiv) productsDiv.innerHTML = ""
  }

  let cart = getCart()

  let cartTotal = 0
  let { currency } = parsePrice(cart[0].price)
  for (let i = 0; i < cart.length; i++) {
    let productDiv = renderProduct(cart[i], i)
    productsDiv.append(productDiv)
    let quantity = cart[i].quantity
    let { numeric } = parsePrice(cart[i].price)
    cartTotal += calculateProductTotal(quantity, numeric)
  }

  let cartTotalDiv = document.getElementById("cart-total")
  if (!cartTotalDiv) {
    cartTotalDiv = document.createElement("p")
    cartTotalDiv.id = "cart-total"
    cartDiv.append(cartTotalDiv)
  }
  cartTotalDiv.innerText = `Cart total: ${cartTotal.toFixed(2)} ${
    currency ?? ""
  }`
  cartTotalDiv.style.marginTop = "2rem"
  document.body.append(cartDiv)
}

// =============================== FUNCTION CALLS =========================================

addProduct(getProductData())
