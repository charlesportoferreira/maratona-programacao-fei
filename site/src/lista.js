async function getData() {
	const { data:{user}, err } = await db.auth.getUser();

	let uid = undefined;
	if(user) uid = user.id;
	let query = db.from('grupo_topicos').select('*');
	const { data, error } = await query;

	if (error) {
		console.error('Error fetching data from Supabase:', error)
		return;
	}

	const container = document.getElementById('container');

	const groups = [];
	const topics = {};
	const topic_groups = {};
	for(let t of data){

		if (!groups.some(g => g.gid === t.gid)) {
			groups.push({ gid: t.gid, nome: t.nome_grupo });

			topic_groups[t.gid] = [];
		}
		
		if( !topics[t.tid] ){
			topics[t.tid] = {
				'tid': t.tid,
				'nome': t.nome,
				'gid': t.gid,
				'grupo_nome': t.nome_grupo,
				'uids': [t.uid]
			};
		} else topics[t.tid].uids.push(t.uid);

		if(!topic_groups[t.gid].includes(t.tid))
			topic_groups[t.gid].push(t.tid);
	}
	console.log('groups',groups);
	console.log('topics',topics);
	console.log('topic_groups',topic_groups);

	for(let g of groups){
		const grupo = document.createElement("div");
		grupo.classList.add('grupo');
		grupo.classList.add('clickable');

		const toggle = document.createElement('input');
		toggle.classList.add('toggle');
		toggle.id = `toggle_grupo_${g.gid}`;
		toggle.type = 'checkbox';

		const linha = document.createElement('label');
		linha.classList.add('linha');
		linha.classList.add('clickable');
		linha.setAttribute('for',`toggle_grupo_${g.gid}`);


		const title = document.createElement("label");
		title.setAttribute('for',`toggle_grupo_${g.gid}`);
		title.classList.add('clickable');
		title.innerText = `${g.gid}. ${g.nome}`;

		const arrow = document.createElement('label');
		arrow.classList.add('arrow');
		arrow.classList.add('clickable');
		arrow.setAttribute('for',`toggle_grupo_${g.gid}`);
		arrow.innerText = '<';

		linha.appendChild(title);
		linha.appendChild(arrow);
		grupo.appendChild(toggle);
		grupo.appendChild(linha);
		container.appendChild(grupo);
		for(let t of topic_groups[g.gid]){
			const topicos = document.createElement("div");
			topicos.classList.add('topico');
			const label = document.createElement("label");
			label.classList.add('left');
			const checkbox = document.createElement("input");
			checkbox.type = 'checkbox';
			if( topics[t].uids.includes(uid) ) checkbox.checked = true;
			checkbox.addEventListener('change', async (event)=>{
				const isChecked = event.target.checked;
				
				if( isChecked ){
					await db.from('topicos_resolvidos').insert([{
						uid:uid,
						tid:t
					}]);
				} else {
					await db.from('topicos_resolvidos').delete()
					.eq('uid',uid)
					.eq('tid',t);
				}
			});
			const link = document.createElement("a");
			link.innerText = `${t}. ${topics[t].nome}`;
			link.href = `${PATH}/views/topico.html?id=${t}`;
			label.appendChild(checkbox);
			label.appendChild(link);
			topicos.appendChild(label);
			grupo.appendChild(topicos);
		}
	}

	console.log(data);
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()
