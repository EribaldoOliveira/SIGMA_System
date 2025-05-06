// ==========================
// TEMA CLARO/ESCURO
// ==========================
document.getElementById("botao-tema").addEventListener("click", () => {
  document.body.classList.toggle("modo-escuro");
  const botao = document.getElementById("botao-tema");
  botao.textContent = document.body.classList.contains("modo-escuro") ? "☀️ Modo Claro" : "🌙 Modo Escuro";
});

// ==========================
// FUNÇÃO GENÉRICA DE SALVAMENTO
// ==========================
function salvarListaNoStorage(listaId, tipo) {
  const itens = [];
  document.querySelectorAll(`#${listaId} li`).forEach(li => {
    const texto = li.firstChild?.nodeValue?.trim() || "";
    const concluido = li.querySelector("input[type='checkbox']")?.checked || false;
    itens.push({ texto, concluido });
  });
  localStorage.setItem(`gera-${tipo}`, JSON.stringify(itens));
}

function carregarListaDoStorage(listaId, tipo, isTarefa = false) {
  const lista = document.getElementById(listaId);
  lista.innerHTML = "";
  const dados = JSON.parse(localStorage.getItem(`gera-${tipo}`)) || [];

  dados.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.texto;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", () => editarItem(li, `${tipo}-input`, tipo, listaId));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.addEventListener("click", () => {
      li.remove();
      salvarListaNoStorage(listaId, tipo);
      atualizarProgresso();
    });

    li.appendChild(botaoEditar);
    li.appendChild(botaoExcluir);

    if (isTarefa) {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.concluido;
      checkbox.addEventListener("change", () => {
        salvarListaNoStorage(listaId, tipo);
        atualizarProgresso();
      });
      li.prepend(checkbox);
    }

    lista.appendChild(li);
  });
  if (isTarefa) atualizarProgresso();
}

// ==========================
// ADICIONAR ITEM
// ==========================
function adicionarItem(tipo, inputId, listaId) {
  const input = document.getElementById(inputId);
  const lista = document.getElementById(listaId);
  const texto = input.value.trim();

  if (texto !== "") {
    const li = document.createElement("li");
    li.textContent = texto;

    const botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.addEventListener("click", () => editarItem(li, inputId, tipo, listaId));

    const botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.addEventListener("click", () => {
      li.remove();
      salvarListaNoStorage(listaId, tipo);
      atualizarProgresso();
    });

    li.appendChild(botaoEditar);
    li.appendChild(botaoExcluir);

    if (tipo === "tarefas") {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.addEventListener("change", () => {
        salvarListaNoStorage(listaId, tipo);
        atualizarProgresso();
      });
      li.prepend(checkbox);
    }

    lista.appendChild(li);
    input.value = "";

    salvarListaNoStorage(listaId, tipo);
    if (tipo === "tarefas") atualizarProgresso();
  }
}

// ==========================
// EDITAR ITEM
// ==========================
function editarItem(item, inputId, tipo, listaId) {
  const input = document.getElementById(inputId);
  input.value = item.firstChild?.nodeValue?.trim();
  item.remove();
  salvarListaNoStorage(listaId, tipo);
  atualizarProgresso();
}

// ==========================
// PROGRESSO DAS TAREFAS
// ==========================
function atualizarProgresso() {
  const tarefas = document.querySelectorAll("#lista-tarefas input[type='checkbox']");
  const barra = document.getElementById("barra-tarefas");
  if (tarefas.length === 0) {
    barra.style.width = "0%";
    return;
  }
  const concluidas = [...tarefas].filter(cb => cb.checked).length;
  const percentual = (concluidas / tarefas.length) * 100;
  barra.style.width = `${percentual}%`;
}

// ==========================
// FILTRO DE TAREFAS
// ==========================
document.getElementById("filtro-tarefas").addEventListener("change", function () {
  const valor = this.value;
  const tarefas = document.querySelectorAll("#lista-tarefas li");

  tarefas.forEach(li => {
    const checkbox = li.querySelector("input[type='checkbox']");
    if (valor === "todas") {
      li.style.display = "list-item";
    } else if (valor === "concluidas" && checkbox?.checked) {
      li.style.display = "list-item";
    } else if (valor === "pendentes" && !checkbox?.checked) {
      li.style.display = "list-item";
    } else {
      li.style.display = "none";
    }
  });
});

// ==========================
// CALENDÁRIO MANUAL
// ==========================
const monthYear = document.getElementById("month-year");
const calendarDays = document.getElementById("calendar-days");
let currentDate = new Date();

function renderizarCalendario() {
  calendarDays.innerHTML = "";

  const ano = currentDate.getFullYear();
  const mes = currentDate.getMonth();
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicial = primeiroDia.getDay();

  monthYear.textContent = currentDate.toLocaleString("pt-BR", { month: "long", year: "numeric" });

  for (let i = 0; i < diaSemanaInicial; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("dia-vazio");
    calendarDays.appendChild(vazio);
  }

  for (let d = 1; d <= diasNoMes; d++) {
    const dia = document.createElement("div");
    dia.classList.add("dia");
    dia.textContent = d;

    const hoje = new Date();
    if (d === hoje.getDate() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
      dia.classList.add("hoje");
    }

    calendarDays.appendChild(dia);
  }
}

document.getElementById("prev-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderizarCalendario();
});

document.getElementById("next-month").addEventListener("click", () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderizarCalendario();
});

renderizarCalendario();

// ==========================
// FULLCALENDAR E PRAZOS
// ==========================
let calendarioFull;
let eventos = JSON.parse(localStorage.getItem("gera-prazos")) || [];

function adicionarPrazo() {
  const nome = document.getElementById("nome-prazo").value.trim();
  const data = document.getElementById("data-prazo").value;

  if (nome && data) {
    eventos.push({ nome, data });
    localStorage.setItem("gera-prazos", JSON.stringify(eventos));
    atualizarListaPrazos();
    atualizarListaEventosCalendario();

    if (calendarioFull) {
      calendarioFull.addEvent({ title: nome, start: data, allDay: true });
    }

    document.getElementById("nome-prazo").value = "";
    document.getElementById("data-prazo").value = "";
  }
}

function atualizarListaPrazos() {
  const lista = document.getElementById("lista-prazos");
  lista.innerHTML = "";
  eventos.forEach(({ nome, data }) => {
    const li = document.createElement("li");
    li.textContent = `${nome} - ${data}`;
    lista.appendChild(li);
  });
}

function atualizarListaEventosCalendario() {
  const listaEventos = document.getElementById("lista-eventos-calendario");
  listaEventos.innerHTML = "";

  const eventosPorData = {};
  eventos.forEach(({ nome, data }) => {
    if (!eventosPorData[data]) eventosPorData[data] = [];
    eventosPorData[data].push(nome);
  });

  Object.keys(eventosPorData).sort().forEach(data => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${formatarDataBrasileira(data)}</strong><ul>` +
      eventosPorData[data].map(nome => `<li>${nome}</li>`).join("") +
      "</ul>";
    listaEventos.appendChild(li);
  });
}

function formatarDataBrasileira(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  calendarioFull = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    locale: 'pt-br',
    height: 400
  });
  calendarioFull.render();

  eventos.forEach(({ nome, data }) => {
    calendarioFull.addEvent({ title: nome, start: data, allDay: true });
  });

  // Carregar listas ao iniciar
  document.addEventListener('DOMContentLoaded', () => {
    carregarListaDoStorage("lista-cursos", "cursos");
    carregarListaDoStorage("lista-pos", "pos");
    carregarListaDoStorage("lista-projetos", "projetos");
    carregarListaDoStorage("lista-tarefas", "tarefas", true);
    atualizarListaPrazos();
    atualizarListaEventosCalendario();
    // E também o FullCalendar
  });
  

// ==========================
// VOLTAR AO TOPO
// ==========================
document.querySelector(".voltar-topo").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
