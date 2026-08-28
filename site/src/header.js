// document.createElement();
// .appendChild();
// .classList();

const header = document.getElementById("header");
const left_tags = ['home','ranking','links','contato'];
const logout_tags = ['login','sign up'];
const PATH = '/maratona-programacao-fei/site'
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
			button.href = `${header_files['user']}?uid=${session.user.id}`;
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

const canvas = document.createElement("canvas");
canvas.id = 'logo';
document.getElementById('header_home').innerText = 'aaaaaaaaaaaaaaaaa';
document.getElementById('header_home').prepend(canvas);
const ltx = canvas.getContext('2d');

const offsetx = 5;
const offsety = 4;
canvas.width = 215;
canvas.height = 79;
let tamanho_logo = 7;
let colunas_logo = Math.ceil(canvas.height / tamanho_logo );
let linhas_logo = Math.ceil(canvas.width / tamanho_logo );
let visitados_logo = Array.from({length: linhas_logo},()=>Array(colunas_logo).fill(0));
const fill = 0.45;

const logo = [
'#####...#####...#####.',
'#.......#.........#...',
'###.....####......#...',
'#.......#.........#...',
'#.......#####...#####.'
];

function dfs_logo(xi,yi,fill){
	let pilha = [];
	const direcoes = [
		[1,0],
		[-1,0],
		[0,1],
		[0,-1]
	];
	pilha.push([xi,yi]);
	while(pilha.length > 0){
		let [x, y] = pilha[pilha.length-1];
		pilha.pop();
		if( x < 0 || y < 0 || x >= linhas_logo || y >= colunas_logo ) continue;
		if( visitados_logo[x][y] > 0 ) continue;;
		visitados_logo[x][y]++;


		for(let [dx, dy] of direcoes){
			let nx = x + dx;
			let ny = y + dy;
			let yes = Math.random();
			if(yes > fill) continue;
			if( nx < 0 || ny < 0 || nx >= linhas_logo || ny >= colunas_logo ) continue;
			if(visitados_logo[nx][ny] != 0) continue;
			ltx.moveTo(x*tamanho_logo,y*tamanho_logo);
			ltx.lineTo(nx*tamanho_logo,ny*tamanho_logo);
			pilha.push([nx,ny]);
		}
	}
}


function draw_border(){
	const direcoes = [
		[1,0], [-1,0], [0,1], [0,-1]
	];
	const diagonais = [
		[1,1], [1,-1], [-1,1], [-1,-1]
	];
	for(let i = 0; i < linhas_logo; i++){
		for(let j = 0; j < colunas_logo; j++){
			if(visitados_logo[i][j] == 1) continue;
			visitados_logo[i][j] == 1;

			let borda = false;
			for(let [x,y] of direcoes){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas_logo || ny >= colunas_logo ) continue;
				if(visitados_logo[nx][ny] == 1){
					borda = true;
					break;
				}
			}
			for(let [x,y] of diagonais){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas_logo || ny >= colunas_logo ) continue;
				if(visitados_logo[nx][ny] == 1){
					borda = true;
					break;
				}
			}
			if( !borda ) continue;

			for(let [x,y] of direcoes){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas_logo || ny >= colunas_logo ) continue;
				if(visitados_logo[nx][ny]) continue;
				let borda2 = false;
				for(let [dx,dy] of direcoes){
					let nnx = nx + dx;
					let nny = ny + dy;
					if( nnx < 0 || nny < 0 || nnx >= linhas_logo || nny >= colunas_logo ) continue;
					if(visitados_logo[nnx][nny]){
						borda2 = true;
						break;
					}
				}
				for(let [dx,dy] of diagonais){
					let nnx = nx + dx;
					let nny = ny + dy;
					if( nnx < 0 || nny < 0 || nnx >= linhas_logo || nny >= colunas_logo ) continue;
					if(visitados_logo[nnx][nny]){
						borda2 = true;
						break;
					}
				}
				if( !borda2 ) continue;

				ltx.moveTo(i*tamanho_logo,j*tamanho_logo);
				ltx.lineTo(nx*tamanho_logo,ny*tamanho_logo);
			}

		}
	}
}

function draw_logo(){
	for(let i = 0; i < logo.length; i++){
		for(let j = 0; j < logo[i].length; j++){
			if(logo[i][j] == '#') visitados_logo[j + offsetx][i+offsety] = 1;
		}
	}

	ltx.beginPath();
	ltx.strokeStyle = '#eeeeff';
	ltx.lineWidth = 2;
	draw_border();
	ltx.stroke();

	ltx.beginPath();
	ltx.strokeStyle = '#eeeeff';
	ltx.lineWidth = 1;
	for(let i = 0; i < linhas_logo; i++)
		for(let j = 0; j < colunas_logo; j++)
			if( !visitados_logo[i][j]) dfs_logo(i,j,fill);
	ltx.stroke();
}
draw_logo();
