// order.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Correctly reference the global variable defined by the inline script ---
    const orderId = currentOrderId;
    // Helper function to get display name from enum values
    const getStatusDisplayName = (statusName) => {
        const status = orderItemStatusEnumValues.find(s => s.name === statusName);
        return status ? status.displayName : statusName;
    };
    // --- DOM elements ---
    const addOrderItemBtn = document.getElementById('addOrderItemBtn');
    const menuItemsSelectionContainer = document.getElementById('menuItemsSelectionContainer');
    const backToOrderBtn = document.getElementById('backToOrderBtn');
    const dynamicMenuItemsGrid = document.getElementById('dynamicMenuItemsGrid');
    const categoryFilterButtonsContainer = document.querySelector('.category-filter-buttons');
    const menuItemSearchInput = document.getElementById('menuItemSearch');

    const addOrderItemModal = document.getElementById('addOrderItemModal');
    const closeAddOrderItemModalBtn = document.getElementById('closeAddOrderItemModalBtn');
    const cancelAddOrderItemModalBtn = document.getElementById('cancelAddOrderItemModalBtn');
    const addOrderItemForm = document.getElementById('addOrderItemForm');
    const modalMenuItemId = document.getElementById('modalMenuItemId');
    const modalMenuItemName = addOrderItemModal.querySelector('.modal-menu-item-name');
    const modalMenuItemPrice = addOrderItemModal.querySelector('.modal-menu-item-price');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const specialInstructionsInput = document.getElementById('specialInstructions');

    let activeCategory = 'ALL';
    let searchQuery = '';
    let stompClient = null;

    // --- WebSocket Setup ---
    function connectToWebSocket() {
        // Use a relative path to connect to the /ws endpoint defined in your config
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);

            // Subscribe to the specific order's topic to receive updates
            stompClient.subscribe(`/topic/orders/${orderId}`, (message) => {
                const newOrderItem = JSON.parse(message.body);
                console.log('Received new order item:', newOrderItem);
                addOrderItemToPage(newOrderItem);
            });
        }, (error) => {
            console.error('WebSocket connection error: ' + error);
        });
    }

    // Call the function to connect when the page loads
    connectToWebSocket();

    // Function to dynamically add a new item's card to the page
    const addOrderItemToPage = (newOrderItem) => {
        const orderItemsSection = document.querySelector('.order-items-section');
        if (!orderItemsSection) {
            return;
        }

        const noItemsMessage = orderItemsSection.querySelector('.no-items-message');
        if (noItemsMessage) {
            noItemsMessage.remove();
        }

        let orderItemsList = orderItemsSection.querySelector('.order-items-list');

        if (!orderItemsList) {
            orderItemsList = document.createElement('div');
            orderItemsList.classList.add('order-items-list');
            orderItemsSection.appendChild(orderItemsList);
        }

        const statusName = typeof newOrderItem.orderItemStatus === 'string'
            ? newOrderItem.orderItemStatus
            : newOrderItem.orderItemStatus.name;

        const statusDisplayName = getStatusDisplayName(statusName);

        const newCard = document.createElement('div');
        newCard.classList.add('order-item-card');
        newCard.innerHTML = `
            <div class="item-info">
                <span class="item-quantity">${newOrderItem.quantity}</span> x
                <span class="item-name">${newOrderItem.menuItem.name}</span>
                <span class="item-price">${newOrderItem.menuItem.price.toFixed(2)} лв.</span>
            </div>
            <div class="item-status status-${statusName}">${statusDisplayName}</div>
            ${newOrderItem.specialInstructions ? `<p class="item-instructions">${newOrderItem.specialInstructions}</p>` : ''}
            <div class="item-actions">
                <div ${statusName === 'WAITING' ? '' : 'style="display:none;"'}>
                    <form action="/table/order/approve-item" method="post">
                        <input type="hidden" name="orderId" value="${newOrderItem.order.id}">
                        <input type="hidden" name="orderItemId" value="${newOrderItem.id}">
                        <button type="submit" class="btn btn-approve">
                            <i class="fas fa-check"></i> Одобри
                        </button>
                    </form>
                </div>
            </div>
        `;
        orderItemsList.appendChild(newCard);
    };


    // Function to apply filters by showing/hiding existing elements
    const applyFilters = () => {
        const menuCards = dynamicMenuItemsGrid.querySelectorAll('.menu-item-card-dynamic');
        let anyVisible = false;
        const normalizedSearchQuery = searchQuery.toLowerCase().trim();

        menuCards.forEach(card => {
            const category = card.dataset.category;
            const itemName = card.dataset.itemName ? card.dataset.itemName.toLowerCase() : '';
            const categoryMatch = (activeCategory === 'ALL' || category === activeCategory);
            const searchMatch = (normalizedSearchQuery === '' || itemName.includes(normalizedSearchQuery));

            if (categoryMatch && searchMatch) {
                card.style.display = '';
                anyVisible = true;
            } else {
                card.style.display = 'none';
            }
        });

        let noItemsMessage = document.getElementById('noMenuItemsMessage');
        if (!anyVisible) {
            if (!noItemsMessage) {
                const p = document.createElement('p');
                p.id = 'noMenuItemsMessage';
                p.classList.add('no-items-message');
                dynamicMenuItemsGrid.appendChild(p);
                noItemsMessage = p;
            }
            noItemsMessage.style.display = '';
            noItemsMessage.textContent = 'Няма намерени елементи от менюто с текущите филтри.';
        } else {
            if (noItemsMessage) {
                noItemsMessage.style.display = 'none';
            }
        }
    };


    // --- Event Listeners ---

    addOrderItemBtn.addEventListener('click', () => {
        document.getElementById('orderSummaryCard').style.display = 'none';
        document.getElementById('orderItemsSection').style.display = 'none';
        menuItemsSelectionContainer.style.display = 'flex';

        categoryFilterButtonsContainer.querySelector('[data-category="ALL"]').click();
        menuItemSearchInput.value = '';
        searchQuery = '';
        applyFilters();
    });

    backToOrderBtn.addEventListener('click', () => {
        menuItemsSelectionContainer.style.display = 'none';
        document.getElementById('orderSummaryCard').style.display = 'block';
        document.getElementById('orderItemsSection').style.display = 'block';
    });

    categoryFilterButtonsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.category-btn');
        if (target && target.dataset.category) {
            categoryFilterButtonsContainer.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            target.classList.add('active');
            activeCategory = target.dataset.category;
            applyFilters();
        }
    });

    menuItemSearchInput.addEventListener('input', (event) => {
        searchQuery = event.target.value;
        applyFilters();
    });

    closeAddOrderItemModalBtn.addEventListener('click', () => {
        addOrderItemModal.classList.remove('active');
    });

    cancelAddOrderItemModalBtn.addEventListener('click', () => {
        addOrderItemModal.classList.remove('active');
    });

    dynamicMenuItemsGrid.addEventListener('click', (event) => {
        const addButton = event.target.closest('.btn-add-to-order');
        if (addButton) {
            const menuItemCard = addButton.closest('.menu-item-card-dynamic');
            if (menuItemCard) {
                const itemId = menuItemCard.dataset.itemId;
                const itemName = menuItemCard.dataset.itemName;
                const itemPrice = parseFloat(menuItemCard.dataset.itemPrice);

                modalMenuItemId.value = itemId;
                modalMenuItemName.textContent = itemName;
                modalMenuItemPrice.textContent = `${itemPrice.toFixed(2)} лв.`;
                itemQuantityInput.value = 1;
                specialInstructionsInput.value = '';
                addOrderItemModal.classList.add('active');
            }
        }
    });

    // --- NEW: Standard HTTP POST form submission handler (AJAX) ---
    addOrderItemForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Stop the default form submission (prevents page reload)

        const formData = new FormData(addOrderItemForm);

        try {
            const response = await fetch(addOrderItemForm.action, {
                method: 'POST',
                body: new URLSearchParams(formData),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Неуспешна заявка за добавяне на артикул: ${errorText}`);
            }

            addOrderItemModal.classList.remove('active');
            addOrderItemForm.reset();

        } catch (error) {
            console.error("Error adding order item:", error);
            alert('Възникна грешка: ' + error.message);
        }
    });

    // On page load, hide the menu selection container
    menuItemsSelectionContainer.style.display = 'none';
});