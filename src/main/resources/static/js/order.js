// order.js

document.addEventListener('DOMContentLoaded', () => {

    // --- Correctly reference the global variable defined by the inline script ---
    const orderId = currentOrderId;

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

        // Toggle the "no items message" visibility
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

        // Reset filters on show
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

    // Category filter button clicks (delegated)
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

    // Search input listener
    menuItemSearchInput.addEventListener('input', (event) => {
        searchQuery = event.target.value;
        applyFilters();
    });

    // Modal logic
    closeAddOrderItemModalBtn.addEventListener('click', () => {
        addOrderItemModal.classList.remove('active');
    });

    cancelAddOrderItemModalBtn.addEventListener('click', () => {
        addOrderItemModal.classList.remove('active');
    });

    // Event listener for "Добави" buttons (delegated)
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

    // The form submission is now a standard POST, so we don't need a custom event listener
    // that uses 'fetch' and 'preventDefault'. The browser will handle the submission.
    // The Thymeleaf `th:action` and `th:object` will ensure the data is sent correctly.

    // On page load, hide the menu selection container
    menuItemsSelectionContainer.style.display = 'none';
});