// Dados do carrinho
let cart = [];
let selectedProductForModal = null;
let selectedQuantity = 1;

// Preços dos produtos
const prices = {
    "Brigadeiro": 5.00,
    "Brigadeiro Branco": 7.00,
    "Brigadeiro Ferrero Rocher": 10.00,
    "Beijinho": 10.00,
    "Brigadeiro de Morango": 15.00,
    "Brigadeiro de Ninho": 10.00,
    "Coxinha de chocolate branco": 15.00,
    "Morango do amor": 10.00,
    "Brownie": 20.00,
    "Bolo Cenoura": 25.00,
    "Vulcão Prestígio": 20.00,
    "Coca Cola": 8.50,
    "Guaraná": 8.50,
    "H2O": 15.00
};

// Elementos do DOM - Modais
const addToCardBtns = document.querySelectorAll('.add-to-card-btn');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const productModal = document.getElementById('product-modal');
const closeModalBtn = document.getElementById('closse-modal-btn');
const closeProductModalBtn = document.getElementById('close-product-modal');
const checkoutBtn = document.getElementById('checkout-btn');

// Elementos do carrinho
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const addressInput = document.getElementById('address');
const addressWarning = document.getElementById('address-warn');

// Elementos do modal de produto
const productName = document.getElementById('product-name');
const productImage = document.getElementById('product-image');
const productDescription = document.getElementById('product-description');
const productPrice = document.getElementById('product-price');
const productQtyInput = document.getElementById('product-qty');
const decreaseQtyBtn = document.getElementById('decrease-qty');
const increaseQtyBtn = document.getElementById('increase-qty');
const confirmProductBtn = document.getElementById('confirm-product');
const cancelProductBtn = document.getElementById('cancel-product');

// Event Listeners
addToCardBtns.forEach(btn => {
    btn.addEventListener('click', openProductModal);
});

cartBtn.addEventListener('click', openCartModal);
closeModalBtn.addEventListener('click', closeCartModal);
closeProductModalBtn.addEventListener('click', closeProductModal);
cancelProductBtn.addEventListener('click', closeProductModal);
checkoutBtn.addEventListener('click', checkout);
decreaseQtyBtn.addEventListener('click', decreaseQuantityModal);
increaseQtyBtn.addEventListener('click', increaseQuantityModal);
confirmProductBtn.addEventListener('click', addToCartFromModal);

// Função para abrir modal de produto
function openProductModal(e) {
    const btn = e.currentTarget;
    const productNameValue = btn.getAttribute('data-name');
    const imageUrl = btn.getAttribute('data-image');
    const price = prices[productNameValue];

    if (!price) {
        console.error(`Produto "${productNameValue}" não encontrado na lista de preços`);
        return;
    }

    selectedProductForModal = productNameValue;
    selectedQuantity = 1;

    // Preencher dados do modal
    productName.textContent = productNameValue;
    productPrice.textContent = price.toFixed(2);
    productQtyInput.value = 1;
    
    // Preencher imagem
    if (imageUrl) {
        productImage.src = imageUrl;
        console.log('Imagem carregada:', imageUrl);
    } else {
        console.warn('data-image não encontrado, tentando querySelector');
        // Fallback: tentar obter imagem do card
        const productCard = btn.closest('.flex');
        if (productCard) {
            const img = productCard.querySelector('img');
            if (img && img.src) {
                productImage.src = img.src;
                productImage.alt = img.alt;
                console.log('Imagem carregada (fallback):', img.src);
            }
        }
    }
    
    // Tentar obter descrição
    const productCard = btn.closest('.flex');
    if (productCard) {
        const description = productCard.querySelector('p.text-sm');
        if (description) {
            productDescription.textContent = description.textContent;
        } else {
            productDescription.textContent = '';
        }
    }

    // Abrir modal
    productModal.classList.remove('hidden');
    productModal.classList.add('flex');
}

// Função para fechar modal de produto
function closeProductModal() {
    productModal.classList.add('hidden');
    productModal.classList.remove('flex');
    selectedProductForModal = null;
    selectedQuantity = 1;
}

// Aumentar quantidade no modal
function increaseQuantityModal() {
    selectedQuantity++;
    productQtyInput.value = selectedQuantity;
}

// Diminuir quantidade no modal
function decreaseQuantityModal() {
    if (selectedQuantity > 1) {
        selectedQuantity--;
        productQtyInput.value = selectedQuantity;
    }
}

// Adicionar ao carrinho a partir do modal
function addToCartFromModal() {
    if (!selectedProductForModal) return;

    const price = prices[selectedProductForModal];
    const quantity = parseInt(productQtyInput.value) || 1;

    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.name === selectedProductForModal);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: selectedProductForModal,
            price: price,
            quantity: quantity
        });
    }

    updateCart();
    showNotification(`${quantity}x ${selectedProductForModal} adicionado ao carrinho!`);
    closeProductModal();
}

// Função para adicionar item ao carrinho (mantida para compatibilidade)
function addToCart(e) {
    const productName = e.currentTarget.getAttribute('data-name');
    const price = prices[productName];

    if (!price) {
        console.error(`Produto "${productName}" não encontrado na lista de preços`);
        return;
    }

    // Verificar se o produto já está no carrinho
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`${productName} adicionado ao carrinho!`);
}

// Função para atualizar o carrinho
function updateCart() {
    // Atualizar contagem
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;

    // Renderizar itens do carrinho
    renderCartItems();

    // Calcular total
    calculateTotal();

    // Salvar carrinho no localStorage
    localStorage.setItem('candy-cart', JSON.stringify(cart));
}

// Função para renderizar itens do carrinho
function renderCartItems() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="text-center py-4 text-gray-500">Seu carrinho está vazio</p>';
        return;
    }

    cart.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'border-b py-2 flex justify-between items-center';
        itemElement.innerHTML = `
            <div>
                <p class="font-semibold">${item.name}</p>
                <p class="text-sm text-gray-600">R$ ${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="flex items-center gap-2">
                <p class="font-bold">R$ ${(item.price * item.quantity).toFixed(2)}</p>
                <div class="flex gap-1">
                    <button onclick="decreaseQuantity(${index})" class="bg-yellow-500 px-2 py-1 rounded text-white text-sm hover:bg-yellow-600">-</button>
                    <button onclick="increaseQuantity(${index})" class="bg-blue-500 px-2 py-1 rounded text-white text-sm hover:bg-blue-600">+</button>
                    <button onclick="removeFromCart(${index})" class="bg-red-500 px-2 py-1 rounded text-white text-sm hover:bg-red-600">Remover</button>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });
}

// Função para calcular total
function calculateTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalSpan.textContent = total.toFixed(2);
}

// Função para aumentar quantidade
function increaseQuantity(index) {
    cart[index].quantity++;
    updateCart();
}

// Função para diminuir quantidade
function decreaseQuantity(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
    } else {
        removeFromCart(index);
    }
    updateCart();
}

// Função para remover item do carrinho
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

// Função para abrir modal do carrinho
function openCartModal() {
    cartModal.classList.remove('hidden');
    cartModal.classList.add('flex');
    addressInput.value = '';
    addressWarning.classList.add('hidden');
}

// Função para fechar modal do carrinho
function closeCartModal() {
    cartModal.classList.add('hidden');
    cartModal.classList.remove('flex');
}

// Função para validar endereço
function validateAddress() {
    const address = addressInput.value.trim();

    if (address.length < 10) {
        addressWarning.classList.remove('hidden');
        return false;
    }

    addressWarning.classList.add('hidden');
    return true;
}

// Função para finalizar pedido
function checkout() {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }

    if (!validateAddress()) {
        return;
    }

    const address = addressInput.value.trim();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Criar mensagem para WhatsApp
    let mensagem = `Olá! Gostaria de fazer um pedido:\n\n`;

    cart.forEach(item => {
        mensagem += `${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    mensagem += `\nTotal: R$ ${total.toFixed(2)}\n`;
    mensagem += `Endereço de entrega: ${address}`;

    // Números de WhatsApp (você deve colocar seu número aqui)
    const phoneNumber = '5585987654321'; // Substitua pelo seu número

    // Criar link do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(mensagem)}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');

    // Limpar carrinho
    cart = [];
    updateCart();
    closeCartModal();

    showNotification('Pedido enviado com sucesso!');
}

// Função para mostrar notificação
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-pulse';
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Carregar carrinho do localStorage ao iniciar
function loadCart() {
    const savedCart = localStorage.getItem('candy-cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

// Fechar modal do carrinho ao clicar fora dele
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeCartModal();
    }
});

// Fechar modal de produto ao clicar fora dele
productModal.addEventListener('click', (e) => {
    if (e.target === productModal) {
        closeProductModal();
    }
});

// Atualizar quantidade ao digitar no input
productQtyInput.addEventListener('change', (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value < 1) {
        productQtyInput.value = 1;
        selectedQuantity = 1;
    } else {
        selectedQuantity = value;
    }
});

// Validar endereço em tempo real
addressInput.addEventListener('blur', validateAddress);

// Inicializar
// loadCart(); // Desabilitado para que o carrinho sempre comece vazio
