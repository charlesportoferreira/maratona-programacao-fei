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
	const ranking = document.createElement('div');
	ranking.classList.add('grupo');
	container.appendChild(ranking);

	{
		const linha = document.createElement('div');
		linha.classList.add('linha');

		const posicao = document.createElement('div');
		posicao.classList.add('left');
		posicao.innerText = 'Nº Usuario';

		const pontuacao = document.createElement('div');
		pontuacao.classList.add('right');
		pontuacao.innerText = 'Problemas Resolvidos';

		linha.appendChild(posicao);
		linha.appendChild(pontuacao);
		ranking.appendChild(linha);
	}


	for(let i = 0; i < data.length; i++){
		const linha = document.createElement('div');
		linha.classList.add('problema');
		const label = document.createElement('label');
		const posicao = document.createElement('span');
		const nome = document.createElement('a');
		posicao.innerText = i+1;
		nome.innerText = data[i].metadata.username;
		nome.href = `${PATH}/views/usuario.html?uid=${data[i].uid}`;
		label.appendChild(posicao);
		label.appendChild(nome);
		const problemas = document.createElement('span');
		problemas.innerText = data[i].problemas_resolvidos;
		
		linha.appendChild(label);
		linha.appendChild(problemas);

		ranking.appendChild(linha);
	}

	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()
