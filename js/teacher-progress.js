// js/teacher-progress.js
$(document).ready(function() {
    loadStudentProgress();
});

async function loadStudentProgress() {
    const tableBody = $('#progressTableBody').empty().append('<tr><td colspan="4">Loading...</td></tr>');
    
    // *** FIXED: Reads from 'currentLearnerId' which login.js saves ***
    const teacherId = sessionStorage.getItem('currentLearnerId');
    if (!teacherId) {
        tableBody.html('<tr><td colspan="4">Could not find teacher ID. Please log in again.</td></tr>');
        return;
    }

    try {
        // *** FIXED: Now sends the teacherId to the API ***
        const response = await fetch(`/api/Teacher/student-progress?teacherId=${teacherId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
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