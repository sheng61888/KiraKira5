const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');
const signUpCard = document.querySelector('.sign-up-card');
const signInCard = document.querySelector('.sign-in-card');
const signupForm = document.getElementById('signupForm');
const forgotLink = document.querySelector('.forgot-link');

if (window.location.search.includes('signup=true')) {
    signInCard.classList.remove('active');
    signUpCard.classList.add('active');
}

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
		name: formData.get('name'),
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
			const userId = result.user.id || result.user.Id;
			const userEmail = result.user.email || result.user.Email;
			console.log('Login successful, user role:', userRole);
			sessionStorage.setItem('userName', userName);
			sessionStorage.setItem('currentLearnerId', userId);
			sessionStorage.setItem('userEmail', userEmail);
			if (userRole === 'admin') {
				window.location.href = 'admin-dashboard.html';
			} else if (userRole === 'learner') {
				window.location.href = 'learner-home.html';
			} else if (userRole === 'teacher') {
				window.location.href = 'teacher-dashboard-new.html';
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
			alert('OTP has been sent to your notifications. Please login to check your notifications, or contact admin for the OTP.');
			
			const otp = prompt('Enter the OTP from your notifications:');
			if (!otp) return;
			
			const newPassword = prompt('Enter your new password:');
			if (!newPassword) return;
			
			const verifyResponse = await fetch('/api/passwordreset/verify', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, otp, newPassword })
			});
			
			const verifyResult = await verifyResponse.json();
			if (verifyResult.success) {
				alert('Password reset successful! You can now login with your new password.');
			} else {
				alert(verifyResult.message || 'Failed to reset password');
			}
		} else {
			alert(result.message || 'Failed to submit request');
		}
	} catch (error) {
		alert('Error: ' + error.message);
	}
});