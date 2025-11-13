class TeacherAssignmentManager {
    constructor() {
        this.teacherId = this.getCurrentTeacherId(); // Implement this based on your auth system
        this.init();
    }

    async init() {
        await this.loadCourses();
        await this.loadStudents();
        await this.loadAssignments();
        this.setupEventListeners();
    }

    getCurrentTeacherId() {
        // This should be implemented based on your authentication system
        // For now, we'll use a placeholder - you might get this from sessionStorage, JWT, etc.
        return sessionStorage.getItem('currentUserId') || 'teacher123';
    }

    async loadCourses() {
        try {
            const response = await fetch('/api/Teacher/courses');
            const courses = await response.json();
            
            const courseSelect = document.getElementById('courseSelect');
            courseSelect.innerHTML = '<option value="">Choose a course...</option>';
            
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.courseId;
                option.textContent = course.courseName;
                courseSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showMessage('Error loading courses', 'error');
        }
    }

    async loadStudents() {
        try {
            const response = await fetch('/api/Teacher/students');
            const students = await response.json();
            
            const studentSelect = document.getElementById('studentSelect');
            studentSelect.innerHTML = '';
            
            students.forEach(student => {
                const option = document.createElement('option');
                option.value = student.studentId;
                option.textContent = `${student.studentName} (${student.email})`;
                studentSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading students:', error);
            this.showMessage('Error loading students', 'error');
        }
    }

    async loadAssignments() {
        try {
            const response = await fetch(`/api/Teacher/${this.teacherId}/assignments`);
            const assignments = await response.json();
            
            this.renderAssignments(assignments);
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showMessage('Error loading assignments', 'error');
        }
    }

    renderAssignments(assignments) {
        const tbody = document.getElementById('assignmentsBody');
        tbody.innerHTML = '';

        if (assignments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No assignments found</td></tr>';
            return;
        }

        assignments.forEach(assignment => {
            const row = document.createElement('tr');
            const statusClass = this.getStatusClass(assignment.status);
            
            row.innerHTML = `
                <td>${assignment.studentName}</td>
                <td>${assignment.courseName}</td>
                <td>${new Date(assignment.assignedDate).toLocaleDateString()}</td>
                <td>${new Date(assignment.deadline).toLocaleDateString()}</td>
                <td><span class="badge ${statusClass}">${assignment.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-deadline" 
                            data-id="${assignment.assignmentId}" 
                            data-deadline="${assignment.deadline}">
                        Edit Deadline
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-assignment" 
                            data-id="${assignment.assignmentId}">
                        Delete
                    </button>
                </td>
            `;
            
            tbody.appendChild(row);
        });

        this.setupAssignmentEventListeners();
    }

    getStatusClass(status) {
        const classes = {
            'assigned': 'badge-primary',
            'in-progress': 'badge-warning',
            'completed': 'badge-success',
            'overdue': 'badge-danger'
        };
        return classes[status] || 'badge-secondary';
    }

    setupEventListeners() {
        // Assignment form submission
        document.getElementById('assignmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.assignCourse();
        });

        // Edit deadline form submission
        document.getElementById('editDeadlineForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateDeadline();
        });
    }

    setupAssignmentEventListeners() {
        // Edit deadline buttons
        document.querySelectorAll('.edit-deadline').forEach(button => {
            button.addEventListener('click', (e) => {
                const assignmentId = e.target.getAttribute('data-id');
                const currentDeadline = e.target.getAttribute('data-deadline');
                this.openEditDeadlineModal(assignmentId, currentDeadline);
            });
        });

        // Delete assignment buttons
        document.querySelectorAll('.delete-assignment').forEach(button => {
            button.addEventListener('click', (e) => {
                const assignmentId = e.target.getAttribute('data-id');
                this.deleteAssignment(assignmentId);
            });
        });
    }

    openEditDeadlineModal(assignmentId, currentDeadline) {
        document.getElementById('editAssignmentId').value = assignmentId;
        
        // Format the datetime for the input field
        const deadlineDate = new Date(currentDeadline);
        const formattedDate = deadlineDate.toISOString().slice(0, 16);
        document.getElementById('newDeadline').value = formattedDate;
        
        $('#editDeadlineModal').modal('show');
    }

    async assignCourse() {
        const courseId = document.getElementById('courseSelect').value;
        const studentSelect = document.getElementById('studentSelect');
        const deadline = document.getElementById('deadline').value;

        if (!courseId || !deadline) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        const selectedStudents = Array.from(studentSelect.selectedOptions).map(option => option.value);
        
        if (selectedStudents.length === 0) {
            this.showMessage('Please select at least one student', 'error');
            return;
        }

        try {
            const request = {
                teacherId: this.teacherId,
                studentIds: selectedStudents,
                courseId: parseInt(courseId),
                deadline: new Date(deadline).toISOString()
            };

            const response = await fetch('/api/Teacher/assign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Course assigned successfully!', 'success');
                document.getElementById('assignmentForm').reset();
                await this.loadAssignments();
            } else {
                this.showMessage(result.message || 'Failed to assign course', 'error');
            }
        } catch (error) {
            console.error('Error assigning course:', error);
            this.showMessage('Error assigning course', 'error');
        }
    }

    async updateDeadline() {
        const assignmentId = document.getElementById('editAssignmentId').value;
        const newDeadline = document.getElementById('newDeadline').value;

        try {
            const response = await fetch(`/api/Teacher/assignments/${assignmentId}/deadline`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newDeadline: new Date(newDeadline).toISOString()
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Deadline updated successfully!', 'success');
                $('#editDeadlineModal').modal('hide');
                await this.loadAssignments();
            } else {
                this.showMessage(result.message || 'Failed to update deadline', 'error');
            }
        } catch (error) {
            console.error('Error updating deadline:', error);
            this.showMessage('Error updating deadline', 'error');
        }
    }

    async deleteAssignment(assignmentId) {
        if (!confirm('Are you sure you want to delete this assignment?')) {
            return;
        }

        try {
            const response = await fetch(`/api/Teacher/assignments/${assignmentId}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (response.ok) {
                this.showMessage('Assignment deleted successfully!', 'success');
                await this.loadAssignments();
            } else {
                this.showMessage(result.message || 'Failed to delete assignment', 'error');
            }
        } catch (error) {
            console.error('Error deleting assignment:', error);
            this.showMessage('Error deleting assignment', 'error');
        }
    }

    showMessage(message, type) {
        // Implement your notification system here
        // This could be a toast notification, alert, or status message
        alert(`${type.toUpperCase()}: ${message}`);
    }
}

// Initialize the assignment manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TeacherAssignmentManager();
});