// User Management JavaScript
let users = [];

function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    $.ajax({
        type: "GET",
        url: "/api/user/list",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            users = response;
            displayUsers(users);
        },
        error: function() {
            console.error('Failed to load users');
        }
    });
}

function displayUsers(userList) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    userList.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="editUser('${user.id}')">Edit</button>
                    <button onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function searchUsers() {
    const searchId = document.getElementById('searchUserId').value.trim();
    const roleFilter = document.getElementById('roleFilter').value;
    
    console.log('Search ID:', searchId);
    console.log('Role Filter:', roleFilter);
    
    // If both are empty, show all users
    if (!searchId && !roleFilter) {
        displayUsers(users);
        return;
    }
    
    // Client-side filtering
    let filtered = users;
    
    if (searchId) {
        filtered = filtered.filter(user => user.id.toLowerCase().includes(searchId.toLowerCase()));
    }
    
    if (roleFilter) {
        filtered = filtered.filter(user => user.role.toLowerCase() === roleFilter.toLowerCase());
    }
    
    console.log('Filtered users:', filtered);
    displayUsers(filtered);
}

function clearSearch() {
    document.getElementById('searchUserId').value = '';
    document.getElementById('roleFilter').value = '';
    loadUsers();
}

function showAddModal() {
    document.getElementById('modalTitle').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userPassword').style.display = 'block';
    document.getElementById('userPassword').previousElementSibling.style.display = 'block';
    document.getElementById('userModal').style.display = 'block';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    document.getElementById('userPassword').style.display = 'none';
    document.getElementById('userPassword').previousElementSibling.style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        $.ajax({
            type: "DELETE",
            url: `/api/user/delete/${id}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    loadUsers();
                    alert('User deleted successfully');
                } else {
                    alert('Failed to delete user');
                }
            },
            error: function() {
                alert('Error deleting user');
            }
        });
    }
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

// Admin Dashboard JavaScript
async function loadDashboardStats() {
    try {
        const response = await fetch('/api/admin/total-users');
        const data = await response.json();
        document.getElementById('totalUsers').textContent = data.totalUsers.toLocaleString();
    } catch (error) {
        document.getElementById('totalUsers').textContent = 'Error';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard stats if on dashboard page
    if (document.getElementById('totalUsers')) {
        loadDashboardStats();
    }
    
    // Initialize user management if on that page
    if (document.getElementById('usersTable')) {
        loadUsers();
        
        // Enable search on Enter key
        document.getElementById('searchUserId').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchUsers();
            }
        });
        
        // Auto-filter when role dropdown changes
        document.getElementById('roleFilter').addEventListener('change', function() {
            searchUsers();
        });
        
        document.getElementById('userForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const id = document.getElementById('userId').value;
            const username = document.getElementById('userUsername').value;
            const name = document.getElementById('userName').value;
            const email = document.getElementById('userEmail').value;
            const password = document.getElementById('userPassword').value;
            const role = document.getElementById('userRole').value;

            if (id) {
                // Update existing user
                $.ajax({
                    type: "PUT",
                    url: "/api/user/update",
                    data: JSON.stringify({ id: id, username: username, name: name, email: email, role: role }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        if (response.success) {
                            closeModal();
                            loadUsers();
                            alert('User updated successfully');
                        } else {
                            alert('Failed to update user');
                        }
                    },
                    error: function() {
                        alert('Error updating user');
                    }
                });
            } else {
                // Add new user
                $.ajax({
                    type: "POST",
                    url: "/api/user/add",
                    data: JSON.stringify({ username: username, name: name, email: email, password: password, usertype: role }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        if (response.success) {
                            closeModal();
                            loadUsers();
                            alert('User added successfully');
                        } else {
                            alert('Failed to add user');
                        }
                    },
                    error: function() {
                        alert('Error adding user');
                    }
                });
            }
        });
    }
});