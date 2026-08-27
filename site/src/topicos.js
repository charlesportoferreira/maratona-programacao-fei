async function getData(){
	const tid = new URLSearchParams(window.location.search).get('id');

	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if( user ) uid = user.id;
	let query = db.from('topicos_problemas').select('*').eq('tid',tid);
	const {data, error} = await query;

	console.log(data);
	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');
	

	const problems = {};
	for(let p of data){
		if( !problems[p.pid] ){
			problems[p.pid] = {
				'tid': p.tid,
				'pid': p.pid,
				'topico_nome': p.topico_nome,
				'nome': p.nome,
				'link': p.link,
				'dificuldade': p.dificuldade,
				'uids': [p.uid],
				'editorial': p.editorial
			};
		} else problems[p.pid].uids.push(p.uid);
	}

	console.log(problems);
	
	const topico = document.createElement("h2");
	topico.innerText = data[0].topico_nome;
	container.appendChild(topico);

	const introducao = document.createElement("div");
	introducao.classList.add('grupo');
	introducao.innerText = "Introdução";
	container.appendChild(introducao);

	{
		const descricao = document.createElement("div");
		descricao.classList.add('descricao');
		descricao.innerHTML = marked.parse(data[0].introducao);
		introducao.appendChild(descricao);

	}

	const problemas = document.createElement("div");
	problemas.classList.add('grupo')
	container.appendChild(problemas);

	{
		const linha = document.createElement("div");
		linha.classList.add('linha');

		const titulo = document.createElement("div");
		titulo.classList.add('left');
		titulo.innerText = "Problemas";

		const editoriais = document.createElement("div");
		editoriais.classList.add('center');
		editoriais.innerText = "Editoriais";

		const dificuldades = document.createElement("div");
		dificuldades.classList.add('right');
		dificuldades.innerText = "Dificuldade";
		linha.appendChild(titulo);
		linha.appendChild(editoriais);
		linha.appendChild(dificuldades);
		problemas.appendChild(linha);
	}

	for(const [key,p] of Object.entries(problems)){
		console.log(p);
		const problema = document.createElement("div");
		problema.classList.add('problema');

		const label = document.createElement("div");
		label.classList.add('left');
		const checkbox = document.createElement("input");
		checkbox.type = 'checkbox';
		if(p.uids.includes(uid)) checkbox.checked = true;
		checkbox.addEventListener('change', async (event)=>{
			const isChecked = event. target.checked;

			if( isChecked ){
				await db.from('problemas_resolvidos').insert([{
					uid:uid,
					pid:p.pid
				}]);
			} else{
				await db.from('problemas_resolvidos').delete()
				.eq('uid',uid)
				.eq('pid',p.pid);
			}
		});

		const link = document.createElement("a");
		link.href = p.link;
		link.target = '_blank';
		link.innerText = `${p.pid}. ${p.nome}`;

		label.appendChild(checkbox);
		label.appendChild(link);

		problema.appendChild(label);
		
		const editorial = document.createElement("a");
		editorial.classList.add('center');
		editorial.href = `${PATH}/views/editorial.html?id=${p.pid}`;
		editorial.innerText = "editorial";
		if(p.editorial) problema.appendChild(editorial);

		const dificuldade = document.createElement("span");
		dificuldade.classList.add('right');
		dificuldade.innerText = p.dificuldade;

		problema.appendChild(dificuldade);
		problemas.appendChild(problema);
	}

	console.log('Successfully connected! Your data:', data)
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData();

