/* =====================================================================
   core.js — FUNÇÕES GERAIS E PEÇAS COMPARTILHADAS
   ---------------------------------------------------------------------
   Tema, salvar dados, navegação entre páginas, avisos (toast),
   estrutura comum (menu + cabeçalho) e cards de empresa/material.
   ===================================================================== */

/* --- TEMA CLARO/ESCURO ---------------------------------------------- */
/* paint(): aplica o tema na página.
   - data-theme  -> usado pelo NOSSO css (style.css)
   - data-bs-theme -> usado pelo BOOTSTRAP (para os componentes dele também escurecerem) */
function paint(){
  document.documentElement.dataset.theme = TH;
  document.documentElement.setAttribute("data-bs-theme", TH);
  const themeButton = $("#tg");
  if(themeButton){ themeButton.textContent = TH === "dark" ? "☀" : "☾"; themeButton.setAttribute("aria-label", TH === "dark" ? "Ativar tema claro" : "Ativar tema escuro"); themeButton.title = themeButton.getAttribute("aria-label"); }
}
function setTheme(t){ TH = t; ls.set("ml_theme", t); paint(); render() }

/* --- SALVAR / USUÁRIO / NAVEGAR ------------------------------------- */
/* save(): grava tudo no localStorage. Chame depois de mudar S.users, S.fav, S.chats, S.own ou S.me */
const save = () => {
  ls.set("ml_users", S.users); ls.set("ml_me", S.me); ls.set("ml_fav", S.fav);
  ls.set("ml_chats", S.chats); ls.set("ml_own", S.own);
};

/* user(): devolve o usuário logado (ou undefined) */
const user = () => S.users.find(u => u.email === S.me);

/* go("nome"): vai para outra página. Ex.: go("home") abre home.html.
   Antes de sair, guarda o estado de navegação para a próxima página ler. */
const go = r => {
  ls.set("ml_navigation_state", {
    q:S.q, mat:S.mat, sel:S.sel, chat:S.chat,
    ftab:S.ftab, fil:S.fil, reg:S.reg, doar:S.doar
  });
  /* Exceções de nome: login -> index.html. As demais seguem "nome.html".
     >>> Para criar uma página nova, basta ter o arquivo nome.html (copie um existente). */
  const pages = {login:"index.html", cadastro:"cadastro.html"};
  location.href = pages[r] || (r + ".html");
};

/* --- AVISOS (TOAST DO BOOTSTRAP) ------------------------------------ */
/* toast("mensagem"): mostra um aviso temporário embaixo da tela.
   O formato/cores ficam no style.css (seção 10). Duração: delay (em milissegundos). */
const toast = t => {
  /* Plano B se o Bootstrap não carregou (sem internet) */
  if(!window.bootstrap){
    const d = document.createElement("div");
    d.className = "toast-fallback"; d.textContent = t;
    document.body.appendChild(d); setTimeout(() => d.remove(), 2200);
    return;
  }
  /* Caixa que posiciona os avisos (classes utilitárias do Bootstrap):
     position-fixed + bottom-0 = colada embaixo | start-50 + translate-middle-x = centralizada */
  let box = document.getElementById("toasts");
  if(!box){
    box = document.createElement("div");
    box.id = "toasts";
    box.className = "toast-container position-fixed bottom-0 start-50 translate-middle-x p-3";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");          // leitores de tela anunciam o aviso
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-atomic", "true");
  el.innerHTML = '<div class="toast-body text-center fw-semibold"></div>';
  el.firstChild.textContent = t;              // textContent = seguro contra HTML
  box.appendChild(el);
  el.addEventListener("hidden.bs.toast", () => el.remove());   // limpa depois de sumir
  new bootstrap.Toast(el, {delay:2200}).show();                // 2200 = 2,2 segundos
};

/* brl(1.5) -> "R$ 1,50"  (formata dinheiro) */
const brl = v => "R$ " + v.toFixed(2).replace(".", ",");

/* --- ESTRUTURA COMUM (MENU + CABEÇALHO + <main>) --------------------- */
/* shell(conteudo): envolve o conteúdo de cada página interna.
   >>> Para ADICIONAR um item no menu lateral, copie uma linha <a href="...">...</a> abaixo. */
function shell(inner){
  const navItems = [
    ["home","Página inicial",TH==="dark"?"home-branca.png":"home-verde.png"],
    ["mapa","Mapa",TH==="dark"?"mapa-branco.png":"mapa-verde.png"],
    ["favoritos","Favoritos",TH==="dark"?"estrela-branca.png":"estrela-verde.png"],
    ["chat","Chat",TH==="dark"?"chat-branco.png":"chat-verde.png"],
    ...(user()?.type === "empresa" ? [["cadastrar","Cadastrar material",TH==="dark"?"sacola-branca.png":"sacola-verde.png"]] : []),
    ["perfil","Perfil",TH==="dark"?"user-branco.png":"user-verde.png"]
  ];
  const links = navItems.map(([page,label,icon])=>`<a href="${page}.html" class="${document.body.dataset.page===page?"active":""}" onclick="menu(0)"><img src="img/${icon}" alt="" aria-hidden="true"><span>${label}</span></a>`).join("");
  return `<header><button class="ib menu-toggle" type="button" onclick="menu(1)" aria-label="Abrir menu">☰</button><a href="home.html"><img class="logo" src="${L()}" alt="MatériaLink"></a>
<form class="search" role="search" onsubmit="event.preventDefault();S.q=this.q.value.trim();go('busca')"><img src="img/${TH==="dark"?"buscar-branco.png":"pesquisar-verde.png"}" alt="" aria-hidden="true"><input name="q" aria-label="Buscar" placeholder="Buscar materiais, empresas, cidade..." value="${esc(S.q)}"></form></header>
<nav class="main-nav" aria-label="Navegação principal">${links}<a class="sair" href="#" onclick="logout();return false">Sair</a></nav>
<div class="ov" id="ov" onclick="menu(0)"></div><nav class="side" id="side" aria-label="Menu para celular"><img class="logo" src="${LOGOW}" alt="MatériaLink">${links}<a class="sair" href="#" onclick="logout();return false">Sair</a></nav>
<main class="wrap" id="conteudo"><h1 class="visually-hidden">MatériaLink</h1>${inner}</main>`
}

/* menu(1) abre o menu lateral | menu(0) fecha (liga/desliga a classe .open do CSS) */
function menu(o){
  const side = $("#side"), overlay = $("#ov");
  if(side) side.classList.toggle("open", !!o);
  if(overlay) overlay.classList.toggle("open", !!o);
}
/* Sair: encerra a sessão e leva para a tela de cadastro. (Para voltar ao login, troque "cadastro" por "login".) */
function logout(){ S.me = null; save(); go("cadastro") }

/* --- CARDS ---------------------------------------------------------- */
/* Pequeno helper: faz o card responder também ao teclado (Enter).
   A checagem event.target===this evita disparar quando o Enter é no botão ❤️ de dentro. */
const KEY = "onkeydown=\"if(event.target===this&&event.key==='Enter')this.click()\"";

/* coCard(empresa): card de empresa. Clicar abre o chat com ela; o ❤️ favorita. */
function coCard(c){
  const f = S.fav.c.includes(c.id);
  return `<article class="co" tabindex="0" ${KEY} onclick="openChat(${c.id})"><div class="av">${empresaIconImg(c)}</div><div><b>${esc(c.n)}</b><small>${c.km.toString().replace(".",",")} Km - ${c.city}</small><span class="pr">A partir de ${brl(c.p)}/kg</span></div>
<button class="heart" type="button" title="Favoritar" aria-label="Favoritar empresa" onclick="event.stopPropagation();tog('c',${c.id})">${f?"❤️":"🤍"}</button></article>`
}

/* matCard(material): card de material. Clicar abre a página de detalhes. */
function matCard(m){
  const f = S.fav.m.includes(m.id);
  return `<article class="co" tabindex="0" ${KEY} onclick="S.mat=${m.id};go('material');render()"><div class="av">${iconImg(m.t)}</div><div><b>${esc(m.n)}</b><span class="pr">${brl(m.p)}/kg</span></div>
<button class="heart" type="button" aria-label="Favoritar material" onclick="event.stopPropagation();tog('m',${m.id})">${f?"❤️":"🤍"}</button></article>`
}

/* tog("c" ou "m", id): liga/desliga favorito */
function tog(k, id){ const a = S.fav[k], i = a.indexOf(id); i < 0 ? a.push(id) : a.splice(i, 1); save(); render() }

/* allMats(): materiais de exemplo + os cadastrados pelo usuário */
function allMats(){ return MATS.concat(S.own) }


/* --- RODAPÉ (aparece em todas as páginas) ---------------------------- */
/* >>> Para trocar e-mail, CNPJ, cidade ou links das redes sociais, edite só este bloco.
   Links com "#" mostram o aviso "Em breve" até você colocar o endereço real. */
const CONTATO = {
  email:  "contato@materialink.com.br",   // TROQUE pelo e-mail real do projeto
  cidade: "São Paulo | SP",
  cnpj:   "00.000.000/0001-00",           // TROQUE pelo CNPJ real (ou apague a linha no siteFooter)
  termos: "#", privacidade: "#", cookies: "#",
  redes: [
    {n:"Instagram", u:"#", svg:'<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>'},
    {n:"LinkedIn",  u:"#", svg:'<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>'},
    {n:"Facebook",  u:"#", svg:'<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>'},
    {n:"WhatsApp",  u:"#", svg:'<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'}
  ]
};

/* siteFooter(): devolve o HTML do rodapé. Cores no css/style.css (seção "RODAPÉ").
   Tema claro: fundo verde escuro + logo branca. Tema escuro: tudo invertido (fundo claro + logo escura). */
function siteFooter(){
  const dark = TH === "dark";
  const logo = dark ? LOGO : LOGOW;                       // inverte a logo em relação ao resto do site
  const mailIcon = dark ? "email-verde.png" : "email-branco.png";
  const lk = (u, t) => u === "#" ? `<a href="#" onclick="toast('Em breve');return false">${t}</a>` : `<a href="${u}">${t}</a>`;
  const redes = CONTATO.redes.map(r => `<a class="ft-soc" href="${r.u}" ${r.u==="#"?`onclick="toast('Em breve');return false"`:`target="_blank" rel="noopener"`} aria-label="${r.n}" title="${r.n}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${r.svg}</svg></a>`).join("");
  const cta = user() ? `<a class="ft-cta" href="cadastrar.html">Cadastrar material</a>` : `<a class="ft-cta" href="cadastro.html">Criar minha conta</a>`;
  return `<footer class="site-footer">
<div class="ft-grid">
<section><h2 class="ft-t">Identidade e Apresentação</h2><img class="ft-logo" src="${logo}" alt="MatériaLink"><p>Conectamos pessoas e empresas para vender, doar e encontrar materiais recicláveis, transformando resíduo em oportunidade.</p></section>
<section><h2 class="ft-t">Informações de Contato</h2><p class="ft-line"><img src="img/${mailIcon}" alt="" aria-hidden="true"><a href="mailto:${CONTATO.email}">${CONTATO.email}</a></p><p class="ft-line">${CONTATO.cidade}</p></section>
<section><h2 class="ft-t">Aspectos Legais e Conformidade</h2><ul class="ft-list"><li>${lk(CONTATO.termos,"Termos de Uso")}</li><li>${lk(CONTATO.privacidade,"Política de Privacidade")}</li><li>${lk(CONTATO.cookies,"Política de Cookies")}</li></ul><p class="ft-small">Tratamento de dados conforme a LGPD (Lei nº 13.709/2018).<br>CNPJ ${CONTATO.cnpj}</p></section>
<section><h2 class="ft-t">Redes Sociais e Conversão</h2><div class="ft-socs">${redes}</div><p>Faça parte da rede que dá nova vida aos materiais.</p>${cta}</section>
</div>
<div class="ft-bottom">© ${new Date().getFullYear()} MatériaLink. Todos os direitos reservados.</div>
</footer>`
}
