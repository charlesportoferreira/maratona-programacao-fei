async function getData() {
	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if(user) uid = user.id;
	const { data, error } = await db.from('ranking').select('*');

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	for(let i = 0; i < data.length; i++){
		const linha = document.createElement('div');
		linha.classList.add('topico');
		const label = document.createElement('label');
		const posicao = document.createElement('span');
		const nome = document.createElement('span');
		posicao.innerText = i+1;
		nome.innerText = data[i].email;
		label.appendChild(posicao);
		label.appendChild(nome);
		const problemas = document.createElement('span');
		problemas.innerText = data[i].problemas_resolvidos;
		
		linha.appendChild(label);
		linha.appendChild(problemas);

		container.appendChild(linha);
	}

	console.log(data);
}

getData()
