// Dados do carrinho
let cart = [];

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

// Elementos do DOM
const addToCardBtns = document.querySelectorAll('.add-to-card-btn');
const cartBtn = document.getElementById('cart-btn');
const cartModal = document.querySelector('.bg-black\\/50');
const closeModalBtn = document.getElementById('closse-modal-btn');
const checkoutBtn = document.getElementById('checkout-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountSpan = document.getElementById('cart-count');
const cartTotalSpan = document.getElementById('cart-total');
const addressInput = document.getElementById('address');
const addressWarning = document.getElementById('address-warn');

// Event Listeners
addToCardBtns.forEach(btn => {
    btn.addEventListener('click', addToCart);
});

cartBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
checkoutBtn.addEventListener('click', checkout);

// Função para adicionar item ao carrinho
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

// Função para abrir modal
function openModal() {
    cartModal.classList.remove('hidden');
    cartModal.classList.add('flex');
    addressInput.value = '';
    addressWarning.classList.add('hidden');
}

// Função para fechar modal
function closeModal() {
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
    closeModal();

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

// Fechar modal ao clicar fora dele
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        closeModal();
    }
});

// Validar endereço em tempo real
addressInput.addEventListener('blur', validateAddress);

// Inicializar
loadCart();
