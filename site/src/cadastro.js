async function cadastro(){
	const name = document.getElementById('cadastro_name').value;
	const email = document.getElementById('cadastro_email').value;
	const password = document.getElementById('cadastro_senha').value;
	const confirm_password = document.getElementById('cadastro_senha2').value;

	const res = document.getElementById('response');

	if( confirm_password != password ){
		res.innerText = "Senha e senha de confirmação diferentes";
		return;
	}
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
		res.innerText = error.message;
	} else {
		window.location.href = `${PATH}/index.html`;
	}
}
