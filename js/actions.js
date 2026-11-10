/* =====================================================================
   actions.js — AÇÕES (o que acontece ao clicar / enviar formulários)
   ---------------------------------------------------------------------
   Cada função é chamada por um formulário ou botão em pages.js.
   Padrão usado:  validar -> mostrar erro em #err e parar (return)  OU  salvar e seguir.
   Atenção: tudo é simulação no navegador (localStorage), não há servidor.
   ===================================================================== */

/* --- LOGIN (form de pages.js > login) -------------------------------- */
/* Aceita e-mail OU CNPJ (só os números são comparados) + senha. */
function doLogin(){
  const e = $("#e").value.trim().toLowerCase(),
        digits = e.replace(/\D/g, ""),          // tira tudo que não é número (para o CNPJ)
        s = $("#s").value;
  const u = S.users.find(x => (x.email === e || (x.cnpj && x.cnpj === digits)) && x.pass === s);
  if(!u){ $("#err").textContent = "E-mail/CNPJ ou senha inválidos."; return }
  S.me = u.email; save(); go("home"); render()
}

/* Login com Google: é só uma DEMONSTRAÇÃO (cria um usuário fictício). */
function gLogin(){
  const e = "google.user@gmail.com";
  if(!S.users.find(u => u.email === e)) S.users.push({name:"Usuário Google", email:e, pass:"", type:"user"});
  S.me = e; save(); go("home"); render()
}

/* --- CADASTRO DE CONTA ----------------------------------------------- */
/* Para mudar as regras (ex.: senha mínima de 8), altere os números/mensagens abaixo. */
function doReg(){
  const n  = $("#n").value.trim(),
        e  = $("#e").value.trim().toLowerCase(),
        s  = $("#s").value,
        s2 = $("#s2").value,
        er = $("#err");
  if(!n || !e || !s)               return er.textContent = "Preencha todos os campos.";
  if(S.reg === "empresa" && !/^\d{14}$/.test(( $("#cn").value || "").replace(/\D/g,""))) return er.textContent = "Informe um CNPJ válido com 14 números.";
  if(!/^\S+@\S+\.\S+$/.test(e))    return er.textContent = "E-mail inválido.";
  if(s.length < 6)                 return er.textContent = "A senha precisa ter 6+ caracteres.";   // <- tamanho mínimo da senha
  if(s !== s2)                     return er.textContent = "As senhas não conferem.";
  if(S.users.find(u => u.email === e)) return er.textContent = "E-mail já cadastrado.";
  S.users.push({name:n, email:e, pass:s, type:S.reg, cnpj: S.reg === "empresa" ? ($("#cn").value.replace(/\D/g, "")) : ""});
  S.me = e; save(); go("home"); render(); toast("Conta criada!")
}

/* --- CADASTRAR MATERIAL ---------------------------------------------- */
/* Se S.doar for true (aba "Doar") o preço é 0. O material vai para S.own e aparece na home/busca/perfil. */
function addMat(){
  if(user()?.type !== "empresa"){ toast("Apenas empresas podem cadastrar materiais."); go("home"); return }
  const t = $("#mt").value, q = +$("#mq").value, er = $("#err");
  if(!t || !q){ er.textContent = "Informe o tipo e a quantidade."; return }
  const p = S.doar ? 0 : Number($("#mp").value || 0),
        desc = $("#md").value.trim(),
        location = $("#ml").value.trim();
  if(!S.doar && (!Number.isFinite(p) || p < 0)){ er.textContent = "Informe um preço válido."; return }
  S.own.push({id: 1000 + Date.now() % 1e6, n: t + (S.doar ? " (doação)" : ""), t, p, min:q, co:0, owner:S.me, desc, location});
  save(); toast("Material cadastrado!"); go("perfil"); render()
}

/* --- PERFIL ----------------------------------------------------------- */
function saveProf(){
  const u = user(), name = $("#pn").value.trim(), pass = $("#ps").value, confirm = $("#ps2").value, er = $("#err");
  if(!name){ er.textContent = "O nome não pode ficar vazio."; return }
  if(pass || confirm){                      // só valida a senha se o usuário digitou algo
    if(pass.length < 6){ er.textContent = "A nova senha precisa ter pelo menos 6 caracteres."; return }
    if(pass !== confirm){ er.textContent = "As senhas não conferem."; return }
    u.pass = pass;
  }
  u.name = name; u.tel = $("#pt").value.trim(); u.city = $("#pc").value.trim(); u.bio = $("#pb").value.trim();
  save(); toast("Perfil atualizado com sucesso!"); render()
}

/* --- CHAT -------------------------------------------------------------- */
/* openChat(id): abre (ou cria) a conversa com a empresa de id informado */
function openChat(id){ S.chat = id; if(!S.chats[id]){ S.chats[id] = []; save() } go("chat"); render() }

/* Respostas automáticas (simulação). Para mudar/adicionar respostas, edite esta lista. */
const REPL = [
  "Olá! Atendemos sim, pode passar no ponto de coleta.",
  "Claro! Qual a quantidade que você tem?",
  "Podemos combinar o pagamento por Pix.",
  "Obrigado pelo contato! Retornamos em breve."
];
/* sendMsg(input): grava sua mensagem e, 1,2 s depois (1200 ms), a empresa "responde" */
function sendMsg(inp){
  const t = inp.value.trim(); if(!t) return;
  const id = S.chat;
  S.chats[id].push({me:1, t}); save(); render();
  setTimeout(() => {
    S.chats[id].push({t: REPL[Math.floor(Math.random() * REPL.length)]});
    save();
    if(document.body.dataset.page === "chat") render()
  }, 1200)
}
