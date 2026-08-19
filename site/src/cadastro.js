async function cadastro(){
	const name = document.getElementById('cadastro_name').value;
	const email = document.getElementById('cadastro_email').value;
	const password = document.getElementById('cadastro_senha').value;
	const { data, error } = await db.auth.signUp({
		email: email,
		password: password,
		options: {
			data: {
				username: name
			}
		}
	});
	if( error ){
		console.log( error.message );
	} else {
		// const response = document.createElement('div');
		// response.innerText = "Check your email for a verification link!";
		// const res = document.getElementById('response')
		// res.appendChild(response);
		window.location.href = `${PATH}/views/login.html`;
	}
}
