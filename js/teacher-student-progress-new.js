class StudentProgressTracker {
    constructor() {
        this.teacherId = sessionStorage.getItem('currentLearnerId');
        if (!this.teacherId) {
            alert('Please log in as a teacher');
            window.location.href = '/html/login_signup.html';
            return;
        }
        this.init();
    }

    async init() {
        await this.loadProgress();
    }

    async loadProgress() {
        try {
            const response = await fetch(`/api/TeacherPanel/progress?teacherId=${this.teacherId}`);
            const progress = await response.json();
            
            this.renderProgress(progress);
        } catch (error) {
            console.error('Error loading progress:', error);
            document.getElementById('progressTableBody').innerHTML = 
                '<tr><td colspan="5">Error loading progress data</td></tr>';
        }
    }

    renderProgress(progress) {
        const tbody = document.getElementById('progressTableBody');
        
        if (progress.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5">No assignments yet</td></tr>';
            return;
        }

        tbody.innerHTML = progress.map(p => {
            const status = this.getStatus(p);
            return `
                <tr>
                    <td>${p.studentName}</td>
                    <td>${p.className}</td>
                    <td>${p.moduleName}</td>
                    <td>${new Date(p.dueDate).toLocaleDateString()}</td>
                    <td><span class="status-badge status-${status.class}">${status.text}</span></td>
                </tr>
            `;
        }).join('');
    }

    getStatus(progress) {
        if (progress.isCompleted) {
            return { class: 'completed', text: 'Completed' };
        }
        
        const now = new Date();
        const dueDate = new Date(progress.dueDate);
        
        if (dueDate < now) {
            return { class: 'overdue', text: 'Overdue' };
        }
        
        return { class: 'pending', text: 'Pending' };
    }
}

new StudentProgressTracker();
