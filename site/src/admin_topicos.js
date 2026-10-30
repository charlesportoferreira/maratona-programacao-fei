let todos_grupos = [];
let grupo = undefined;

async function cadastrar_topico(event){
	const res = document.getElementById('topico_response');
	const nome = document.getElementById('topico_nome').value;
	const introducao = code.value;
	console.log(nome);
	console.log(introducao);
	if(grupo == undefined){
		res.innerText = "Selecione um Grupo";
		return;
	}
	const { data:topico, error } = await db.from('topicos')
		.insert({
			nome: nome,
			introducao: introducao,
			grupo: grupo.id
		});
	if (error) {
		res.innerText = error.message;
		return;
	} 
	res.innerText = "Topico Adicionado com Sucesso";
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

function remover_grupo(){
	grupo = undefined;
	update_grupo_selected();
}

function adicionar_grupo(id, nome){
	grupo = {id:id,nome:nome}
	update_grupo_selected();
}

function update_grupo_selected(){
	const selecionado = document.getElementById('grupo_selecionado');
	selecionado.replaceChildren();

	if( !grupo ){
		const layoutReadyEvent = new CustomEvent('layoutReady');
		window.dispatchEvent(layoutReadyEvent);
		return;
	}
	const item = document.createElement('div');
	item.classList.add('tag');
	item.classList.add('linha');
	item.classList.add('clickable');
	item.setAttribute('onclick',`remover_grupo()`);
	const label = document.createElement('label');
	label.innerText = grupo.nome;
	const x = document.createElement('div');
	x.innerText = 'x';
	item.appendChild(label);
	item.appendChild(x); selecionado.appendChild(item);
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

function update_grupos(){
	const cadastro_grupos = document.getElementById('topico_grupo');
	const filter = document.getElementById('grupo_search').value;
	cadastro_grupos.replaceChildren();
	for(let g of todos_grupos){
		if( filtro(g.nome,filter) ) continue;
		const option = document.createElement('div');
		const check = document.createElement("input");
		const label = document.createElement('label');
		option.classList.add('linha2');
		option.classList.add('clickable');
		option.setAttribute('for',`check_grupo_${g.id}`);

		check.type = 'checkbox';
		check.value = g.id;
		check.id = `check_grupo_${g.id}`;
		check.classList.add('clickable');
		check.classList.add('check');
		check.setAttribute('onclick',`adicionar_grupo(${g.id},'${g.nome}')`);

		label.innerText = g.nome;
		label.classList.add('clickable');
		label.setAttribute('for',`check_grupo_${g.id}`);
		option.appendChild(check);
		option.appendChild(label);
		cadastro_grupos.appendChild(option);
	}
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

document.getElementById('grupo_search').addEventListener('input',update_grupos);

async function getData() {
	{
		const { data:{user}, err } = await db.auth.getUser();
		if( user == undefined || user == null
		 || user.user_metadata.super_admin == null
		 || user.user_metadata.super_admin == undefined)
			window.location.href = `${PATH}/index.html`;
	}
	{
		let query = db.from('grupos')
			.select('*')
			.order('nome')
		const {data, error} = await query;
		if( error) {
			console.error('Error fetching data from Supabase:', error);
			return;
		}
		const topicos_grupos = document.getElementById('problema_topico');
		todos_grupos = data;
		update_grupos();
	}

	{
		const title = document.createElement("span");
		title.innerText = "Introducao:";
		title.classList.add('left');
		const introducao = document.getElementById("introducao");
		const botoes = document.createElement("div");
		const edit_button = document.createElement("button");
		const preview_button = document.createElement("button");

		botoes.classList.add('editor_preview_buttons');
		edit_button.innerText = "edit";
		preview_button.innerText = "preview";

		edit_button.type = "button";
		preview_button.type = "button";

		edit_button.setAttribute('onclick','set_editor()');
		preview_button.setAttribute('onclick','set_preview()');

		edit_button.setAttribute('formnovalidate','');
		preview_button.setAttribute('formnovalidate','');

		botoes.appendChild(edit_button);
		botoes.appendChild(preview_button);
		introducao.prepend(botoes);
		introducao.prepend(title);
		set_editor();
	}

	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}
getData()

function set_preview(){
	const editor = document.getElementById('editor');
	const preview = document.getElementById('preview');
	preview.classList.remove('escondido');
	editor.classList.add('escondido');
}

function set_editor(){
	const editor = document.getElementById('editor');
	const preview = document.getElementById('preview');
	editor.classList.remove('escondido');
	preview.classList.add('escondido');
}

window.addEventListener('vimReady', () => set_code());
let code;
function set_code(){
	code = document.getElementById("vim_code");
	if(!code) return;
	code.addEventListener('keyup', ()=>{preview(code.value)});
	preview(code.value);
}

function preview(texto){
	const introducao = document.getElementById("preview");
	introducao.replaceChildren();
	const descricao = document.createElement('div');
	descricao.classList.add('descricao');
	descricao.innerHTML = marked.parse(texto);
	introducao.appendChild(descricao);
}

