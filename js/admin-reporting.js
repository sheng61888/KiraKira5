// Load all analytics data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserAnalytics();
    loadCommunityStats();
});

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


