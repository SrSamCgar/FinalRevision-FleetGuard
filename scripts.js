// Core Variables
let currentLanguage = 'es';
let currentTheme = 'light';
let currentWorker = null;
let currentIndex = 0;
let currentInspectionData = {};
let currentItemStatus = null;
let lastCaptureTime = 0;

// Configuration Data
const workers = {
    '1234': { id: '003', name: 'Juan Ramon', password: 'abcd1234', role: 'user', inspections: [], status: 'active' },
    '5678': { id: '004', name: 'Maria Lopez', password: 'maria5678', role: 'user', inspections: [], status: 'inactive' },
    '9876': { id: '005', name: 'Carlos Perez', password: 'carlos9876', role: 'auditor', inspections: [], status: 'active' },
    '4321': { id: '006', name: 'Ana Garcia', password: 'ana4321', role: 'auditor', inspections: [], status: 'inactive' },
    '9999': { id: '001', name: 'Admin User', password: 'admin123', role: 'admin', inspections: [], status: 'active' },
    '1111': { id: '007', name: 'Luis Fernandez', password: 'luis1111', role: 'admin', inspections: [], status: 'active' },
    '2222': { id: '008', name: 'Sofia Martinez', password: 'sofia2222', role: 'admin', inspections: [], status: 'inactive' },
    '3333': { id: '009', name: 'Pedro Gomez', password: 'pedro3333', role: 'admin', inspections: [], status: 'active' }
};

const trucks = {
    'T001': { id: 'T001', model: 'Kenworth T680', year: 2020, driver: 'Carlos Perez' },
    'T002': { id: 'T002', model: 'Freightliner Cascadia', year: 2019, driver: 'Ana Lopez' },
    'T003': { id: 'T003', model: 'Volvo VNL 760', year: 2021, driver: 'Luis Martinez' },
    'T004': { id: 'T004', model: 'International LT625', year: 2018, driver: 'Sofia Ramirez' },
    'T005': { id: 'T005', model: 'Peterbilt 579', year: 2022, driver: 'Miguel Hernandez' }
};

// Lista de items de inspección
const inspectionItems = [
    { 
        id: 'tires', 
        name: { en: 'Tires', es: 'Llantas' }, 
        icon: '🚗', 
        description: { 
            en: 'Check for proper inflation, no visible damage, and sufficient tread depth.', 
            es: 'Verifique que estén correctamente infladas, sin daños visibles y con suficiente profundidad de dibujo.' 
        },
        requiredPhotos: 2  // Se requieren 4 fotos (una por cada llanta)
    },
    { 
        id: 'mirrors', 
        name: { en: 'Rearview Mirrors', es: 'Espejos Retrovisores' }, 
        icon: '🪞', 
        description: { 
            en: 'Ensure both mirrors are properly aligned, clean, and free from damage.', 
            es: 'Asegúrese de que ambos espejos estén correctamente alineados, limpios y sin daños.' 
        },
        requiredPhotos: 0  // Se requieren 2 fotos (espejo izquierdo y derecho)
    },
    { 
        id: 'license_plates', 
        name: { en: 'License Plates', es: 'Placas Delantera y Trasera' }, 
        icon: '🔖', 
        description: { 
            en: 'Confirm that both plates are securely attached and clearly visible.', 
            es: 'Confirme que ambas placas estén firmemente sujetas y sean claramente visibles.' 
        },
        requiredPhotos: 0  // Se requieren 2 fotos (placa delantera y trasera)
    },
    { 
        id: 'cleanliness', 
        name: { en: 'Cleanliness', es: 'Limpieza' }, 
        icon: '🧼', 
        description: { 
            en: 'Ensure the vehicle is clean, both exterior and interior.', 
            es: 'Asegúrese de que el vehículo esté limpio, tanto exterior como interior.' 
        },
	requiredPhotos: 0 //unica foto central pasillo
    },
    { 
        id: 'scratches', 
        name: { en: 'Exterior Scratches', es: 'Rayones del Exterior' }, 
        icon: '🔍', 
        description: { 
            en: 'Check for any visible scratches or dents on the exterior.', 
            es: 'Verifique si hay rayones o abolladuras visibles en el exterior.' 
        },
        requiredPhotos: 0  // Se requieren 3 fotos (lateral izquierdo, derecho y frontal)
    },
    { 
        id: 'headlights_taillights', 
        name: { en: 'Headlights and Taillights', es: 'Faros Delanteros y Traseros' }, 
        icon: '💡', 
        description: { 
            en: 'Ensure they are not broken or foggy and are functioning properly.', 
            es: 'Asegúrese de que no estén rotos u opacos y que funcionen correctamente.' 
        },
        requiredPhotos: 0  // Se requieren 2 fotos (faros delanteros y traseros)
    },
    { 
        id: 'compartments', 
        name: { en: 'Compartments', es: 'Gavetas' }, 
        icon: '🗄️', 
        description: { 
            en: 'Check the compartments for cleanliness and general condition.', 
            es: 'Verifique la limpieza y el estado general de las gavetas.' 
        },
        requiredPhotos: 0  // Se requieren 2 fotos (lado izquierdo y derecho)
    }
];

// Notification Messages
const notificationMessages = {
    welcome: { en: 'Welcome', es: 'Bienvenido' },
    invalidWorker: { en: 'Invalid Worker ID or Password', es: 'ID de Trabajador o Contraseña inválidos' },
    truckSelected: { en: 'Truck selected:', es: 'Camión seleccionado:' },
    invalidTruckId: { en: 'Invalid Truck ID', es: 'ID de Camión inválido' },
    imageProcessing: { en: 'Processing image...', es: 'Procesando imagen...' }
};

// Initialize Application
function initializeApp() {
    try {
        // Load saved data
        loadSavedData();
        
        // Initialize language and theme
        //initializeLanguage();
       // initializeTheme();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initialize mobile optimizations
        initializeMobileOptimizations();
        
        console.log('App initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showNotification('Error initializing application', 'error');
    }
}

function loadSavedData() {
    try {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) currentLanguage = savedLanguage;
        
        const savedTheme = localStorage.getItem('preferredTheme');
        if (savedTheme) {
            currentTheme = savedTheme;
            document.body.classList.toggle('dark-theme', savedTheme === 'dark');
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
    }
}

function setupEventListeners() {
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.style.display = 'none';
        });
        
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.style.display = 'block';
            loginScreen.classList.add('active');
        }
    });

    window.addEventListener('beforeunload', () => {
        try {
            localStorage.setItem('preferredLanguage', currentLanguage);
            localStorage.setItem('preferredTheme', currentTheme);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initializeApp);
// Authentication Functions
function login() {
    const workerId = document.getElementById('workerId')?.value?.trim();
    const password = document.getElementById('workerPassword')?.value?.trim();

    if (!workerId || !password) {
        showNotification('Please fill in both fields', 'error');
        return;
    }

    if (!workers[workerId] || workers[workerId].password !== password) {
        showNotification('Invalid credentials', 'error');
        return;
    }

    // Set current worker
    currentWorker = workers[workerId];
    showNotification(`Welcome, ${currentWorker.name}!`, 'success');

    // Close modals and hide screens
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });

    // Navigate based on role
    if (currentWorker.role === 'admin') {
        showAdminDashboard();
    } else {
        showScreen('truckIdScreen');
    }
}

function startDemoMode() {
    currentWorker = { 
        id: '000', 
        name: 'Demo User', 
        role: 'user',
        inspections: []
    };

    showNotification('Demo mode started', 'success');
    resetScreens();
    showScreen('truckIdScreen');
}

// Screen Management
function showScreen(screenId) {
    // Close modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });

    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove('active');
    });

    // Show selected screen
    const selectedScreen = document.getElementById(screenId);
    if (selectedScreen) {
        selectedScreen.style.display = 'block';
        selectedScreen.classList.add('active');
        
        // Update screen-specific content
        if (screenId === 'adminScreen') {
            updateAdminStats();
            updateRecentInspections();
        }
    }

    // Update mobile optimizations
    updateScreenForMobile(screenId);
}

// Mobile Screen Optimization
function updateScreenForMobile(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;

    screen.style.overflow = 'auto';
    screen.style.webkitOverflowScrolling = 'touch';

    const navButtons = screen.querySelector('.nav-buttons');
    if (navButtons) {
        screen.style.paddingBottom = `${navButtons.offsetHeight + 16}px`;
    }
}

function resetScreens() {
    currentInspectionData = {};
    currentIndex = 0;
    currentItemStatus = null;
    
    const photoPreview = document.getElementById('photoPreview');
    const commentBox = document.getElementById('commentBox');
    
    if (photoPreview) {
        photoPreview.style.display = 'none';
        photoPreview.src = '';
    }
    
    if (commentBox) {
        commentBox.value = '';
    }
}

// Language and Theme Management
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    updateLanguage();
    localStorage.setItem('preferredLanguage', currentLanguage);
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
    localStorage.setItem('preferredTheme', currentTheme);
}

function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = el.getAttribute('data-lang') === currentLanguage ? 'inline' : 'none';
    });
}
// Inspection Management
function startInspection() {
    const truckId = document.getElementById('truckId').value.trim();

    if (!trucks[truckId]) {
        showNotification('Invalid truck ID', 'error');
        return;
    }

    const truck = trucks[truckId];
    showNotification(`Truck selected: ${truck.model}, ${truck.year}`, 'success');
    resetInspection();
    showScreen('inspectionScreen');
    updateInspectionDisplay();
    updateProgressBar();
}

function resetInspection() {
    currentIndex = 0;
    currentInspectionData = {};
    currentItemStatus = null;
    
    const elements = {
        photoPreview: document.getElementById('photoPreview'),
        commentBox: document.getElementById('commentBox'),
        charCount: document.getElementById('charCount')
    };
    
    if (elements.photoPreview) {
        elements.photoPreview.style.display = 'none';
        elements.photoPreview.src = '';
    }
    
    if (elements.commentBox) {
        elements.commentBox.value = '';
    }
    
    if (elements.charCount) {
        elements.charCount.textContent = '0/150';
    }
}

function updateInspectionDisplay() {
    const item = inspectionItems[currentIndex];
    if (!item) {
        console.error('Invalid inspection index');
        return;
    }

    const currentData = currentInspectionData[item.id] || { comment: '', photos: [], status: null };

    // Update UI elements
    document.getElementById('currentName').textContent = `${item.icon} ${item.name[currentLanguage]}`;
    document.getElementById('currentDescription').textContent = item.description[currentLanguage];
    document.getElementById('commentBox').value = currentData.comment || '';
    updateCharCount();

    // Update photo preview if exists
    const photoPreview = document.getElementById('photoPreview');
    if (currentData.photos?.length > 0) {
        photoPreview.src = currentData.photos[currentData.photos.length - 1];
        photoPreview.style.display = 'block';
    } else {
        photoPreview.style.display = 'none';
        photoPreview.src = '';
    }

    // Update status buttons
    document.querySelectorAll('.status-btn').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.status === currentData.status) {
            button.classList.add('active');
        }
    });

    validateNextButton(currentData.comment?.length || 0, 30, 150);
}

function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        const progress = ((currentIndex + 1) / inspectionItems.length) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function setItemStatus(status) {
    currentItemStatus = status;
    const btn = event.currentTarget;
    
    document.querySelectorAll('.status-btn').forEach(button => {
        button.classList.remove('active');
    });
    
    btn.classList.add('active');
    
    const item = inspectionItems[currentIndex];
    currentInspectionData[item.id] = {
        ...currentInspectionData[item.id],
        status: status
    };
    
    updateCharCount();
}

async function nextItem() {
    const item = inspectionItems[currentIndex];
    const requiredPhotos = item.requiredPhotos ?? 0;
    const currentPhotos = currentInspectionData[item.id]?.photos || [];
    const comment = document.getElementById('commentBox').value;

    // Skip photo validation if no photos required
    if (requiredPhotos > 0 && currentPhotos.length < requiredPhotos) {
        showNotification(`${requiredPhotos - currentPhotos.length} more photos required`, 'error');
        return;
    }

    // Save current item data
    currentInspectionData[item.id] = {
        ...currentInspectionData[item.id],
        comment: comment,
        status: currentItemStatus,
        timestamp: new Date().toISOString()
    };

    // Move to next item or complete inspection
    if (currentIndex < inspectionItems.length - 1) {
        currentIndex++;
        updateInspectionDisplay();
        updateProgressBar();
        currentItemStatus = null;
    } else {
        completeInspection();
    }
}

function previousItem() {
    if (currentIndex > 0) {
        currentIndex--;
        updateInspectionDisplay();
        updateProgressBar();
        currentItemStatus = null;
    } else {
        showNotification('This is the first item', 'warning');
    }
}

function completeInspection() {
    const truckId = document.getElementById('truckId').value.trim();
    
    // Create inspection record
    const inspectionRecord = {
        worker: currentWorker.name,
        truckId: truckId,
        date: new Date().toLocaleString(),
        data: { ...currentInspectionData }
    };

    // Add to records array
    if (!Array.isArray(window.records)) {
        window.records = [];
    }
    window.records.push(inspectionRecord);

    // Save to localStorage
    try {
        localStorage.setItem('inspectionRecords', JSON.stringify(window.records));
    } catch (error) {
        console.error('Error saving inspection record:', error);
    }

    showNotification('Inspection completed successfully', 'success');
    showScreen('recordsScreen');
}

function validateNextButton(charCount, minCharLimit, maxCharLimit) {
    const nextButton = document.getElementById('nextButton');
    const isValid = charCount >= minCharLimit && 
                   charCount <= maxCharLimit && 
                   currentItemStatus !== null;
    
    nextButton.disabled = !isValid;
    nextButton.classList.toggle('disabled', !isValid);
}

function updateCharCount() {
    const commentBox = document.getElementById('commentBox');
    const charCountDisplay = document.getElementById('charCount');
    
    if (!commentBox || !charCountDisplay) return;
    
    const charCount = commentBox.value.length;
    charCountDisplay.textContent = `${charCount}/150`;
    validateNextButton(charCount, 30, 150);
}
// Image Processing and Camera Functions
async function openCamera() {
    const item = inspectionItems[currentIndex];
    const requiredPhotos = item.requiredPhotos || 0;

    // Skip if no photos required
    if (requiredPhotos === 0) {
        showNotification(`No photos required for this item`, 'info');
        return;
    }

    // Prevent rapid camera opens
    if (Date.now() - lastCaptureTime < 1000) {
        console.log('Preventing multiple rapid camera opens');
        return;
    }

    lastCaptureTime = Date.now();

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.multiple = true;

    input.addEventListener('change', async (event) => {
        const files = Array.from(event.target.files);

        if (!files.length) {
            console.log('No files selected');
            return;
        }

        // Initialize photos array if needed
        if (!currentInspectionData[item.id]) {
            currentInspectionData[item.id] = { photos: [] };
        }

        for (let file of files) {
            try {
                // Validate file size
                if (file.size > 10 * 1024 * 1024) {
                    showNotification('Image too large. Maximum 10MB allowed.', 'error');
                    continue;
                }

                // Process and resize image
                const resizedImage = await resizeImage(file);
                currentInspectionData[item.id].photos.push(resizedImage);

                showNotification('Photo uploaded successfully', 'success');
            } catch (error) {
                console.error('Error processing image:', error);
                showNotification('Error processing image', 'error');
            }
        }

        // Update photo preview
        const photoPreview = document.getElementById('photoPreview');
        if (photoPreview && currentInspectionData[item.id].photos.length > 0) {
            const lastPhoto = currentInspectionData[item.id].photos.slice(-1)[0];
            photoPreview.src = lastPhoto;
            photoPreview.style.display = 'block';
        }

        // Check if required photos are met
        const currentPhotos = currentInspectionData[item.id].photos.length;
        if (currentPhotos >= requiredPhotos) {
            showNotification('All required photos uploaded', 'success');
        } else {
            showNotification(
                `${requiredPhotos - currentPhotos} more photos required`,
                'warning'
            );
        }
    });

    input.click();
}

async function resizeImage(file, maxWidth = 1280, maxHeight = 960, quality = 0.75) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress image
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to base64
                resolve(canvas.toDataURL('image/jpeg', quality));
            };

            img.onerror = () => reject(new Error('Error loading image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Error reading file'));
        reader.readAsDataURL(file);
    });
}

async function analyzePhotoWithOpenAI(base64Images) {
    const item = inspectionItems[currentIndex];
    const componentName = item.name[currentLanguage];

    if (item.requiredPhotos === 0) {
        return `Component: ${componentName}\nStatus: No photo analysis required`;
    }

    if (!Array.isArray(base64Images) || base64Images.length === 0) {
        console.error('No images provided for analysis');
        return 'Error: No images provided for analysis';
    }

    try {
        const responses = await Promise.allSettled(
            base64Images.map(async (base64Image, index) => {
                const base64Content = base64Image.split(',')[1];

                const response = await fetch('https://fleet-guard-test.vercel.app/api/openai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt: `Analyze the component: ${componentName}`,
                        image: base64Content
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error: ${response.status}`);
                }

                const data = await response.json();
                return data.result;
            })
        );

        return responses
            .map((result, index) => {
                if (result.status === 'fulfilled') {
                    return `Image ${index + 1}: ${result.value}`;
                }
                return `Image ${index + 1}: Analysis failed`;
            })
            .join('\n');

    } catch (error) {
        console.error('Error analyzing photos:', error);
        return 'Error analyzing photos';
    }
}
// Admin Dashboard Functions
function showAdminDashboard() {
    showScreen('adminScreen');
    document.getElementById('menuToggleBtn').style.display = 'block';
    updateAdminStats();
    updateRecentInspections();
}

function updateAdminStats() {
    if (!window.records) window.records = [];
    
    const stats = {
        totalInspections: window.records.length,
        criticalCount: 0,
        activeVehicles: new Set()
    };

    window.records.forEach(record => {
        stats.activeVehicles.add(record.truckId);
        
        const hasCritical = Object.values(record.data).some(
            item => item.status === 'critical'
        );
        if (hasCritical) stats.criticalCount++;
    });

    // Update UI
    document.getElementById('totalInspections').textContent = stats.totalInspections;
    document.getElementById('criticalIssues').textContent = stats.criticalCount;
    document.getElementById('activeVehicles').textContent = stats.activeVehicles.size;
}

function updateRecentInspections() {
    const tableBody = document.getElementById('recentInspectionsTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const recentInspections = window.records?.slice(-5).reverse() || [];

    recentInspections.forEach(inspection => {
        const hasCritical = Object.values(inspection.data).some(
            item => item.status === 'critical'
        );
        const hasWarning = Object.values(inspection.data).some(
            item => item.status === 'warning'
        );
        
        const status = hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'OK';
        const statusColor = hasCritical ? '#ef4444' : hasWarning ? '#f59e0b' : '#10b981';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${inspection.date}</td>
            <td>${inspection.worker}</td>
            <td>${inspection.truckId}</td>
            <td><span style="color: ${statusColor}; font-weight: bold;">${status}</span></td>
            <td>
                <button class="btn" onclick="viewInspectionDetails('${inspection.truckId}')">
                    View Details
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// User Management Functions
function showUserManagement() {
    toggleSidebar();
    showScreen('userManagementScreen');
    displayUsers();
}

function displayUsers() {
    const tableBody = document.getElementById('userTableBody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';

    Object.entries(workers).forEach(([id, user]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.role}</td>
            <td>${user.lastActivity || 'No activity'}</td>
            <td>${user.status}</td>
            <td>
                <button class="btn btn-secondary" onclick="editUser('${id}')">Edit</button>
                <button class="btn btn-secondary" onclick="toggleUserStatus('${id}')">
                    ${user.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function showAddUserForm() {
    const userModal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    
    modalTitle.textContent = 'Add User';
    userForm.reset();
    userModal.style.display = 'block';
}

function editUser(userId) {
    const user = workers[userId];
    if (!user) return;

    const elements = {
        modal: document.getElementById('userModal'),
        title: document.getElementById('modalTitle'),
        id: document.getElementById('userId'),
        name: document.getElementById('userName'),
        role: document.getElementById('userRole'),
        password: document.getElementById('userPassword')
    };

    elements.title.textContent = 'Edit User';
    elements.id.value = user.id;
    elements.name.value = user.name;
    elements.role.value = user.role;
    elements.password.value = user.password;
    elements.modal.style.display = 'block';
}

function handleUserSubmit(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const userData = {
        id: userId,
        name: document.getElementById('userName').value,
        role: document.getElementById('userRole').value,
        password: document.getElementById('userPassword').value,
        status: 'active',
        lastActivity: new Date().toLocaleString()
    };

    workers[userId] = userData;
    closeUserModal();
    displayUsers();
    showNotification('User saved successfully', 'success');
}

function toggleUserStatus(userId) {
    if (!workers[userId]) return;
    
    workers[userId].status = workers[userId].status === 'active' ? 'inactive' : 'active';
    displayUsers();
    showNotification(
        `User ${workers[userId].status === 'active' ? 'activated' : 'deactivated'} successfully`,
        'success'
    );
}

function closeUserModal() {
    const userModal = document.getElementById('userModal');
    if (userModal) userModal.style.display = 'none';
}

// Sidebar Management
function toggleSidebar() {
    const sidebar = document.getElementById('adminSidebar');
    if (!sidebar) return;

    sidebar.classList.toggle('open');
    
    const menuBtn = document.getElementById('menuToggleBtn');
    if (menuBtn) {
        menuBtn.innerHTML = sidebar.classList.contains('open') ? '✕' : '☰';
    }
}
// Utility Functions
function showNotification(message, type = 'success') {
    const notification = document.getElementById('customNotification');
    if (!notification) return;

    notification.textContent = message;
    notification.className = `custom-notification ${type} show`;

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function validateInputs() {
    const workerId = document.getElementById('workerId').value.trim();
    const password = document.getElementById('workerPassword').value.trim();

    const workerIdPattern = /^\d{4,6}$/;
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/;

    if (!workerIdPattern.test(workerId)) {
        showNotification('Worker ID must contain 4-6 digits', 'error');
        return false;
    }

    if (!passwordPattern.test(password)) {
        showNotification('Password must contain letters and numbers, 6-12 characters', 'error');
        return false;
    }

    return true;
}

// Mobile Optimization Functions
function initializeMobileOptimizations() {
    setupTouchHandling();
    fixIOSIssues();
    handleOrientationChanges();
    setupScrolling();
}

function setupTouchHandling() {
    // Prevent double-tap zoom
    document.querySelectorAll('button, input, select').forEach(element => {
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            element.click();
        });
    });

    // Improve touch response
    document.addEventListener('touchstart', () => {}, { passive: true });
    document.addEventListener('touchmove', () => {}, { passive: true });
}

function fixIOSIssues() {
    // Fix input zoom
    const meta = document.querySelector('meta[name="viewport"]');
    if (meta) {
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }

    // Fix iOS input focus
    document.addEventListener('focus', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            document.body.scrollTop = 0;
        }
    }, true);
}

function handleOrientationChanges() {
    window.addEventListener('orientationchange', () => {
        // Reset scroll position
        window.scrollTo(0, 0);
        
        // Update viewport height
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        
        // Recalculate layouts after orientation change
        setTimeout(() => {
            updateScreenForMobile(
                document.querySelector('.screen.active')?.id
            );
        }, 300);
    });
}

function setupScrolling() {
    // Enable smooth scrolling
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.overflow = 'auto';
        screen.style.webkitOverflowScrolling = 'touch';
        screen.addEventListener('scroll', handleScroll);
    });
}

function handleScroll(e) {
    const navButtons = document.querySelector('.nav-buttons');
    if (!navButtons) return;

    const scrollHeight = e.target.scrollHeight;
    const scrollTop = e.target.scrollTop;
    const clientHeight = e.target.clientHeight;

    // Show/hide navigation based on scroll position
    navButtons.classList.toggle(
        'nav-buttons-visible',
        scrollHeight - scrollTop === clientHeight
    );
}

// Error Handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Operation failed. Please try again.', 'error');
});

// Cache Management
const CacheManager = {
    set: async (key, data, expiry = 3600) => {
        try {
            const item = {
                data,
                timestamp: Date.now(),
                expiry
            };
            await localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    },
    
    get: async (key) => {
        try {
            const item = JSON.parse(await localStorage.getItem(key));
            if (!item) return null;
            
            if (Date.now() - item.timestamp > item.expiry * 1000) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.data;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
};

// Export functions to window
Object.assign(window, {
    login,
    startDemoMode,
    showScreen,
    startInspection,
    previousItem,
    nextItem,
    openCamera,
    toggleLanguage,
    toggleTheme,
    showUserManagement,
    toggleSidebar
});
