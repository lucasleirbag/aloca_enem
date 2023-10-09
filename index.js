const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

sideLinks.forEach(item => {
    const li = item.parentElement;
    item.addEventListener('click', () => {
        sideLinks.forEach(i => {
            i.parentElement.classList.remove('active');
        })
        li.classList.add('active');
    })
});

const menuBar = document.querySelector('.content nav .bx.bx-menu');
const sideBar = document.querySelector('.sidebar');

menuBar.addEventListener('click', () => {
    sideBar.classList.toggle('close');
});

const searchBtn = document.querySelector('.content nav form .form-input button');
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');
const searchForm = document.querySelector('.content nav form');

searchBtn.addEventListener('click', function (e) {
    if (window.innerWidth < 576) {
        e.preventDefault;
        searchForm.classList.toggle('show');
        if (searchForm.classList.contains('show')) {
            searchBtnIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchBtnIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }
    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
});

const toggler = document.getElementById('theme-toggle');

toggler.addEventListener('change', function () {
    if (this.checked) {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }
});
const homeLink = document.querySelector('.sidebar .side-menu li a[href="#"]');
const homeContent = document.getElementById('home-content');
homeContent.style.display = 'block';

homeLink.addEventListener('click', function(e) {
    e.preventDefault();
    homeContent.style.display = 'block';
});

sideLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        if (link.href.endsWith('#')) {
            e.preventDefault();
            if (link.querySelector('.bx-home')) {
                homeContent.style.display = 'block';
            } else {
                homeContent.style.display = 'none';
            }
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Carregar dados do arquivo JSON
    fetch('dados.json')
    .then(response => response.json())
    .then(data => {
        fillUfTable(data);
        setupUfTableClickHandler(data);

        const ufTableBody = document.getElementById('ufTableBody');
        if (!ufTableBody) return console.error('Elemento tbody da UF não encontrado');
    
        ufTableBody.addEventListener('click', function(e) {
            if (e.target.tagName === 'TD') {
                const clickedUf = e.target.parentElement.firstElementChild.textContent;
                // Ocultar tabela UF
                document.getElementById('ufSection').style.display = 'none';
                // Mostrar tabela de cidades
                document.getElementById('citySection').style.display = 'block';
                // Preencher tabela de cidades com dados da UF clicada
                fillCityTable(data, clickedUf); // Certifique-se de ter os dados disponíveis aqui
            }
        });
        // Chame setupCityTableClickHandler aqui, dentro do bloco .then onde data está definido
        setupCityTableClickHandler(data);
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
});

// Relatório Geral
// Função para carregar os dados do JSON e atualizar os valores
function loadAndDisplayData() {
    // Carregar dados do arquivo JSON
    fetch('dados.json')
    .then(response => response.json())
    .then(data => {
        // Calculando os valores necessários
        let totalAllocated = 0;
        let totalExpected = 0;
        for (let uf in data) {
            for (let city in data[uf]) {
                totalAllocated += data[uf][city].total_allocated;
                totalExpected += data[uf][city].total_expected;
            }
        }
        let percentageAllocated = (totalAllocated / totalExpected) * 100;
        let remainingQty = totalExpected - totalAllocated;

        // Atualizando os valores no HTML
        document.getElementById('percentageAllocated').textContent = percentageAllocated.toFixed(2) + '%';
        document.getElementById('allocatedQty').textContent = totalAllocated.toLocaleString();
        document.getElementById('remainingQty').textContent = remainingQty.toLocaleString();
        document.getElementById('expectedQty').textContent = totalExpected.toLocaleString();
    })
    .catch(error => console.error('Error loading JSON data:', error));
}

// Chamar a função quando a página for carregada
document.addEventListener('DOMContentLoaded', loadAndDisplayData);

function fillUfTable(data) {
    const tableBody = document.getElementById('ufTableBody');
    if (!tableBody) return console.error('Elemento tbody não encontrado');

    let ufSummary = [];
    for (let uf in data) {
        let allocated = 0, expected = 0, remaining = 0;
        for (let city in data[uf]) {
            allocated += data[uf][city].total_allocated;
            expected += data[uf][city].total_expected;
            remaining += data[uf][city].total_expected - data[uf][city].total_allocated;
        }
        let percentageAllocated = (allocated / expected * 100).toFixed(2) + '%';
        ufSummary.push({uf, percentageAllocated, allocated, remaining, expected});
    }

    // Adicionando linhas à tabela
    ufSummary.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.uf}</td>
            <td>${row.percentageAllocated}</td>
            <td>${row.allocated}</td>
            <td>${row.remaining}</td>
            <td>${row.expected}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function setupUfTableClickHandler(data) {
    const ufTableBody = document.getElementById('ufTableBody');
    if (!ufTableBody) return console.error('Elemento tbody da UF não encontrado');

    ufTableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'TD') {
            const clickedUf = e.target.parentElement.firstElementChild.textContent;
            // Ocultar tabela UF
            document.getElementById('ufSection').style.display = 'none';
            // Mostrar tabela de cidades
            document.getElementById('citySection').style.display = 'block';
            // Preencher tabela de cidades com dados da UF clicada
            fillCityTable(data, clickedUf);
        }
    });
}

function fillCityTable(data, clickedUf) {
    const tableBody = document.getElementById('cityTableBody');
    if (!tableBody) return console.error('Elemento tbody da cidade não encontrado');

    tableBody.innerHTML = ''; // Limpar tabela de cidades
    const cityData = data[clickedUf]; // Supondo que seus dados estejam estruturados desta forma

    for (let city in cityData) {
        const row = cityData[city];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${clickedUf}</td>
            <td>${city}</td>
            <td>${(row.total_allocated / row.total_expected * 100).toFixed(2)}%</td>
            <td>${row.total_allocated}</td>
            <td>${row.total_expected - row.total_allocated}</td>
            <td>${row.total_expected}</td>
        `;
        tableBody.appendChild(tr);
    }
}

function setupCityTableClickHandler(data) {
    const cityTableBody = document.getElementById('cityTableBody');
    if (!cityTableBody) return console.error('Elemento tbody da Cidade não encontrado');

    cityTableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'TD') {
            const clickedUf = e.target.parentElement.firstElementChild.textContent;
            const clickedCity = e.target.parentElement.children[1].textContent;
            // Ocultar tabela da Cidade
            document.getElementById('citySection').style.display = 'none';
            // Mostrar tabela da Escola
            document.getElementById('schoolSection').style.display = 'block';
            // Preencher tabela da Escola com dados da Cidade clicada
            fillSchoolTable(data, clickedUf, clickedCity);
        }
    });
}

function fillSchoolTable(data, clickedUf, clickedCity) {
    const tableBody = document.getElementById('schoolTableBody');
    if (!tableBody) return console.error('Elemento tbody da Escola não encontrado');

    tableBody.innerHTML = ''; // Limpar tabela da Escola
    const cityData = data[clickedUf][clickedCity].details; // Dados da cidade específica

    for (let schoolName in cityData) {
        let totalAllocated = 0;
        let totalExpected = 0;
        let nroCoordenacao;
        let localProvaId;

        for (let jobName in cityData[schoolName]) {
            const job = cityData[schoolName][jobName];
            totalAllocated += job.allocated;
            totalExpected += job.expected;
            // Assumindo que nro_coordenacao e local_prova_id são os mesmos para todos os trabalhos em uma escola
            nroCoordenacao = job.nro_coordenacao;
            localProvaId = job.local_prova_id;
        }

        const percentageAllocated = ((totalAllocated / totalExpected) * 100).toFixed(2) + '%';
        const remaining = totalExpected - totalAllocated;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            
            <td>${nroCoordenacao}</td>
            <td>${localProvaId}</td>
            <td>${schoolName}</td>
            <td>${percentageAllocated}</td>
            <td>${totalAllocated}</td>
            <td>${remaining}</td>
            <td>${totalExpected}</td>
        `;
        tableBody.appendChild(tr);
    }
}

