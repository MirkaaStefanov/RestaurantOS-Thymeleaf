// Define toggleSidebar in the global scope or attach it to window.
// This is necessary because your HTML uses onclick="toggleSidebar()".
window.toggleSidebar = function() {
    const sidebar = document.querySelector('.sidebar'); // Targets your <aside class="sidebar">
    const sidebarToggle = document.querySelector('.sidebar-toggle'); // The desktop toggle button
    const sidebarOverlay = document.getElementById('sidebarOverlay'); // The new overlay element

    if (sidebar) {
        if (window.innerWidth > 768) {
            // DESKTOP BEHAVIOR: Collapse/expand the sidebar
            sidebar.classList.toggle('collapsed');
            // If you have main content adjustments for desktop sidebar collapse, add them here:
            // const mainContent = document.querySelector('.main-content');
            // if (mainContent) mainContent.classList.toggle('sidebar-collapsed');
        } else {
            // MOBILE BEHAVIOR: Open/close the hamburger menu (off-canvas sidebar)
            sidebar.classList.toggle('open');
            // Toggle the overlay visibility
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
            // Prevent body scrolling when sidebar is open on mobile
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        }
    }
};


document.addEventListener('DOMContentLoaded', function() {
    // Get elements for mobile hamburger functionality
    const sidebar = document.querySelector('.sidebar'); // Your <aside class="sidebar">
    const hamburgerBtn = document.getElementById('hamburgerBtn'); // The new hamburger button in mobile-header
    const sidebarOverlay = document.getElementById('sidebarOverlay'); // The new overlay

    // Event listener for the mobile hamburger button
    if (hamburgerBtn && sidebar && sidebarOverlay) {
        hamburgerBtn.addEventListener('click', function() {
            // Call the global toggleSidebar function for mobile behavior
            window.toggleSidebar();
        });

        // Event listener for the overlay to close the sidebar when clicked
        sidebarOverlay.addEventListener('click', function() {
            if (sidebar.classList.contains('open')) {
                window.toggleSidebar(); // Close the sidebar if it's open
            }
        });

        // Close sidebar if a menu item link is clicked (good UX for mobile)
        const sidebarLinks = document.querySelectorAll('.sidebar-menu-item .sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', function() {
                // Ensure it's a mobile view and sidebar is open before closing
                if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
                    window.toggleSidebar(); // Close the sidebar
                }
            });
        });
    }

    // The desktop sidebar toggle button (from your fragment) already has onclick="toggleSidebar()",
    // so it will automatically use the `window.toggleSidebar` function.
    // The `if (window.innerWidth > 768)` check inside `toggleSidebar()` handles its specific behavior.


    // --- Existing Modal Logic and Card Filtering (KEPT AS IS) ---
    const addNewItemBtn = document.getElementById('addNewItemBtn');
    const menuItemModal = document.getElementById('menuItemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const menuItemForm = document.getElementById('menuItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const saveItemBtn = document.getElementById('saveItemBtn');

    // Image preview elements
    const itemImageFileInput = document.getElementById('itemImageFile');
    const imagePreviewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const previewFileName = document.getElementById('previewFileName');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const itemBase64Image = document.getElementById('itemBase64Image'); // Hidden input for base64

    // Open Add New Item Modal
    if (addNewItemBtn) {
        addNewItemBtn.addEventListener('click', function() {
            menuItemForm.reset(); // Clear previous form data
            menuItemModal.classList.add('active');
            modalTitle.textContent = 'Добавяне на ново ястие';
            saveItemBtn.textContent = 'Създай ястие';
            menuItemForm.action = '/menu-item'; // Set action for new item
            document.getElementById('menuItemId').value = ''; // Clear ID
            document.getElementById('itemAvailable').checked = true; // Default to available
            // Clear image preview
            imagePreview.style.display = 'none';
            previewImage.src = '';
            previewFileName.textContent = '';
            itemBase64Image.value = ''; // Clear hidden base64 input
        });
    }

    // Close Modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            menuItemModal.classList.remove('active');
        });
    }
    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', function() {
            menuItemModal.classList.remove('active');
        });
    }
    if (menuItemModal) {
        menuItemModal.addEventListener('click', function(e) {
            if (e.target === menuItemModal) {
                menuItemModal.classList.remove('active');
            }
        });
    }

    // Open Edit Modal (delegated event listener)
    document.body.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-edit')) {
            const itemId = e.target.dataset.id;
            // The allMenuItems array is now available from the Thymeleaf inline script
            const item = allMenuItems.find(i => i.id == itemId);

            if (item) {
                document.getElementById('menuItemId').value = item.id;
                document.getElementById('itemName').value = item.name;
                document.getElementById('itemDescription').value = item.description || '';
                document.getElementById('itemPrice').value = item.price;
                document.getElementById('itemPrepTime').value = item.preparationTime || '';
                document.getElementById('itemCategory').value = item.category;
                document.getElementById('itemAvailable').checked = item.available;

                modalTitle.textContent = 'Редактиране на ястие';
                saveItemBtn.textContent = 'Запази промените';
                menuItemForm.action = '/menu-item/edit/' + itemId; // Corrected line

                // Handle image preview for edit
                if (item.image) {
                    previewImage.src = 'data:image/jpeg;base64,' + item.image;
                    previewFileName.textContent = 'current_image.jpg'; // Or actual filename if available
                    imagePreview.style.display = 'flex';
                    itemBase64Image.value = item.image; // Keep current base64 image
                } else {
                    imagePreview.style.display = 'none';
                    previewImage.src = '';
                    previewFileName.textContent = '';
                    itemBase64Image.value = '';
                }

                menuItemModal.classList.add('active');
            }
        }
    });

    // Image file input change listener
     if (itemImageFileInput) {
                itemImageFileInput.addEventListener('change', function() {
                    const file = this.files[0]; // Get the first selected file

                    if (file) {
                        // Define your maximum allowed file size in bytes (e.g., 15MB)
                        // This should match or be slightly less than your server's spring.servlet.multipart.max-file-size
                        const maxAllowedSizeInBytes = 15 * 1024 * 1024; // 15 MB

                        if (file.size > maxAllowedSizeInBytes) {
                            // File is too large, show an alert to the user
                            alert('Файлът е твърде голям! Моля, изберете изображение по-малко от 15MB.');
                            this.value = ''; // Clear the input field (important!)
                            imagePreviewContainer.style.display = 'none'; // Hide any previous preview
                            previewImage.src = '';
                            previewFileName.textContent = '';
                        } else {
                            // File size is acceptable, proceed with displaying the preview
                            const reader = new FileReader();
                            reader.onload = function(e) {
                                previewImage.src = e.target.result;
                                previewFileName.textContent = file.name;
                                imagePreviewContainer.style.display = 'flex'; // Show the preview container
                            };
                            reader.readAsDataURL(file);
                        }
                    } else {
                        // No file selected, hide the preview
                        imagePreviewContainer.style.display = 'none';
                        previewImage.src = '';
                        previewFileName.textContent = '';
                    }
                });
     }


    // Remove image button listener
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', function() {
            itemImageFile.value = ''; // Clear file input
            imagePreview.style.display = 'none';
            previewImage.src = '';
            previewFileName.textContent = '';
            itemBase64Image.value = ''; // Clear hidden base64 input
        });
    }

    // Category Filter and Availability Toggle Logic (REVERTED TO PREVIOUS WORKING VERSION)
    const categoryButtons = document.querySelectorAll('.category-btn[data-category]'); // <--- CRUCIAL CHANGE HERE
    const availableToggle = document.getElementById('availableToggle');
    const menuItemCards = document.querySelectorAll('.menu-item-card');
    const noMenuItemsMessage = document.getElementById('noMenuItemsMessage');

    let currentFilterCategory = 'ALL';
    let currentFilterAvailable = false;

    function applyFilters() {
        let itemsShown = 0;
        menuItemCards.forEach(card => {
            const itemCategory = card.dataset.category;
            const itemAvailable = card.dataset.available === 'true';

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
            // NEW: Add/remove 'active' class from the label when checkbox state changes
            const availableToggleLabel = document.querySelector('label[for="availableToggle"]');
            if (availableToggleLabel) {
                if (availableToggle.checked) {
                    availableToggleLabel.classList.add('active');
                } else {
                    availableToggleLabel.classList.remove('active');
                }
            }
            applyFilters();
        });
    }

    // Initial filter application when page loads
    // Also ensure "Само налични" active state is correct on load
    applyFilters();
    // Set initial active state for the "Само налични" label if checkbox is checked on load
    if (availableToggle && availableToggle.checked) {
        const availableToggleLabel = document.querySelector('label[for="availableToggle"]');
        if (availableToggleLabel) {
            availableToggleLabel.classList.add('active');
        }
    }


    // Toggle menu item availability (from the card buttons)
    // Assuming these are triggered by form submissions, not direct JS functions anymore
    // based on your HTML forms.
    // The previous window.toggleAvailability, window.openEditModal, window.deleteItem might be remnants
    // if you've moved to direct form submissions for toggle/delete and delegated click for edit.
    // If not, ensure these functions are still being called from your HTML elements.

    // If you need direct JS control over toggle/delete/edit, ensure your HTML buttons
    // have `onclick="toggleAvailability(this.dataset.id)"` etc.
});