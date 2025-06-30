document.addEventListener('DOMContentLoaded', () => {
    // --- Sidebar Toggle Logic ---
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    const mainContent = document.querySelector('.main-content');

    // Function to toggle sidebar state
    window.toggleSidebar = function() {
        sidebar.classList.toggle('collapsed');
        // Optional: Adjust main content margin if needed, based on your CSS.
        // mainContent.style.marginLeft = sidebar.classList.contains('collapsed') ? '70px' : '250px';
        const icon = sidebarToggle.querySelector('i');
        icon.classList.toggle('fa-chevron-left');
        icon.classList.toggle('fa-chevron-right');
    };

    // --- Modal Logic ---
    const addMenuItemBtn = document.getElementById('addMenuItemBtn');
    const menuItemModal = document.getElementById('menuItemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const menuItemForm = document.getElementById('menuItemForm');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    // Form fields for easy access
    const menuItemIdInput = document.getElementById('menuItemId');
    const nameInput = document.getElementById('name');
    const descriptionInput = document.getElementById('description');
    const priceInput = document.getElementById('price');
    const preparationTimeInput = document.getElementById('preparationTime');
    const categorySelect = document.getElementById('category');
    const availableCheckbox = document.getElementById('available');
    const imageInput = document.getElementById('image');
    const previewImage = document.getElementById('previewImage');
    const previewFileName = document.getElementById('previewFileName');
    const imageUploadPreview = document.getElementById('image-upload-preview');
    const removeImageBtn = document.getElementById('removeImageBtn');

    function openMenuItemModal() {
        menuItemModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling body when modal is open
    }

    function closeMenuItemModal() {
        menuItemModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scrolling
        resetForm(); // Clear form on close
    }

    function resetForm() {
        menuItemForm.reset();
        menuItemIdInput.value = ''; // Ensure hidden ID is cleared
        modalTitle.textContent = 'Добави нов елемент в менюто';
        submitBtn.textContent = 'Запази';
        menuItemForm.action = '/menu-item/add'; // Reset action to add

        // Reset image preview
        previewImage.src = '#';
        previewImage.style.display = 'none';
        previewFileName.textContent = '';
        imageUploadPreview.style.display = 'none';
        imageInput.value = ''; // Clear the file input
    }

    // Event listener for opening the Add modal
    if (addMenuItemBtn) {
        addMenuItemBtn.addEventListener('click', () => {
            resetForm(); // Always reset first when opening for 'Add'
            openMenuItemModal();
        });
    }

    // Event listeners for closing the modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeMenuItemModal);
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeMenuItemModal);
    }
    // Close modal if clicking outside (on overlay)
    if (menuItemModal) {
        menuItemModal.addEventListener('click', (e) => {
            if (e.target === menuItemModal) {
                closeMenuItemModal();
            }
        });
    }

    // Function to populate the modal for editing
    function populateEditForm(itemData) {
        menuItemIdInput.value = itemData.id;
        nameInput.value = itemData.name;
        descriptionInput.value = itemData.description;
        priceInput.value = itemData.price;
        preparationTimeInput.value = itemData.preparationTime;
        categorySelect.value = itemData.category;
        availableCheckbox.checked = itemData.available;

        // Handle image preview for existing image
        if (itemData.image) { // Assuming itemData.image contains the base64 string
            previewImage.src = 'data:image/jpeg;base64,' + itemData.image;
            previewImage.style.display = 'block';
            previewFileName.textContent = 'current_image.jpg'; // Or actual file name if available
            imageUploadPreview.style.display = 'flex';
        } else {
            previewImage.src = '#';
            previewImage.style.display = 'none';
            previewFileName.textContent = '';
            imageUploadPreview.style.display = 'none';
        }
        imageInput.value = ''; // Clear file input so user can choose new file

        modalTitle.textContent = 'Редактирай елемент от менюто';
        submitBtn.textContent = 'Запази промените';
        menuItemForm.action = '/menu-item/edit'; // Set action to edit
        openMenuItemModal();
    }

    // Event delegation for Edit buttons (since they are rendered by Thymeleaf)
    const menuItemsContainer = document.getElementById('menuItemsContainer');
    if (menuItemsContainer) {
        menuItemsContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btn-edit')) {
                const itemId = e.target.dataset.id;
                // Fetch item details from backend using AJAX
                try {
                    const response = await fetch(`/menu-item/details/${itemId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const itemData = await response.json();
                    populateEditForm(itemData);
                } catch (error) {
                    console.error('Error fetching menu item details:', error);
                    alert('Възникна грешка при зареждане на информацията за елемента.');
                }
            }
        });
    }

    // Image file input change listener for preview
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                    previewFileName.textContent = file.name;
                    imageUploadPreview.style.display = 'flex';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.src = '#';
                previewImage.style.display = 'none';
                previewFileName.textContent = '';
                imageUploadPreview.style.display = 'none';
            }
        });
    }

    // Remove image button functionality
    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            imageInput.value = ''; // Clear the file input
            previewImage.src = '#';
            previewImage.style.display = 'none';
            previewFileName.textContent = '';
            imageUploadPreview.style.display = 'none';
            // If you want to remove an already uploaded image from the server on edit,
            // you'd need an additional hidden input or flag to signal this to the backend.
            // For now, it just clears the selection in the form.
        });
    }

});