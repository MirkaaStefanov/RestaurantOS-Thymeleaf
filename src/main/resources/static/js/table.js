document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const tableGrid = document.querySelector('.table-grid');
    const noTablesMessage = document.getElementById('noTablesMessage'); // Moved inside table-grid in HTML
    const addNewTableBtn = document.getElementById('addNewTableBtn');

    // MODAL ELEMENTS
    const tableModalOverlay = document.getElementById('tableModalOverlay'); // This is the main modal wrapper
    const closeTableModalBtn = document.getElementById('closeTableModalBtn');
    const cancelTableModalBtn = document.getElementById('cancelTableModalBtn');
    const tableForm = document.getElementById('tableForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveTableBtn = document.getElementById('saveTableBtn');

    // Form fields
    const tableIdInput = document.getElementById('tableId');
    const tableNumberInput = document.getElementById('tableNumber');
    const tableCapacityInput = document.getElementById('tableCapacity');
    const tableStatusSelect = document.getElementById('tableStatus');

    // Filter elements
    const statusCategoryButtons = document.querySelectorAll('.category-btn[data-status]');
    const showAvailableTablesToggle = document.getElementById('showAvailableTables');

    // --- State Variables ---
    // allTables will be globally available from Thymeleaf, e.g., <script th:inline="javascript"> var allTables = [[${tables}]]; </script>
    let currentFilteredTables = [];
    let currentFilterStatus = 'ALL'; // Default to show all statuses (matches "Всички" button)
    let currentFilterShowAvailableOnly = false; // Default to show all tables

    // --- Functions ---

    /**
     * Renders table cards in the grid.
     * @param {Array} tablesToRender - The array of table objects to display.
     */
    function renderTables(tablesToRender) {
        // Clear all content in the grid, except for the noTablesMessage placeholder
        const existingCards = tableGrid.querySelectorAll('.table-card');
        existingCards.forEach(card => card.remove());

        if (tablesToRender.length === 0) {
            noTablesMessage.style.display = 'block';
            // tableGrid.style.display = 'none'; // Keep grid as flex/grid to center message if desired
        } else {
            noTablesMessage.style.display = 'none';
            // tableGrid.style.display = 'grid'; // Ensure grid is visible (already handled by CSS usually)
        }

        tablesToRender.forEach(table => {
            const tableCard = document.createElement('div');
            tableCard.className = 'table-card'; // Reusing 'menu-item-card' style if similar CSS
            tableCard.setAttribute('data-id', table.id); // Store ID for easy access
            tableCard.setAttribute('data-status', table.status); // For filtering
            tableCard.setAttribute('data-available', table.status === 'AVAILABLE'); // For the "available only" toggle

            // Determine status display text and class
            let statusText = '';
            let statusClass = '';
            switch (table.status) {
                case 'AVAILABLE':
                    statusText = 'Налична';
                    statusClass = 'available-status'; // Using consistency from menu-item if available-status is green
                    break;
                case 'OCCUPIED':
                    statusText = 'Заета';
                    statusClass = 'occupied-status'; // Define this in your CSS
                    break;
                case 'RESERVED':
                    statusText = 'Резервирана';
                    statusClass = 'reserved-status'; // Define this in your CSS
                    break;
                case 'NEEDS_CLEANING':
                    statusText = 'За почистване';
                    statusClass = 'needs-cleaning-status'; // Define this in your CSS
                    break;
                default:
                    statusText = table.status;
                    statusClass = '';
            }

            // Construct the inner HTML similar to menu-item-card
            tableCard.innerHTML = `
                <div class="table-card-header">
                    <h3 class="table-number">Маса ${table.number}</h3>
                    <span class="table-availability ${statusClass}">${statusText}</span>
                </div>
                <div class="table-card-body">
                    <p class="table-capacity"><i class="fas fa-chair"></i> Капацитет: ${table.capacity} места</p>
                    ${table.currentOrder ? `<p class="table-order"><i class="fas fa-clipboard-list"></i> Поръчка: ${table.currentOrder}</p>` : ''}
                    ${table.currentWaiter ? `<p class="table-waiter"><i class="fas fa-user-tie"></i> Сервитьор: ${table.currentWaiter}</p>` : ''}
                </div>
                <div class="table-card-actions">
                    <button class="btn btn-use" data-action="use" data-id="${table.id}">Използвай</button>
                    <button class="btn btn-edit" data-action="edit" data-id="${table.id}">Редактирай</button>
                    <button class="btn btn-delete" data-action="delete" data-id="${table.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
            tableGrid.appendChild(tableCard);
        });
    }

    /**
     * Applies filters and re-renders tables.
     */
    function applyFilters() {
        let filtered = allTables; // Start with all tables (from global Thymeleaf variable)

        // Filter by status if a specific status is selected (and not 'ALL')
        if (currentFilterStatus && currentFilterStatus !== 'ALL') {
            filtered = filtered.filter(table => table.status === currentFilterStatus);
        }

        // Filter by 'show available only' toggle
        if (currentFilterShowAvailableOnly) {
            filtered = filtered.filter(table => table.status === 'AVAILABLE');
        }

        currentFilteredTables = filtered;
        renderTables(currentFilteredTables);
    }

    /**
     * Opens the modal for adding or editing a table.
     * @param {Object} [tableData=null] - Table DTO object for editing, or null for creating.
     */
    function openTableModal(tableData = null) {
        tableForm.reset();
        tableIdInput.value = '';

        if (tableData) {
            modalTitle.textContent = 'Редактиране на маса';
            saveTableBtn.textContent = 'Запази промените';
            tableForm.action = `/table/edit/${tableData.id}`; // Endpoint for editing
            tableForm.method = 'post';

            tableIdInput.value = tableData.id;
            tableNumberInput.value = tableData.number;
            tableCapacityInput.value = tableData.capacity;
            tableStatusSelect.value = tableData.status;
            // No currentOrder/currentWaiter fields in modal based on HTML, so no pre-fill needed
        } else {
            modalTitle.textContent = 'Добавяне на нова маса';
            saveTableBtn.textContent = 'Създай маса';
            tableForm.action = '/table'; // Endpoint for adding new
            tableForm.method = 'post';
            tableStatusSelect.value = 'AVAILABLE'; // Default new table to Available
        }
        tableModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling background
    }

    /**
     * Closes the table modal.
     */
    function closeTableModal() {
        tableModalOverlay.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    /**
     * Finds a table in the global allTables array by ID.
     * @param {number} id - The ID of the table to find.
     * @returns {Object|undefined} The table object if found, otherwise undefined.
     */
    function findTableById(id) {
        return allTables.find(table => table.id === id);
    }

    // --- Event Listeners ---

    // Open Add New Table Modal
    if (addNewTableBtn) {
        addNewTableBtn.addEventListener('click', () => openTableModal());
    }

    // Close Modal Buttons
    if (closeTableModalBtn) {
        closeTableModalBtn.addEventListener('click', closeTableModal);
    }
    if (cancelTableModalBtn) {
        cancelTableModalBtn.addEventListener('click', closeTableModal);
    }
    // Close modal if overlay is clicked
    if (tableModalOverlay) {
        tableModalOverlay.addEventListener('click', function(e) {
            if (e.target === tableModalOverlay) { // Check if the overlay itself was clicked
                closeTableModal();
            }
        });
    }

    // Delegated event listener for Edit, Delete, Use buttons on table cards
    if (tableGrid) {
        tableGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.btn');
            if (!button) return;

            const tableId = parseInt(button.dataset.id);
            const action = button.dataset.action;
            const table = findTableById(tableId);

            if (!table) {
                console.error('Table not found for ID:', tableId);
                return;
            }

            switch (action) {
                case 'use':
                    alert(`Използвай маса ${table.number} (ID: ${table.id}).\nПренасочване към страница за поръчки...`);
                    // Example: window.location.href = `/orders?tableId=${table.id}`;
                    break;
                case 'edit':
                    openTableModal(table);
                    break;
                case 'delete':
                    if (confirm(`Сигурни ли сте, че искате да изтриете маса номер ${table.number}?`)) {
                        fetch(`/table/delete/${table.id}`, {
                                method: 'POST', // Or 'DELETE' if your backend supports it directly
                                headers: {
                                    'Content-Type': 'application/json',
                                    // Include CSRF token if you use Spring Security
                                    // 'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').getAttribute('content')
                                }
                            })
                            .then(response => {
                                if (response.ok) {
                                    alert(`Маса ${table.number} успешно изтрита.`);
                                    // Remove table from allTables array and re-render
                                    allTables = allTables.filter(t => t.id !== tableId);
                                    applyFilters(); // Re-render with updated data
                                } else {
                                    return response.text().then(text => { throw new Error(text) });
                                }
                            })
                            .catch(error => {
                                console.error('Error deleting table:', error);
                                alert('Възникна грешка при изтриването на масата: ' + error.message);
                            });
                    }
                    break;
            }
        });
    }

    // Filter by status category buttons
    statusCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove 'active' from all status buttons
            statusCategoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add 'active' to the clicked button
            this.classList.add('active');

            currentFilterStatus = this.dataset.status; // Get the status from data-status attribute
            applyFilters();
        });
    });

    // Filter by 'Show Available Only' toggle
    if (showAvailableTablesToggle) {
        showAvailableTablesToggle.addEventListener('change', function() {
            currentFilterShowAvailableOnly = this.checked;
            // Optionally, deactivate other status filters when this is active
            if (this.checked) {
                // If "Само налични" is checked, ensure the "Налични" category button is active
                statusCategoryButtons.forEach(btn => btn.classList.remove('active'));
                const availableButton = document.querySelector('.category-btn[data-status="AVAILABLE"]');
                if (availableButton) {
                    availableButton.classList.add('active');
                    currentFilterStatus = 'AVAILABLE'; // Update the status filter as well
                }
            } else {
                // If "Само налични" is unchecked, reset to "Всички" category button
                statusCategoryButtons.forEach(btn => btn.classList.remove('active'));
                const allButton = document.querySelector('.category-btn[data-status="ALL"]');
                if (allButton) {
                    allButton.classList.add('active');
                    currentFilterStatus = 'ALL'; // Update the status filter as well
                }
            }
            applyFilters();
        });
    }

    // Initial render when the page loads
    // 'allTables' is expected to be provided by Thymeleaf as a global JS variable
    if (typeof allTables !== 'undefined' && Array.isArray(allTables)) {
        applyFilters();
        // Set initial active filter button if any, default to 'ALL'
        const initialActiveButton = document.querySelector('.category-btn[data-status="ALL"]');
        if (initialActiveButton) {
            initialActiveButton.classList.add('active');
        }
        // If the "show available only" toggle is initially checked (e.g., from server-side state)
        if (showAvailableTablesToggle && showAvailableTablesToggle.checked) {
            // This will trigger the change event, so no explicit action needed here beyond setting checked state
            // showAvailableTablesToggle.dispatchEvent(new Event('change')); // Can force the change event if needed
        }
    } else {
        console.error("allTables data not found or is not an array. Tables cannot be rendered.");
        noTablesMessage.style.display = 'block';
    }
});