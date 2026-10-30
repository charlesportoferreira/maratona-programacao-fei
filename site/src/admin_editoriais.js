let todos_problemas = [];
let problema = undefined;

async function cadastrar_editorial(event){
	const res = document.getElementById('editorial_response');
	const descricao = code.value;
	if(problema == undefined){
		res.innerText = "Selecione um Problema";
		return;
	}
	const { data:topico, error } = await db.from('editorial')
		.insert({
			pid: problema.id,
			descricao: descricao,
		});
	if (error) {
		res.innerText = error.message;
		return;
	} 
	res.innerText = "Editorial Adicionado com Sucesso";
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

function remover_problema(){
	problema = undefined;
	update_problema_selected();
}

function adicionar_problema(id, nome){
	problema = {id:id,nome:nome}
	update_problema_selected();
}

function update_problema_selected(){
	const selecionado = document.getElementById('problema_selecionado');
	selecionado.replaceChildren();

	if( !problema ){
		const layoutReadyEvent = new CustomEvent('layoutReady');
		window.dispatchEvent(layoutReadyEvent);
		return;
	}
	const item = document.createElement('div');
	item.classList.add('tag');
	item.classList.add('linha');
	item.classList.add('clickable');
	item.setAttribute('onclick',`remover_problema()`);
	const label = document.createElement('label');
	label.innerText = problema.nome;
	const x = document.createElement('div');
	x.innerText = 'x';
	item.appendChild(label);
	item.appendChild(x); selecionado.appendChild(item);
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

function update_problemas(){
	const problemas = document.getElementById('problemas');
	const filter = document.getElementById('problema_search').value;
	problemas.replaceChildren();
	for(let p of todos_problemas){
		if( filtro(p.nome,filter) ) continue;
		const option = document.createElement('div');
		const check = document.createElement("input");
		const label = document.createElement('label');
		option.classList.add('linha2');
		option.classList.add('clickable');
		option.setAttribute('for',`check_problema_${p.id}`);

		check.type = 'checkbox';
		check.value = p.id;
		check.id = `check_problema_${p.id}`;
		check.classList.add('clickable');
		check.classList.add('check');
		check.setAttribute('onclick',`adicionar_problema(${p.id},'${p.nome}')`);

		label.innerText = p.nome;
		label.classList.add('clickable');
		label.setAttribute('for',`check_problema_${p.id}`);
		option.appendChild(check);
		option.appendChild(label);
		problemas.appendChild(option);
	}
	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

document.getElementById('problema_search').addEventListener('input',update_problemas);

async function getData() {
	{
		// const { data:{user}, err } = await db.auth.getUser();
		// if( user == undefined || user == null
		//  || user.user_metadata.super_admin == null
		//  || user.user_metadata.super_admin == undefined)
		// 	window.location.href = `${PATH}/index.html`;
	}
	{
		let query = db.from('problemas')
			.select('*')
			.order('nome')
		const {data, error} = await query;
		if( error) {
			console.error('Error fetching data from Supabase:', error);
			return;
		}
		todos_problemas = data;
		update_problemas();
	}

	{
		const title = document.createElement("span");
		title.innerText = "Descricao:";
		title.classList.add('left');
		const editorial = document.getElementById("editorial");
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
		editorial.prepend(botoes);
		editorial.prepend(title);
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
	const editorial = document.getElementById("preview");
	editorial.replaceChildren();
	const descricao = document.createElement('div');
	descricao.classList.add('descricao');
	descricao.innerHTML = marked.parse(texto);
	editorial.appendChild(descricao);
}

