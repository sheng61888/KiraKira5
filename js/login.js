const switchToSignUp = document.getElementById('switchToSignUp');
const switchToSignIn = document.getElementById('switchToSignIn');
const signUpCard = document.querySelector('.sign-up-card');
const signInCard = document.querySelector('.sign-in-card');

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