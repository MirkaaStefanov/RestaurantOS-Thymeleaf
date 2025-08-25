document.addEventListener('DOMContentLoaded', () => {

    const orderId = currentOrderId;
    const getStatusDisplayName = (statusName) => {
        const status = orderItemStatusEnumValues.find(s => s.name === statusName);
        return status ? status.displayName : statusName;
    };

    const menuItemsSelectionContainer = document.getElementById('menuItemsSelectionContainer');
    const orderView = document.getElementById('orderView');
    const menuBtn = document.getElementById('menuBtn');
    const orderBtn = document.getElementById('orderBtn');
    const payBtn = document.getElementById('payBtn');

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
    const orderItemsList = document.getElementById('orderItemsList');
    const filterButtonsContainer = document.querySelector('.filter-buttons-container');

    let activeCategory = 'ALL';
    let searchQuery = '';
    let activeStatusFilter = 'all';

    const allViews = [menuItemsSelectionContainer, orderView];
    const allFooterBtns = [menuBtn, orderBtn, payBtn];

    // Function to handle view switching and button activation
    const showView = (viewToShow, buttonToActivate) => {
        allViews.forEach(view => {
            view.classList.remove('active-view');
            view.classList.add('hidden-view');
        });
        viewToShow.classList.remove('hidden-view');
        viewToShow.classList.add('active-view');

        allFooterBtns.forEach(btn => btn.classList.remove('active'));
        if (buttonToActivate) {
            buttonToActivate.classList.add('active');
        }
    };

    function connectToWebSocket() {
        const socket = new SockJS('/ws');
        const stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Connected: ' + frame);

            stompClient.subscribe(`/topic/orders/${orderId}`, (message) => {
                const updatedItem = JSON.parse(message.body);
                console.log('Received updated order item:', updatedItem);

                const existingCard = document.querySelector(`.order-item-card[data-item-id="${updatedItem.id}"]`);
                if (existingCard) {
                    updateOrderItemOnPage(existingCard, updatedItem);
                } else {
                    addOrderItemToPage(updatedItem);
                }
                applyStatusFilter();
            });
        }, (error) => {
            console.error('WebSocket connection error: ' + error);
        });
    }

    connectToWebSocket();

    const applyStatusFilter = () => {
        const items = orderItemsList.querySelectorAll('.order-item-card');
        const noItemsMessage = orderItemsList.querySelector('.no-items-message');
        let anyVisible = false;

        items.forEach(card => {
            const status = card.dataset.status;
            const isWaiting = status === 'WAITING';
            const isOthers = status !== 'WAITING';

            if (activeStatusFilter === 'all' || (activeStatusFilter === 'waiting' && isWaiting) || (activeStatusFilter === 'others' && isOthers)) {
                card.style.display = '';
                anyVisible = true;
            } else {
                card.style.display = 'none';
            }
        });

        if (noItemsMessage) {
            if (anyVisible) {
                noItemsMessage.style.display = 'none';
            } else {
                noItemsMessage.style.display = 'block';
                noItemsMessage.textContent = 'Няма намерени артикули с този филтър.';
            }
        }
    };

    const addOrderItemToPage = (newOrderItem) => {
        const noItemsMessage = orderItemsList.querySelector('.no-items-message');
        if (noItemsMessage) {
            noItemsMessage.remove();
        }

        const statusName = typeof newOrderItem.orderItemStatus === 'string' ? newOrderItem.orderItemStatus : newOrderItem.orderItemStatus.name;
        const statusDisplayName = getStatusDisplayName(statusName);

        const newCard = document.createElement('div');
        newCard.classList.add('order-item-card');
        newCard.dataset.itemId = newOrderItem.id;
        newCard.dataset.status = statusName;
        newCard.innerHTML = `
            <div class="item-info">
                <span class="item-quantity">${newOrderItem.quantity}</span> x
                <span class="item-name">${newOrderItem.name}</span>
                <span class="item-price">${newOrderItem.menuItem.price.toFixed(2)} лв.</span>
            </div>
            <div class="item-status status-${statusName}">${statusDisplayName}</div>
            ${newOrderItem.specialInstructions ? `<p class="item-instructions">${newOrderItem.specialInstructions}</p>` : ''}
            <div class="item-actions">
                ${statusName === 'WAITING' || statusName === 'PENDING' ? `<button type="button" class="btn btn-approve" data-order-item-id="${newOrderItem.id}"><i class="fas fa-check"></i> Одобри</button>` : ''}
                ${statusName === 'PREPARING' ? `<button type="button" class="btn btn-complete" data-order-item-id="${newOrderItem.id}"><i class="fas fa-check-double"></i> Готово</button>` : ''}
            </div>
        `;
        orderItemsList.appendChild(newCard);
    };

    const updateOrderItemOnPage = (itemCard, updatedItem) => {
        const statusName = typeof updatedItem.orderItemStatus === 'string' ? updatedItem.orderItemStatus : updatedItem.orderItemStatus.name;
        const statusDisplayName = getStatusDisplayName(statusName);

        itemCard.dataset.status = statusName;
        const statusDiv = itemCard.querySelector('.item-status');
        statusDiv.textContent = statusDisplayName;
        statusDiv.className = `item-status status-${statusName}`;
        const actionsDiv = itemCard.querySelector('.item-actions');
        actionsDiv.innerHTML = '';
        if (statusName === 'IN_PROGRESS') {
            actionsDiv.innerHTML = `
                <button type="button" class="btn btn-complete">
                    <i class="fas fa-check-double"></i> Готово
                </button>
            `;
        }
    };

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

        let noMenuItemsMessage = document.getElementById('noMenuItemsMessage');
        if (!anyVisible) {
            if (!noMenuItemsMessage) {
                const p = document.createElement('p');
                p.id = 'noMenuItemsMessage';
                p.classList.add('no-items-message');
                dynamicMenuItemsGrid.appendChild(p);
                noMenuItemsMessage = p;
            }
            noMenuItemsMessage.style.display = '';
            noMenuItemsMessage.textContent = 'Няма намерени елементи от менюто с текущите филтри.';
        } else {
            if (noMenuItemsMessage) {
                noMenuItemsMessage.style.display = 'none';
            }
        }
    };

    // Event listeners for the three footer buttons
    menuBtn.addEventListener('click', () => {
        showView(menuItemsSelectionContainer, menuBtn);
    });

    orderBtn.addEventListener('click', () => {
        showView(orderView, orderBtn);
        applyStatusFilter();
    });

    payBtn.addEventListener('click', () => {
        showView(menuItemsSelectionContainer, payBtn);
        // You would typically handle payment logic here
        console.log("Pay button clicked. Implement payment logic.");
    });

    filterButtonsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.btn-filter');
        if (target) {
            filterButtonsContainer.querySelectorAll('.btn-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            target.classList.add('active');
            activeStatusFilter = target.dataset.filter;
            applyStatusFilter();
        }
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

    // Event delegation for the "add to order" button
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

    addOrderItemForm.addEventListener('submit', async (event) => {
        event.preventDefault();

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

    document.addEventListener('click', async (event) => {
        const approveButton = event.target.closest('.btn-approve');
        if (approveButton) {
            const orderItemId = approveButton.dataset.orderItemId;
            try {
                const response = await fetch(`/table/order/accept/${orderItemId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to accept order item: ${errorText}`);
                }
                console.log(`Order item ${orderItemId} accepted.`);
            } catch (error) {
                console.error('Error accepting order item:', error);
                alert('An error occurred while accepting the order item.');
            }
        }
    });
});