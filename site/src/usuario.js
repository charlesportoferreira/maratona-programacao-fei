async function getData() {
	let uid = new URLSearchParams(window.location.search).get('uid');
	if( !uid ) window.location = `${PATH}/index.html`;

	const { data:user, err } = await db.from('profiles')
		.select('*')
		.eq('uid',uid)
		.single();

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

	{ // Nome do Usuario
		const nome = document.createElement('h1');
		nome.innerText = user.metadata.username;

		container.appendChild(nome);
	}

	const profile = document.createElement('div');
	profile.id = 'profile';
	container.appendChild(profile);

	{ // Estatisticas do Usuario
		const { data:estatisticas, err } = await db.from('grafico')
			.select('*')
			.eq('uid',uid)
			.order('gid');

		const problemas_resolvidos = document.createElement("div");
		problemas_resolvidos.classList.add('status');
		{ // Problemas Resolvidos
			let total_resolvido = 0;
			for(let stat of estatisticas)
				total_resolvido += stat.solved_problems;
			const resolvidos_text1 = document.createElement("h3");
			resolvidos_text1.innerText = "Problemas Resolvidos:";

			const resolvidos_text2 = document.createElement("h3");
			resolvidos_text2.innerText = `${total_resolvido}`;

			problemas_resolvidos.appendChild(resolvidos_text1);
			problemas_resolvidos.appendChild(resolvidos_text2);
		}

		profile.appendChild(problemas_resolvidos);

		const topicos_resolvidos = document.createElement("div");
		topicos_resolvidos.classList.add('status');
		{ // Topicos Resolvidos 
			let total_resolvido = 0;
			if(estatisticas[0]) total_resolvido = estatisticas[0].solved_topics;
			const resolvidos_text1 = document.createElement("h3");
			resolvidos_text1.innerText = "Topicos Resolvidos:";

			const resolvidos_text2 = document.createElement("h3");
			resolvidos_text2.innerText = `${total_resolvido}`;

			topicos_resolvidos.appendChild(resolvidos_text1);
			topicos_resolvidos.appendChild(resolvidos_text2);
		}

		profile.appendChild(topicos_resolvidos);

		{ // Grafico
			const user_statistics = document.createElement("canvas");
			const wrap_grafico = document.createElement("div");
			wrap_grafico.id = 'user_statistics';
			const utx = user_statistics.getContext('2d');
			const grupos = new Set();
			const topicos = [];
			for(const stat of estatisticas){
				grupos.add(stat.nome);
				const topico = {
					label: stat.topico,
					data: []
				}
				for(const g of grupos){
					if( g == stat.nome ) topico.data.push(stat.solved_problems);
					else topico.data.push(0);
				}
				topicos.push(topico);
			}
			console.log(grupos);
			console.log(topicos);

			const grafico = new Chart(utx,{
				type: 'bar',
				data: {
					labels: [...grupos],
					datasets: topicos,
				},
				options: {
					responsive: true,
					plugins:{
						legend:{ display: false },
						colors:{ forceOverride: true }
					},
					scales: {
						x: { stacked: true, },
						y: { stacked: true, }
					},
				}
			});
			wrap_grafico.appendChild(user_statistics);
			profile.appendChild(wrap_grafico);
		}

	}

	{ // Historico de problemas resolvidos do usuario
		const historico = document.createElement('div');
		historico.classList.add('grupo');
		{
			const titulo = document.createElement('label');
			titulo.innerText = 'Historico de problemas';
			historico.appendChild(titulo);
		}
		container.appendChild(historico);

		for(let p of data){
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
			dificuldade.innerText = p.data;

			problema.appendChild(dificuldade);

			historico.appendChild(problema);
		}
	}

	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()
