/* =========================
    VARIÁVEIS GLOBAIS
========================= */
let vidas = 5;
let nivel = "";
let bancoQuestoes = {};
let perguntasUsadas = [];
let perguntaAtual;
let paginasRecuperadas = 0;
let digitacaoAtiva = null; 

const perguntasPorFase = 5;

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
    UTILITÁRIOS (EMBARALHAMENTO)
========================= */
function embaralhar(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/* =========================
    CARREGAR JSON
========================= */
async function carregarBanco() {
    try {
        const resposta = await fetch("pibid.json");
        bancoQuestoes = await resposta.json();
    } catch (e) {
        console.error("Erro ao carregar o arquivo JSON:", e);
    }
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

document.getElementById("nivel").addEventListener("change", function(){
    nivel = this.value;
    if(nivel !== ""){
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
    if(!lista || lista.length === 0) return null;

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
    document.getElementById("tituloFase").textContent = fasesNarrativas[faseAtual].titulo;

    efeitoDigitacao(fasesNarrativas[faseAtual].texto, "narrativa", 20);

    document.getElementById("faseInfo").textContent = 
        "Desafio " + ((paginasRecuperadas % perguntasPorFase) + 1) + "/" + perguntasPorFase;

    perguntaAtual = pegarPerguntaAleatoria();
    if(!perguntaAtual) return;

    document.getElementById("pergunta").textContent = perguntaAtual.pergunta;

    // LÓGICA DE EMBARALHAMENTO DAS OPÇÕES
    let opcoesDiv = document.getElementById("opcoes");
    opcoesDiv.innerHTML = "";

    // Mapeamos as opções para objetos que sabem se são a correta
    let listaOpcoes = perguntaAtual.opcoes.map((texto, index) => {
        return { texto: texto, correta: index === perguntaAtual.correta };
    });

    // Embaralhamos a lista antes de criar os botões
    embaralhar(listaOpcoes);

    listaOpcoes.forEach(op => {
        let btn = document.createElement("button");
        btn.textContent = op.texto;
        btn.onclick = () => verificarResposta(op.correta, btn);
        opcoesDiv.appendChild(btn);
    });
}

/* =========================
    VERIFICAR RESPOSTA (CORRIGIDA)
========================= */
function verificarResposta(eCorreta, botaoClicado) {
    if (eCorreta) {
        botaoClicado.classList.add("botao-correto");
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
        botaoClicado.style.backgroundColor = "#ff4444"; // Feedback visual imediato de erro
        document.getElementById("mensagem").textContent = "O símbolo enfraquece... você perdeu uma vida.";

        if (vidas <= 0) {
            alert("O caderno se fecha antes que o segredo seja revelado.");
            trocarTela("config");
        }
    }
    atualizarTopo();
}

/* =========================
    FINAL & ESTÉTICA
========================= */
function finalizarMissao(){
    trocarTela("final");
    efeitoDigitacao("O símbolo final brilha intensamente...\nA palavra revelada é: " + palavraSecreta, "finalTexto", 35);
}

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

function criarConfete() {
    for (let i = 0; i < 20; i++) {
        const confete = document.createElement("div");
        confete.classList.add("confete");
        confete.style.left = Math.random() * 100 + "vw";
        document.body.appendChild(confete);
        setTimeout(() => confete.remove(), 1000);
    }
}

function atualizarTopo(){
    document.getElementById("vidas").textContent = "❤️ ".repeat(vidas);
}

function efeitoDigitacao(texto, elementoId, velocidade = 25){
    const elemento = document.getElementById(elementoId);
    if (digitacaoAtiva) clearTimeout(digitacaoAtiva);
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