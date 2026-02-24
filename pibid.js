/* =========================
   VARIÁVEIS GLOBAIS
========================= */

let vidas = 5;
let nivel = "";
let bancoQuestoes = {};
let perguntasUsadas = [];
let perguntaAtual;
let paginasRecuperadas = 0;
let digitacaoAtiva = null; // controle da digitação

const perguntasPorFase = 3;

const fasesNarrativas = [
    {
        titulo: "Fase 1 – A Sala dos Rascunhos",
        texto: "Você encontra um antigo caderno esquecido na biblioteca. Símbolos geométricos surgem nas páginas...",
        cor: "#1b5e20"
    },
    {
        titulo: "Fase 2 – O Labirinto dos Polígonos",
        texto: "As páginas revelam um código oculto. Ângulos e polígonos formam um enigma maior.",
        cor: "#e65100"
    },
    {
        titulo: "Fase 3 – A Câmara Final",
        texto: "Um símbolo gigante domina o centro do caderno. Apenas quem domina a matemática pode revelar o segredo.",
        cor: "#4a148c"
    }
];

const palavraSecreta = "GEOMETRIA";

/* =========================
   CARREGAR JSON
========================= */

async function carregarBanco() {
    const resposta = await fetch("pibid.json");
    bancoQuestoes = await resposta.json();
}

window.onload = carregarBanco;

/* =========================
   TELAS
========================= */

function trocarTela(id){
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function irConfig(){
    trocarTela("config");
}

document.getElementById("nivel").addEventListener("change",function(){
    nivel=this.value;
    if(nivel!==""){
        document.getElementById("tutorial").classList.remove("hidden");
    }
});

function ativarPronto(){
    document.getElementById("btnPronto").classList.remove("hidden");
}

/* =========================
   INICIAR JOGO
========================= */

function iniciar(){
    vidas = 5;
    perguntasUsadas = [];
    paginasRecuperadas = 0;

    trocarTela("game");
    carregarPergunta();
}

/* =========================
   PEGAR PERGUNTA
========================= */

function pegarPerguntaAleatoria(){

    let lista = bancoQuestoes[nivel];

    if(!lista || lista.length === 0){
        alert("Sem perguntas nesse nível.");
        return null;
    }

    let disponiveis = lista.filter(p => !perguntasUsadas.includes(p));

    if(disponiveis.length === 0){
        perguntasUsadas = [];
        disponiveis = lista;
    }

    let pergunta = disponiveis[Math.floor(Math.random() * disponiveis.length)];
    perguntasUsadas.push(pergunta);

    return pergunta;
}

/* =========================
   CARREGAR PERGUNTA + FASE
========================= */

function carregarPergunta(){

    atualizarTopo();

    let faseAtual = Math.floor(paginasRecuperadas / perguntasPorFase);

    if(faseAtual >= fasesNarrativas.length){
        finalizarMissao();
        return;
    }

    document.body.style.background = fasesNarrativas[faseAtual].cor;

    document.getElementById("tituloFase").textContent =
        fasesNarrativas[faseAtual].titulo;

    efeitoDigitacao(
        fasesNarrativas[faseAtual].texto,
        "narrativa",
        20
    );

    document.getElementById("faseInfo").textContent =
        "Desafio " +
        ((paginasRecuperadas % perguntasPorFase) + 1) +
        "/" + perguntasPorFase;

    perguntaAtual = pegarPerguntaAleatoria();
    if(!perguntaAtual) return;

    document.getElementById("pergunta").textContent =
        perguntaAtual.pergunta;

    let opcoesDiv = document.getElementById("opcoes");
    opcoesDiv.innerHTML = "";

    perguntaAtual.opcoes.forEach((op,i)=>{
        let btn=document.createElement("button");
        btn.textContent=op;
        btn.onclick=()=>verificar(i);
        opcoesDiv.appendChild(btn);
    });
}

/* =========================
   VERIFICAR RESPOSTA
========================= */

function verificar(indiceEscolhido) {

    let botoes = document.querySelectorAll("#opcoes button");

    if (indiceEscolhido === perguntaAtual.correta) {

        botoes[indiceEscolhido].classList.add("botao-correto");
        document.querySelector(".desafio-box").classList.add("acerto");

        criarConfete();
        mostrarMensagem();

        paginasRecuperadas++;

        if (vidas < 5) vidas++;

        setTimeout(() => {
            document.querySelector(".desafio-box").classList.remove("acerto");
            carregarPergunta();
        }, 900);

    } else {

        vidas--;
        document.getElementById("mensagem").textContent =
            "O símbolo enfraquece... você perdeu uma vida.";

        if (vidas <= 0) {
            alert("O caderno se fecha antes que o segredo seja revelado.");
            trocarTela("config");
        }
    }

    atualizarTopo();
}

/* =========================
   FINAL ÉPICO
========================= */

function finalizarMissao(){
    trocarTela("final");

    efeitoDigitacao(
        "O símbolo final brilha intensamente...\nA palavra revelada é: " + palavraSecreta,
        "finalTexto",
        35
    );
}

/* =========================
   MENSAGENS
========================= */

const mensagens = [
    "O código reage à sua inteligência!",
    "As páginas brilham com sua resposta!",
    "Você está decifrando o mistério!",
    "A geometria responde ao seu comando!"
];

function mostrarMensagem() {
    const msg = document.getElementById("mensagem");
    msg.textContent = mensagens[Math.floor(Math.random() * mensagens.length)];
}

/* =========================
   CONFETE
========================= */

function criarConfete() {
    for (let i = 0; i < 20; i++) {
        const confete = document.createElement("div");
        confete.classList.add("confete");
        confete.style.left = Math.random() * 100 + "vw";
        document.body.appendChild(confete);
        setTimeout(() => confete.remove(), 1000);
    }
}

/* =========================
   VIDAS
========================= */

function atualizarTopo(){
    document.getElementById("vidas").textContent="❤️ ".repeat(vidas);
}

/* =========================
   EFEITO DIGITAÇÃO (CORRIGIDO E ROBUSTO)
========================= */

function efeitoDigitacao(texto, elementoId, velocidade = 25){
    const elemento = document.getElementById(elementoId);

    if (digitacaoAtiva) {
        clearTimeout(digitacaoAtiva);
    }

    elemento.textContent = "";

    const caracteres = [...texto];
    let i = 0;

    function digitar(){
        if(i < caracteres.length){
            elemento.textContent += caracteres[i];
            i++;
            digitacaoAtiva = setTimeout(digitar, velocidade);
        }
    }

    digitar();
}