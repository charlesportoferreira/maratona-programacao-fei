async function getData(){
	const id = new URLSearchParams(window.location.search).get('id');

	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if( user ) uid = user.id;
	let query = db.from('tags').select('problemas ( *, problemas_resolvidos ( uid ) )').eq('tid',id);
	if( uid ) query = query.eq('problemas.problemas_resolvidos.uid',uid);
	const {data, error} = await query;

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
		const checkbox = document.createElement("input");
		checkbox.type = 'checkbox';
		if(p.problemas_resolvidos.length > 0) checkbox.checked = true;
		checkbox.addEventListener('change', async (event)=>{
			const isChecked = event. target.checked;

			console.log(uid, p.id)
			if( isChecked ){
				await db.from('problemas_resolvidos').insert([{
					uid:uid,
					pid:p.id
				}]);
			} else{
				await db.from('problemas_resolvidos').delete()
				.eq('uid',uid)
				.eq('pid',p.id);
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

