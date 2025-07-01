document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const tableGrid = document.getElementById('tableGrid'); // Use ID for direct access
    const noTablesMessage = document.getElementById('noTablesMessage');
    const addNewTableBtn = document.getElementById('addNewTableBtn');

    // MODAL ELEMENTS
    const tableModalOverlay = document.getElementById('tableModalOverlay');
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
    // allTables is now populated directly from Thymeleaf in the HTML <script> block
    let currentFilterStatus = 'ALL'; // Default to show all statuses (matches "Всички" button)
    let currentFilterShowAvailableOnly = false; // Default to show all tables

    // --- Functions ---

    /**
     * Applies filters to the already rendered table cards.
     * It iterates through the DOM elements and shows/hides them.
     */
    function applyFilters() {
        const allTableCards = tableGrid.querySelectorAll('.table-card');
        let visibleCount = 0;

        allTableCards.forEach(card => {
            const cardStatus = card.dataset.status; // e.g., 'AVAILABLE', 'OCCUPIED'
            const isCardAvailable = card.dataset.available === 'true'; // boolean from data-available

            let isVisible = true;

            // Apply status filter
            if (currentFilterStatus !== 'ALL' && cardStatus !== currentFilterStatus) {
                isVisible = false;
            }

            // Apply 'show available only' toggle filter
            if (currentFilterShowAvailableOnly && !isCardAvailable) {
                isVisible = false;
            }

            if (isVisible) {
                card.style.display = ''; // Show the card (uses its default display, e.g., flex or block)
                visibleCount++;
            } else {
                card.style.display = 'none'; // Hide the card
            }
        });

        // Show/hide the 'no tables message' based on filter results
        if (visibleCount === 0) {
            noTablesMessage.style.display = 'block';
        } else {
            noTablesMessage.style.display = 'none';
        }
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
            tableForm.action = `/tables/edit/${tableData.id}`; // Endpoint for editing
            tableForm.method = 'post';

            tableIdInput.value = tableData.id;
            tableNumberInput.value = tableData.number;
            tableCapacityInput.value = tableData.capacity;
            tableStatusSelect.value = tableData.status;
        } else {
            modalTitle.textContent = 'Добавяне на нова маса';
            saveTableBtn.textContent = 'Създай маса';
            tableForm.action = '/tables'; // Endpoint for adding new
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
     * This array is populated by Thymeleaf.
     * @param {number} id - The ID of the table to find.
     * @returns {Object|undefined} The table object if found, otherwise undefined.
     */
    function findTableById(id) {
        // Ensure allTables exists and is an array before trying to find
        if (typeof allTables !== 'undefined' && Array.isArray(allTables)) {
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
            if (e.target === tableModalOverlay) { // Check if the overlay itself was clicked
                closeTableModal();
            }
        });
    }

    // Delegated event listener for Edit, Delete, Use buttons on table cards
    // Attach to tableGrid as cards are children
    if (tableGrid) {
        tableGrid.addEventListener('click', function(e) {
            const button = e.target.closest('.btn'); // Finds the closest ancestor with class .btn
            if (!button) return; // Not a button related to table actions

            const tableId = parseInt(button.dataset.id); // Get ID from data-id
            const table = findTableById(tableId);

            if (!table) {
                console.error('Table data not found in JavaScript for ID:', tableId);
                return;
            }

            // Determine action based on button class or specific data-action attribute if present
            if (button.classList.contains('btn-use')) {
                alert(`Използвай маса №${table.number} (ID: ${table.id}).\nПренасочване към страница за поръчки...`);
                // Example: window.location.href = `/orders?tableId=${table.id}`;
            } else if (button.classList.contains('btn-edit')) {
                openTableModal(table);
            } else if (button.classList.contains('btn-delete')) {
                // The HTML form for delete already handles the confirmation and submission.
                // This block is primarily for demonstration if you were to use AJAX for delete.
                // Since your Thymeleaf form already has `onsubmit="return confirm(...)"`,
                // this JavaScript delete action is not strictly necessary unless you switch to AJAX.
                // If you remove the <form> tag around the delete button in HTML, uncomment this:
                /*
                if (confirm(`Сигурни ли сте, че искате да изтриете маса номер ${table.number}?`)) {
                    fetch(`/tables/delete/${table.id}`, { // Adjust endpoint as per your Spring Controller
                        method: 'POST', // Or 'DELETE' if your backend expects it
                        headers: {
                            'Content-Type': 'application/json',
                            // 'X-CSRF-TOKEN': document.querySelector('meta[name="_csrf"]').getAttribute('content') // If using Spring Security CSRF
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert(`Маса №${table.number} успешно изтрита.`);
                            // Remove table from allTables array and re-apply filters to update UI
                            allTables = allTables.filter(t => t.id !== tableId);
                            applyFilters(); // Update the displayed cards
                        } else {
                            return response.text().then(text => { throw new Error(text) });
                        }
                    })
                    .catch(error => {
                        console.error('Error deleting table:', error);
                        alert('Възникна грешка при изтриването на масата: ' + error.message);
                    });
                }
                */
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

            // If a specific status button is clicked, uncheck 'Show Available Only'
            if (currentFilterStatus !== 'AVAILABLE') {
                showAvailableTablesToggle.checked = false;
            }

            applyFilters();
        });
    });

    // Filter by 'Show Available Only' toggle
    if (showAvailableTablesToggle) {
        showAvailableTablesToggle.addEventListener('change', function() {
            currentFilterShowAvailableOnly = this.checked;

            // Adjust category buttons based on toggle state
            statusCategoryButtons.forEach(btn => btn.classList.remove('active')); // Deactivate all

            if (this.checked) {
                // If "Само налични" is checked, make "Налични" button active
                const availableButton = document.querySelector('.category-btn[data-status="AVAILABLE"]');
                if (availableButton) {
                    availableButton.classList.add('active');
                    currentFilterStatus = 'AVAILABLE'; // Update the status filter
                }
            } else {
                // If "Само налични" is unchecked, make "Всички" button active
                const allButton = document.querySelector('.category-btn[data-status="ALL"]');
                if (allButton) {
                    allButton.classList.add('active');
                    currentFilterStatus = 'ALL'; // Update the status filter
                }
            }
            applyFilters();
        });
    }

    // Initial application of filters when the page loads
    // This ensures that if allTables is populated and filters are set,
    // the display updates correctly.
    if (typeof allTables !== 'undefined' && Array.isArray(allTables)) {
        // Set initial active filter button, default to 'ALL'
        const initialActiveButton = document.querySelector('.category-btn[data-status="ALL"]');
        if (initialActiveButton) {
            initialActiveButton.classList.add('active');
        }

        // Check if the 'showAvailableTablesToggle' is initially checked
        // This might happen if its state is persisted (e.g., via a cookie or server-side).
        if (showAvailableTablesToggle && showAvailableTablesToggle.checked) {
            currentFilterShowAvailableOnly = true;
            // Also ensure the 'AVAILABLE' category button is active if the toggle is on
            statusCategoryButtons.forEach(btn => btn.classList.remove('active'));
            const availableButton = document.querySelector('.category-btn[data-status="AVAILABLE"]');
            if (availableButton) {
                availableButton.classList.add('active');
                currentFilterStatus = 'AVAILABLE';
            }
        }

        applyFilters(); // Apply filters based on initial state
    } else {
        console.error("allTables data not found or is not an array. Filtering cannot be applied.");
        // If no tables, and Thymeleaf already showed the message, JS doesn't need to change display.
        // If Thymeleaf didn't show it but allTables is empty, then show it.
        // This is covered by applyFilters anyway.
    }
});