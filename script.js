// Get DOM elements
const balanceDisplay = document.getElementById('total-balance-display');
const incomeDisplay = document.getElementById('income-display');
const expenseDisplay = document.getElementById('expense-display');
const form = document.getElementById('transaction-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeSelect = document.getElementById('type');
const categorySelect = document.getElementById('category'); // New category select
const transactionList = document.getElementById('transaction-list');
const categorySummary = document.getElementById('category-summary'); // New element for category summary
const noTransactionsMessage = document.getElementById('no-transactions-message');
const noCategoryDataMessage = categorySummary.querySelector('.no-data-message');


// Initialize transactions from Local Storage or an empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Function to update the balance displays
function updateBalances() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const total = income - expense;

    incomeDisplay.textContent = `$${income.toFixed(2)}`;
    expenseDisplay.textContent = `$${expense.toFixed(2)}`;
    balanceDisplay.textContent = `$${total.toFixed(2)}`;

    // Show/hide no transactions message
    if (transactions.length === 0) {
        noTransactionsMessage.style.display = 'block';
    } else {
        noTransactionsMessage.style.display = 'none';
    }
}

// Function to add a new transaction to the DOM
function addTransactionToDOM(transaction) {
    const li = document.createElement('li');
    li.classList.add(transaction.type); // 'income' or 'expense'
    li.innerHTML = `
        <div class="transaction-details">
            <h4>${transaction.description} <small>(${transaction.category})</small></h4>
            <small>${new Date(transaction.date).toLocaleDateString()}</small>
        </div>
        <div class="transaction-amount">
            ${transaction.type === 'income' ? '+' : '-'}$${parseFloat(transaction.amount).toFixed(2)}
        </div>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})"><i class="fas fa-trash-alt"></i></button>
    `;
    transactionList.appendChild(li);
}

// Function to render all transactions
function renderTransactions() {
    transactionList.innerHTML = '';
    transactions.forEach(addTransactionToDOM);
    updateBalances();
    updateCategorySummary(); // Update analytics when transactions change
}

// Function to update the category spending summary
function updateCategorySummary() {
    categorySummary.innerHTML = ''; // Clear previous summary

    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    if (expenseTransactions.length === 0) {
        categorySummary.innerHTML = '<p class="no-data-message">No expense data to display yet.</p>';
        return;
    }

    // Group expenses by category
    const categories = expenseTransactions.reduce((acc, transaction) => {
        if (!acc[transaction.category]) {
            acc[transaction.category] = 0;
        }
        acc[transaction.category] += parseFloat(transaction.amount);
        return acc;
    }, {});

    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a);

    // Display each category
    sortedCategories.forEach(([categoryName, totalAmount]) => {
        const div = document.createElement('div');
        div.classList.add('category-item');
        div.innerHTML = `
            <span class="category-name">${categoryName}</span>
            <span class="category-amount">-$${totalAmount.toFixed(2)}</span>
        `;
        categorySummary.appendChild(div);
    });
}


// Handle form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
        id: Math.floor(Math.random() * 100000), // Simple unique ID
        description: descriptionInput.value,
        amount: parseFloat(amountInput.value),
        type: typeSelect.value,
        category: categorySelect.value, // Get selected category
        date: new Date()
    };

    if (newTransaction.amount <= 0 || isNaN(newTransaction.amount)) {
        alert('Please enter a valid positive amount.');
        return;
    }

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    
    addTransactionToDOM(newTransaction);
    updateBalances();
    updateCategorySummary(); // Update analytics
    
    // Clear form inputs
    descriptionInput.value = '';
    amountInput.value = '';
    typeSelect.value = 'expense'; // Reset to expense by default
    categorySelect.value = 'Other'; // Reset category to Other
});

// Function to delete a transaction
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    renderTransactions(); // Re-render everything to update UI and analytics
}

// Initial rendering of the app
renderTransactions();