document.getElementById('joinClassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = sessionStorage.getItem('currentLearnerId');
    if (!studentId) {
        alert('Please log in first');
        window.location.href = '/html/login_signup.html';
        return;
    }
    
    const joinCode = document.getElementById('joinCode').value.toUpperCase();
    
    try {
        const response = await fetch('/api/TeacherPanel/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, joinCode })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert('Successfully joined class!');
            window.location.href = '/html/learner-home.html';
        } else {
            alert(result.message || 'Invalid join code');
        }
    } catch (error) {
        console.error('Error joining class:', error);
        alert('Error joining class. Please try again.');
    }
});

document.getElementById('joinCode').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});
