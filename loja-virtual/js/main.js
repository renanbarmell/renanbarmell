// Cart state
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.badge').forEach(b => {
    b.textContent = total;
    b.style.display = total > 0 ? 'flex' : 'none';
  });
}

function addToCart(id, name, brand, price, emoji) {
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, name, brand, price, emoji, qty: 1 });
  }
  saveCart();
  showToast(`${name} adicionado ao carrinho!`);
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:24px;right:24px;background:#003087;color:#fff;
    padding:12px 20px;border-radius:6px;font-size:0.88rem;font-weight:600;
    z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,0.2);
    animation:slideIn 0.3s ease;max-width:300px;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Hero slider
function initSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dots button');
  if (!slides.length) return;
  let current = 0;

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
  setInterval(() => goTo(current + 1), 5000);
}

// Qty controls on cart page
function initQtyControls() {
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.closest('.cart-item').dataset.id;
      const item = cart.find(i => i.id === itemId);
      if (!item) return;
      const delta = this.dataset.action === 'inc' ? 1 : -1;
      item.qty = Math.max(0, item.qty + delta);
      if (item.qty === 0) cart = cart.filter(i => i.id !== itemId);
      saveCart();
      renderCart();
    });
  });

  document.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const itemId = this.closest('.cart-item').dataset.id;
      cart = cart.filter(i => i.id !== itemId);
      saveCart();
      renderCart();
    });
  });
}

function renderCart() {
  const container = document.getElementById('cart-items-list');
  const summaryContainer = document.getElementById('cart-summary-panel');
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-cart">
        <div class="icon">🛒</div>
        <h3>Seu carrinho está vazio</h3>
        <p>Adicione produtos para continuar comprando</p>
        <a href="produtos.html" class="btn-continue">Ver Produtos</a>
      </div>
    `;
    if (summaryContainer) summaryContainer.style.display = 'none';
    return;
  }

  if (summaryContainer) summaryContainer.style.display = '';

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const frete = subtotal >= 299 ? 0 : 19.90;
  const total = subtotal + frete;

  container.innerHTML = `
    <div class="cart-header-row">
      <div>Produto</div><div>Preço</div><div>Qtd.</div><div>Total</div><div></div>
    </div>
    ${cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="cart-item-product">
          <div class="cart-item-img">${item.emoji}</div>
          <div>
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-brand">${item.brand}</div>
          </div>
        </div>
        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.',',')}</div>
        <div class="qty-control">
          <button class="qty-btn" data-action="dec">−</button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn" data-action="inc">+</button>
        </div>
        <div class="cart-item-total">R$ ${(item.price * item.qty).toFixed(2).replace('.',',')}</div>
        <button class="cart-item-remove" title="Remover">✕</button>
      </div>
    `).join('')}
  `;

  if (summaryContainer) {
    summaryContainer.querySelector('#summary-subtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.',',')}`;
    summaryContainer.querySelector('#summary-frete').textContent = frete === 0 ? 'Grátis' : `R$ ${frete.toFixed(2).replace('.',',')}`;
    summaryContainer.querySelector('#summary-total').textContent = `R$ ${total.toFixed(2).replace('.',',')}`;
  }

  initQtyControls();
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  initSlider();
  if (document.getElementById('cart-items-list')) renderCart();

  // Add to cart buttons
  document.querySelectorAll('[data-add-cart]').forEach(btn => {
    btn.addEventListener('click', function() {
      const { id, name, brand, price, emoji } = this.dataset;
      addToCart(id, name, brand, parseFloat(price), emoji);
    });
  });
});
