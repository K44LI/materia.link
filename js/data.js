/* =====================================================================
   data.js — DADOS E ESTADO DO SITE
   ---------------------------------------------------------------------
   Aqui ficam: caminhos das logos, atalhos, listas de empresas e materiais
   (de exemplo) e o "estado" (S) que guarda quem está logado, favoritos etc.
   É o primeiro arquivo carregado: os outros usam o que é criado aqui.
   ===================================================================== */

/* Logos. Para trocar a imagem, coloque o novo arquivo em /img e altere o nome. */
const LOGO  = "img/logo.png";         // logo para o tema claro
const LOGOW = "img/logo-branca.png";  // logo branca (tema escuro e menu lateral)

/* Atalhos:
   $("#id") = document.querySelector("#id")  -> pega um elemento da página
   esc(texto) = protege contra HTML malicioso (use SEMPRE que mostrar texto digitado pelo usuário) */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

/* ls = pequena ajuda para o localStorage (memória do navegador).
   ls.get("chave", valorPadrao) lê  |  ls.set("chave", valor) grava */
const ls = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d }catch(e){ return d } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} }
};

/* ÍCONES dos tipos de material.
   >>> Para ADICIONAR um tipo novo (ex.: Madeira), basta incluir uma linha aqui:  Madeira:"🪵"
   Ele aparece automaticamente na home, no mapa e no cadastro de material. */
const ICON = {Plástico:"plastico", Vidro:"vidro", Papelão:"papelao", Eletrônico:"eletronico", Metal:"lata", "Subprodutos de origem animal":"comida"};
const iconPath = key => {
  const stem = ICON[key] || "sacola";
  const dark = {plastico:"plastico-branco.png",vidro:"vidro-branco.png",papelao:"papelao-branco.png",eletronico:"eletronico-branco.png",lata:"metal-branco.png",comida:"sobra-branca.png"};
  const light = {plastico:"plastico-branco.png",vidro:"vidro-branco.png",papelao:"papelao-branco.png",eletronico:"eletronico-branco.png",lata:"lata-branca.png",comida:"sobra-branca.png"};
  return "img/" + (TH === "dark" ? (dark[stem] || light[stem]) : (light[stem] || "sacola-verde.png"));
};
const iconImg = (key, cls="material-icon") => `<img class="${cls}" src="${iconPath(key)}" alt="" aria-hidden="true">`;
const empresaIconImg = (empresa, cls = "material-icon") =>
  `<img class="${cls}" src="${empresa.icon}" alt="${empresa.n}">`;
/* EMPRESAS de exemplo.
   id = número único | n = nome | km = distância | city = cidade
   p = preço por kg  | m = tipo de material (igual às chaves de ICON)
   x,y = posição do pino no mapa (0-360 e 0-400) */
const COS = [
  {id:1, n:"EcoPacks Embalagens", km:2.4, city:"São Paulo | SP", p:1.3, m:"Plástico", x:120, y:90, icon:"img/empresa1.png"},
  {id:2, n:"MetalSul", km:4.8, city:"São Paulo | SP", p:.8, m:"Metal", x:260, y:200, icon:"img/empresa2.png"},
  {id:3, n:"vcvPlast LTDA", km:7.3, city:"São Bernardo | SP", p:2, m:"Plástico", x:90, y:270, icon:"img/empresa3.png"},
  {id:4, n:"VanGogh Vidros", km:9.1, city:"Santo André | SP", p:.6, m:"Vidro", x:280, y:60, icon:"img/vangogh.png"},
  {id:5, n:"PapelInova", km:3.2, city:"São Paulo | SP", p:.8, m:"Papelão", x:200, y:310, icon:"img/papelao-branco.png"},
  {id:6, n:"Reaproveita Animal", km:5.6, city:"São Bernardo | SP", p:2.5, m:"Subprodutos de origem animal", x:170, y:330, icon:"img/carne-branca.png"}
];

/* MATERIAIS de exemplo.
   n = nome | t = tipo | p = preço por kg | min = quantidade mínima (kg)
   co = id da empresa dona (veja COS acima) */
const MATS = [
  {id:1, n:"Plástico PET",       t:"Plástico",   p:1.2, min:10, co:1},
  {id:2, n:"Metal Alumínio",     t:"Metal",      p:1.5, min:5,  co:2},
  {id:3, n:"Papelão",            t:"Papelão",    p:.8,  min:20, co:5},
  {id:4, n:"Vidro Transparente", t:"Vidro",      p:.5,  min:15, co:4},
  {id:5, n:"Sucata Eletrônica",  t:"Eletrônico", p:3,   min:5,  co:3},
  {id:6, n:"Sebo animal", t:"Subprodutos de origem animal", p:2.5, min:10, co:6, desc:"Subproduto de origem animal destinado ao reaproveitamento industrial."}
];

/* ESTADO (S) — a "memória" do site enquanto ele roda:
   users = contas criadas        me   = e-mail de quem está logado
   fav   = favoritos {c:empresas, m:materiais}
   chats = conversas             own  = materiais cadastrados pelo usuário
   q = texto da busca | mat = material aberto | sel = pino selecionado no mapa
   chat = conversa aberta | ftab = aba dos favoritos | fil = filtro do mapa
   reg = tipo de cadastro (user/empresa) | doar = true (Doar) / false (Vender) */
let S = {
  users: ls.get("ml_users", []),
  me:    ls.get("ml_me", null),
  fav:   ls.get("ml_fav", {c:[], m:[]}),
  chats: ls.get("ml_chats", {}),
  own:   ls.get("ml_own", []),
  q:"", mat:null, sel:null, chat:null, ftab:"c", fil:"", reg:"user", doar:true
};
/* Como cada tela é um arquivo .html diferente, o estado de navegação (busca, material
   aberto...) é guardado ao sair de uma página (função go) e recuperado aqui ao entrar. */
Object.assign(S, ls.get("ml_navigation_state", {}));

/* TEMA: "light" ou "dark". Usa a escolha salva; se não houver, segue o do aparelho. */
let TH = ls.get("ml_theme", null) || (matchMedia("(prefers-color-scheme:dark)").matches ? "dark" : "light");
const L = () => TH === "dark" ? LOGOW : LOGO;   // logo certa para o tema atual
