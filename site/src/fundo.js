const fundo = document.createElement("canvas");
fundo.id = 'fundo';
document.body.prepend(fundo);
const ctx = fundo.getContext("2d");

let tamanho = 10;
let colunas = 0, linhas = 0;
let visitados = Array.from({length: linhas},()=>Array(colunas).fill(0)); 

function dfs(xi,yi,fill){
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
		if( x < 0 || y < 0 || x >= linhas || y >= colunas ) continue;
		if( visitados[x][y] > 0 ) continue;;
		visitados[x][y]++;


		for(let [dx, dy] of direcoes){
			let nx = x + dx;
			let ny = y + dy;
			let yes = Math.random();
			if(yes > fill) continue;
			if( nx < 0 || ny < 0 || nx >= linhas || ny >= colunas ) continue;
			if(visitados[nx][ny] != 0) continue;
			ctx.moveTo(x*tamanho,y*tamanho);
			ctx.lineTo(nx*tamanho,ny*tamanho);
			pilha.push([nx,ny]);
		}
	}
}

function draw(){
	fundo.width = Math.max(window.innerWidth, document.body.offsetWidth);
	fundo.height = Math.max(window.innerHeight, document.body.offsetHeight);
	colunas = Math.ceil(fundo.height / tamanho);
	linhas = Math.ceil(fundo.width / tamanho);
	visitados = Array.from({length: linhas},()=>Array(colunas).fill(0));
	const fill = 0.45;

	ctx.beginPath();
	ctx.strokeStyle = '#114064';
	ctx.lineWidth = 2;
	for(let i = 0; i < linhas; i++)
		for(let j = 0; j < colunas; j++)
			if( !visitados[i][j]) dfs(i,j,fill);
	ctx.stroke();
}
draw();

window.addEventListener("resize",draw);
window.addEventListener('layoutReady', () => draw());
