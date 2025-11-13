let currentClassId = null;

async function loadClasses() {
    const teacherId = sessionStorage.getItem('userId');
    if (!teacherId) return;

    try {
        const response = await fetch(`/api/TeacherPanel/classes?teacherId=${teacherId}`);
        const classes = await response.json();
        
        const tbody = document.getElementById('classesTableBody');
        tbody.innerHTML = classes.map(c => `
            <tr>
                <td>${c.classId}</td>
                <td>${c.className}</td>
                <td>${c.studentCount}</td>
                <td><button class="btn btn--sm" onclick="viewStudents(${c.classId}, '${c.className}')">View Students</button></td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading classes:', error);
    }
}

async function viewStudents(classId, className) {
    currentClassId = classId;
    document.getElementById('studentListHeader').textContent = `Students in ${className}`;
    document.getElementById('studentListCard').style.display = 'block';

    try {
        const response = await fetch(`/api/TeacherPanel/classes/${classId}/students`);
        const students = await response.json();
        
        const tbody = document.getElementById('studentsTableBody');
        tbody.innerHTML = students.map(s => `
            <tr>
                <td>${s.studentId}</td>
                <td>${s.name}</td>
                <td>${s.studentId}</td>
                <td>${s.email}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading students:', error);
    }
}

function showAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'block';
    document.getElementById('studentSearchInput').value = '';
    document.getElementById('searchResults').innerHTML = '';
}

function closeAddStudentModal() {
    document.getElementById('addStudentModal').style.display = 'none';
}

let searchTimeout;
document.getElementById('studentSearchInput')?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        document.getElementById('searchResults').innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const response = await fetch(`/api/TeacherPanel/search-students?query=${encodeURIComponent(query)}`);
            const students = await response.json();
            
            const resultsDiv = document.getElementById('searchResults');
            resultsDiv.innerHTML = students.map(s => `
                <div style="padding:0.5rem; border:1px solid #ddd; margin:0.25rem 0; border-radius:4px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;" onclick="addStudent('${s.studentId}')">
                    <div>
                        <strong>${s.name}</strong><br>
                        <small>${s.studentId} - ${s.email}</small>
                    </div>
                    <button class="btn btn--sm">Add</button>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error searching students:', error);
        }
    }, 300);
});

async function addStudent(studentId) {
    if (!currentClassId) return;

    try {
        const response = await fetch(`/api/TeacherPanel/classes/${currentClassId}/add-student`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId })
        });

        if (response.ok) {
            alert('Student added successfully');
            closeAddStudentModal();
            const className = document.getElementById('studentListHeader').textContent.replace('Students in ', '');
            viewStudents(currentClassId, className);
        } else {
            alert('Failed to add student');
        }
    } catch (error) {
        console.error('Error adding student:', error);
        alert('Error adding student');
    }
}

document.addEventListener('DOMContentLoaded', loadClasses);
