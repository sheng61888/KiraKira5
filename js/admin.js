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
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn-edit" data-user-id="${user.id}">Edit</button>
                <button class="btn-delete" data-user-id="${user.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
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
    const passwordField = document.getElementById('userPassword');
    passwordField.style.display = 'block';
    passwordField.setAttribute('required', 'required');
    passwordField.previousElementSibling.style.display = 'block';
    document.getElementById('userModal').style.display = 'flex';
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    document.getElementById('modalTitle').textContent = 'Edit User';
    document.getElementById('userId').value = user.id;
    document.getElementById('userUsername').value = user.username;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userRole').value = user.role;
    const passwordField = document.getElementById('userPassword');
    passwordField.style.display = 'none';
    passwordField.removeAttribute('required');
    passwordField.previousElementSibling.style.display = 'none';
    document.getElementById('userModal').style.display = 'flex';
}

function deleteUser(id) {
    console.log('deleteUser called with ID:', id);
    if (confirm('Are you sure you want to delete this user?')) {
        console.log('Sending DELETE request to:', `/api/user/delete/${id}`);
        $.ajax({
            type: "DELETE",
            url: `/api/user/delete/${id}`,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                console.log('Delete response:', response);
                if (response.success) {
                    loadUsers();
                    alert('User deleted successfully');
                } else {
                    alert('Failed to delete user');
                }
            },
            error: function(xhr, status, error) {
                console.error('Delete error:', status, error);
                console.error('Response:', xhr.responseText);
                alert('Error deleting user: ' + error);
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
    
    try {
        const response = await fetch('/api/admin/engagement-rate');
        const data = await response.json();
        document.getElementById('engagementRate').textContent = data.engagementRate + '%';
    } catch (error) {
        document.getElementById('engagementRate').textContent = 'Error';
    }
    
    try {
        const response = await fetch('/api/admin/online-users');
        const data = await response.json();
        document.getElementById('onlineUsers').textContent = data.onlineUsers.toLocaleString();
    } catch (error) {
        document.getElementById('onlineUsers').textContent = 'Error';
    }
}

async function loadPasswordResetRequests() {
    try {
        const response = await fetch('/api/admin/password-reset-requests');
        const requests = await response.json();
        
        const badge = document.getElementById('notificationBadge');
        const notificationList = document.getElementById('notificationList');
        
        if (requests.length > 0) {
            badge.textContent = requests.length;
            badge.style.display = 'block';
            
            notificationList.innerHTML = requests.map(req => `
                <div class="notification-item">
                    <p><strong>${req.username}</strong> (${req.email})</p>
                    <small>Requested: ${new Date(req.requestDate).toLocaleString()}</small>
                    <div class="notification-actions">
                        <button class="btn-approve" onclick="handlePasswordReset(${req.id}, 'approve')">Approve</button>
                        <button class="btn-reject" onclick="handlePasswordReset(${req.id}, 'reject')">Reject</button>
                    </div>
                </div>
            `).join('');
        } else {
            badge.style.display = 'none';
            notificationList.innerHTML = '<p style="color: var(--muted);">No pending requests</p>';
        }
    } catch (error) {
        console.error('Error loading password reset requests:', error);
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

async function handlePasswordReset(requestId, action) {
    try {
        const response = await fetch(`/api/admin/password-reset-request/handle?requestId=${requestId}&action=${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            alert(`Error: ${response.status} - ${errorText}`);
            return;
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert(`Request ${action}d successfully`);
            loadPasswordResetRequests();
        } else {
            alert(`Failed to process request: ${result.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error handling password reset:', error);
        alert(`Error processing request: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Load dashboard stats if on dashboard page
    if (document.getElementById('totalUsers')) {
        loadDashboardStats();
        loadPasswordResetRequests();
        setInterval(loadPasswordResetRequests, 30000);
    }
    
    // Initialize user management if on that page
    if (document.getElementById('usersTable')) {
        loadUsers();
        
        // Event delegation for edit and delete buttons
        document.getElementById('usersTableBody').addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-edit')) {
                editUser(e.target.getAttribute('data-user-id'));
            } else if (e.target.classList.contains('btn-delete')) {
                deleteUser(e.target.getAttribute('data-user-id'));
            }
        });
        
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