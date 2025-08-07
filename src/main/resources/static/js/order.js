// order.js

document.addEventListener('DOMContentLoaded', () => {

    const orderId = currentOrderId;
    const getStatusDisplayName = (statusName) => {
        // Find the status object by its name and return its displayName
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

    const orderItemsList = document.getElementById('orderItemsList');
    const filterButtonsContainer = document.querySelector('.filter-buttons-container');

    let activeCategory = 'ALL';
    let searchQuery = '';
    let activeStatusFilter = 'all';

    // --- WebSocket Setup ---
     function connectToWebSocket() {
            const socket = new SockJS('/ws');
            stompClient = Stomp.over(socket);

            stompClient.connect({}, (frame) => {
                console.log('Connected: ' + frame);

                stompClient.subscribe(`/topic/orders/${orderId}`, (message) => {
                    const updatedItem = JSON.parse(message.body);
                    console.log('Received updated order item:', updatedItem);

                    const existingCard = document.querySelector(`.order-item-card[data-item-id="${updatedItem.id}"]`);
                    if (existingCard) {
                        updateOrderItemOnPage(existingCard, updatedItem);
                    } else {
                        const statusName = typeof updatedItem.orderItemStatus === 'string'
                            ? updatedItem.orderItemStatus
                            : updatedItem.orderItemStatus.name;
                        addOrderItemToPage(updatedItem, statusName);
                    }

                    // Re-apply the filter to ensure the new/updated item is shown/hidden correctly
                    applyStatusFilter();
                });
            }, (error) => {
                console.error('WebSocket connection error: ' + error);
            });
        }

    connectToWebSocket();

    const applyStatusFilter = () => {
            const items = orderItemsList.querySelectorAll('.order-item-card');
            const noItemsMessage = document.getElementById('noItemsMessage');
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
        // This line correctly finds and removes the 'no items' message if it exists.
        const noItemsMessage = orderItemsList.querySelector('.no-items-message');
        if (noItemsMessage) {
            noItemsMessage.remove();
        }

        const statusName = typeof newOrderItem.orderItemStatus === 'string'
            ? newOrderItem.orderItemStatus
            : newOrderItem.orderItemStatus.name;
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
          const statusName = typeof updatedItem.orderItemStatus === 'string'
              ? updatedItem.orderItemStatus
              : updatedItem.orderItemStatus.name;
          const statusDisplayName = getStatusDisplayName(statusName);

           // Update the card's data-status attribute
           itemCard.dataset.status = statusName;

           // Update the status and class
           const statusDiv = itemCard.querySelector('.item-status');
           statusDiv.textContent = statusDisplayName;
           statusDiv.className = `item-status status-${statusName}`;

           // Update the actions div
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

       console.log('Enum values loaded:', orderItemStatusEnumValues);


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
                       headers: {
                           'Content-Type': 'application/json'
                       }
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

    menuItemsSelectionContainer.style.display = 'none';
});