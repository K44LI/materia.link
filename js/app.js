/* =====================================================================
   app.js — INICIALIZAÇÃO (último arquivo carregado)
   ---------------------------------------------------------------------
   render() decide qual tela mostrar e desenha dentro de <div id="app">.
   ===================================================================== */
function render(){
  /* Página pedida pelo <body data-page="..."> (padrão: login) */
  let r = document.body.dataset.page || "login";

  /* PROTEÇÃO DE PÁGINAS:
     - sem login: só deixa ver "cadastro"; o resto vira "login"
     - com login: login/cadastro redirecionam para "home" */
  if(!S.me || !user()){ if(r !== "cadastro") r = "login" }
  else if(r === "login" || r === "cadastro") r = "home";
  if(r === "cadastrar" && user()?.type !== "empresa") r = "home";

  if(!V[r]) r = "home";                 // se a tela não existir em pages.js, vai para a home

  $("#app").innerHTML = V[r]() + siteFooter();   // desenha a tela + rodapé (siteFooter está em js/core.js)
  const l = $("#log"); if(l) l.scrollTop = l.scrollHeight;   // chat: rola até a última mensagem
  if(r === "mapa"){
    /* o mapa nunca pode derrubar a página: se der erro, o fundo em imagem continua aparecendo */
    try{ initMap() }catch(e){ const m = document.getElementById("mapa-real"); if(m){ try{ mapaSvg(m, mlPos || MAP_PADRAO, COS) }catch(_){ m.innerHTML = "" } } }
  }
  window.scrollTo(0, 0)
}


/* =====================================================================
   MAPA — Leaflet + OpenStreetMap (sem chave de API)
   ---------------------------------------------------------------------
   Como funciona:
   1) Ao abrir o mapa, o site pede a localização do usuário (opcional).
   2) As empresas de exemplo são "inventadas" ao redor da posição dele
      (placeCompanies) — cada uma a uma distância/direção fixa.
   3) Se a localização for negada/indisponível, o mapa abre numa região
      de exemplo (São Paulo) e continua funcionando normalmente.
   4) Se o Leaflet ou os tiles não carregarem (sem internet), aparece um
      mapa SVG simples (mapaSvg) com os mesmos pinos. Nada quebra.
   ===================================================================== */
const MAP_PADRAO = {lat:-23.5505, lng:-46.6333};   // centro de exemplo (São Paulo)
const MAP_RAIOS  = [2.4, 4.8, 7.3, 9.1, 3.2, 5.6]; // distância (km) de cada empresa até o usuário (igual ao km de COS)
const MAP_ANGULOS = [25, 100, 170, 235, 300, 345];  // direção (graus) de cada empresa

let mlLeafletMap = null;   // mapa Leaflet atual
let mlPos = null;          // posição real do usuário {lat,lng} (ou null)
let mlTentou = false;      // já tentou pedir a localização nesta página?

try{ mlPos = JSON.parse(sessionStorage.getItem("ml_pos") || "null") }catch(e){ mlPos = null }

/* Coloca as empresas de exemplo ao redor de um ponto central (lat/lng). */
function placeCompanies(centro){
  COS.forEach((c,i)=>{
    const r = MAP_RAIOS[i % MAP_RAIOS.length], a = MAP_ANGULOS[i % MAP_ANGULOS.length] * Math.PI / 180;
    c.lat = centro.lat + (r * Math.cos(a)) / 111;
    c.lng = centro.lng + (r * Math.sin(a)) / (111 * Math.cos(centro.lat * Math.PI / 180));
    c.km  = r;
  });
}

function setMapStatus(txt){ const el = document.getElementById("map-status"); if(el) el.textContent = txt }

function statusInicial(){
  setMapStatus(mlPos
    ? "Mostrando sua localização atual. As empresas são de demonstração."
    : "Mostrando uma região de exemplo (São Paulo). Toque em “Usar minha localização” para ver as empresas ao seu redor.");
}

/* Marca o card da empresa na lista (sem redesenhar a página). */
function destacarCard(id){
  S.sel = id;
  document.querySelectorAll(".co").forEach(c => c.classList.remove("on"));
  const card = document.querySelector('[data-co="'+id+'"]');
  if(card){ card.classList.add("on"); card.scrollIntoView({block:"nearest", behavior:"smooth"}) }
}

function popupEmpresa(c){
  return `<strong>${esc(c.n)}</strong><br>${esc(c.city)}<br>${esc(c.m)}<br>A ${c.km.toString().replace(".",",")} km · ${brl(c.p)}/kg`;
}

function initMap(){
  const el = document.getElementById("mapa-real");
  if(!el) return;
  const centro = mlPos || MAP_PADRAO;
  const lista = COS.filter(c => !S.fil || c.m === S.fil);

  if(mlLeafletMap){ try{ mlLeafletMap.remove() }catch(e){} mlLeafletMap = null }
  el.innerHTML = "";

  let ok = false;
  if(typeof L !== "undefined"){
    try{ mapaLeaflet(el, centro, lista); ok = true }
    catch(e){ if(mlLeafletMap){ try{ mlLeafletMap.remove() }catch(_){} mlLeafletMap = null } el.innerHTML = "" }
  }
  if(!ok){ mapaSvg(el, centro, lista) }

  statusInicial();
  if(!ok) setMapStatus("Mapa online indisponível — mostrando um mapa simples com as mesmas empresas.");

  /* pede a localização automaticamente só uma vez por página */
  if(!mlTentou){ mlTentou = true; locateOnMap(true) }
}

/* Mapa real (Leaflet). Lança erro se algo estiver errado, para cair no mapa SVG. */
function mapaLeaflet(el, centro, lista){
  mlLeafletMap = L.map(el, {scrollWheelZoom:false}).setView([centro.lat, centro.lng], mlPos ? 13 : 11);

  /* se o CSS do Leaflet não carregou, o mapa fica quebrado: usa o mapa SVG */
  const pane = el.querySelector(".leaflet-pane");
  if(!pane || getComputedStyle(pane).position !== "absolute") throw new Error("css do Leaflet ausente");

  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
  }).addTo(mlLeafletMap);
  let falhas = 0;
  tiles.on("tileerror", () => { if(++falhas === 3) setMapStatus("Sem conexão com o mapa de fundo — os marcadores continuam visíveis.") });

  const pontos = [[centro.lat, centro.lng]];
  lista.forEach(c => {
    const m = L.circleMarker([c.lat, c.lng], {radius:9, color:"#fff", weight:2, fillColor:S.sel === c.id ? "#0b4a25" : "#438b35", fillOpacity:1}).addTo(mlLeafletMap);
    m.bindPopup(popupEmpresa(c));
    m.on("click", () => destacarCard(c.id));
    if(S.sel === c.id) m.openPopup();
    pontos.push([c.lat, c.lng]);
  });

  if(mlPos){
    L.circleMarker([mlPos.lat, mlPos.lng], {radius:9, color:"#fff", weight:3, fillColor:"#2878e5", fillOpacity:1}).addTo(mlLeafletMap).bindPopup("Você está aqui");
  }
  if(pontos.length > 1) mlLeafletMap.fitBounds(pontos, {padding:[28,28], maxZoom:14});
  setTimeout(() => mlLeafletMap && mlLeafletMap.invalidateSize(), 100);
}

/* Mapa alternativo em SVG (funciona sem internet). Norte para cima; 15 px = 1 km. */
function mapaSvg(el, centro, lista){
  const cx = 180, cy = 200, px = 15, kx = 111 * Math.cos(centro.lat * Math.PI / 180);
  const pinos = lista.map(c => {
    const x = cx + (c.lng - centro.lng) * kx * px, y = cy - (c.lat - centro.lat) * 111 * px;
    const sel = S.sel === c.id;
    return `<g class="pin" tabindex="0" role="button" aria-label="${esc(c.n)}, a ${c.km} km" onclick="selecionarEmpresa(${c.id})" onkeydown="if(event.key==='Enter')selecionarEmpresa(${c.id})">
      <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${sel ? "#0b4a25" : "#438b35"}" stroke="#fff" stroke-width="2"/>
      <text x="${x.toFixed(1)}" y="${(y + 21).toFixed(1)}" text-anchor="middle" font-size="9" style="fill:var(--tx)">${esc(c.n.split(" ")[0])}</text></g>`;
  }).join("");
  const eu = mlPos
    ? `<circle cx="${cx}" cy="${cy}" r="9" fill="#2878e5" stroke="#fff" stroke-width="3"/><text x="${cx}" y="${cy - 14}" text-anchor="middle" font-size="10" font-weight="700" style="fill:var(--tx)">Você</text>`
    : `<circle cx="${cx}" cy="${cy}" r="5" fill="none" stroke="#888" stroke-width="2" stroke-dasharray="3 2"/>`;
  el.innerHTML = `<svg viewBox="0 0 360 400" style="width:100%;height:100%;display:block" role="img" aria-label="Mapa simples com as empresas próximas">
    <image href="img/mapa-fundo.png" x="0" y="0" width="360" height="400" preserveAspectRatio="xMidYMid slice"/>
    <g style="stroke:var(--bd)" fill="none" stroke-width="1">
      <path d="M0 120H360M0 280H360M90 0V400M270 0V400" stroke-width="6" opacity=".5"/>
      <circle cx="${cx}" cy="${cy}" r="${2 * px}" stroke-dasharray="4 4"/><circle cx="${cx}" cy="${cy}" r="${5 * px}" stroke-dasharray="4 4"/><circle cx="${cx}" cy="${cy}" r="${10 * px}" stroke-dasharray="4 4"/>
    </g>
    <text x="${cx + 2 * px + 3}" y="${cy - 3}" font-size="8" style="fill:var(--mut)">2 km</text>
    <text x="${cx + 5 * px + 3}" y="${cy - 3}" font-size="8" style="fill:var(--mut)">5 km</text>
    ${eu}${pinos}</svg>`;
}

/* Clique num pino do mapa SVG: seleciona e redesenha. */
function selecionarEmpresa(id){ S.sel = id; render() }

/* Pede a localização. auto=true quando é a tentativa automática (sem aviso na tela). */
function locateOnMap(auto){
  const falha = msg => { setMapStatus(msg + " Mostrando uma região de exemplo (São Paulo)."); if(auto !== true) toast(msg) };
  if(!navigator.geolocation || !window.isSecureContext){
    falha("Localização indisponível aqui (use HTTPS ou localhost).");
    return;
  }
  setMapStatus("Buscando sua localização…");
  navigator.geolocation.getCurrentPosition(pos => {
    mlPos = {lat:pos.coords.latitude, lng:pos.coords.longitude};
    try{ sessionStorage.setItem("ml_pos", JSON.stringify(mlPos)) }catch(e){}
    placeCompanies(mlPos);
    if(document.getElementById("mapa-real")) render();   // redesenha mapa + lista com as novas distâncias
  }, err => {
    falha(err && err.code === 1 ? "Permissão de localização negada." : "Não foi possível obter sua localização.");
  }, {enableHighAccuracy:true, timeout:10000, maximumAge:60000});
}


/* ---- INICIALIZAÇÃO (fica no fim, depois das funções e variáveis do mapa) ---- */
/* As empresas sempre ganham coordenadas: ao redor do usuário (se ele já liberou a
   localização nesta aba) ou ao redor do centro de exemplo. */
placeCompanies(mlPos || MAP_PADRAO);

if(!location.hash){ location.hash = document.body.dataset.page || "login" }
addEventListener("hashchange", render);
paint();     // aplica o tema (claro/escuro)
render();    // desenha a página
