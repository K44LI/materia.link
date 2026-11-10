/* =====================================================================
   pages/pages.js — O HTML DE CADA PÁGINA
   ---------------------------------------------------------------------
   V é um objeto: cada função (login, home, mapa...) devolve o HTML da tela.
   O arquivo .html tem <body data-page="home"> e o app.js chama V["home"]().

   DICAS PARA ALTERAR:
   - Mudar um texto: procure o texto aqui e edite.
   - Mudar o visual: as classes (ex.: "btn", "co", "panel") estão no css/style.css.
   - ${...} dentro da crase ` ` insere valores do JavaScript no HTML.
   - Classes do Bootstrap usadas aqui: row, col-12, col-md-6, g-3 (grade);
     d-flex, justify-content-between, align-items-center, d-grid, gap-3, mt-3, m-0,
     d-none, d-md-block (utilitários). Lista completa: getbootstrap.com/docs/5.3
   ===================================================================== */
const V = {

/* ---------- LOGIN (index.html) ---------- */
login(){return `<main class="auth" id="conteudo"><h1 class="visually-hidden">Entrar no MatériaLink</h1><img class="logo" src="${L()}" alt="MatériaLink">
<form onsubmit="event.preventDefault();doLogin()" novalidate>
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"email-branco.png":"email-verde.png"}" alt=""><input id="e" name="email" autocomplete="username" aria-label="E-mail ou CNPJ" placeholder="E-mail ou CNPJ"></label>
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"cadeado-branco.png":"cadeado-verde.png"}" alt=""><input id="s" name="senha" type="password" autocomplete="current-password" aria-label="Senha" placeholder="Senha"></label>
<div class="err" id="err" role="alert"></div><button class="btn" type="submit">Entrar →</button>
</form>
<button class="lnk" type="button" onclick="toast('Enviamos um link de recuperação (simulação)')">Esqueceu sua senha?</button>
<div class="sep">ou</div><button class="in justify-content-center" type="button" onclick="gLogin()"><img class="google-icon" src="img/google-icon.png" alt="" aria-hidden="true"> Entre com o Google</button>
<p>Não tem uma conta? <a href="cadastro.html">Cadastre-se</a></p></main>`},

/* ---------- CADASTRO (cadastro.html) ----------
   As abas "Sou usuário / Sou empresa" mudam S.reg; se for empresa, aparece o campo CNPJ. */
cadastro(){const e=S.reg==="empresa";return `<main class="auth" id="conteudo"><h1 class="visually-hidden">Criar conta no MatériaLink</h1><img class="logo" src="${L()}" alt="MatériaLink">
<form onsubmit="event.preventDefault();doReg()" novalidate>
<div class="tabs"><button type="button" class="${e?"":"on"}" onclick="S.reg='user';render()">Sou usuário</button><button type="button" class="${e?"on":""}" onclick="S.reg='empresa';render()">Sou empresa</button></div>
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"email-branco.png":"email-verde.png"}" alt=""><input id="n" name="nome" autocomplete="name" aria-label="${e?"Razão social":"Nome completo"}" placeholder="${e?"Razão social":"Nome completo"}"></label>
${e?`<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"user-branco.png":"user-verde.png"}" alt=""><input id="cn" name="cnpj" inputmode="numeric" aria-label="CNPJ" placeholder="CNPJ"></label>`:""}
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"email-branco.png":"email-verde.png"}" alt=""><input id="e" name="email" type="email" autocomplete="email" aria-label="E-mail" placeholder="E-mail"></label>
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"cadeado-branco.png":"cadeado-verde.png"}" alt=""><input id="s" name="senha" type="password" autocomplete="new-password" aria-label="Senha" placeholder="Senha"></label>
<label class="in"><img class="inline-icon" src="img/${TH==="dark"?"cadeado-branco.png":"cadeado-verde.png"}" alt=""><input id="s2" name="senha2" type="password" autocomplete="new-password" aria-label="Confirmar senha" placeholder="Confirmar senha"></label>
<div class="err" id="err" role="alert"></div><button class="btn" type="submit">Cadastrar →</button>
</form>
<p style="font-size:14px">Ao se cadastrar, você concorda com nossos <a href="#" onclick="return false">Termos de Uso</a> e <a href="#" onclick="return false">Política de Privacidade</a></p>
<p><a href="index.html">Já tenho conta</a></p></main>`},

/* ---------- HOME (home.html) ----------
   Três carrosséis: categorias, empresas próximas e materiais disponíveis. */
home(){const u=user();return shell(`<section class="hero"><div><h2>Olá, ${esc(u.name.split(" ")[0])}!</h2><p>Que bom te ver por aqui!<br>Encontre materiais, conecte empresas e faça a diferença.</p></div><img class="logo d-none d-md-block" src="${L()}" alt=""></section>
<section><h3>Materiais em destaque</h3><div class="carrossel destaques">${Object.keys(ICON).map(k=>`<div class="mat" role="button" tabindex="0" onkeydown="if(event.key==='Enter')this.click()" onclick="S.fil='${k}';go('mapa');render()">${k}<div>${iconImg(k)}</div></div>`).join("")}</div></section>
<section><h3>Empresas próximas</h3><div class="carrossel">${COS.map(coCard).join("")}</div></section>
<section><h3>Materiais disponíveis</h3><div class="carrossel">${allMats().map(matCard).join("")}</div></section>`)},

/* ---------- BUSCA (busca.html) ----------
   Filtra empresas (nome+cidade+material) e materiais (nome+tipo) pelo texto S.q. */
busca(){const q=S.q.toLowerCase(),h=t=>t.toLowerCase().includes(q);
const c=COS.filter(x=>h(x.n+x.city+x.m)),m=allMats().filter(x=>h(x.n+x.t));
return shell(`<h2>Resultados para "${esc(S.q)}"</h2><section><h3>Empresas</h3><div class="carrossel">${c.map(coCard).join("")||'<p class="empty">Nenhuma empresa encontrada.</p>'}</div></section><section><h3>Materiais</h3><div class="carrossel">${m.map(matCard).join("")||'<p class="empty">Nenhum material encontrado.</p>'}</div></section>`)},

/* ---------- DETALHES DO MATERIAL (material.html) ----------
   Grade do Bootstrap: 1 coluna no celular (col-12), 2 colunas no PC (col-md-6). */
material(){const m=allMats().find(x=>x.id===S.mat)||MATS[0],c=COS.find(x=>x.id===m.co);
return shell(`<h3><button class="ib" type="button" aria-label="Voltar" onclick="history.back()">←</button> Detalhes do material</h3><article class="panel"><div class="row g-3"><div class="col-12 col-md-6"><div class="av" style="width:100%;height:220px;border-radius:12px">${iconImg(m.t,"detail-material-icon")}</div></div>
<div class="col-12 col-md-6"><h2 class="m-0">${esc(m.n)}<span class="tag">${m.t}</span></h2><p class="price">${brl(m.p)}/kg</p><p>Quantidade mínima: ${m.min} kg</p>${m.desc?`<p><b>Descrição</b><br>${esc(m.desc)}</p>`:""}
<p><b>Pagamento</b><br>Pix / Dinheiro / Transferência</p><p><b>Localização</b><br>${c?c.city+" - a "+c.km+" km de você":"Localização do anunciante"}</p>
<button class="btn" type="button" onclick="${c?`openChat(${c.id})`:`toast('Contato enviado!')`}">Entrar em contato</button></div></div></article>`)},

/* ---------- MAPA (mapa.html) ----------
   Esquerda: mapa SVG desenhado à mão (pinos usam x,y de COS). Direita: lista de empresas + filtro.
   Para mudar as cores do mapa, edite os valores "stroke" e "fill" do <svg>. */
mapa(){const l=COS.filter(c=>!S.fil||c.m===S.fil).sort((a,b)=>a.km-b.km);
return shell(`<div class="row g-3"><div class="col-12 col-md-6"><button class="btn sm map-location-btn" type="button" onclick="locateOnMap()">Usar minha localização</button><div id="mapa-real" class="map" role="application" aria-label="Mapa interativo das empresas" data-selected="${S.sel||""}"><p class="map-loading">Carregando mapa…</p></div><p id="map-status" class="map-status" role="status" aria-live="polite"></p><p class="map-credit">Mapa © OpenStreetMap · Marcadores de demonstração</p></div>
<section class="col-12 col-md-6"><div class="d-flex justify-content-between align-items-center"><h2 class="m-0" style="color:var(--d)">Empresas próximas</h2>
<select class="btn sm" aria-label="Filtrar por material" style="background:var(--l);color:#111" onchange="S.fil=this.value;render()"><option value="">Filtrar</option>${Object.keys(ICON).map(k=>`<option ${S.fil===k?"selected":""}>${k}</option>`).join("")}</select></div>
${l.map(c=>`<div data-co="${c.id}" style="margin:12px 0" class="${S.sel===c.id?"co on":""}">${coCard(c)}</div>`).join("")||'<p class="empty">Nenhuma empresa.</p>'}</section></div>`)},

/* ---------- FAVORITOS (favoritos.html) ----------
   S.ftab = "c" (empresas) ou "m" (materiais). A lista mostra só os ids marcados em S.fav. */
favoritos(){const t=S.ftab;return shell(`<h2>Meus favoritos</h2><div class="tabs" style="max-width:420px"><button type="button" class="${t==="c"?"on":""}" onclick="S.ftab='c';render()">Empresas</button><button type="button" class="${t==="m"?"on":""}" onclick="S.ftab='m';render()">Materiais</button></div>
<section class="d-grid gap-3 mt-3 lista-limitada">${(t==="c"?COS.filter(c=>S.fav.c.includes(c.id)).map(coCard).join(""):allMats().filter(m=>S.fav.m.includes(m.id)).map(matCard).join(""))||'<p class="empty">Nada favoritado ainda. Toque no ícone de favorito para salvar.</p>'}</section>`)},

/* ---------- CADASTRAR MATERIAL (cadastrar.html) ----------
   Abas Doar/Vender (S.doar). Se for doação, o campo de preço some e o preço fica 0.
   Os ids (mt, mq, mp, md, ml) são lidos em addMat() no actions.js. */
cadastrar(){if(user()?.type!=="empresa") return shell(`<section class="panel access-denied"><h2>Área exclusiva para empresas</h2><p>Somente contas empresariais podem cadastrar materiais no MatériaLink.</p><button class="btn" type="button" onclick="go('perfil')">Voltar ao perfil</button></section>`);return shell(`<form class="form" onsubmit="event.preventDefault();addMat()" novalidate><h3><button class="ib" type="button" aria-label="Voltar" onclick="history.back()">←</button> Cadastrar material</h3>
<div class="tabs"><button type="button" class="${S.doar?"on":""}" onclick="S.doar=true;render()">Doar</button><button type="button" class="${!S.doar?"on":""}" onclick="S.doar=false;render()">Vender</button></div>
<label for="mt">Tipo de material</label><div class="in sq"><select id="mt"><option value="">Selecione o material</option>${Object.keys(ICON).map(k=>`<option>${k}</option>`).join("")}</select></div>
<label for="mq">Quantidade (kg)</label><div class="in sq"><input id="mq" type="number" min="1" placeholder="Ex.: 50"></div>
${S.doar?"":`<label for="mp">Preço por kg (R$)</label><div class="in sq"><input id="mp" type="number" step=".01" min="0" placeholder="Ex.: 1,20"></div>`}
<label for="md">Descrição (opcional)</label><div class="in sq"><input id="md" placeholder="Ex.: Material limpo, separado, sem resíduos."></div>
<label for="ml">Localização</label><div class="in sq"><input id="ml" value="Usar minha localização atual"></div>
<div class="err" id="err" role="alert"></div><button class="btn" type="submit">Cadastrar</button></form>`)},

/* ---------- CHAT (chat.html) ----------
   Esquerda (<aside>): lista de conversas + busca. Direita: mensagens da conversa aberta (S.chat). */
chat(){const ids=Object.keys(S.chats).map(Number);if(S.chat&&!ids.includes(S.chat))ids.push(S.chat);const cur=COS.find(c=>c.id===S.chat),msgs=S.chats[S.chat]||[];
return shell(`<section class="chat"><aside aria-label="Conversas"><b><img class="inline-icon" src="img/${TH==="dark"?"chat-branco.png":"chat-verde.png"}" alt=""> Chat</b><div class="in" style="height:40px;margin:10px 0">🔍<input aria-label="Buscar conversas" placeholder="buscar conversas" oninput="document.querySelectorAll('.conv').forEach(e=>e.style.display=e.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none')"></div>
${ids.map(i=>{const c=COS.find(x=>x.id===i),m=S.chats[i]||[];return `<div class="conv ${i===S.chat?"on":""}" role="button" tabindex="0" onkeydown="if(event.key==='Enter')this.click()" onclick="S.chat=${i};render()"><b style="color:var(--g)">${esc(c.n)}</b><p>${m.length?esc(m[m.length-1].t):"Nova conversa"}</p></div>`}).join("")||'<p class="empty">Nenhuma conversa. Toque em uma empresa para iniciar.</p>'}</aside>
<div class="msgs">${cur?`<div class="top">${esc(cur.n)}<br><small style="color:var(--mut);font-weight:400">Empresa</small></div><div class="log" id="log" role="log" aria-live="polite">${msgs.map(m=>`<div class="bub ${m.me?"me":""}">${esc(m.t)}</div>`).join("")}</div>
<form class="send" onsubmit="event.preventDefault();sendMsg(this.t)"><label class="in">😊<input name="t" autocomplete="off" aria-label="Mensagem" placeholder="Digite sua mensagem..."></label><button aria-label="Enviar">➤</button></form>`:'<p class="empty" style="padding:20px">Selecione uma conversa.</p>'}</div></section>`)},

/* ---------- PERFIL (perfil.html) ----------
   Edita nome, telefone, cidade, bio e senha (saveProf em actions.js) e lista os anúncios do usuário. */
perfil(){const u=user();return shell(`<div class="form"><h2>Meu perfil</h2><form class="panel" style="text-align:center" onsubmit="event.preventDefault();saveProf()" novalidate><div class="av" style="width:80px;height:80px;font-size:36px;margin:0 auto 10px">${esc(u.name[0].toUpperCase())}</div><p class="tag" style="margin:0">${u.type==="empresa"?"Empresa":"Usuário"}</p>${u.bio?`<p class="profile-bio">${esc(u.bio)}</p>`:""}
<label for="pn">Nome</label><div class="in sq"><input id="pn" value="${esc(u.name)}"></div><label for="pe">E-mail</label><div class="in sq"><input id="pe" value="${esc(u.email)}" disabled></div>
<label for="pt">Telefone</label><div class="in sq"><input id="pt" type="tel" value="${esc(u.tel||"")}" placeholder="(11) 90000-0000"></div><label for="pc">Cidade</label><div class="in sq"><input id="pc" value="${esc(u.city||"")}" placeholder="São Paulo - SP"></div>
<label for="pb">Sobre mim</label><div class="in sq"><textarea id="pb" rows="4" maxlength="300" placeholder="Conte um pouco sobre você, sua empresa ou seus objetivos...">${esc(u.bio||"")}</textarea></div>
<label for="ps">Nova senha (opcional)</label><div class="in sq"><input id="ps" type="password" autocomplete="new-password" placeholder="Mínimo de 6 caracteres"></div>
<label for="ps2">Confirmar nova senha</label><div class="in sq"><input id="ps2" type="password" autocomplete="new-password" placeholder="Repita a nova senha"></div>
<p class="hint">Deixe os campos de senha vazios para manter a senha atual.</p>
<div class="err" id="err" role="alert"></div><button class="btn" type="submit">Salvar alterações</button></form>
<section><h3>Meus anúncios</h3>${S.own.filter(o=>o.owner===S.me).map(matCard).join("")||'<p class="empty">Você ainda não cadastrou materiais.</p>'}</section></div>`)}
};
