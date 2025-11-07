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