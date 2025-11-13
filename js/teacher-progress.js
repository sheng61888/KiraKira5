// js/teacher-progress.js
$(document).ready(function() {
    loadStudentProgress();
});

async function loadStudentProgress() {
    const tableBody = $('#progressTableBody').empty().append('<tr><td colspan="4">Loading...</td></tr>');
    try {
        const response = await fetch('/api/TeacherData/student-progress');
        const progressData = await response.json();

        if (!progressData || progressData.length === 0) {
            tableBody.html('<tr><td colspan="4">No student progress found.</td></tr>');
            return;
        }

        tableBody.empty();
        progressData.forEach(data => {
            const row = `
                <tr>
                    <td>${data.studentName}</td>
                    <td>${data.email}</td>
                    <td>${data.className}</td>
                    <td>${data.completedCount}</td>
                </tr>
            `;
            tableBody.append(row);
        });
    } catch (err) {
        console.error('Error loading progress:', err);
        tableBody.html('<tr><td colspan="4">Error loading progress.</td></tr>');
    }
}