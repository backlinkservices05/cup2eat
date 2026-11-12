document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("cup2eat");
  if (!root) return;

  // Demo products and prices. Replace these with the client's approved catalogue.
  const products = [
    {id:1,name:"Classic Chocolate",category:"Chocolate",price:149,image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600",flavours:["Classic","Dark Chocolate","Hazelnut"]},
    {id:2,name:"Premium Coffee",category:"Coffee",price:179,image:"https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600",flavours:["Classic Coffee","Mocha","Vanilla"]},
    {id:3,name:"Chocolate Delight",category:"Chocolate",price:199,image:"https://images.unsplash.com/photo-1542990253-0b8be7ec5a6b?w=600",flavours:["Milk Chocolate","Dark","Caramel"]},
    {id:4,name:"Special Mocha",category:"Special",price:219,image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",flavours:["Mocha","Hazelnut","Caramel"]},
    {id:5,name:"Cold Coffee",category:"Coffee",price:159,image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600",flavours:["Classic","Vanilla","Caramel"]},
    {id:6,name:"Chocolate Shake",category:"Chocolate",price:189,image:"https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600",flavours:["Chocolate","Oreo","Brownie"]},
    {id:7,name:"Caramel Coffee",category:"Special",price:199,image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600",flavours:["Caramel","Vanilla","Mocha"]},
    {id:8,name:"Dark Chocolate",category:"Chocolate",price:229,image:"https://images.unsplash.com/photo-1511381939415-e44015466834?w=600",flavours:["Dark","Extra Dark","Classic"]}
  ];

  let cart = [];
  try { cart = JSON.parse(localStorage.getItem("c2_cart") || "[]"); } catch(e) { cart = []; }

  const grid = root.querySelector("#productGrid");
  const money = n => Number(n).toLocaleString("en-IN");

  function displayProducts(category="All") {
    const list = category === "All" ? products : products.filter(p => p.category === category);
    grid.innerHTML = list.map(p => `
      <article class="product-card">
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        <div class="product-info">
          <h3>${p.name}</h3><p>Premium quality delicious drink.</p>
          <div class="price">₹${money(p.price)}</div>
          <select class="flavour" id="flavour-${p.id}" aria-label="Choose ${p.name} flavour">
            ${p.flavours.map(f => `<option value="${f}">${f}</option>`).join("")}
          </select>
          <button class="add-btn" data-id="${p.id}">Add to Cart +</button>
        </div>
      </article>`).join("");
  }

  root.querySelectorAll(".filters button").forEach(button => {
    button.addEventListener("click", () => {
      root.querySelectorAll(".filters button").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      displayProducts(button.dataset.filter);
    });
  });

  grid.addEventListener("click", e => {
    const button = e.target.closest(".add-btn");
    if (!button) return;
    const id = Number(button.dataset.id);
    const product = products.find(p => p.id === id);
    const flavour = root.querySelector(`#flavour-${id}`).value;
    const existing = cart.find(item => item.id === id && item.flavour === flavour);
    if (existing) existing.qty++;
    else cart.push({id, name:product.name, price:product.price, image:product.image, flavour, qty:1});
    saveCart();
    button.textContent = "Added ✓";
    setTimeout(() => button.textContent = "Add to Cart +", 900);
  });

  function saveCart() {
    try { localStorage.setItem("c2_cart", JSON.stringify(cart)); } catch(e) {}
    updateCart();
  }

  function updateCart() {
    root.querySelector("#cartCount").textContent = cart.reduce((sum,item) => sum + item.qty, 0);
    const total = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
    root.querySelector("#cartTotal").textContent = money(total);
    const container = root.querySelector("#cartItems");
    if (!cart.length) { container.innerHTML = "<p>Your cart is empty.</p>"; return; }
    container.innerHTML = cart.map((item,index) => `
      <div class="cart-item">
        <img src="${item.image}" alt="">
        <div><h4>${item.name}</h4><small>${item.flavour}</small><p>₹${money(item.price)}</p>
          <div class="qty">
            <button data-action="minus" data-index="${index}">−</button><span>${item.qty}</span>
            <button data-action="plus" data-index="${index}">+</button>
            <button class="remove" data-action="remove" data-index="${index}">Remove</button>
          </div>
        </div>
      </div>`).join("");
  }

  root.querySelector("#cartItems").addEventListener("click", e => {
    const button = e.target.closest("[data-action]");
    if (!button) return;
    const index = Number(button.dataset.index);
    if (button.dataset.action === "plus") cart[index].qty++;
    if (button.dataset.action === "minus") { cart[index].qty--; if (cart[index].qty <= 0) cart.splice(index,1); }
    if (button.dataset.action === "remove") cart.splice(index,1);
    saveCart();
  });

  const drawer = root.querySelector("#cartDrawer");
  const overlay = root.querySelector("#cartOverlay");
  const openCart = () => { drawer.classList.add("open"); overlay.classList.add("show"); };
  const closeCart = () => { drawer.classList.remove("open"); overlay.classList.remove("show"); };
  root.querySelector("#cartBtn").addEventListener("click", openCart);
  root.querySelector("#closeCart").addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCart);

  root.querySelector("#checkoutBtn").addEventListener("click", () => {
    if (!cart.length) { alert("Your cart is empty!"); return; }
    let message = "Hello CUP2EAT! I would like to place an order:%0A%0A";
    cart.forEach(item => {
      message += encodeURIComponent(`${item.name} (${item.flavour}) x ${item.qty} = ₹${item.price * item.qty}\n`);
    });
    const total = cart.reduce((sum,item) => sum + item.price * item.qty, 0);
    message += encodeURIComponent(`\nTotal Amount: ₹${total}\nPlease share payment and delivery details.`);
    // Replace this demo WhatsApp number with the client's confirmed business number.
    window.open("https://wa.me/919818192575?text=" + message, "_blank", "noopener");
  });

  const modal = root.querySelector("#loginModal");
  root.querySelector("#loginBtn").addEventListener("click", () => modal.classList.add("show"));
  root.querySelector("#closeLogin").addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("show"); });
  root.querySelector("#loginSubmit").addEventListener("click", () => {
    const name = root.querySelector("#customerName").value.trim();
    const phone = root.querySelector("#customerPhone").value.trim();
    const message = root.querySelector("#loginMessage");
    if (!name || !/^[6-9]\d{9}$/.test(phone)) {
      message.textContent = "Please enter your name and a valid 10-digit Indian mobile number.";
      return;
    }
    message.textContent = "Demo only: customer account creation needs secure WordPress/WooCommerce integration.";
  });

  displayProducts();
  updateCart();
});