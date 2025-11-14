class TeacherDashboard {
    constructor() {
        this.teacherId = sessionStorage.getItem('currentLearnerId');
        if (!this.teacherId) {
            alert('Please log in as a teacher');
            window.location.href = '/html/login_signup.html';
            return;
        }
        this.teacherName = sessionStorage.getItem('userName') || 'Teacher';
        this.init();
    }

    async init() {
        this.displayWelcome();
        await this.loadClasses();
    }

    displayWelcome() {
        const welcomeEl = document.getElementById('welcomeMessage');
        if (welcomeEl) {
            welcomeEl.textContent = `Welcome back, Teacher ${this.teacherName}`;
        }
    }

    async loadClasses() {
        try {
            const response = await fetch(`/api/TeacherPanel/classes?teacherId=${this.teacherId}`);
            const classes = await response.json();
            
            this.renderClasses(classes);
            this.updateStats(classes);
        } catch (error) {
            console.error('Error loading classes:', error);
            this.showMessage('Error loading classes', 'error');
        }
    }

    renderClasses(classes) {
        const container = document.getElementById('classesContainer');
        
        if (classes.length === 0) {
            container.innerHTML = '<p class="muted">No classes yet. Create your first class!</p>';
            return;
        }

        container.innerHTML = classes.map(cls => `
            <div class="class-card">
                <div class="class-header">
                    <div>
                        <h3>${cls.className}</h3>
                        <p class="muted">${cls.studentCount} students</p>
                    </div>
                </div>
                <div style="margin: 1rem 0;">
                    <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 0.5rem;">Join Code:</p>
                    <div class="join-code">${cls.joinCode}</div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="btn btn--ghost btn-sm" onclick="dashboard.viewStudents(${cls.classId}, '${cls.className}')">View Students</button>
                    <button class="btn btn--ghost btn-sm" onclick="dashboard.viewAssignments(${cls.classId}, '${cls.className}')">View Assignments</button>
                    <button class="btn btn--primary btn-sm" onclick="dashboard.openAssignModule(${cls.classId})">Assign Module</button>
                </div>
            </div>
        `).join('');
    }

    async updateStats(classes) {
        const totalStudents = classes.reduce((sum, cls) => sum + cls.studentCount, 0);
        document.getElementById('totalClasses').textContent = classes.length;
        document.getElementById('totalStudents').textContent = totalStudents;
        
        // Get total active assignments
        let totalAssignments = 0;
        for (const cls of classes) {
            try {
                const response = await fetch(`/api/TeacherPanel/classes/${cls.classId}/assignments`);
                const assignments = await response.json();
                totalAssignments += assignments.length;
            } catch (error) {
                console.error('Error loading assignments for stats:', error);
            }
        }
        document.getElementById('activeAssignments').textContent = totalAssignments;
    }

    async createClass(className) {
        try {
            const response = await fetch('/api/TeacherPanel/classes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherId: this.teacherId, className })
            });

            if (response.ok) {
                this.showMessage('Class created successfully!', 'success');
                await this.loadClasses();
                closeCreateClassModal();
            } else {
                this.showMessage('Failed to create class', 'error');
            }
        } catch (error) {
            console.error('Error creating class:', error);
            this.showMessage('Error creating class', 'error');
        }
    }

    async viewStudents(classId, className) {
        this.currentClassId = classId;
        this.currentClassName = className;
        try {
            const response = await fetch(`/api/TeacherPanel/classes/${classId}/students`);
            const students = await response.json();
            
            document.getElementById('studentsModalTitle').textContent = `Students in ${className}`;
            const container = document.getElementById('studentsContainer');
            
            if (students.length === 0) {
                container.innerHTML = '<p class="muted">No students enrolled yet</p>';
            } else {
                container.innerHTML = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 2px solid #e5e7eb;">
                                <th style="text-align: left; padding: 0.5rem;">Name</th>
                                <th style="text-align: left; padding: 0.5rem;">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => `
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 0.5rem;">${s.name}</td>
                                    <td style="padding: 0.5rem;">${s.email}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
            
            document.getElementById('viewStudentsModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading students:', error);
            this.showMessage('Error loading students', 'error');
        }
    }

    async searchStudents(query) {
        if (query.length < 2) return [];
        try {
            const response = await fetch(`/api/TeacherPanel/search-students?query=${encodeURIComponent(query)}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching students:', error);
            return [];
        }
    }

    async addStudent(studentId) {
        try {
            const response = await fetch(`/api/TeacherPanel/classes/${this.currentClassId}/add-student`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });
            if (response.ok) {
                this.showMessage('Student added successfully!', 'success');
                closeAddStudentModal();
                await this.viewStudents(this.currentClassId, this.currentClassName);
            } else {
                this.showMessage('Failed to add student', 'error');
            }
        } catch (error) {
            console.error('Error adding student:', error);
            this.showMessage('Error adding student', 'error');
        }
    }

    async viewAssignments(classId, className) {
        try {
            const response = await fetch(`/api/TeacherPanel/classes/${classId}/assignments`);
            const assignments = await response.json();
            
            document.getElementById('assignmentsModalTitle').textContent = `Assignments for ${className}`;
            const container = document.getElementById('assignmentsContainer');
            
            if (assignments.length === 0) {
                container.innerHTML = '<p class="muted">No assignments yet</p>';
            } else {
                container.innerHTML = assignments.map(a => {
                    const percentage = a.totalStudents > 0 ? Math.round((a.completedCount / a.totalStudents) * 100) : 0;
                    return `
                    <div style="padding: 1rem; border: 1px solid #e5e7eb; border-radius: 4px; margin-bottom: 1rem;">
                        <h4>${a.moduleName}</h4>
                        <p class="muted">Due: ${new Date(a.dueDate).toLocaleString()}</p>
                        <p>Progress: ${a.completedCount}/${a.totalStudents} completed (${percentage}%)</p>
                    </div>
                `}).join('');
            }
            
            document.getElementById('viewAssignmentsModal').style.display = 'block';
        } catch (error) {
            console.error('Error loading assignments:', error);
            this.showMessage('Error loading assignments', 'error');
        }
    }

    openAssignModule(classId) {
        document.getElementById('assignClassId').value = classId;
        document.getElementById('assignModuleModal').style.display = 'block';
    }

    async assignModule(classId, moduleId, dueDate) {
        try {
            const response = await fetch('/api/TeacherPanel/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ classId, moduleId, dueDate })
            });

            if (response.ok) {
                this.showMessage('Module assigned successfully!', 'success');
                closeAssignModuleModal();
                await this.loadClasses();
            } else {
                this.showMessage('Failed to assign module', 'error');
            }
        } catch (error) {
            console.error('Error assigning module:', error);
            this.showMessage('Error assigning module', 'error');
        }
    }

    showMessage(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem;
            border-radius: 8px; color: white; font-weight: 600; z-index: 1000;
            background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => document.body.removeChild(notification), 3000);
    }
}

const dashboard = new TeacherDashboard();

function openCreateClassModal() {
    document.getElementById('createClassModal').style.display = 'block';
}

function closeCreateClassModal() {
    document.getElementById('createClassModal').style.display = 'none';
    document.getElementById('createClassForm').reset();
}

function closeAssignModuleModal() {
    document.getElementById('assignModuleModal').style.display = 'none';
    document.getElementById('assignModuleForm').reset();
}

function closeViewStudentsModal() {
    document.getElementById('viewStudentsModal').style.display = 'none';
}

function closeViewAssignmentsModal() {
    document.getElementById('viewAssignmentsModal').style.display = 'none';
}

document.getElementById('createClassForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const className = document.getElementById('className').value;
    dashboard.createClass(className);
});

document.getElementById('assignModuleForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const classId = parseInt(document.getElementById('assignClassId').value);
    const moduleId = document.getElementById('moduleSelect').value;
    const dueDate = new Date(document.getElementById('dueDate').value).toISOString();
    dashboard.assignModule(classId, moduleId, dueDate);
});

function openAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
    document.getElementById('studentSearchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
}

let searchTimeout;
document.getElementById('studentSearchInput')?.addEventListener('input', async (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        resultsDiv.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        const students = await dashboard.searchStudents(query);
        resultsDiv.innerHTML = students.map(s => `
            <div style="padding:0.75rem; border:1px solid var(--border); margin:0.5rem 0; border-radius:var(--radius-sm); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.2s;" onmouseover="this.style.background='var(--surface-alt)'" onmouseout="this.style.background='transparent'" onclick="dashboard.addStudent('${s.studentId}')">
                <div>
                    <strong>${s.name}</strong><br>
                    <small style="color:var(--muted);">${s.studentId} - ${s.email}</small>
                </div>
                <button class="btn btn--sm btn--primary">Add</button>
            </div>
        `).join('');
    }, 300);
});

window.onclick = (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
};
