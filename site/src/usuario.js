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

		const user_statistics = document.createElement("canvas");
		user_statistics.id = 'user_statistics';
		const utx = user_statistics.getContext('2d');

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
			let total_resolvido = estatisticas[0].solved_topics;
			const resolvidos_text1 = document.createElement("h3");
			resolvidos_text1.innerText = "Topicos Resolvidos:";

			const resolvidos_text2 = document.createElement("h3");
			resolvidos_text2.innerText = `${total_resolvido}`;

			topicos_resolvidos.appendChild(resolvidos_text1);
			topicos_resolvidos.appendChild(resolvidos_text2);
		}

		profile.appendChild(topicos_resolvidos);

		{ // Grafico
			const grafico = document.createElement("div");
			grafico.id = 'user_statistics';
			const altura_grafico = 230;
			for( stat of estatisticas ){
				const barra_wrap = document.createElement('div');
				barra_wrap.id = 'barra_wrap';
				barra_wrap.height = 200;
				barra_wrap.width = 100;
				const barra = document.createElement("div");
				barra.classList.add('barra');
				barra.style.height = `${altura_grafico * (stat.solved_problems / stat.total_problemas)}px`;
				
				console.log(barra.style.height);

				{
					const popup = document.createElement("div");
					popup.classList.add('popup');
					const title = document.createElement("span");
					title.innerText = stat.nome;
					const proportion = document.createElement("span");
					proportion.innerText = ` ${(stat.solved_problems / stat.total_problemas * 100).toFixed(2)}%`;

					popup.appendChild(title);
					popup.appendChild(proportion);
					barra.appendChild(popup);
				}
				const title = document.createElement('div');
				title.classList.add('nome');
				title.innerText = stat.nome;

				barra_wrap.appendChild(barra);
				barra_wrap.appendChild(title);
				grafico.appendChild(barra_wrap);
			}
			profile.appendChild(grafico);
			// for( let i = 0; i < estatisticas.length; i++){
			// 	const altura = altura_max_barras * (estatisticas[i].solved_problems / estatisticas[i].total_problemas);
			// 	retangulo( (1 + 2*i)*tamanho, altura_min_barras + altura_max_barras - altura, tamanho, altura, '#1090b4');

			// 	let titulo = estatisticas[i].nome.split(' ');
			// 	offset_titulo = 25;
			// 	for( let j of titulo){
			// 		texto( (1 + 2*i)*tamanho, altura_canvas - offset_titulo, j, '7pt', 'black');
			// 		offset_titulo -= 10;
			// 	}
			// }

			// utx.beginPath();
			// utx.moveTo(0,altura_min_barras + altura_max_barras);
			// utx.lineTo(largura_canvas,altura_min_barras + altura_max_barras);
			// utx.stroke();
			// utx.closePath();
			// profile.appendChild(user_statistics);
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
