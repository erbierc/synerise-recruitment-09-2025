// https://www.reserved.com/pl/pl/jeansowa-koszula-regular-fit-850em-55j

// =========================== LOCALSTORAGE OPERATIONS =============================================

function getCart() {
  let cart = JSON.parse(window.localStorage.getItem("cart")) ?? []
  return cart
}

function setCart(cart) {
  window.localStorage.setItem("cart", JSON.stringify(cart))
}

function clearCart() {
  window.localStorage.setItem("cart", JSON.stringify([]))
}

// ================================== CART OPERATIONS ======================================

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

function removeProduct(productIndex) {
  let cart = getCart()
  cart.splice(productIndex, 1)
  setCart(cart)
  renderCart()
  return cart
}

function increaseQuantity(productIndex) {
  let cart = getCart()
  if (cart[productIndex]) {
    cart[productIndex].quantity++
    setCart(cart)
    renderCart()
  }
  return cart
}

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

function calculateProductTotal(quantity, price) {
  return quantity * price
}

function parseCurrency(price) {
  let parts = price.split(" ")
  if (parts.length === 1) {
    parts = price.split("\u00A0") // non-breaking space
  }
  return parts[1]
}

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

function getProductData() {
  // according to best SEO practices, product name should be the only h1 element
  let name = document.getElementsByTagName("h1")[0].innerText
  // get the rest of the product data by using class names
  let price = document.getElementsByClassName("basic-price")[0].innerText
  let image = document.getElementsByClassName("sc-hzMMVR")[0].src
  let url = window.location.href
  return { name, price, image, url }
}

function getProductIndex(product, cart) {
  // find product via url, we don't know the quantity
  let object = cart.find((obj) => obj.url == product.url)
  return cart.indexOf(object)
}

// ============================ RENDERING ==============================

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
      max-height: 98vh;
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
