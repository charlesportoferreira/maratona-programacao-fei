async function getData() {
	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if(user) uid = user.id;
	let query = db.from('topicos').select('*, topicos_resolvidos ( uid )');
	if( uid ) query = query.eq('topicos_resolvidos.uid',uid);
	const { data, error } = await query;

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	const groups = [];
	const topic_groups = {};
	for(let t of data){
		if(!groups.includes(t.grupo)){
			groups.push(t.grupo);
			topic_groups[t.grupo] = [];
		}
		topic_groups[t.grupo].push(t);
	}

	for(let g of groups){
		const grupo = document.createElement("div");
		grupo.classList.add('grupo');
		const title = document.createElement("div");
		title.innerText = g;
		grupo.appendChild(title);
		container.appendChild(grupo);
		for(let t of topic_groups[g]){
			const topicos = document.createElement("div");
			topicos.classList.add('topico');
			const label = document.createElement("label");
			const checkbox = document.createElement("input");
			checkbox.type = 'checkbox';
			if( t.topicos_resolvidos.length > 0 ) checkbox.checked = true;
			checkbox.addEventListener('change', async (event)=>{
				const isChecked = event.target.checked;
				
				if( isChecked ){
					await db.from('topicos_resolvidos').insert([{
						uid:uid,
						tid:t.id
					}]);
				} else {
					await db.from('topicos_resolvidos').delete()
					.eq('uid',uid)
					.eq('tid',t.id);
				}
			});
			const link = document.createElement("a");
			link.innerText = t.nome;
			link.href = `${PATH}/views/topico.html?id=${t.id}`;
			label.appendChild(checkbox);
			label.appendChild(link);
			topicos.appendChild(label);
			grupo.appendChild(topicos);
		}
	}

	console.log(data);
}

getData()
