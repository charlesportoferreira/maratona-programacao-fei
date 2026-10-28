let todos_topicos = [];
let topicos = [];

async function cadastrar_problema(){
	const res = document.getElementById('response');
	const nome = document.getElementById('problema_nome').value;
	const link = document.getElementById('problema_link').value;
	const { data:problema, error } = await db.from('problemas')
		.insert({
			nome: nome,
			link: link
		})
		.select('id')
		.single();

	if (error) {
		res.innerText = error.message;
		return;
	} 
	const tags = topicos.map(t => ({pid: problema.id, tid: t.id}));
	const { data, err } = await db.from('tags')
		.insert(tags);

	if (err) {
		res.innerText = err.message;
		await db.from('problemas')
			.delete()
			.eq('id',problema.id);
		return;
	}
	res.innerText = "Problema Adicionado com Sucesso";
}

function filtro(palavra, filtro){
	let i = 0, j = 0;
	while( i < palavra.length && j < filtro.length){
		if( filtro[j].toLowerCase() == palavra[i].toLowerCase() ){
			j++; i++;
		} else {
			i++;
		}
	}
	return !( j == filtro.length );
}

function remover_lista(nome){
	topicos = topicos.filter( t => t.nome !== nome);
	console.log(topicos);
	update_selected();
}

function update_selected(){
	const selecionados = document.getElementById('topicos_selecionados');
	selecionados.replaceChildren();
	for(const t of topicos){
		const item = document.createElement('div');
		item.classList.add('tag');
		item.classList.add('linha');
		item.classList.add('clickable');
		item.setAttribute('onclick',`remover_lista('${t.nome}')`);
		const label = document.createElement('label');
		label.innerText = t.nome;
		const x = document.createElement('div');
		x.innerText = 'x';
		item.appendChild(label);
		item.appendChild(x);
		selecionados.appendChild(item);
	}
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

function adicionar_lista(id, nome){
	for(const t of topicos)
		if( t.nome == nome ) return;
	topicos.push({id: id, nome:nome});
	update_selected();
	console.log(topicos);
}

function update_topicos(){
	const cadastro_topicos = document.getElementById('problema_topico');
	const filter = document.getElementById('topico_search').value;
	cadastro_topicos.replaceChildren();
	for(let t of todos_topicos){
		if( filtro(t.nome,filter) ) continue;
		const option = document.createElement('div');
		const check = document.createElement("input");
		const label = document.createElement('label');
		option.classList.add('linha2');
		option.classList.add('clickable');
		option.setAttribute('for',`check_topic_${t.id}`);

		check.type = 'checkbox';
		check.value = t.id;
		check.id = `check_topic_${t.id}`;
		check.classList.add('clickable');
		check.classList.add('check');
		check.setAttribute('onclick',`adicionar_lista(${t.id},'${t.nome}')`);

		label.innerText = t.nome;
		label.classList.add('clickable');
		label.setAttribute('for',`check_topic_${t.id}`);

		option.appendChild(check);
		option.appendChild(label);
		cadastro_topicos.appendChild(option);
	}
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

document.getElementById('topico_search').addEventListener('input',update_topicos);

async function getData() {
	{
		const { data:{user}, err } = await db.auth.getUser();
		console.log(user);
		if( user == undefined || user == null
		 || user.metadata.super_admin == null
		 || user.metadata.super_admin == undefined) 
			window.location.href = `${PATH}/index.html`;

		let query = db.from('topicos')
			.select('*')
			.order('nome')
		const { data, error } = await query;
		if (error) {
			console.error('Error fetching data from Supabase:', error);
			return;
		}

		const cadastro_topicos = document.getElementById('problema_topico');
		todos_topicos = data;
		update_topicos();
	}

	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()

