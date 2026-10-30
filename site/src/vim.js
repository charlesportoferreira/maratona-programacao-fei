class Vim{
	constructor(){
		this.mode = "general";
		this.cmd = "";

		const container = document.getElementById("editor");
		const borda = document.createElement("div");
		const wrap_barra = document.createElement("div");
		this.barra = document.createElement("div");
		const wrap_highlight = document.createElement("div");
		this.highlight = document.createElement("div");
		this.editor = document.createElement("textarea");
		const status_bar = document.createElement("div");
		const state = document.createElement("div");
		const command = document.createElement("span");

		borda.classList.add("borda");
		wrap_barra.id = "vim_wrap_barra";
		this.barra.id = "vim_barra";
		wrap_highlight.id = "vim_wrap_highlight";
		this.highlight.id = "vim_highlight";
		this.editor.id = "vim_code";
		status_bar.classList.add("vim_status_bar");
		state.id = "vim_status";
		command.id = "vim_cmd";
		this.editor.spellcheck = false;

		container.appendChild(borda);
		borda.appendChild(wrap_barra);
		borda.appendChild(status_bar);
		wrap_barra.appendChild(this.barra);
		wrap_barra.appendChild(wrap_highlight);
		wrap_highlight.appendChild(this.highlight);
		wrap_highlight.appendChild(this.editor)
		status_bar.appendChild(state);
		status_bar.appendChild(command);

		this.editor.value = "";
		this.visual_anchor = 0;
		this.visual_anchor2 = 0;
		this.visual_cursor = 0;
		this.yank = "";

		this.antes = [];
		this.agora = this.editor.value;
		this.depois = [];
		window.dispatchEvent(new CustomEvent('vimReady'));
	}

	undo(){
		this.cmd = "";
		if(this.antes.length == 0) return;
		this.depois.push(this.pos());
		this.depois.push(this.agora);
		this.agora = this.antes.pop();
		this.editor.value = this.agora;
		this.set_pos(this.antes.pop());
	}

	redo(){
		this.cmd = "";
		if(this.depois.length == 0) return;
		this.antes.push(this.pos());
		this.antes.push(this.agora);
		this.agora = this.depois.pop();
		this.editor.value = this.agora;
		this.set_pos(this.depois.pop());

	}

	pos(){
		return this.editor.selectionStart;
	}

	set_pos(p){
		this.cmd = "";
		this.editor.focus();
		this.editor.setSelectionRange(p,p);
	}

	set_sel(l,r){
		this.cmd = "";
		this.editor.focus();
		this.editor.setSelectionRange(l,r);
	}

	get_all(p){
		const text = this.editor.value;
		const linhas = text.split('\n');
		let prefColumnChars = 0;
		let curColumn = 0;
		let curLine = 0;
		let totalChars = text.length;
		for(let i = 0; i < linhas.length; i++){
			if(prefColumnChars + linhas[i].length >= p){
				curLine = i;
				curColumn = p - prefColumnChars;
				break;
			}
			prefColumnChars += linhas[i].length + 1;;
		}
		return {prefColumnChars, curLine, curColumn,totalChars};
	}

	chmod(m){
		this.cmd = "";
		this.mode = m;
		const linhas = this.editor.value.split('\n');
		const {prefColumnChars, curLine, curColumn,totalChars} = this.get_all(this.pos());
		if(this.mode == "visual"){
			this.visual_anchor = this.pos();
			this.visual_cursor = this.pos();
		}
		if(this.mode == "visual-linha"){
			this.visual_anchor = prefColumnChars;
			this.visual_anchor2 = prefColumnChars + linhas[curLine].length;
			this.visual_cursor = this.pos();
			this.set_sel(this.visual_anchor,this.visual_anchor2);
		}
		if(this.mode == "general"){
			if(this.agora != this.editor.value){
				this.antes.push(this.pos());
				this.antes.push(this.agora);
				this.depois = []
			}
			this.agora = this.editor.value;
			this.set_pos(this.pos());
		}
		console.log(this.mode);
	}
}

// Modes

function chpos_horizontal(p){
	vim.cmd = "";
	const text = vim.editor.value;
	if(vim.mode == "general"){
		vim.set_pos(Math.max(0, Math.min(text.length, vim.pos() + p)));
	} else if(vim.mode == "visual"){
		const left = vim.editor.selectionStart;
		const right = vim.editor.selectionEnd;

		let newCursor = vim.visual_cursor + p;
		if(newCursor < 0) newCursor = 0;
		if(newCursor > text.length) newCursor = text.length;

		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	}
}

function chpos_vertical(p){
	vim.cmd = "";
	const linhas = vim.editor.value.split('\n');
	if(vim.mode == "general"){
		const {curLine,curColumn,totalChars} = vim.get_all(vim.pos());
		const targetLine = curLine + p;
		if(targetLine < 0) return vim.set_pos(0);
		if(targetLine >= linhas.length) return vim.set_pos(totalChars);

		let newPos = 0;

		for(let i = 0; i < targetLine; i++)
			newPos += linhas[i].length + 1;
		newPos += Math.min(curColumn, Math.max(0,linhas[targetLine].length));
		vim.set_pos(newPos);
	} else if(vim.mode == "visual"){
		const cursor_all = vim.get_all(vim.visual_cursor);
		const targetLine = cursor_all.curLine + p;
		let newCursor = 0;

		for(let i = 0; i < targetLine; i++)
			newCursor += linhas[i].length + 1;
		newCursor += Math.min(cursor_all.curColumn, linhas[targetLine].length);

		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	} else if(vim.mode == "visual-linha"){
		const cursor_all = vim.get_all(vim.visual_cursor);
		const targetLine = Math.max(0,Math.min(cursor_all.curLine + p,vim.editor.value.length));
		let leftNewCursor = 0;
		let rightNewCursor = 0;

		for(let i = 0; i < targetLine; i++){
			leftNewCursor += linhas[i].length + 1;
			rightNewCursor += linhas[i].length + 1;
		}
		rightNewCursor += linhas[targetLine].length + 1;

		vim.visual_cursor = leftNewCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,leftNewCursor),
			Math.max(vim.visual_anchor2,rightNewCursor)
		);
	}
}

function prox_fim(){
	vim.cmd = "";
	const text = vim.editor.value;
	if(vim.mode == "general"){
		let newCursor = vim.pos();
		for(let i = vim.pos(); i < text.length; i++)
			if((text[i+1] == ' '
				|| text[i+1] == '\n')
				&& text[i] != ' '
				|| i+1 == text.length
			){
				newCursor = i+1;
				break;
			}
		
		vim.set_pos(Math.max(0, Math.min(text.length, newCursor)));
	} else if(vim.mode == "visual"){
		let newCursor = vim.visual_cursor;
		for(let i = vim.visual_cursor; i < text.length; i++)
			if((text[i+1] == ' '
				|| text[i+1] == '\n')
				&& text[i] != ' '
				|| i+1 == text.length
			){
				newCursor = i+1;
				break;
			}
		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	}
}

function prev_cmc(){
	vim.cmd = "";
	const text = vim.editor.value;
	if(vim.mode == "general"){
		let newCursor = vim.pos();
		for(let i = vim.pos()-1; i >= 0; i--)
			if((text[i-1] == ' '
				|| text[i-1] == '\n')
				&& text[i] != ' '
				&& text[i] != '\n'
				|| i == 0
			){
				newCursor = i;
				break;
			}
		
		vim.set_pos(Math.max(0, Math.min(text.length, newCursor)));
	} else if(vim.mode == "visual"){
		let newCursor = vim.visual_cursor;
		for(let i = vim.visual_cursor-1; i >= 0; i--)
			if((text[i-1] == ' '
				|| text[i-1] == '\n')
				&& text[i] != ' '
				&& text[i] != '\n'
				|| i == 0
			){
				newCursor = i;
				break;
			}
		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	}
}

function cmc_linha(){
	vim.cmd = "";
	if(vim.mode == "general"){
		const {prefColumnChars} = vim.get_all(vim.pos());
		vim.set_pos(prefColumnChars);
	} else{
		const linhas = vim.editor.value.split('\n');
		const cursor_all = vim.get_all(vim.visual_cursor);
		const newCursor = cursor_all.prefColumnChars;

		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	}
}

function fim_linha(){
	vim.cmd = "";
	if(vim.mode == "general"){
		const text = vim.editor.value;
		const linhas = text.split('\n');
		const {prefColumnChars,curLine} = vim.get_all(vim.pos());

		vim.set_pos(prefColumnChars + linhas[curLine].length);
		vim.chmod("insert");
	} else{
		const linhas = vim.editor.value.split('\n');
		const cursor_all = vim.get_all(vim.visual_cursor);
		const newCursor = cursor_all.prefColumnChars + linhas[cursor_all.curLine].length;

		vim.visual_cursor = newCursor;
		vim.set_sel(
			Math.min(vim.visual_anchor,newCursor),
			Math.max(vim.visual_anchor,newCursor)
		);
	}
}

function nova_linha(p){
	vim.cmd = "";
	const text = vim.editor.value;
	const linhas = text.split('\n');
	const {prefColumnChars,curLine,curColumn,totalChars} = vim.get_all(vim.pos());
	const newLine = curLine + p;

	let newPos = 0;
	if(newLine > curLine)
		newPos = prefColumnChars + linhas[curLine].length + 1;
	else
		newPos = prefColumnChars;

	const newText = text.substring(0,newPos) + "\n" + text.substring(newPos,totalChars);
	vim.editor.value = newText;
	vim.set_pos(newPos);
	vim.chmod("insert");
}

function del_linha(){
	vim.cmd = "";
	const text = vim.editor.value;
	const linhas = text.split('\n');
	const {prefColumnChars,curLine,curColumn,totalChars} = vim.get_all(vim.pos());
	const targetLine = curLine;
	const left = prefColumnChars;
	const right = left + linhas[curLine].length + 1;
	const newText = text.substring(0,left) + text.substring(right,totalChars);
	const middleText = text.substring(left,right);

	vim.yank = middleText;
	vim.editor.value = newText;
	vim.set_pos(left);
	vim.chmod("general");
}

function del_fim_linha(){
	vim.cmd = "";
	const text = vim.editor.value;
	const linhas = text.split('\n');
	const {prefColumnChars,curLine,curColumn,totalChars} = vim.get_all(vim.pos());
	const left = prefColumnChars + curColumn;
	const right = prefColumnChars + linhas[curLine].length;
	const newText = text.substring(0,left) + text.substring(right,totalChars);
	const middleText = text.substring(left,right);

	vim.yank = middleText;
	vim.editor.value = newText;
	vim.set_pos(left);
	vim.chmod("general");
}

function substituir(){
	vim.cmd = "";
	excluir();
	vim.chmod("insert");
}

function excluir(){
	const text = vim.editor.value;
	if(vim.editor.selectionStart == vim.editor.selectionEnd) 
		vim.set_sel(vim.pos(), Math.min(vim.pos() + 1, Math.max(0,text.length-1)));
	const left = vim.editor.selectionStart;
	const right = vim.editor.selectionEnd;
	const newText = text.substring(0,left) + text.substring(right,text.length);
	const middleText = text.substring(left,right);

	vim.yank = middleText;
	vim.editor.value = newText;
	vim.set_pos(left);
	vim.chmod("general");
}

function paste(p){
	const text = vim.editor.value;
	const linhas = text.split('\n');
	const {prefColumnChars,curLine,curColumn,totalChars} = vim.get_all(vim.pos());
	const targetLine = curLine + p;
	let left = 0;

	if(targetLine > curLine)
		left = prefColumnChars + linhas[curLine].length + 1;
	else
		left = prefColumnChars;

	const newText = text.substring(0,left) + vim.yank + text.substring(left,totalChars);
	vim.editor.value = newText;
	vim.set_pos(left);
	vim.chmod("general");
}

function yank(){
	const text = vim.editor.value;
	const left = vim.editor.selectionStart;
	const right = vim.editor.selectionEnd;
	const middleText = text.substring(left,right);

	vim.yank = middleText;
	vim.chmod("general");
}

function general(tecla){
	if(vim.cmd == 'i') vim.chmod("insert");
	else if(vim.cmd == 'v') vim.chmod("visual");
	else if(vim.cmd == 'V') vim.chmod("visual-linha");
	else if(vim.cmd == 'h') chpos_horizontal(-1);
	else if(vim.cmd == 'j') chpos_vertical(1);
	else if(vim.cmd == 'k') chpos_vertical(-1);
	else if(vim.cmd == 'l') chpos_horizontal(1);
	else if(vim.cmd == 'e') prox_fim();
	else if(vim.cmd == 'b') prev_cmc();
	else if(vim.cmd == 'A') fim_linha();
	else if(vim.cmd == 'o') nova_linha(1);
	else if(vim.cmd == 'O') nova_linha(-1);
	else if(vim.cmd == 'G') vim.set_pos(vim.editor.value.length);
	else if(vim.cmd == 'gg') vim.set_pos(0);
	else if(vim.cmd == 'D') del_fim_linha();
	else if(vim.cmd == 'dd') del_linha();
	else if(vim.cmd == '0') cmc_linha();
	else if(vim.cmd == 's') substituir();
	else if(vim.cmd == 'x') excluir();
	else if(vim.cmd == 'r') vim.redo();
	else if(vim.cmd == 'u') vim.undo();
	else if(vim.cmd == 'p') paste(1);
	else if(vim.cmd == 'P') paste(-1);
}

function visual(tecla){
	if(vim.cmd == 'V') vim.chmod("visual-linha");
	else if(vim.cmd == 'h') chpos_horizontal(-1);
	else if(vim.cmd == 'j') chpos_vertical(1);
	else if(vim.cmd == 'k') chpos_vertical(-1);
	else if(vim.cmd == 'l') chpos_horizontal(1);
	else if(vim.cmd == 'G') vim.set_sel(vim.visual_anchor,vim.editor.value.length);
	else if(vim.cmd == 'gg') vim.set_sel(0,vim.visual_anchor);
	else if(vim.cmd == 's') substituir();
	else if(vim.cmd == 'x') excluir();
	else if(vim.cmd == 'e') prox_fim();
	else if(vim.cmd == 'b') prev_cmc();
	else if(vim.cmd == 'A') fim_linha();
	else if(vim.cmd == 'D') excluir();
	else if(vim.cmd == 'd') excluir();
	else if(vim.cmd == '0') cmc_linha();
	else if(vim.cmd == 'y') yank();
}

function visual_linha(tecla){
	if(vim.cmd == 'v') vim.chmod("visual");
	else if(vim.cmd == 'j') chpos_vertical(1);
	else if(vim.cmd == 'k') chpos_vertical(-1);
	else if(vim.cmd == 'G') vim.set_sel(vim.visual_anchor,vim.editor.value.length);
	else if(vim.cmd == 'gg') vim.set_sel(0,vim.visual_anchor2);
	else if(vim.cmd == 's') substituir();
	else if(vim.cmd == 'x') excluir();
	else if(vim.cmd == 'D') excluir();
	else if(vim.cmd == 'd') excluir();
	else if(vim.cmd == 'y') yank();
}

// Barra

function carregarBarra(){
	const linhas = vim.editor.value.split('\n');
	const {prefColumnChars,curLine,curColumn,totalChars} = vim.get_all(vim.pos());
	let nums = "";

	for(let i = 0; i < curLine; i++){
		nums += (curLine - i) + '\n';
		for(let j = 1; j < linhas[i].length / 75; j++) nums += '\n';
	}
	nums += (curLine+1) + '\n'
	for(let j = 1; j < linhas[curLine].length / 75; j++) nums += '\n';
	for(let i = curLine+1; i < linhas.length; i++){
		nums += (i - curLine) + '\n';
		for(let j = 1; j < linhas[i].length / 75; j++) nums += '\n';
	}

	vim.barra.innerText = nums;
}

// Highlight

function carregarHighlight(on){
	const text = vim.editor.value;
	vim.highlight.replaceChildren();

	const idChars = '[ !@#$%&*()\\-+/?:;.,<>|{}\\[\\]^~\'\"=_\\\\]';

	const rules = {
		vazio: /0+/,
        comentario: /25[\s\S]*?26/,
        palavra: /16[\s\S]*?16/,
        caracter: /17[\s\S]*?17/,
        reservado: new RegExp(`(?<!${idChars})(:\\)|<=|\\[\\]|#|@|\\$|\\?|\\? |\\.\\.\\.|:\\()(?!${idChars})`),
        tipo: new RegExp(`(?<!${idChars})(:\\-:|;\\-;|\\(\\/'\\-'\\)\\/|{\\/"}\\/|\\^\\-\\^|'\\-'|\\-_\\-|\\*_\\*)(?!${idChars})`),
        operador: /[1-9]|1[1-5]|18|19|28|23|24/,
        numero: /[a-z]+[A-Z]*/,
        id: /[!@#$%&\*\(\)\-\+/\?:;\.,><|\{\}\[\]\^~'"=_\\]+/
    };

	const regex = new RegExp(
		Object.entries(rules)
			.map(([name,regex]) => `(?<${name}>${regex.source})`)
			.join('|'),
		'g'
	);

	let lastIndex = 0;
	let match;

	while((match = regex.exec(text)) !== null){
		if(match.index > lastIndex){
			const plain = document.createTextNode(text.substring(lastIndex,match.index));
			vim.highlight.appendChild(plain);
		}

        const groupName = Object.keys(match.groups).find(key => match.groups[key] !== undefined);
        const span = document.createElement("span");

		if(on) span.classList.add(`${groupName}`);
        span.textContent = match[0];

        vim.highlight.appendChild(span);
        lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
        vim.highlight.appendChild(document.createTextNode(text.substring(lastIndex)));
    }
}

// Main

const vim = new Vim();
document.getElementById("vim_status").innerText = vim.mode;
document.getElementById("vim_cmd").innerText = vim.cmd;

let highlight_toggle = true;

vim.editor.addEventListener("keydown",function(event){
	const tecla = event.key;
	if(vim.mode != "insert"
	&& tecla != 'Shift'
	&& tecla != 'Meta'
	&& tecla != 'Enter') vim.cmd += tecla;
	if(tecla == 'Escape') vim.chmod("general");
	if(vim.cmd.length > 2) vim.cmd = "";
	if(vim.mode != "insert") event.preventDefault();

	if(vim.mode == "general") general(tecla);
	else if(vim.mode == "visual") visual(tecla);
	else if(vim.mode == "visual-linha") visual_linha(tecla);

	document.getElementById("vim_status").innerText = vim.mode;
	document.getElementById("vim_cmd").innerText = vim.cmd;
	carregarBarra();
});

vim.editor.addEventListener("input",function(){
	carregarHighlight(highlight_toggle);
});

vim.editor.addEventListener("keyup",function(){
	carregarHighlight(highlight_toggle);
});

vim.editor.addEventListener("scroll",function(){
	vim.barra.scrollTop = vim.editor.scrollTop;
	vim.highlight.scrollTop = vim.editor.scrollTop;
});

function highlight(){
	highlight_toggle = !highlight_toggle;
	carregarHighlight(highlight_toggle);
}


carregarBarra();
carregarHighlight(highlight_toggle);

