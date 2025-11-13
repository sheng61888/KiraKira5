// js/teacher-classes.js
$(document).ready(function() {
    loadTeacherClasses();
});

async function loadTeacherClasses() {
    const tableBody = $('#classesTableBody').empty().append('<tr><td colspan="4">Loading...</td></tr>');
    
    // *** FIXED: Reads from 'currentLearnerId' which login.js saves ***
    const teacherId = sessionStorage.getItem('currentLearnerId');
    if (!teacherId) {
        tableBody.html('<tr><td colspan="4">Could not find teacher ID. Please log in again.</td></tr>');
        return;
    }

    try {
        // *** FIXED: Now sends the teacherId to the API ***
        const response = await fetch(`/api/Teacher/classes?teacherId=${teacherId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const classes = await response.json();

        if (!classes || classes.length === 0) {
            tableBody.html('<tr><td colspan="4">You are not assigned to any classes.</td></tr>');
            return;
        }

        tableBody.empty();
        // The API returns a list of TeacherClassDto
        classes.forEach(cls => {
            const row = `
                <tr>
                    <td>${cls.classId}</td>
                    <td>${cls.className}</td>
                    <td>${cls.studentCount}</td>
                    <td class="actions">
                        <button class="btn btn--ghost" onclick="loadStudents('${cls.classId}', '${cls.className}')">View Roster</button>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    } catch (err) {
        console.error('Error loading classes:', err);
        tableBody.html('<tr><td colspan="4">Error loading classes.</td></tr>');
    }
}

async function loadStudents(classId, className) {
    const studentCard = $('#studentListCard').show();
    $('#studentListHeader').text(`Students in ${className}`);
    const tableBody = $('#studentsTableBody').empty().append('<tr><td colspan="4">Loading students...</td></tr>');
    
    try {
        // This URL was already correct from our previous fix
        const response = await fetch(`/api/Teacher/classes/${classId}/students`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const students = await response.json();

        if (!students || students.length === 0) {
            tableBody.html('<tr><td colspan="4">No students are enrolled in this class.</td></tr>');
            return;
        }

        tableBody.empty();
        students.forEach(student => {
            const row = `
                <tr>
                    <td>${student.uid}</td>
                    <td>${student.name}</td>
                    <td>${student.username}</td>
                    <td>${student.email}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    } catch (err) {
        console.error('Error loading students:', err);
        tableBody.html('<tr><td colspan="4">Error loading students.</td></tr>');
    }
}