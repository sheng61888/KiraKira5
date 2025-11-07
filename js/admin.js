// Admin Dashboard Styles
const adminStyles = `
.search-section {
    display: flex;
    gap: var(--gap);
    align-items: center;
    flex-wrap: wrap;
}

.search-section input, .search-section select {
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    color: var(--text);
    min-width: 200px;
}

.users-table {
    overflow-x: auto;
}

.users-table table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th, .users-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid var(--border);
}

.users-table th {
    background: var(--surface-alt);
    color: var(--accent);
    font-weight: 600;
}

.users-table td {
    color: var(--text);
}

.users-table button {
    padding: 0.5rem 1rem;
    margin: 0 0.25rem;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-weight: 600;
    transition: var(--transition);
}

.users-table button:first-child {
    background: var(--success);
    color: #0c0f1c;
}

.users-table button:last-child {
    background: var(--danger);
    color: #0c0f1c;
}

.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.7);
}

.modal-content {
    background: var(--surface);
    margin: 10% auto;
    padding: 2rem;
    border: 1px solid var(--border);
    width: 400px;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
}

.close {
    color: var(--muted);
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    transition: var(--transition);
}

.close:hover {
    color: var(--text);
}

.modal-content h2 {
    color: var(--accent);
    margin-bottom: 1.5rem;
}

.modal-content label {
    display: block;
    margin: 1rem 0 0.5rem;
    color: var(--muted);
    font-weight: 600;
}

.modal-content input, .modal-content select {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--border);
    color: var(--text);
    box-sizing: border-box;
}

.modal-actions {
    margin-top: 2rem;
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.modal-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    font-weight: 600;
    transition: var(--transition);
}

.modal-actions button[type="submit"] {
    background: linear-gradient(120deg, var(--accent), var(--text2));
    color: #0c0f1c;
}

.modal-actions button[type="button"] {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text);
}
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);

// User Management JavaScript
let users = [
    {id: 1, name: 'Aina Suzuki', email: 'aina@kirakira.edu', role: 'learner'},
    {id: 2, name: 'Mr. Tan Wei Ming', email: 'tan@kirakira.edu', role: 'teacher'},
    {id: 3, name: 'Sarah Chen', email: 'sarah@kirakira.edu', role: 'learner'},
    {id: 4, name: 'Dr. Lim Hui Ling', email: 'lim@kirakira.edu', role: 'teacher'}
];

function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="editUser(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function searchUsers() {
    const searchId = document.getElementById('searchUserId').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    let filtered = users;
    if (searchId) {
        filtered = filtered.filter(user => user.id.toString().includes(searchId));
    }
    if (roleFilter) {
        filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    filtered.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="editUser(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function showAddModal() {
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').style.display = 'block';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userModal').style.display = 'block';
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.id !== id);
        loadUsers();
    }
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user management if on that page
    if (document.getElementById('usersTable')) {
        loadUsers();
        
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('userId').value;
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const role = document.getElementById('userRole').value;

            if (id) {
                const userIndex = users.findIndex(u => u.id == id);
                users[userIndex] = {id: parseInt(id), name, email, role};
            } else {
                const newId = Math.max(...users.map(u => u.id)) + 1;
                users.push({id: newId, name, email, role});
            }
            
            closeModal();
            loadUsers();
        });
    }
});