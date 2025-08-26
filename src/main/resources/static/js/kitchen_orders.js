// kitchen_orders.js

document.addEventListener('DOMContentLoaded', () => {

    let stompClient = null;

    const getStatusDisplayName = (statusName) => {
        if (!statusName) {
            console.error('getStatusDisplayName called with null or undefined statusName');
            return 'N/A';
        }
        const normalizedStatusName = statusName.toUpperCase().trim();
        const status = orderItemStatusEnumValues.find(s => s && s.name && s.name.toUpperCase().trim() === normalizedStatusName);
        return status ? status.displayName : statusName;
    };

    const isBeverage = (item) => {
        if (item.menuItem && item.menuItem.category) {
            return item.menuItem.category.toUpperCase().trim() === 'BEVERAGE';
        }
        return false;
    };

    const kitchenOrderItemsList = document.getElementById('kitchenOrderItemsList');
    const noKitchenItemsMessage = document.getElementById('noKitchenItemsMessage');

    function connectToWebSocket() {
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, (frame) => {
            console.log('Connected to WebSocket for Kitchen View: ' + frame);

            // Subscribe to a single, general topic for all new kitchen updates
            stompClient.subscribe("/topic/kitchen/updates", (message) => {
                const updatedItem = JSON.parse(message.body);
                console.log('Received general kitchen update:', updatedItem);

                if (updatedItem.orderItemStatus && typeof updatedItem.orderItemStatus !== 'string') {
                    updatedItem.orderItemStatus = updatedItem.orderItemStatus.name;
                }

                handleOrderItemUpdate(updatedItem);
            });

        }, (error) => {
            console.error('WebSocket connection error for Kitchen View: ' + error);
        });
    }

    connectToWebSocket();

    const handleOrderItemUpdate = (updatedItem) => {
        if (isBeverage(updatedItem)) {
            console.log(`Ignoring beverage item with ID: ${updatedItem.id}`);
            const existingCard = document.querySelector(`.order-item-card[data-item-id="${updatedItem.id}"]`);
            if (existingCard) {
                existingCard.remove();
            }
            updateNoItemsMessage();
            return;
        }

        const existingCard = document.querySelector(`.order-item-card[data-item-id="${updatedItem.id}"]`);
        const targetStatus = updatedItem.orderItemStatus.toUpperCase().trim();

        if (targetStatus === 'PREPARING') {
            if (existingCard) {
                updateOrderItemOnPage(existingCard, updatedItem);
            } else {
                const newCard = addOrderItemToPage(updatedItem);
                let inserted = false;
                const existingCards = kitchenOrderItemsList.querySelectorAll('.order-item-card');

                for (let i = 0; i < existingCards.length; i++) {
                    const existingItemTime = existingCards[i].dataset.addedTime;
                    if (new Date(updatedItem.addedTime) < new Date(existingItemTime)) {
                        kitchenOrderItemsList.insertBefore(newCard, existingCards[i]);
                        inserted = true;
                        break;
                    }
                }
                if (!inserted) {
                    kitchenOrderItemsList.appendChild(newCard);
                }
            }
        } else if (targetStatus === 'DONE' || targetStatus === 'CANCELLED') {
            if (existingCard) {
                existingCard.remove();
                console.log(`Removed item ${updatedItem.id} with status ${targetStatus} from kitchen view.`);
            }
        } else {
            if (existingCard) {
                existingCard.remove();
                console.log(`Removed item ${updatedItem.id} with status ${targetStatus} from kitchen view (not relevant).`);
            }
        }
        updateNoItemsMessage();
    };

    const addOrderItemToPage = (newOrderItem) => {
        if (newOrderItem.orderItemStatus.toUpperCase().trim() !== 'PREPARING') {
            return;
        }

        const statusName = newOrderItem.orderItemStatus;
        const statusDisplayName = getStatusDisplayName(statusName);

        const newCard = document.createElement('div');
        newCard.classList.add('order-item-card');
        newCard.dataset.itemId = newOrderItem.id;
        newCard.dataset.status = statusName;
        newCard.dataset.orderId = newOrderItem.order.id;
        newCard.dataset.addedTime = newOrderItem.addedTime;

        newCard.innerHTML = `
            <div class="item-info">
                <span class="item-quantity">${newOrderItem.quantity}</span> x
                <span class="item-name">${newOrderItem.menuItem.name}</span>
                <span class="item-price">${newOrderItem.menuItem.price.toFixed(2)} лв.</span>
            </div>
            <div class="item-order-id">Поръчка №${newOrderItem.order.id}</div>
            <div class="item-status status-${statusName.toUpperCase().trim()}">${statusDisplayName}</div>
            ${newOrderItem.specialInstructions ? `<p class="item-instructions">${newOrderItem.specialInstructions}</p>` : ''}
            <div class="item-actions">
                <button type="button" class="btn btn-complete" data-order-item-id="${newOrderItem.id}">
                    <i class="fas fa-check-double"></i> Готово
                </button>
            </div>
        `;
        return newCard;
    };

    const updateOrderItemOnPage = (itemCard, updatedItem) => {
        const statusName = updatedItem.orderItemStatus;
        const statusDisplayName = getStatusDisplayName(statusName);

        itemCard.dataset.status = statusName;

        const statusDiv = itemCard.querySelector('.item-status');
        if (statusDiv) {
            statusDiv.textContent = statusDisplayName;
            statusDiv.className = `item-status status-${statusName.toUpperCase().trim()}`;
        }

        const actionsDiv = itemCard.querySelector('.item-actions');
        if (actionsDiv) {
            if (statusName.toUpperCase().trim() === 'PREPARING') {
                actionsDiv.innerHTML = `
                    <button type="button" class="btn btn-complete" data-order-item-id="${updatedItem.id}">
                        <i class="fas fa-check-double"></i> Готово
                    </button>
                `;
            } else {
                actionsDiv.innerHTML = '';
            }
        }
    };

    const updateNoItemsMessage = () => {
        const visibleItems = kitchenOrderItemsList.querySelectorAll('.order-item-card');
        if (visibleItems.length === 0) {
            if (noKitchenItemsMessage) {
                noKitchenItemsMessage.style.display = 'block';
            }
        } else {
            if (noKitchenItemsMessage) {
                noKitchenItemsMessage.style.display = 'none';
            }
        }
    };

    document.addEventListener('click', async (event) => {
        const completeButton = event.target.closest('.btn-complete');
        if (completeButton) {
            const orderItemId = completeButton.dataset.orderItemId;
            try {
                const response = await fetch(`/kitchen/order/complete/${orderItemId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to complete order item: ${errorText}`);
                }
                console.log(`Order item ${orderItemId} completed.`);
            } catch (error) {
                console.error('Error completing order item:', error);
                alert('An error occurred while completing the order item.');
            }
        }
    });

    // Initial check for no items message
    updateNoItemsMessage();
});