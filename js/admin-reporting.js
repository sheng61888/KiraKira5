// Load all analytics data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserAnalytics();
    loadCommunityStats();
    loadRegisteredUsers();
    populateFilters();
});

function populateFilters() {
    const yearSelect = document.getElementById('yearFilter');
    const monthSelect = document.getElementById('monthFilter');
    const currentYear = new Date().getFullYear();
    
    for (let year = 2025; year <= currentYear + 5; year++) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        monthSelect.innerHTML += `<option value="${String(index + 1).padStart(2, '0')}">${month}</option>`;
    });
}

function applyFilter() {
    const role = document.getElementById('roleFilter').value;
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    loadRegisteredUsers(role, year, month);
}

// Load user analytics by role
function loadUserAnalytics() {
    $.ajax({
        type: "GET",
        url: "/api/admin/analytics/users",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            document.getElementById('learnerCount').textContent = response.learner || 0;
            document.getElementById('teacherCount').textContent = response.teacher || 0;
            document.getElementById('adminCount').textContent = response.admin || 0;
        },
        error: function() {
            console.error('Failed to load user analytics');
            document.getElementById('learnerCount').textContent = 'Error';
            document.getElementById('teacherCount').textContent = 'Error';
            document.getElementById('adminCount').textContent = 'Error';
        }
    });
}

// Load registered users
function loadRegisteredUsers(role = '', year = '', month = '') {
    let url = '/api/admin/analytics/registered-users?';
    if (role) url += `role=${role}&`;
    if (year) url += `year=${year}&`;
    if (month) url += `month=${month}`;
    
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            const tbody = document.getElementById('registeredUsersTable');
            tbody.innerHTML = '';
            
            if (response && response.length > 0) {
                response.forEach(user => {
                    const regDate = user.registrationDate ? new Date(user.registrationDate).toLocaleString() : 'N/A';
                    const row = `
                        <tr>
                            <td>${user.username}</td>
                            <td>${user.name}</td>
                            <td>${user.email}</td>
                            <td>${user.usertype}</td>
                            <td>${regDate}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No users found</td></tr>';
            }
        },
        error: function(xhr, status, error) {
            console.error('Failed to load registered users:', error);
            document.getElementById('registeredUsersTable').innerHTML = '<tr><td colspan="5" class="text-muted">Error loading data</td></tr>';
        }
    });
}

// Load community activity statistics
function loadCommunityStats() {
    $.ajax({
        type: "GET",
        url: "/api/admin/analytics/community",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            document.getElementById('totalThreads').textContent = response.totalThreads || 0;
            document.getElementById('totalReplies').textContent = response.totalReplies || 0;
            
            // Display most active users
            const tbody = document.getElementById('activeUsersTable');
            tbody.innerHTML = '';
            
            if (response.mostActiveUsers && response.mostActiveUsers.length > 0) {
                response.mostActiveUsers.forEach(user => {
                    const row = `
                        <tr>
                            <td>${user.username}</td>
                            <td>${user.activityCount}</td>
                        </tr>
                    `;
                    tbody.innerHTML += row;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="2" class="text-muted">No activity data available</td></tr>';
            }
        },
        error: function() {
            console.error('Failed to load community stats');
            document.getElementById('totalThreads').textContent = 'Error';
            document.getElementById('totalReplies').textContent = 'Error';
            document.getElementById('activeUsersTable').innerHTML = '<tr><td colspan="2" class="text-muted">Error loading data</td></tr>';
        }
    });
}


