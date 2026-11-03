function editor_preview(){
	const container = document.getElementById('container');

	const editorial = document.createElement('div');
	const editor = document.createElement('div');
	const prev = document.createElement('div');
	const botoes = document.createElement("div");
	const edit_button = document.createElement("button");
	const preview_button = document.createElement("button");
	editorial.id = 'blog_container';
	editorial.classList.add('editor_preview');
	editor.id = 'editor';
	prev.id = 'preview';

	botoes.classList.add('editor_preview_buttons');
	edit_button.innerText = "edit";
	preview_button.innerText = "preview";

	edit_button.type = "button";
	preview_button.type = "button";

	edit_button.setAttribute('onclick','set_editor()');
	preview_button.setAttribute('onclick','set_preview()');

	edit_button.setAttribute('formnovalidate','');
	preview_button.setAttribute('formnovalidate','');

	const botao_cadastrar = document.createElement('button');
	botao_cadastrar.classList.add('botao');
	botao_cadastrar.setAttribute('onclick','postar()');
	botao_cadastrar.innerText = 'Postar';

	botoes.appendChild(edit_button);
	botoes.appendChild(preview_button);
	editorial.appendChild(editor);
	editorial.appendChild(prev);
	editorial.prepend(botoes);
	container.appendChild(editorial);
	container.appendChild(botao_cadastrar);
	set_editor();
}

function set_preview(){
	const editor = document.getElementById('editor');
	const preview = document.getElementById('preview');
	preview.classList.remove('escondido');
	editor.classList.add('escondido');
}

function set_editor(){
	const editor = document.getElementById('editor');
	const prev = document.getElementById('preview');
	editor.classList.remove('escondido');
	prev.classList.add('escondido');
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
	const prev = document.getElementById("preview");
	prev.replaceChildren();
	const descricao = document.createElement('div');
	descricao.classList.add('descricao');
	descricao.innerHTML = marked.parse(texto);
	prev.appendChild(descricao);
}

async function postar(){
	const descricao = document.getElementById('vim_code').value;
	const { data, error } = await db.from('blog')
		.insert({
			descricao: descricao,
		});
	if( error ){
		console.log(error.message);
		return;
	}

	const container = document.getElementById('container');
	{
		const post = document.createElement('div');
		const desc = document.createElement('div');
		post.classList.add('post');
		desc.classList.add('descricao');
		desc.innerHTML = marked.parse(descricao);
		post.appendChild(desc);
		container.appendChild(post);
	}
}

async function getData(){
	{
		const { data:{user}, err } = await db.auth.getUser();

		if(user != null
			&& user != undefined
			&& user.user_metadata.super_admin )
				editor_preview();
	}

	{
		const { data:blog, error } = await db.from('blog')
			.select('*')
			.order('data');

		const container = document.getElementById('container');
		for(let b of blog){
			const post = document.createElement('div');
			const descricao = document.createElement('div');
			post.classList.add('post');
			descricao.classList.add('descricao');
			descricao.innerHTML = marked.parse(b.descricao);
			post.appendChild(descricao);
			container.appendChild(post);
		}
	}

	const layoutReadyEvent = new CustomEvent('layoutReady');
	window.dispatchEvent(layoutReadyEvent);
}

getData()
