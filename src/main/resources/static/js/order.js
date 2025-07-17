// order.js

document.addEventListener('DOMContentLoaded', () => {
    // Global variables from Thymeleaf inline script
    const currentOrderId = typeof currentOrderId_js !== 'undefined' ? currentOrderId_js : null; // Ensure definition
    const menuCategoriesForJs = typeof menuCategoryEnumValues_js !== 'undefined' ? menuCategoryEnumValues_js : []; // Ensure definition and correct variable name from inline script

    // DOM elements
    const addOrderItemBtn = document.getElementById('addOrderItemBtn');
    const menuItemsSelectionContainer = document.getElementById('menuItemsSelectionContainer');
    const backToOrderBtn = document.getElementById('backToOrderBtn');
    const dynamicMenuItemsGrid = document.getElementById('dynamicMenuItemsGrid');
    const categoryFilterButtonsContainer = document.querySelector('.category-filter-buttons');
    const menuItemSearchInput = document.getElementById('menuItemSearch'); // New search bar input

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
            const available = card.dataset.available === 'true'; // Convert "true"/"false" string to boolean

            const categoryMatch = (activeCategory === 'ALL' || category === activeCategory);
            const searchMatch = (normalizedSearchQuery === '' || itemName.includes(normalizedSearchQuery));
            // Removed availability filter based on user request

            if (categoryMatch && searchMatch) {
                card.style.display = ''; // Show the item
                anyVisible = true;
            } else {
                card.style.display = 'none'; // Hide the item
            }
        });

        // Toggle the "no items message" visibility
        const noItemsMessage = dynamicMenuItemsGrid.querySelector('#noMenuItemsMessage');
        if (noItemsMessage) { // Check if the message element exists
            if (!anyVisible) {
                noItemsMessage.style.display = ''; // Show the message if no items are visible
                noItemsMessage.textContent = 'Няма намерени елементи от менюто с текущите филтри.'; // Update text
            } else {
                noItemsMessage.style.display = 'none'; // Hide the message if any items are visible
            }
        } else if (!anyVisible && dynamicMenuItemsGrid.childElementCount > 0) {
            // If no message element exists but no items are visible, append one.
            const p = document.createElement('p');
            p.id = 'noMenuItemsMessage';
            p.classList.add('no-items-message');
            p.textContent = 'Няма намерени елементи от менюто с текущите филтри.';
            dynamicMenuItemsGrid.appendChild(p);
        } else if (anyVisible && dynamicMenuItemsGrid.childElementCount > 0 && dynamicMenuItemsGrid.querySelector('#noMenuItemsMessage')) {
             // If items are visible and message exists, remove it
             dynamicMenuItemsGrid.querySelector('#noMenuItemsMessage').remove();
        }
    };

    // --- Event Listeners ---

    addOrderItemBtn.addEventListener('click', () => {
        // Hide order summary and items, show menu selection
        document.getElementById('orderSummaryCard').style.display = 'none';
        document.getElementById('orderItemsSection').style.display = 'none';
        menuItemsSelectionContainer.style.display = 'flex'; // Show the menu item selection

        // Ensure category buttons are reset visually and then apply filters
        categoryFilterButtonsContainer.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        categoryFilterButtonsContainer.querySelector('[data-category="ALL"]').classList.add('active');
        activeCategory = 'ALL';
        menuItemSearchInput.value = ''; // Clear search on opening
        searchQuery = '';
        applyFilters(); // Apply filters immediately when shown
    });

    backToOrderBtn.addEventListener('click', () => {
        menuItemsSelectionContainer.style.display = 'none'; // Hide menu selection
        document.getElementById('orderSummaryCard').style.display = 'block'; // Show order summary
        document.getElementById('orderItemsSection').style.display = 'block'; // Show order items

        // Reset filters for next time it's opened
        activeCategory = 'ALL';
        searchQuery = '';
        menuItemSearchInput.value = '';
        // applyFilters(); // No need to call this if menuItemsSelectionContainer is hidden
    });

    // Category filter button clicks (delegated to parent container)
    categoryFilterButtonsContainer.addEventListener('click', (event) => {
        const target = event.target.closest('.category-btn'); // Use closest to handle clicks on spans/i inside button
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

    // Event listener for all "Добави" buttons (delegated to dynamicMenuItemsGrid)
    dynamicMenuItemsGrid.addEventListener('click', (event) => {
        const addButton = event.target.closest('.btn-add-to-order');
        if (addButton) {
            // Get item details directly from data attributes of the parent card
            const menuItemCard = addButton.closest('.menu-item-card-dynamic');
            if (menuItemCard) {
                const itemId = menuItemCard.dataset.itemId;
                const itemName = menuItemCard.dataset.itemName;
                const itemPrice = parseFloat(menuItemCard.dataset.itemPrice); // Convert to number

                modalMenuItemId.value = itemId;
                modalMenuItemName.textContent = itemName;
                modalMenuItemPrice.textContent = `${itemPrice.toFixed(2)} лв.`;
                itemQuantityInput.value = 1; // Reset quantity
                specialInstructionsInput.value = ''; // Reset instructions
                addOrderItemModal.classList.add('active');
            }
        }
    });

    // Handle form submission for adding item to order
    addOrderItemForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const menuItemId = modalMenuItemId.value; // Get the ID from the hidden input
        if (!menuItemId) {
            console.error("No menu item ID found for adding.");
            return;
        }

        const quantity = itemQuantityInput.value;
        const specialInstructions = specialInstructionsInput.value;

        // Construct the DTO for the new order item
        const newOrderItemDTO = {
            menuItemId: menuItemId, // Use the ID from the modal
            quantity: quantity,
            specialInstructions: specialInstructions || null // Send null if empty
        };

        // Send data to the backend via Fetch API
        try {
            const response = await fetch(`/orders/${currentOrderId}/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add CSRF token header if Spring Security is enabled
                    // e.g., 'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').content,
                },
                body: JSON.stringify(newOrderItemDTO)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Грешка при добавяне на артикул.');
            }

            const updatedOrder = await response.json();
            console.log('Артикулът е добавен успешно:', updatedOrder);
            addOrderItemModal.classList.remove('active');
            window.location.reload(); // Reload page to reflect updated order items
        } catch (error) {
            console.error('Възникна грешка:', error.message);
            alert('Грешка: ' + error.message);
        }
    });
});