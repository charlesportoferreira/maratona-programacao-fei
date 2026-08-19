async function login(){
	const email = document.getElementById('login_email').value;
	const password = document.getElementById('login_senha').value;
	const { data, error } = await db.auth.signInWithPassword({ email, password });
	if( error ){
		console.log( error.message );
	} else{
		window.location.href = `${PATH}/index.html`;
	}
}
