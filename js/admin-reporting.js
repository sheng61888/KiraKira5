// Load all analytics data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadUserAnalytics();
    loadCommunityStats();
    loadRegisteredUsers();
    populateFilters();
    loadVisitStats();
});

function populateFilters() {
    const yearSelect = document.getElementById('yearFilter');
    const monthSelect = document.getElementById('monthFilter');
    const visitYearSelect = document.getElementById('visitYearFilter');
    const visitMonthSelect = document.getElementById('visitMonthFilter');
    const currentYear = new Date().getFullYear();
    
    for (let year = 2025; year <= currentYear + 5; year++) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
        visitYearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const value = String(index + 1).padStart(2, '0');
        monthSelect.innerHTML += `<option value="${value}">${month}</option>`;
        visitMonthSelect.innerHTML += `<option value="${value}">${month}</option>`;
    });
}

function applyFilter() {
    const role = document.getElementById('roleFilter').value;
    const year = document.getElementById('yearFilter').value;
    const month = document.getElementById('monthFilter').value;
    loadRegisteredUsers(role, year, month);
}

function applyVisitFilter() {
    const year = document.getElementById('visitYearFilter').value;
    const month = document.getElementById('visitMonthFilter').value;
    loadVisitStats(year, month);
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

let visitsChartInstance = null;

// Load website visit statistics
function loadVisitStats(year = '', month = '') {
    let url = '/api/admin/analytics/visits?';
    if (year) url += `year=${year}&`;
    if (month) url += `month=${month}`;
    
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            const labels = response.map(item => item.date);
            const data = response.map(item => item.count);
            
            if (visitsChartInstance) {
                visitsChartInstance.destroy();
            }
            
            const ctx = document.getElementById('visitsChart').getContext('2d');
            visitsChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Visits',
                        data: data,
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        borderColor: 'rgba(99, 102, 241, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        },
        error: function() {
            console.error('Failed to load visit stats');
        }
    });
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    pdf.setFontSize(18);
    pdf.text('KiraKira Analytics Report', 105, 15, { align: 'center' });
    pdf.setFontSize(10);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 22, { align: 'center' });
    
    let yPos = 35;
    
    pdf.setFontSize(14);
    pdf.text('User Distribution by Role', 15, yPos);
    yPos += 8;
    pdf.setFontSize(10);
    pdf.text(`Learners: ${document.getElementById('learnerCount').textContent}`, 20, yPos);
    yPos += 6;
    pdf.text(`Teachers: ${document.getElementById('teacherCount').textContent}`, 20, yPos);
    yPos += 6;
    pdf.text(`Admins: ${document.getElementById('adminCount').textContent}`, 20, yPos);
    yPos += 12;
    
    pdf.setFontSize(14);
    pdf.text('Community Engagement', 15, yPos);
    yPos += 8;
    pdf.setFontSize(10);
    pdf.text(`Total Threads: ${document.getElementById('totalThreads').textContent}`, 20, yPos);
    yPos += 6;
    pdf.text(`Total Replies: ${document.getElementById('totalReplies').textContent}`, 20, yPos);
    yPos += 12;
    
    const canvas = document.getElementById('visitsChart');
    const imgData = canvas.toDataURL('image/png');
    pdf.setFontSize(14);
    pdf.text('Website Visits', 15, yPos);
    yPos += 8;
    pdf.addImage(imgData, 'PNG', 15, yPos, 180, 80);
    
    pdf.save('KiraKira-Analytics-Report.pdf');
}

