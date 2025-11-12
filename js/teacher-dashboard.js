class TeacherDashboard {
    constructor() {
        this.teacherId = this.getCurrentTeacherId();
        this.init();
    }

    async init() {
        await this.loadClasses();
        await this.loadCourses();
        await this.loadAssignments();
        this.setupEventListeners();
    }

    getCurrentTeacherId() {
        // Implement based on your authentication system
        // This could come from sessionStorage, JWT, etc.
        return sessionStorage.getItem('currentUserId') || 'teacher123';
    }

    async loadClasses() {
        try {
            const response = await fetch('/api/Teacher/classes');
            const classes = await response.json();
            
            const classSelect = document.getElementById('classSelect');
            classSelect.innerHTML = '<option value="">Choose a class...</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.classId;
                option.textContent = cls.className;
                classSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showMessage('Error loading classes', 'error');
        }
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/Teacher/courses');
            const courses = await response.json();
            
            const courseSelect = document.getElementById('courseSelect');
            courseSelect.innerHTML = '<option value="">Choose a course...</option>';
            
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.courseName;
                option.textContent = course.courseName;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Error loading courses', 'error');
        }
    }

    async loadAssignments() {
        try {
            const response = await fetch('/api/Teacher/assignments');
            const assignments = await response.json();
            
            this.renderAssignments(assignments);
            this.updateStats(assignments);
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showMessage('Error loading assignments', 'error');
        }
    }

    renderAssignments(assignments) {
        const container = document.getElementById('assignmentsContainer');
        
        if (assignments.length === 0) {
            container.innerHTML = '<p class="muted">No assignments found. Create your first assignment above.</p>';
            return;
        }

        const assignmentsHtml = assignments.map(assignment => `
            <div class="assignment-card ${this.getAssignmentCardClass(assignment)}">
                <div class="assignment-header">
                    <div>
                        <h3>${assignment.title}</h3>
                        <p class="muted">${assignment.courseName} • ${assignment.classId}</p>
                    </div>
                    <span class="status-badge status-${assignment.status.toLowerCase()}">
                        ${assignment.status}
                    </span>
                </div>
                
                <div class="assignment-meta">
                    <span><strong>Deadline:</strong> ${new Date(assignment.deadline).toLocaleString()}</span>
                    <span><strong>Created:</strong> ${new Date(assignment.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div class="assignment-actions">
                    <button class="btn btn--ghost btn-sm" onclick="editAssignment(${assignment.assignmentId})">
                        Edit
                    </button>
                    <button class="btn btn--ghost btn-sm" onclick="updateAssignmentStatus(${assignment.assignmentId}, 'Completed')">
                        Mark Complete
                    </button>
                    <button class="btn btn--danger btn-sm" onclick="deleteAssignment(${assignment.assignmentId})">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = assignmentsHtml;
    }

    getAssignmentCardClass(assignment) {
        const now = new Date();
        const deadline = new Date(assignment.deadline);
        
        if (assignment.status === 'Completed') return 'completed';
        if (deadline < now && assignment.status !== 'Completed') return 'overdue';
        return '';
    }

    updateStats(assignments) {
        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const total = assignments.length;
        const active = assignments.filter(a => a.status === 'Open').length;
        const upcoming = assignments.filter(a => {
            const deadline = new Date(a.deadline);
            return deadline > now && deadline <= sevenDaysFromNow && a.status === 'Open';
        }).length;
        const completed = assignments.filter(a => a.status === 'Completed').length;

        document.getElementById('totalAssignments').textContent = total;
        document.getElementById('activeAssignments').textContent = active;
        document.getElementById('upcomingAssignments').textContent = upcoming;
        document.getElementById('completedAssignments').textContent = completed;
    }

    setupEventListeners() {
        // Assignment form submission
        document.getElementById('assignmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createAssignment();
        });

        // Edit assignment form submission
        document.getElementById('editAssignmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateAssignment();
        });
    }

    async createAssignment() {
        const classId = document.getElementById('classSelect').value;
        const courseName = document.getElementById('courseSelect').value;
        const title = document.getElementById('assignmentTitle').value;
        const deadline = document.getElementById('deadline').value;

        if (!classId || !courseName || !title || !deadline) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            const request = {
                classId: classId,
                title: title,
                courseName: courseName,
                deadline: new Date(deadline).toISOString()
            };

            const response = await fetch('/api/Teacher/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Assignment created successfully!', 'success');
                document.getElementById('assignmentForm').reset();
                await this.loadAssignments();
            } else {
                this.showMessage(result.message || 'Failed to create assignment', 'error');
            }
        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showMessage('Error creating assignment', 'error');
        }
    }

    async updateAssignment() {
        const assignmentId = document.getElementById('editAssignmentId').value;
        const title = document.getElementById('editTitle').value;
        const deadline = document.getElementById('editDeadline').value;
        const status = document.getElementById('editStatus').value;

        try {
            const response = await fetch(`/api/Teacher/assignments/${assignmentId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Assignment updated successfully!', 'success');
                this.closeEditModal();
                await this.loadAssignments();
            } else {
                this.showMessage(result.message || 'Failed to update assignment', 'error');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            this.showMessage('Error updating assignment', 'error');
        }
    }

    showMessage(message, type) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
}

// Global functions for button clicks
async function editAssignment(assignmentId) {
    try {
        const response = await fetch('/api/Teacher/assignments');
        const assignments = await response.json();
        const assignment = assignments.find(a => a.assignmentId === assignmentId);
        
        if (assignment) {
            document.getElementById('editAssignmentId').value = assignment.assignmentId;
            document.getElementById('editTitle').value = assignment.title;
            
            // Format datetime for input field
            const deadlineDate = new Date(assignment.deadline);
            const formattedDate = deadlineDate.toISOString().slice(0, 16);
            document.getElementById('editDeadline').value = formattedDate;
            
            document.getElementById('editStatus').value = assignment.status;
            
            document.getElementById('editAssignmentModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading assignment details:', error);
    }
}

function closeEditModal() {
    document.getElementById('editAssignmentModal').style.display = 'none';
}

async function updateAssignmentStatus(assignmentId, status) {
    if (!confirm(`Are you sure you want to mark this assignment as ${status}?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/Teacher/assignments/${assignmentId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Reload assignments to reflect changes
            const dashboard = new TeacherDashboard();
            await dashboard.loadAssignments();
            dashboard.showMessage(`Assignment marked as ${status}`, 'success');
        } else {
            alert(result.message || 'Failed to update assignment status');
        }
    } catch (error) {
        console.error('Error updating assignment status:', error);
        alert('Error updating assignment status');
    }
}

async function deleteAssignment(assignmentId) {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`/api/Teacher/assignments/${assignmentId}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            // Reload assignments to reflect changes
            const dashboard = new TeacherDashboard();
            await dashboard.loadAssignments();
            dashboard.showMessage('Assignment deleted successfully', 'success');
        } else {
            alert(result.message || 'Failed to delete assignment');
        }
    } catch (error) {
        console.error('Error deleting assignment:', error);
        alert('Error deleting assignment');
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TeacherDashboard();
});

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editAssignmentModal');
    if (event.target === modal) {
        closeEditModal();
    }
}