const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');
const signUpCard = document.querySelector('.sign-up-card');
const signInCard = document.querySelector('.sign-in-card');
const signupForm = document.getElementById('signupForm');

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