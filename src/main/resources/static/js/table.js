document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const tableGrid = document.getElementById('tableGrid');
    const noTablesMessage = document.getElementById('noTablesMessage');
    const addNewTableBtn = document.getElementById('addNewTableBtn');

    // MODAL ELEMENTS
    const tableModalOverlay = document.getElementById('tableModal');
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
    // Checkbox has been removed, so no need to select it here

    // --- State Variables ---
    // allTables is populated directly from Thymeleaf in the HTML <script> block
    let currentFilterStatus = 'ALL';
    // The 'showAvailableOnly' state is no longer needed after checkbox removal

    // --- Functions ---

    /**
     * Applies filters to the already rendered table cards.
     * It iterates through the DOM elements and shows/hides them.
     */
    function applyFilters() {
        console.log('--- Applying Filters ---');
        console.log('Current Filter Status:', currentFilterStatus);

        const allTableCards = tableGrid.querySelectorAll('.table-card');
        console.log('Total table cards found:', allTableCards.length);
        let visibleCount = 0;

        allTableCards.forEach(card => {
            const cardId = card.dataset.id; // For identification
            const cardStatus = card.dataset.status;

            let isVisible = true;

            // Apply status filter
            // Only hide if a specific filter is chosen (not 'ALL') AND the card status doesn't match
            if (currentFilterStatus !== 'ALL' && cardStatus !== currentFilterStatus) {
                isVisible = false;
            }

            console.log(`Card ID: ${cardId}, Status: ${cardStatus}, Should Be Visible: ${isVisible}`);

            if (isVisible) {
                card.style.display = 'flex'; // Ensure flex display for cards
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        console.log('Total visible cards after filter:', visibleCount);
        if (noTablesMessage) {
            noTablesMessage.style.display = (visibleCount === 0) ? 'block' : 'none';
        }
    }

    /**
     * Opens the modal for adding or editing a table.
     * @param {Object} [tableData=null] - Table DTO object for editing, or null for creating.
     */
    function openTableModal(tableData = null) {
        tableForm.reset();
        tableIdInput.value = '';
        modalTitle.textContent = 'Добавяне на нова маса';
        saveTableBtn.textContent = 'Създай маса';
        tableForm.action = '/table';
        tableForm.method = 'post'; // Ensure method is POST for Spring forms

        if (tableData) {
            modalTitle.textContent = 'Редактиране на маса';
            saveTableBtn.textContent = 'Запази промените';
            // Use tableData.id directly as it's a UUID string
            tableForm.action = `/table/edit/${tableData.id}`;

            tableIdInput.value = tableData.id;
            tableNumberInput.value = tableData.number;
            tableCapacityInput.value = tableData.capacity;
            tableStatusSelect.value = tableData.status;
        } else {
            tableStatusSelect.value = 'AVAILABLE';
        }
        tableModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Closes the table modal.
     */
    function closeTableModal() {
        tableModalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Finds a table in the global allTables array by ID (UUID string).
     * This array is populated by Thymeleaf.
     * @param {string} id - The UUID string ID of the table to find.
     * @returns {Object|undefined} The table object if found, otherwise undefined.
     */
    function findTableById(id) {
        // Ensure allTables exists and is an array before trying to find
        if (typeof allTables !== 'undefined' && Array.isArray(allTables)) {
            // Compare IDs directly as strings (UUIDs)
            return allTables.find(table => table.id === id);
        }
        console.error("allTables is not defined or is not an array. Cannot find table by ID.");
        return undefined;
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
            if (e.target === tableModalOverlay) {
                closeTableModal();
            }
        });
    }

    // Delegated event listener for Edit, Delete, Use buttons on table cards
    if (tableGrid) {
        tableGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.btn');
            if (!button) return;

            const tableId = button.dataset.id; // Get ID directly as a string

            if (button.classList.contains('btn-use')) {
//                alert(`Използвай маса №${tableId} (ID: ${tableId}).\nПренасочване към страница за поръчки...`);
                // Example: window.location.href = `/orders?tableId=${tableId}`;
            } else if (button.classList.contains('btn-edit')) {
                console.log('--- Edit button clicked ---');
                console.log('Button data-id:', button.dataset.id);
                console.log('Table ID (UUID) extracted:', tableId);
                const table = findTableById(tableId); // Now finds by UUID string
                console.log('Found table object:', table);
                if (table) {
                    openTableModal(table);
                } else {
                    console.error('Table data NOT found for ID:', tableId, 'in allTables:', allTables);
                }
            } else if (button.classList.contains('btn-delete')) {
                // HTML form handles delete
            }
        });
    }

    // Filter by status category buttons
    statusCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('--- Filter button clicked ---');
            statusCategoryButtons.forEach(btn => btn.classList.remove('active')); // Deactivate all
            this.classList.add('active'); // Activate clicked button

            currentFilterStatus = this.dataset.status; // Update filter status
            console.log('New currentFilterStatus:', currentFilterStatus);

            applyFilters(); // Apply filters
        });
    });

    // Initial application of filters when the page loads
    // This runs only once when the DOM is loaded
    if (typeof allTables !== 'undefined' && Array.isArray(allTables)) {
        // Ensure 'Всички' button is active by default on load
        const initialActiveButton = document.querySelector('.category-btn[data-status="ALL"]');
        if (initialActiveButton) {
            initialActiveButton.classList.add('active');
            currentFilterStatus = 'ALL'; // Explicitly set initial filter status
        }
        applyFilters(); // Apply filters based on initial state
    } else {
        console.warn("allTables data not found or is not an array. Filtering cannot be applied on load.");
    }
});