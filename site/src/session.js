const supabaseUrl = 'https://ujlqugijvevfpfvnxcph.supabase.co';
const supabaseKey = 'sb_publishable_My14EUbQM59mJJVr9X6NDg_-MJ-s-mt';

const { createClient } = supabase;
const db = createClient(supabaseUrl, supabaseKey);

db.auth.onAuthStateChange((event, session) => {
	if (session) {
		console.log("logado");
	} else {
		console.log("nao logado");
	}
});
