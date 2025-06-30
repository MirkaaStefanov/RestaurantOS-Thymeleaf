// src/main/resources/static/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Toggle ---
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const toggleIcon = sidebarToggle ? sidebarToggle.querySelector('i') : null;

    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            if (toggleIcon) {
                toggleIcon.classList.toggle('fa-chevron-left');
                toggleIcon.classList.toggle('fa-chevron-right');
            }
        });
    }

    // --- Modal Elements ---
    const menuItemModal = document.getElementById('menuItemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addNewItemBtn = document.getElementById('addNewItemBtn');
    const modalTitle = document.getElementById('modalTitle');
    const menuItemForm = document.getElementById('menuItemForm');
    const saveItemBtn = document.getElementById('saveItemBtn');

    // Form inputs
    const menuItemIdInput = document.getElementById('menuItemId');
    const itemNameInput = document.getElementById('itemName');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemPrepTimeInput = document.getElementById('itemPrepTime');
    const itemCategorySelect = document.getElementById('itemCategory');
    const itemImageFileInput = document.getElementById('itemImageFile');
    const itemBase64ImageInput = document.getElementById('itemBase64Image'); // Hidden input for existing image
    const itemAvailableCheckbox = document.getElementById('itemAvailable');

    // Image preview elements
    const imagePreviewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const previewFileName = document.getElementById('previewFileName');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // --- Modal Functions ---
    function openModal() {
        menuItemModal.classList.add('active');
    }

    function closeProvisionalModal() {
        menuItemModal.classList.remove('active');
        // Reset form to default state (for 'add new')
        menuItemForm.reset();
        menuItemIdInput.value = ''; // Clear ID for new item
        modalTitle.textContent = 'Добавяне на ново ястие';
        saveItemBtn.textContent = 'Създай ястие';
        menuItemForm.action = '/menu-item'; // Default to create endpoint
        imagePreviewContainer.style.display = 'none'; // Hide image preview
        previewImage.src = '';
        previewFileName.textContent = '';
        itemImageFileInput.value = ''; // Clear file input
        itemBase64ImageInput.value = ''; // Clear hidden base64 input
    }

    // --- Event Listeners for Modal ---
    if (addNewItemBtn) {
        addNewItemBtn.addEventListener('click', () => {
            closeProvisionalModal(); // Reset form first
            openModal();
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProvisionalModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeProvisionalModal);
    }

    // Close modal if clicking outside the modal content
    if (menuItemModal) {
        menuItemModal.addEventListener('click', (e) => {
            if (e.target === menuItemModal) {
                closeProvisionalModal();
            }
        });
    }

    // --- Handle Edit Button Click ---
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', async (event) => {
            const itemId = event.currentTarget.dataset.id;
            console.log(`Edit button clicked for item ID: ${itemId}`); // Debugging

            // Fetch item data from backend
            try {
                const response = await fetch(`/menu-item/${itemId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const item = await response.json();
                console.log("Fetched item for edit:", item); // Debugging

                // Populate the form fields
                menuItemIdInput.value = item.id;
                itemNameInput.value = item.name;
                itemDescriptionInput.value = item.description;
                itemPriceInput.value = item.price;
                itemPrepTimeInput.value = item.preparationTime;
                itemCategorySelect.value = item.category; // Ensure category matches enum name
                itemAvailableCheckbox.checked = item.available;

                // Set form action for update
                menuItemForm.action = `/menu-item/edit/${item.id}`;
                modalTitle.textContent = 'Редактиране на ястие';
                saveItemBtn.textContent = 'Обнови ястие';

                // Handle image preview
                if (item.image) {
                    previewImage.src = `data:image/jpeg;base64,${item.image}`;
                    previewFileName.textContent = 'Current Image'; // Or a more descriptive name if available
                    imagePreviewContainer.style.display = 'flex';
                    itemBase64ImageInput.value = item.image; // Store existing base64
                } else {
                    imagePreviewContainer.style.display = 'none';
                    previewImage.src = '';
                    previewFileName.textContent = '';
                    itemBase64ImageInput.value = '';
                }

                openModal();
            } catch (error) {
                console.error("Error fetching menu item for edit:", error);
                alert("Неуспешно зареждане на данни за редактиране.");
            }
        });
    });

    // --- Image Preview on File Select ---
    if (itemImageFileInput) {
        itemImageFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    previewFileName.textContent = file.name;
                    imagePreviewContainer.style.display = 'flex';
                    itemBase64ImageInput.value = ''; // Clear hidden base64 if a new file is selected
                };
                reader.readAsDataURL(file);
            } else {
                imagePreviewContainer.style.display = 'none';
                previewImage.src = '';
                previewFileName.textContent = '';
                // If no new file, try to restore the hidden base64 for edit mode
                if (menuItemIdInput.value && !itemBase64ImageInput.value) {
                     // This scenario means an image was removed during edit, then file input cleared.
                     // The hidden base64 input for `name="image"` would normally handle this on form submission.
                     // For now, let's just make sure the preview is hidden.
                }
            }
        });
    }

    // --- Remove Image Button ---
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            itemImageFileInput.value = ''; // Clear the file input
            imagePreviewContainer.style.display = 'none';
            previewImage.src = '';
            previewFileName.textContent = '';
            itemBase64ImageInput.value = ''; // Crucial: clear hidden base64 to indicate image removal
        });
    }


    // --- Client-Side Filtering ---
    const categoryButtons = document.querySelectorAll('.category-btn[data-category]');
       const availableToggle = document.getElementById('availableToggle');
       const menuItemCards = document.querySelectorAll('.menu-item-card'); // <-- This is key
       const noMenuItemsMessage = document.getElementById('noMenuItemsMessage');

       let currentFilterCategory = 'ALL';
       let currentFilterAvailable = false;

       function applyFilters() {
           let itemsShown = 0;
           menuItemCards.forEach(card => {
               const itemCategory = card.dataset.category; // <-- Read from data attribute
               const itemAvailable = card.dataset.available === 'true'; // <-- Read from data attribute

               const categoryMatch = (currentFilterCategory === 'ALL' || itemCategory === currentFilterCategory);
               const availabilityMatch = (!currentFilterAvailable || itemAvailable);

               if (categoryMatch && availabilityMatch) {
                   card.style.display = 'flex'; // Show the card
                   itemsShown++;
               } else {
                   card.style.display = 'none'; // Hide the card
               }
           });

           if (noMenuItemsMessage) {
               noMenuItemsMessage.style.display = itemsShown === 0 ? 'block' : 'none';
           }
       }

       // Event listeners for category buttons
       categoryButtons.forEach(button => {
           button.addEventListener('click', () => {
               // Remove 'active' from all category buttons
               categoryButtons.forEach(btn => btn.classList.remove('active'));
               // Add 'active' to the clicked button
               button.classList.add('active');
               currentFilterCategory = button.dataset.category;
               applyFilters();
           });
       });
    // Event listener for availability toggle
    if (availableToggle) {
        availableToggle.addEventListener('change', () => {
            currentFilterAvailable = availableToggle.checked;
            applyFilters();
        });
    }

    // Initial filter application when page loads
    applyFilters();
});