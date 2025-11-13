async function loadStats() {
    try {
        const response = await fetch('/api/user/stats');
        const data = await response.json();
        
        document.querySelectorAll('.metric-value')[0].textContent = data.learners;
        document.querySelectorAll('.metric-value')[1].textContent = data.teachers;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadStats);
