const canvas = document.createElement("canvas");
canvas.id = 'canvas';

document.body.prepend(canvas);
const ctx = canvas.getContext("2d");

const logo = [
'#...#....###....####.....###....#####....###....#...#....###.',
'##.##...#...#...#...#...#...#.....#.....#...#...##..#...#...#',
'#.#.#...#...#...####....#...#.....#.....#...#...#.#.#...#...#',
'#...#...#####...#..#....#####.....#.....#...#...#..##...#####',
'#...#...#...#...#...#...#...#.....#......###....#...#...#...#',
'.............................................................',
'.............................................................',
'.............................................................',
'....................########...########...##.................',
'....................########...########...##.................',
'....................##.........##.........##.................',
'....................#####......#####......##.................',
'....................#####......#####......##.................',
'....................##.........##.........##.................',
'....................##.........########...##.................',
'....................##.........########...##.................'
];

const tamanho = 10;
const offsetx = 35;
const offsety = 30;

canvas.width = Math.max(window.innerWidth,document.body.offsetWidth);
canvas.height = Math.max(window.innerHeight,document.body.offsetHeight);
let colunas = Math.ceil(canvas.height / tamanho);
let linhas = Math.ceil(canvas.width / tamanho);
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

function draw_border(){
	const direcoes = [
		[1,0], [-1,0], [0,1], [0,-1]
	];
	const diagonais = [
		[1,1], [1,-1], [-1,1], [-1,-1]
	];
	for(let i = 0; i < linhas; i++){
		for(let j = 0; j < colunas; j++){
			if(visitados[i][j] == 1) continue;
			visitados[i][j] == 1;

			let borda = false;
			for(let [x,y] of direcoes){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas || ny >= colunas ) continue;
				if(visitados[nx][ny] == 1){
					borda = true;
					break;
				}
			}
			for(let [x,y] of diagonais){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas || ny >= colunas ) continue;
				if(visitados[nx][ny] == 1){
					borda = true;
					break;
				}
			}
			if( !borda ) continue;

			for(let [x,y] of direcoes){
				let nx = i + x;
				let ny = j + y;
				if( nx < 0 || ny < 0 || nx >= linhas || ny >= colunas ) continue;
				if(visitados[nx][ny]) continue;
				let borda2 = false;
				for(let [dx,dy] of direcoes){
					let nnx = nx + dx;
					let nny = ny + dy;
					if( nnx < 0 || nny < 0 || nnx >= linhas || nny >= colunas ) continue;
					if(visitados[nnx][nny]){
						borda2 = true;
						break;
					}
				}
				for(let [dx,dy] of diagonais){
					let nnx = nx + dx;
					let nny = ny + dy;
					if( nnx < 0 || nny < 0 || nnx >= linhas || nny >= colunas ) continue;
					if(visitados[nnx][nny]){
						borda2 = true;
						break;
					}
				}
				if( !borda2 ) continue;

				ctx.moveTo(i*tamanho,j*tamanho);
				ctx.lineTo(nx*tamanho,ny*tamanho);
			}

		}
	}
}

function draw(){
	canvas.width = Math.max(window.innerWidth, document.body.offsetWidth);
	canvas.height = Math.max(window.innerHeight, document.body.offsetHeight);
	console.log(linhas,colunas);
	colunas = Math.ceil(canvas.height / tamanho);
	linhas = Math.ceil(canvas.width / tamanho);
	visitados = Array.from({length: linhas},()=>Array(colunas).fill(0));
	const fill = 0.45;

	// for(let i = 0; i < logo.length; i++){
	// 	for(let j = 0; j < logo[i].length; j++){
	// 		if(logo[i][j] == '#') visitados[j + offsetx][i+offsety] = 1;
	// 	}
	// }

	// ctx.beginPath();
	// ctx.strokeStyle = '#114064';
	// ctx.lineWidth = 3;
	// draw_border();
	// ctx.stroke();

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
