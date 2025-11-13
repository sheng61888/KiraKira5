document.getElementById('joinClassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentId = sessionStorage.getItem('currentLearnerId');
    if (!studentId) {
        alert('Please log in first');
        window.location.href = '/html/login_signup.html';
        return;
    }
    
    const joinCode = document.getElementById('joinCode').value.toUpperCase().trim();
    
    console.log('Attempting to join with:', { studentId, joinCode });
    
    try {
        const response = await fetch('/api/TeacherPanel/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, joinCode })
        });
        
        console.log('Response status:', response.status);
        const result = await response.json();
        console.log('Response data:', result);
        
        if (response.ok) {
            alert('Successfully joined class!');
            window.location.href = '/html/learner-home.html';
        } else {
            alert(result.message || 'Invalid join code. Please check the code and try again.');
        }
    } catch (error) {
        console.error('Error joining class:', error);
        alert('Error joining class. The teacher panel tables may not be set up yet. Please contact your administrator.');
    }
});

document.getElementById('joinCode').addEventListener('input', (e) => {
    e.target.value = e.target.value.toUpperCase();
});
