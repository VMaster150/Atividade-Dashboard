// Dados e configurações
let transacoes = JSON.parse(localStorage.getItem('transacoes')) || [];
let categorias = JSON.parse(localStorage.getItem('categorias')) || [
  "Alimentação", "Transporte", "Moradia", "Lazer", "Saúde", "Educação", "Outros"
];

const form = document.getElementById('formTransacao');
const tabelaBody = document.querySelector('#tabelaTransacoes tbody');
const saldoEl = document.getElementById('saldoAtual');
const selectCat = document.getElementById('categoria');
const alertaOrcamento = document.getElementById('alerta-orcamento');

let chartCategorias;

function salvarDados() {
  localStorage.setItem('transacoes', JSON.stringify(transacoes));
  localStorage.setItem('categorias', JSON.stringify(categorias));
}

function formatarMoeda(valor) {
  return 'R$ ' + Number(valor).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
}

function calcularSaldo() {
  let total = 0;
  transacoes.forEach(t => {
    total += t.tipo === 'depósito' ? t.valor : -t.valor;
  });
  saldoEl.textContent = formatarMoeda(total);
  saldoEl.className = total >= 0 ? 'positivo' : 'negativo';
}

function popularSelectCategorias() {
  selectCat.innerHTML = '<option value=""> Sem categoria (apenas depósitos)</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    selectCat.appendChild(opt);
  });
}

function atualizarGraficoDespesas() {
  const despesasPorCat = {};

  transacoes
    .filter(t => t.tipo === 'despesa')
    .forEach(t => {
      despesasPorCat[t.categoria] = (despesasPorCat[t.categoria] || 0) + t.valor;
    });

  const labels = Object.keys(despesasPorCat);
  const valores = Object.values(despesasPorCat);

  if (chartCategorias) chartCategorias.destroy();

  chartCategorias = new Chart(document.getElementById('graficoCategorias'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        data: valores,
        backgroundColor: ['#e74c3c','#3498db','#f39c12','#2ecc71','#9b59b6','#1abc9c','#34495e'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' }
      },
      tittle: {
        display: true,
        text: 'Chart.js Combined Line/Bar Chart'
      }
    }
  });
}

function listarTransacoes() {
  tabelaBody.innerHTML = '';

  const ordenadas = [...transacoes].sort((a,b) => new Date(b.data) - new Date(a.data));

  ordenadas.forEach((trans, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${new Date(trans.data + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
      <td>${trans.tipo}</td>
      <td>${trans.categoria || '-'}</td>
      <td>${trans.descricao || '-'}</td>
      <td class="${trans.tipo === 'depósito' ? 'positivo' : 'negativo'}">
        ${formatarMoeda(trans.valor)}
      </td>
      <td>
        <button class="btn-delete" onclick="removerTransacao(${index})">Excluir</button>
      </td>
    `;
    tabelaBody.appendChild(tr);
  });
}

function removerTransacao(index) {
  if (!confirm('Deseja realmente excluir esta transação?')) return;
  transacoes.splice(index, 1);
  salvarDados();
  atualizarTudo();
}

function atualizarTudo() {
  listarTransacoes();
  calcularSaldo();
  atualizarGraficoDespesas();
}

form.addEventListener('submit', e => {
  e.preventDefault();

  const tipoSelecionado = document.getElementById('tipo').value
  const categoriaSelecionada = document.getElementById('categoria').value

  if (tipoSelecionado === 'despesa' && !categoriaSelecionada) {
    alert('para despesas é necessário selecionar uma categoria!');
    return;
  }

  const novaTrans = {
    data: document.getElementById('data').value,
    tipo: tipoSelecionado,
    valor: Number(document.getElementById('valor').value),
    categoria: categoriaSelecionada || null,
    descricao: document.getElementById('descricao').value.trim()
  };

  transacoes.push(novaTrans);
  salvarDados();
  form.reset();
  atualizarTudo();
});

popularSelectCategorias();
atualizarTudo();