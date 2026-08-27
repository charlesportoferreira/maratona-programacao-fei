async function getData() {
	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if(user) uid = user.id;
	else window.location.href = `${PATH}/index.html`;

	let query = db.from('problemas_resolvidos')
		.select('*, problemas!left ( * )')
		.eq('uid',uid)
		.order('data', {ascending: false})
		.limit(10);
	const { data, error } = await query;

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	{
		const nome = document.createElement('h2');
		nome.innerText = user.user_metadata.username;

		container.appendChild(nome);
	}

	const historico = document.createElement('div');
	historico.classList.add('grupo');
	{
		const titulo = document.createElement('label');
		titulo.innerText = 'Historico de problemas';
		historico.appendChild(titulo);
	}
	container.appendChild(historico);

	for(let p of data){
		console.log(p);
		const problema = document.createElement("div");
		problema.classList.add('problema');

		const label = document.createElement("label");

		const link = document.createElement("a");
		link.href = p.problemas.link;
		link.target = '_blank';
		link.innerText = `${p.pid}. ${p.problemas.nome}`;

		label.appendChild(link);

		problema.appendChild(label);

		const dificuldade = document.createElement("span");
		dificuldade.innerText = p.problemas.dificuldade;

		problema.appendChild(dificuldade);

		historico.appendChild(problema);
	}

	console.log(data);
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()
