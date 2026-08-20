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
				'nome': p.nome,
				'link': p.link,
				'dificuldade': p.dificuldade,
				'uids': [p.uid]
			};
		} else problems[p.pid].uids.push(p.uid);
	}

	console.log(problems);

	for(const [key,p] of Object.entries(problems)){
		console.log(p);
		const problema = document.createElement("div");
		problema.classList.add('topico');

		const label = document.createElement("label");
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
		link.innerText = p.nome;

		label.appendChild(checkbox);
		label.appendChild(link);

		problema.appendChild(label);
		
		const editorial = document.createElement("a");
		editorial.href = `${PATH}/views/editorial.html?id=${p.id}`;
		editorial.innerText = "editorial";
		problema.appendChild(editorial);

		const dificuldade = document.createElement("span");
		dificuldade.innerText = p.dificuldade;
		problema.appendChild(dificuldade);
		container.appendChild(problema);
	}

	console.log('Successfully connected! Your data:', data)
}
getData();

