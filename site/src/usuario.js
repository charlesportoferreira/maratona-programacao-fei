async function getData() {
	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if(user) uid = user.id;
	else window.location.href = `${PATH}/index.html`;
	let query = db.from('usuarios').select('*, problemas_resolvidos!left ( *,problemas_resolvidos!left ( * ) )');
	const { data, error } = await query;

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	for(let p of data){
		console.log(p);
		p = p.problemas;
		const problema = document.createElement("div");
		problema.classList.add('topico');

		const label = document.createElement("label");

		const link = document.createElement("a");
		link.href = p.link;
		link.innerText = p.nome;

		label.appendChild(checkbox);
		label.appendChild(link);

		problema.appendChild(label);

		const dificuldade = document.createElement("span");
		dificuldade.innerText = p.dificuldade;
		problema.appendChild(dificuldade);
		container.appendChild(problema);
	}

	console.log(data);
}

getData()
