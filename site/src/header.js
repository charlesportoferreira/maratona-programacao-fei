// document.createElement();
// .appendChild();
// .classList();

const header = document.getElementById("header");
const left_tags = ['home','ranking','links','contato'];
const logout_tags = ['login','sign up'];
const PATH = '/home/rafel/repositoriogit/maratona-programacao-fei/site'
const header_files = {
	'home':`${PATH}/index.html`,
	'links':`${PATH}/views/links.html`,
	'contato':`${PATH}/views/contato.html`,
	'ranking':`${PATH}/views/ranking.html`,
	'login':`${PATH}/views/login.html`,
	'sign up':`${PATH}/views/cadastro.html`,
	'user':`${PATH}/views/usuario.html`,
};

async function logout(){
	const { error } = await db.auth.signOut();
	if( error ) console.log( error.message );
}

const left = document.createElement("div");
left.id = "left";
header.appendChild(left);

for(let i = 0; i < left_tags.length; i++){
	const button = document.createElement("a");
	button.id = `header_${left_tags[i]}`;
	button.href = header_files[left_tags[i]];
	button.textContent = left_tags[i];
	left.appendChild(button);
}

const titulo = document.getElementById("titulo");
header.appendChild(titulo);

const right = document.createElement("div");
right.id = "right";
header.appendChild(right);

db.auth.onAuthStateChange((event,session) => {
	if(session){
		console.log("logado header");
		right.replaceChildren();
		{
			const button = document.createElement("button");
			button.textContent = 'log out';
			button.setAttribute("onclick",'logout()');
			right.appendChild(button);
		}
		{
			const button = document.createElement("a");
			button.href = header_files['user'];
			button.textContent = session.user.user_metadata.username;
			right.appendChild(button);
		}

	} else{
		console.log("nao logado header");
		right.replaceChildren();
		for(let i = 0; i < logout_tags.length; i++){
			const button = document.createElement("a");
			button.href = header_files[logout_tags[i]];
			button.textContent = logout_tags[i];
			right.appendChild(button);
		}

	}
});
