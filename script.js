// Initialize localStorage if empty
if (!localStorage.getItem('appData')) {
    localStorage.setItem('appData', JSON.stringify({
        months: {},
        tempData: {}
    }));
}

// Login functionality
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'admin' && password === 'admin') {
        document.getElementById('login-page').classList.remove('active');
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('main-page').classList.remove('hidden');
        startClock();
        loadLastSelectedMonth();
    } else {
        alert('اسم المستخدم أو كلمة المرور غير صحيح');
    }
}

// Load last selected month if any
function loadLastSelectedMonth() {
    const lastMonth = localStorage.getItem('lastSelectedMonth');
    if (lastMonth) {
        document.getElementById('monthSelect').value = lastMonth;
        document.getElementById('menuButtons').classList.remove('hidden');
        loadSavedData(lastMonth);
    }
}

// Clock and Date functionality
function startClock() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
}

function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true 
    });
    const dateString = now.toLocaleDateString('ar-EG', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('clock').textContent = timeString;
    document.getElementById('date').textContent = dateString;
}

// Month selection
document.getElementById('monthSelect').addEventListener('change', function() {
    const menuButtons = document.getElementById('menuButtons');
    if (this.value) {
        menuButtons.classList.remove('hidden');
        loadSavedData(this.value);
    } else {
        menuButtons.classList.add('hidden');
    }
});

// Section navigation
function showSection(sectionId) {
    const sections = ['products', 'purchaseInvoice', 'salesInvoice'];
    sections.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
        selectedSection.classList.remove('hidden');
    }
}

// Product form handling
const productDetails = {
    dates: { name: 'علبة تمر', unit: 'كجم' },
    ajwa: { name: 'علبة عجوة', unit: 'كجم' },
    biscuits: { name: 'بسكوت بالتمر', unit: 'كيس' },
    juice: { name: 'علبة عصير تمر', unit: 'علبة' }
};

function showProductForm(productType) {
    const product = productDetails[productType];
    document.getElementById('products').classList.add('hidden');
    document.getElementById('productForm').classList.remove('hidden');
    document.getElementById('productTitle').textContent = product.name;
    document.getElementById('productName').value = product.name;
    document.getElementById('quantityUnit').textContent = product.unit;
    clearForm();
}

function clearForm() {
    ['quantity', 'unitPrice', 'currentStock', 'soldItems', 'remainingItems', 'total'].forEach(id => {
        document.getElementById(id).value = '';
    });
}

function calculateRemaining() {
    const currentStock = Number(document.getElementById('currentStock').value) || 0;
    const quantity = Number(document.getElementById('quantity').value) || 0;
    const soldItems = quantity; // Set sold items equal to quantity
    const remainingItems = currentStock - soldItems;
    
    document.getElementById('remainingItems').value = remainingItems;
    document.getElementById('soldItems').value = soldItems;
}

function calculateTotal() {
    const quantity = Number(document.getElementById('quantity').value) || 0;
    const unitPrice = Number(document.getElementById('unitPrice').value) || 0;
    document.getElementById('total').value = quantity * unitPrice;
}

// Local Storage functions
function saveTemp() {
    const formData = {
        productName: document.getElementById('productName').value,
        quantity: document.getElementById('quantity').value,
        unitPrice: document.getElementById('unitPrice').value,
        currentStock: document.getElementById('currentStock').value,
        soldItems: document.getElementById('soldItems').value,
        remainingItems: document.getElementById('remainingItems').value,
        total: document.getElementById('total').value,
        unit: document.getElementById('quantityUnit').textContent
    };
    
    const currentMonth = document.getElementById('monthSelect').value;
    const storageKey = `tempFormData_${currentMonth}_${formData.productName}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));
    alert('تم حفظ البيانات مؤقتاً');
}

function deleteData() {
    const productName = document.getElementById('productName').value;
    const currentMonth = document.getElementById('monthSelect').value;
    const storageKey = `tempFormData_${currentMonth}_${productName}`;
    
    localStorage.removeItem(storageKey);
    clearForm();
    alert('تم حذف البيانات');
}

function restoreData() {
    const productName = document.getElementById('productName').value;
    const currentMonth = document.getElementById('monthSelect').value;
    const storageKey = `tempFormData_${currentMonth}_${productName}`;
    
    const savedData = JSON.parse(localStorage.getItem(storageKey));
    if (savedData) {
        Object.keys(savedData).forEach(key => {
            if (document.getElementById(key)) {
                document.getElementById(key).value = savedData[key];
            }
        });
        alert('تم استعادة البيانات');
    } else {
        alert('لا توجد بيانات محفوظة');
    }
}

function addToInvoices() {
    const currentMonth = document.getElementById('monthSelect').value;
    if (!currentMonth) {
        alert('الرجاء اختيار الشهر أولاً');
        return;
    }

    const formData = {
        productName: document.getElementById('productName').value,
        quantity: document.getElementById('quantity').value,
        unitPrice: document.getElementById('unitPrice').value,
        currentStock: document.getElementById('currentStock').value,
        soldItems: document.getElementById('soldItems').value,
        remainingItems: document.getElementById('remainingItems').value,
        total: document.getElementById('total').value,
        unit: document.getElementById('quantityUnit').textContent
    };

    // Validate data
    if (!formData.quantity || !formData.unitPrice || !formData.currentStock) {
        alert('الرجاء ملء جميع البيانات المطلوبة');
        return;
    }

    // Add to purchase invoice
    addToPurchaseInvoice(formData, currentMonth);
    
    // Add to sales invoice
    addToSalesInvoice(formData, currentMonth);
    
    // Save to local storage
    saveInvoicesToStorage(currentMonth);
    
    alert('تم إضافة البيانات إلى الفواتير');
}

function addToPurchaseInvoice(data, month) {
    const table = document.querySelector('#purchaseTable tbody');
    const row = table.insertRow();
    const soldItems = Number(data.quantity) || 0;
    
    row.innerHTML = `
        <td>${data.productName}</td>
        <td>${data.unit}</td>
        <td>${data.quantity}</td>
        <td>${data.unitPrice}</td>
        <td>${data.total}</td>
        <td>${soldItems}</td>
        <td><button onclick="deletePurchaseRow(this)">حذف</button></td>
    `;
    savePurchaseData(month);
}

function addToSalesInvoice(data, month) {
    const table = document.querySelector('#salesTable tbody');
    const row = table.insertRow();
    const soldItems = Number(data.quantity) || 0;
    const remainingItems = Number(data.currentStock) - soldItems;
    
    row.innerHTML = `
        <td>${data.productName}</td>
        <td>${data.unit}</td>
        <td>${data.quantity}</td>
        <td>${data.currentStock}</td>
        <td>${remainingItems}</td>
        <td>${soldItems}</td>
        <td>${data.unitPrice}</td>
        <td><button onclick="deleteSalesRow(this)">حذف</button></td>
    `;
    saveSalesData(month);
}

function deletePurchaseRow(button) {
    deleteRow(button, 'purchase');
}

function deleteSalesRow(button) {
    deleteRow(button, 'sales');
}

function deleteRow(button, table) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    
    // Save the updated data
    const currentMonth = document.getElementById('monthSelect').value;
    if (currentMonth) {
        if (table === 'purchase') {
            savePurchaseData(currentMonth);
        } else if (table === 'sales') {
            saveSalesData(currentMonth);
        }
    }
}

function savePurchaseData(month) {
    const table = document.getElementById('purchaseTable');
    const data = Array.from(table.rows).slice(1).map(row => {
        return Array.from(row.cells).slice(0, -1).map(cell => cell.textContent);
    });
    localStorage.setItem(`purchaseInvoiceData_${month}`, JSON.stringify(data));
}

function saveSalesData(month) {
    const table = document.getElementById('salesTable');
    const data = Array.from(table.rows).slice(1).map(row => {
        return Array.from(row.cells).slice(0, -1).map(cell => cell.textContent);
    });
    localStorage.setItem(`salesInvoiceData_${month}`, JSON.stringify(data));
}

function saveInvoicesToStorage(month) {
    savePurchaseData(month);
    saveSalesData(month);
}

// Save functions
function saveInvoice(type) {
    const currentMonth = document.getElementById('monthSelect').value;
    if (!currentMonth) {
        alert('الرجاء اختيار الشهر أولاً');
        return;
    }

    let appData = JSON.parse(localStorage.getItem('appData'));
    if (!appData || !appData.months[currentMonth]) {
        appData.months[currentMonth] = {
            purchase: [],
            sales: []
        };
    }

    const table = document.getElementById(type + 'Table');
    const data = Array.from(table.rows).slice(1).map(row => {
        return Array.from(row.cells).slice(0, -1).map(cell => cell.textContent);
    });

    appData.months[currentMonth][type] = data;
    localStorage.setItem('appData', JSON.stringify(appData));
    localStorage.setItem('lastSelectedMonth', currentMonth);

    alert('تم حفظ البيانات بنجاح');
}

// Print functions with direct printer access
function printInvoice(type) {
    // Get the current date and time in Arabic format
    const now = new Date();
    const dateString = now.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeString = now.toLocaleTimeString('ar-EG', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    // Create and insert the print header
    const headerDiv = document.createElement('div');
    headerDiv.className = 'print-header';
    headerDiv.innerHTML = `
        <img src="logo.png" alt="شعار الشركة">
        <h1>شركة الأطيبان A.M.B لتمور الوادي</h1>
        <div class="print-datetime">
            <div>${dateString}</div>
            <div>${timeString}</div>
        </div>
    `;

    // Get the invoice section and create a clone for printing
    const originalSection = document.getElementById(type + 'Invoice');
    const printSection = originalSection.cloneNode(true);
    
    // Remove all buttons from the print section
    printSection.querySelectorAll('button, .invoice-buttons').forEach(el => el.remove());
    
    // Create a new print container
    const printContainer = document.createElement('div');
    printContainer.className = 'print-container';
    printContainer.appendChild(headerDiv);
    printContainer.appendChild(printSection);
    
    // Store the original body content
    const originalContent = document.body.innerHTML;
    
    // Replace body content with print content
    document.body.innerHTML = printContainer.innerHTML;
    
    // Print the document
    window.print();
    
    // Restore the original content after printing
    setTimeout(() => {
        document.body.innerHTML = originalContent;
        // Reattach event listeners
        initializeEventListeners();
    }, 500);
}

function initializeEventListeners() {
    // Reattach all necessary event listeners
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('productType')?.addEventListener('change', handleProductTypeChange);
    document.getElementById('quantity')?.addEventListener('input', calculateTotal);
    document.getElementById('unitPrice')?.addEventListener('input', calculateTotal);
    document.getElementById('currentStock')?.addEventListener('input', calculateRemaining);
    document.getElementById('monthSelect')?.addEventListener('change', handleMonthChange);
    
    // Re-initialize the clock
    startClock();
}

// Load saved data
function loadSavedData(month) {
    const appData = JSON.parse(localStorage.getItem('appData'));
    if (!appData || !appData.months[month]) return;

    const monthData = appData.months[month];
    
    // Clear existing data
    document.querySelector('#purchaseTable tbody').innerHTML = '';
    document.querySelector('#salesTable tbody').innerHTML = '';
    
    // Load purchase invoice data
    if (monthData.purchase) {
        monthData.purchase.forEach(rowData => {
            const row = document.querySelector('#purchaseTable tbody').insertRow();
            row.innerHTML = `
                <td>${rowData[0]}</td>
                <td>${rowData[1]}</td>
                <td>${rowData[2]}</td>
                <td>${rowData[3]}</td>
                <td>${rowData[4]}</td>
                <td>${rowData[5]}</td>
                <td><button onclick="deletePurchaseRow(this)">حذف</button></td>
            `;
        });
    }
    
    // Load sales invoice data
    if (monthData.sales) {
        monthData.sales.forEach(rowData => {
            const row = document.querySelector('#salesTable tbody').insertRow();
            row.innerHTML = `
                <td>${rowData[0]}</td>
                <td>${rowData[1]}</td>
                <td>${rowData[2]}</td>
                <td>${rowData[3]}</td>
                <td>${rowData[4]}</td>
                <td>${rowData[5]}</td>
                <td>${rowData[6]}</td>
                <td><button onclick="deleteSalesRow(this)">حذف</button></td>
            `;
        });
    }
}

// Load saved data on page load
window.addEventListener('load', () => {
    const appData = JSON.parse(localStorage.getItem('appData'));
    if (!appData) return;

    const lastMonth = localStorage.getItem('lastSelectedMonth');
    if (lastMonth) {
        document.getElementById('monthSelect').value = lastMonth;
        document.getElementById('menuButtons').classList.remove('hidden');
        loadSavedData(lastMonth);
    }
});

