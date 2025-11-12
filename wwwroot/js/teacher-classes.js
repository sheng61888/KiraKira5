// js/teacher-classes.js
$(document).ready(function() {
    loadTeacherClasses();
});

async function loadTeacherClasses() {
    const tableBody = $('#classesTableBody').empty().append('<tr><td colspan="4">Loading...</td></tr>');
    try {
        const response = await fetch('/api/Teacher/classes');
        const classes = await response.json();

        if (!classes || classes.length === 0) {
            tableBody.html('<tr><td colspan="4">You are not assigned to any classes.</td></tr>');
            return;
        }

        tableBody.empty();
        classes.forEach(cls => {
            const row = `
                <tr>
                    <td>${cls.classId}</td>
                    <td>${cls.className}</td>
                    <td>(N/A)</td> <td class="actions">
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
        const response = await fetch(`/api/TeacherData/classes/${classId}/students`);
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