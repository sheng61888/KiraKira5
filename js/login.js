const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');
const signUpCard = document.querySelector('.sign-up-card');
const signInCard = document.querySelector('.sign-in-card');
const signupForm = document.getElementById('signupForm');
const forgotLink = document.querySelector('.forgot-link');

switchToSignUp.addEventListener('click', (e) => {
	e.preventDefault();
	signInCard.classList.remove('active');
	signUpCard.classList.add('active');
});

switchToSignIn.addEventListener('click', (e) => {
	e.preventDefault();
	signUpCard.classList.remove('active');
	signInCard.classList.add('active');
});

const signinForm = document.getElementById('signinForm');

signupForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	
	const formData = new FormData(e.target);
	const userData = {
		username: formData.get('username'),
		name: formData.get('username'),
		email: formData.get('email'),
		password: formData.get('password'),
		usertype: formData.get('role')
	};
	
	try {
		const response = await fetch('/api/user/add', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(userData)
		});
		
		const result = await response.json();
		
		if (result.success) {
			alert('Registration successful!');
			signupForm.reset();
			signUpCard.classList.remove('active');
			signInCard.classList.add('active');
		} else {
			alert('Registration failed: ' + (result.error || 'Unknown error'));
		}
	} catch (error) {
		alert('Error: ' + error.message);
	}
});

signinForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	
	const formData = new FormData(e.target);
	const loginData = {
		email: formData.get('email'),
		password: formData.get('password')
	};
	
	console.log('Login attempt:', loginData);
	
	try {
		const response = await fetch('/api/user/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(loginData)
		});
		
		console.log('Response status:', response.status);
		const result = await response.json();
		console.log('Login result:', result);
		
		if (result.success) {
			const userRole = result.user.role || result.user.Role;
			const userName = result.user.name || result.user.Name;
			console.log('Login successful, user role:', userRole);
			sessionStorage.setItem('userName', userName);
			if (userRole === 'admin') {
				window.location.href = 'admin-dashboard.html';
			} else if (userRole === 'learner') {
				window.location.href = 'learner-dashboard.html';
			} else if (userRole === 'teacher') {
				window.location.href = 'teacher-dashboard.html';
			}
		} else {
			console.log('Login failed:', result.message);
			alert(result.message || 'Login failed');
		}
	} catch (error) {
		console.error('Login error:', error);
		alert('Error: ' + error.message);
	}
});

forgotLink.addEventListener('click', async (e) => {
	e.preventDefault();
	const email = prompt('Enter your email address:');
	if (!email) return;
	
	try {
		const response = await fetch('/api/passwordreset/request', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ email })
		});
		
		const result = await response.json();
		if (result.success) {
			alert('Password reset request submitted. Admin will review your request.');
		} else {
			alert(result.message || 'Failed to submit request');
		}
	} catch (error) {
		alert('Error: ' + error.message);
	}
});