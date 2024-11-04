// Importing jsPDF library
const { jsPDF } = window.jspdf;

// DOM Elements
const generateInvoiceButton = document.getElementById("generateInvoice");
const downloadAllInvoicesButton = document.getElementById("downloadAllInvoices");
const exportToCSVButton = document.getElementById("exportToCSV");
const itemList = document.getElementById("itemList");
const invoicesContainer = document.getElementById("invoicesContainer");

// Global Variables
const invoices = [];
let currentItems = [];

// Event Listeners
document.getElementById("addItem").addEventListener("click", addItem);
document.getElementById("defaultItems").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
        document.getElementById("itemName").value = selectedOption.text.split(' - ')[0];
        document.getElementById("itemPrice").value = parseFloat(selectedOption.text.split(' - ₹')[1]);
    }
});

// Invoice Management
generateInvoiceButton.addEventListener("click", function () {
    const clientName = document.getElementById("clientName").value;
    const clientAddress = document.getElementById("clientAddress").value;
    const tax = parseFloat(document.getElementById("tax").value);

    if (clientName && clientAddress && currentItems.length > 0) {
        const totalAmount = currentItems.reduce((total, item) => total + item.itemTotal, 0);
        const taxAmount = (tax / 100) * totalAmount;
        const finalAmount = totalAmount + taxAmount;

        const invoice = { clientName, clientAddress, items: currentItems, totalAmount, tax, taxAmount, finalAmount };
        invoices.push(invoice);
        const invoiceElement = createInvoice(invoice);
        invoicesContainer.appendChild(invoiceElement);
        clearForm();
    } else {
        alert("Please fill in all fields correctly and add at least one item.");
    }
});

function createInvoice({ clientName, clientAddress, items, totalAmount, tax, taxAmount, finalAmount }) {
    const invoiceDiv = document.createElement("div");
    invoiceDiv.className = "invoice";
    invoiceDiv.innerHTML = `
        <div class="invoice-header">Invoice for: ${clientName}</div>
        <div>Address: ${clientAddress}</div>
        <div>${items.map(item => `${item.itemName} - Quantity: ${item.itemQuantity}, Price: ₹${item.itemPrice.toFixed(2)}, Total: ₹${item.itemTotal.toFixed(2)}`).join('<br>')}</div>
        <div>Subtotal: ₹${totalAmount.toFixed(2)}</div>
        <div>Tax (${tax}%): ₹${taxAmount.toFixed(2)}</div>
        <div class="total">Total Amount: ₹${finalAmount.toFixed(2)}</div>
        <button onclick="downloadInvoice(${invoices.length - 1})">Download</button>
        <button onclick="printInvoice(${invoices.length - 1})">Print</button>
    `;
    return invoiceDiv;
}

// Item Management
function addItem() {
    const itemName = document.getElementById("itemName").value;
    const itemQuantity = parseFloat(document.getElementById("itemQuantity").value);
    const itemPrice = parseFloat(document.getElementById("itemPrice").value);

    if (itemName && !isNaN(itemQuantity) && !isNaN(itemPrice) && itemQuantity > 0 && itemPrice > 0) {
        const itemTotal = itemQuantity * itemPrice;
        currentItems.push({ itemName, itemQuantity, itemPrice, itemTotal });
        updateItemList();
        clearItemInputs();
    } else {
        alert("Please fill in all item fields correctly.");
    }
}

function updateItemList() {
    itemList.innerHTML = "";
    currentItems.forEach((item, index) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "item";
        itemDiv.innerHTML = `${item.itemName} - Quantity: ${item.itemQuantity}, Price: ₹${item.itemPrice.toFixed(2)}, Total: ₹${item.itemTotal.toFixed(2)} <button onclick="removeItem(${index})">Remove</button>`;
        itemList.appendChild(itemDiv);
    });
}

function removeItem(index) {
    currentItems.splice(index, 1);
    updateItemList();
}

// Form Management
function clearForm() {
    document.getElementById("clientName").value = "";
    document.getElementById("clientAddress").value = "";
    document.getElementById("tax").value = "0";
    currentItems = [];
    updateItemList();
}

function clearItemInputs() {
    document.getElementById("itemName").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("itemPrice").value = "";
    document.getElementById("defaultItems").selectedIndex = 0;
}

// PDF Generation
downloadAllInvoicesButton.addEventListener("click", function () {
    const pdf = new jsPDF();
    let y = 10; 

    invoices.forEach((invoice, index) => {
        pdf.text(`Invoice ${index + 1} for ${invoice.clientName}`, 10, y);
        y += 10; 
        pdf.text(`Address: ${invoice.clientAddress}`, 10, y);
        y += 10;

        invoice.items.forEach((item) => {
            pdf.text(`${item.itemName} - Quantity: ${item.itemQuantity}, Price: ₹${item.itemPrice.toFixed(2)}, Total: ₹${item.itemTotal.toFixed(2)}`, 10, y);
            y += 10;
        });

        pdf.text(`Subtotal: ₹${invoice.totalAmount.toFixed(2)}`, 10, y);
        y += 10;
        pdf.text(`Tax (${invoice.tax}%): ₹${invoice.taxAmount.toFixed(2)}`, 10, y);
        y += 10;
        pdf.text(`Total Amount: ₹${invoice.finalAmount.toFixed(2)}`, 10, y);
        y += 20; 
       
        if (y >= 270) { 
            pdf.addPage();
            y = 10; 
        }
    });

    pdf.save(`All_Invoices.pdf`);
});

function downloadInvoice(index) {
    const invoice = invoices[index];
    const pdf = new jsPDF();
    pdf.text(`Invoice for ${invoice.clientName}`, 10, 10);
    pdf.text(`Address: ${invoice.clientAddress}`, 10, 20);
    invoice.items.forEach((item, i) => {
        pdf.text(`${item.itemName} - Quantity: ${item.itemQuantity}, Price: ₹${item.itemPrice.toFixed(2)}, Total: ₹${item.itemTotal.toFixed(2)}`, 10, 30 + (i * 10));
    });
    pdf.text(`Subtotal: ₹${invoice.totalAmount.toFixed(2)}`, 10, 30 + (invoice.items.length * 10));
    pdf.text(`Tax (${invoice.tax}%): ₹${invoice.taxAmount.toFixed(2)}`, 10, 40 + (invoice.items.length * 10));
    pdf.text(`Total Amount: ₹${invoice.finalAmount.toFixed(2)}`, 10, 50 + (invoice.items.length * 10));
    pdf.save(`Invoice_${index + 1}_${invoice.clientName}.pdf`);
}

function printInvoice(index) {
    const invoice = invoices[index];
    let printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Invoice</title></head><body>');
    printWindow.document.write(`<h1>Invoice for ${invoice.clientName}</h1>`);
    printWindow.document.write(`<p>Address: ${invoice.clientAddress}</p>`);
    invoice.items.forEach(item => {
        printWindow.document.write(`<p>${item.itemName} - Quantity: ${item.itemQuantity}, Price: ₹${item.itemPrice.toFixed(2)}, Total: ₹${item.itemTotal.toFixed(2)}</p>`);
    });
    printWindow.document.write(`<p>Subtotal: ₹${invoice.totalAmount.toFixed(2)}</p>`);
    printWindow.document.write(`<p>Tax (${invoice.tax}%): ₹${invoice.taxAmount.toFixed(2)}</p>`);
    printWindow.document.write(`<h2>Total Amount: ₹${invoice.finalAmount.toFixed(2)}</h2>`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

// CSV Export
exportToCSVButton.addEventListener("click", function () {
    let csvContent = "Client Name,Client Address,Item Name,Quantity,Price,Item Total,Tax (%),Tax Amount,Final Amount\n";
    invoices.forEach((invoice) => {
        invoice.items.forEach((item) => {
            csvContent += `${invoice.clientName},${invoice.clientAddress},${item.itemName},${item.itemQuantity},${item.itemPrice},${item.itemTotal},${invoice.tax},${invoice.taxAmount},${invoice.finalAmount}\n`;
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "invoices.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
 
