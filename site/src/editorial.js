async function getData(){
	let pid = new URLSearchParams(window.location.search).get('id');
	if( pid == undefined ) pid = 1;
	const {data, error} = await db.from('editorial').select('*, problemas (*)').eq('pid',pid);
	console.log(data);

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	const nome = document.createElement('h2');
	nome.innerText = data[0].problemas.nome;

	const descricao = document.createElement('pre');
	descricao.innerText = data[0].descricao;
	container.appendChild(nome);
	container.appendChild(descricao);

	console.log('Successfully connected! Your data:', data)
}
getData();

