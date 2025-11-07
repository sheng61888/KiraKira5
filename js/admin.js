// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = adminStyles;
document.head.appendChild(styleSheet);

// User Management JavaScript
let users = [];

function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    // Call C# web method to get users
    $.ajax({
        type: "POST",
        url: "../code/user_management.cs/GetUsers",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            users = JSON.parse(response.d);
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
                <td>${user.Id}</td>
                <td>${user.Username}</td>
                <td>${user.Name}</td>
                <td>${user.Email}</td>
                <td>${user.Role}</td>
                <td>
                    <button onclick="editUser('${user.Id}')">Edit</button>
                    <button onclick="deleteUser('${user.Id}')">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function searchUsers() {
    const searchId = document.getElementById('searchUserId').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    $.ajax({
        type: "POST",
        url: "../code/user_management.cs/SearchUsers",
        data: JSON.stringify({ searchId: searchId, roleFilter: roleFilter }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            const filteredUsers = JSON.parse(response.d);
            displayUsers(filteredUsers);
        },
        error: function() {
            console.error('Failed to search users');
        }
    });
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
    const user = users.find(u => u.Id === id);
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.Id;
    document.getElementById('userUsername').value = user.Username;
    document.getElementById('userName').value = user.Name;
    document.getElementById('userEmail').value = user.Email;
    document.getElementById('userRole').value = user.Role;
    document.getElementById('userPassword').style.display = 'none';
    document.getElementById('userPassword').previousElementSibling.style.display = 'none';
    document.getElementById('userModal').style.display = 'block';
}

function deleteUser(id) {
    if (confirm('Are you sure you want to delete this user?')) {
        $.ajax({
            type: "POST",
            url: "../code/user_management.cs/DeleteUser",
            data: JSON.stringify({ id: id }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                if (response.d) {
                    loadUsers();
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
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user management if on that page
    if (document.getElementById('usersTable')) {
        loadUsers();
        
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
                    type: "POST",
                    url: "../code/user_management.cs/UpdateUser",
                    data: JSON.stringify({ id: id, username: username, name: name, email: email, role: role }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        if (response.d) {
                            closeModal();
                            loadUsers();
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
                    url: "../code/user_management.cs/AddUser",
                    data: JSON.stringify({ username: username, name: name, email: email, password: password, role: role }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function(response) {
                        if (response.d) {
                            closeModal();
                            loadUsers();
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