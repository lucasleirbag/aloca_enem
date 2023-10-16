/**
 * @fileoverview Este script contém funções e lógicas relacionadas à manipulação do DOM e interações na interface.
 */

// Definindo elementos principais do DOM, como a sidebar, links na sidebar, barras de menu, tema, etc.

/** @constant {Element} sideBar - O elemento da barra lateral */
const sideBar = document.querySelector('.sidebar');
sideBar.classList.add('close');

/** @constant {NodeList} sideLinks - Links na barra lateral, excluindo o link de logout */
const sideLinks = document.querySelectorAll('.sidebar .side-menu li a:not(.logout)');

/** @constant {Element} menuBar - O ícone da barra de menu */
const menuBar = document.querySelector('.content nav .bx.bx-menu');

/** @constant {Element} searchBtn - O botão de pesquisa */
const searchBtn = document.querySelector('.content nav form .form-input button');

/** @constant {Element} searchBtnIcon - O ícone dentro do botão de pesquisa */
const searchBtnIcon = document.querySelector('.content nav form .form-input button .bx');

/** @constant {Element} searchForm - O formulário de pesquisa */
const searchForm = document.querySelector('.content nav form');

/** @constant {Element} homeLink - Link para a página inicial */
const homeLink = document.querySelector('.sidebar .side-menu li a[href="#"]');

/** @constant {Element} homeContent - Conteúdo da página inicial */
const homeContent = document.getElementById('home-content');
homeContent.style.display = 'block';

/** @constant {Element} toggler - O switch para alternar entre temas */
const toggler = document.getElementById('theme-toggle');

/**
 * Alterna a visibilidade da barra lateral.
 */
function toggleSideBar() {
    sideBar.classList.toggle('close');
}

/**
 * Trata o evento de clique em um link lateral, tornando-o ativo e desativando outros links.
 * @param {Event} event - O evento de clique.
 */
function handleSideLinkClick(event) {
    sideLinks.forEach(link => {
        link.parentElement.classList.remove('active');
    });
    event.currentTarget.parentElement.classList.add('active');
}

/**
 * Manipula o evento de clique no botão de pesquisa, mostrando/ocultando o formulário de pesquisa.
 * @param {Event} e - O evento de clique.
 */
function handleSearchButtonClick(e) {
    if (window.innerWidth < 576) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        const iconClass = searchForm.classList.contains('show') ? ['bx-search', 'bx-x'] : ['bx-x', 'bx-search'];
        searchBtnIcon.classList.replace(...iconClass);
    }
}

/**
 * Trata o evento de redimensionamento da janela, ajustando elementos conforme a largura da janela.
 */
function handleWindowResize() {
    if (window.innerWidth < 768) {
        sideBar.classList.add('close');
    } else {
        sideBar.classList.remove('close');
    }

    if (window.innerWidth > 576) {
        searchBtnIcon.classList.replace('bx-x', 'bx-search');
        searchForm.classList.remove('show');
    }
}

/**
 * Alterna o tema entre claro e escuro.
 */
function toggleTheme() {
    const theme = this.checked ? 'dark' : 'light';
    document.body.classList.toggle('dark', this.checked);
    localStorage.setItem('theme', theme);
}

/**
 * Trata o evento de clique no link da página inicial.
 * @param {Event} e - O evento de clique.
 */
function handleHomeLinkClick(e) {
    e.preventDefault();
    homeContent.style.display = 'block';
}

// Manipula o evento 'DOMContentLoaded', inicializando configurações e carregando dados.

function handleContentLoaded() {
    // Aplicar o tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    const toggler = document.getElementById('theme-toggle');
    if (savedTheme) {
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            toggler.checked = true;
        } else {
            document.body.classList.remove('dark');
            toggler.checked = false;
        }
    }

    // Carregar dados do arquivo JSON
    fetch('dados.json')
    .then(response => response.json())
    .then(data => {
        sortTableByPercentage('ufTableBody');

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
                sortTableByPercentage('cityTableBody');
            }
        });

        // Chame setupCityTableClickHandler aqui, dentro do bloco .then onde data está definido
        setupCityTableClickHandler(data);

        // Adicionando event listeners para os links do breadcrumb
        document.getElementById('link-uf').addEventListener('click', function(e) {
            e.preventDefault();
            showUfTable();
        });

        document.getElementById('link-city').addEventListener('click', function(e) {
            e.preventDefault();
            showCityTable(); 
        });
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
}

function updateInsights(data) {
    // Supondo que os dados estejam estruturados de uma forma específica (isso pode precisar ser ajustado)
    let totalAllocated = 0;
    let totalExpected = 0;
    
    for (let uf in data) {
        for (let city in data[uf]) {
            totalAllocated += data[uf][city].total_allocated;
            totalExpected += data[uf][city].total_expected;
        }
    }

    const percentageAllocated = (totalAllocated / totalExpected * 100).toFixed(2) + '%';
    const remainingQty = totalExpected - totalAllocated;

    // Atualizar o DOM
    document.getElementById("percentageAllocated").textContent = percentageAllocated;
    document.getElementById("allocatedQty").textContent = totalAllocated.toLocaleString('pt-BR');
    document.getElementById("remainingQty").textContent = remainingQty.toLocaleString('pt-BR');
    document.getElementById("expectedQty").textContent = totalExpected.toLocaleString('pt-BR');
}

// Event listeners

menuBar.addEventListener('click', toggleSideBar);
searchBtn.addEventListener('click', handleSearchButtonClick);
window.addEventListener('resize', handleWindowResize);
toggler.addEventListener('change', toggleTheme);
homeLink.addEventListener('click', handleHomeLinkClick);
document.addEventListener('DOMContentLoaded', handleContentLoaded);

sideLinks.forEach(link => {
    link.addEventListener('click', handleSideLinkClick);
});

// ------------------ INICIALIZAÇÃO ------------------

document.addEventListener('DOMContentLoaded', function() {
    applySavedTheme();
    loadDataAndSetupHandlers();
});

// ------------------ TEMAS ------------------

function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const toggler = document.getElementById('theme-toggle');
    if (!savedTheme) return;

    const isDarkTheme = savedTheme === 'dark';
    document.body.classList.toggle('dark', isDarkTheme);
    toggler.checked = isDarkTheme;
}

// ------------------ CARREGAMENTO DE DADOS E MANIPULAÇÃO ------------------

function loadDataAndSetupHandlers() {
    fetch('dados.json')
    .then(response => response.json())
    .then(data => {
        updateInsights(data);
        setupTables(data);
        setupBreadcrumbHandlers();
    })
    .catch(error => console.error('Erro ao carregar os dados:', error));
}

function setupTables(data) {
    fillUfTable(data);
    sortTableByPercentage('ufTableBody');
    setupTableClickHandlers(data);
}

function setupTableClickHandlers(data) {
    const ufTableBody = document.getElementById('ufTableBody');
    const cityTableBody = document.getElementById('cityTableBody');
    const schoolTableBody = document.getElementById('schoolTableBody');

    ufTableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'TD') {
            const clickedUf = e.target.parentElement.firstElementChild.textContent;
            switchSection('ufSection', 'citySection');
            fillCityTable(data, clickedUf);
            sortTableByPercentage('cityTableBody');
        }
    });

    cityTableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'TD') {
            const clickedUf = e.target.parentElement.firstElementChild.textContent;
            const clickedCity = e.target.parentElement.children[1].textContent;
            switchSection('citySection', 'schoolSection');
            fillSchoolTable(data, clickedUf, clickedCity);
            sortTableByPercentage('schoolTableBody');
        }
    });

    schoolTableBody.addEventListener('click', function(e) {
        if (e.target.tagName === 'TD') {
            const clickedUf = e.target.parentElement.dataset.uf;
            const clickedCity = e.target.parentElement.dataset.city;
            const clickedSchool = e.target.parentElement.children[2].textContent;
            switchSection('schoolSection', 'functionSection');
            fillFunctionTable(data, clickedUf, clickedCity, clickedSchool);
            sortTableByPercentage('functionTableBody');
        }
    });
}

function setupBreadcrumbHandlers() {
    document.getElementById('link-uf').addEventListener('click', function(e) {
        e.preventDefault();
        showUfTable();
    });

    document.getElementById('link-city').addEventListener('click', function(e) {
        e.preventDefault();
        showCityTable();
    });
}

// ------------------ FUNÇÕES DE PREENCHIMENTO DE TABELAS ------------------

function fillUfTable(data) {
    console.log("fillUFTable foi chamada");
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
    applyPercentageColor('ufTableBody');
}

function fillCityTable(data, clickedUf) {
    document.querySelector("#citySection h3").innerHTML = `Atualização de alocação - <a href="#" data-section="ufSection">${clickedUf}</a>`;
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
    sortTableByPercentage('cityTableBody');
    applyPercentageColor('cityTableBody');
}

function fillSchoolTable(data, clickedUf, clickedCity) {
    document.querySelector("#schoolSection h3").innerHTML = `Atualização de alocação - <a href="#" data-section="ufSection">${clickedUf}</a> - <a href="#" data-section="citySection">${clickedCity}</a>`;
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
        tr.dataset.uf = clickedUf;   // Armazenando UF
        tr.dataset.city = clickedCity;   // Armazenando cidade
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
    sortTableByPercentage('schoolTableBody');
    applyPercentageColor('schoolTableBody');
}

function fillFunctionTable(data, clickedUf, clickedCity, clickedSchool) {
    document.querySelector("#functionSection h3").innerHTML = `Atualização de alocação - <a href="#" data-section="ufSection">${clickedUf}</a> - <a href="#" data-section="citySection">${clickedCity}</a> - ${clickedSchool}`;
    const functionTableBody = document.getElementById('functionTableBody');
    if (!functionTableBody) return console.error('Elemento tbody das Funções não encontrado');

    functionTableBody.innerHTML = ''; // Limpar tabela de Funções

    if (!data[clickedUf]) {
        console.error(`Dados para a UF '${clickedUf}' não encontrados!`);
        return;
    }
    
    if (!data[clickedUf][clickedCity]) {
        console.error(`Dados para a cidade '${clickedCity}' na UF '${clickedUf}' não encontrados!`);
        return;
    }
    
    if (!data[clickedUf][clickedCity].details) {
        console.error(`Detalhes para a cidade '${clickedCity}' na UF '${clickedUf}' não encontrados!`);
        return;
    }
    
    const schoolData = data[clickedUf][clickedCity].details[clickedSchool];

    if (!schoolData) {
        console.error(`Dados para a escola '${clickedSchool}' na cidade '${clickedCity}' na UF '${clickedUf}' não encontrados!`);
        return;
    }

    for (let functionName in schoolData) {
        const functionDetails = schoolData[functionName];
        const allocated = functionDetails.allocated;
        const expected = functionDetails.expected;
        const percentageAllocated = ((allocated / expected) * 100).toFixed(2) + '%';
        const remaining = expected - allocated;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${functionName}</td>
            <td>${percentageAllocated}</td>
            <td>${allocated}</td>
            <td>${remaining}</td>
            <td>${expected}</td>
        `;
        functionTableBody.appendChild(tr);
    }
    sortTableByPercentage('functionTableBody');
    applyPercentageColor('functionTableBody');
}

// ------------------ UTILITÁRIOS ------------------

function switchSection(hideSectionId, showSectionId) {
    document.getElementById(hideSectionId).style.display = 'none';
    document.getElementById(showSectionId).style.display = 'block';
}

function sortTableByPercentage(tbodyId) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    // Detectar a coluna "Alocados - %"
    const headerRow = tbody.parentElement.querySelector("thead tr");
    let percentageColumnIndex = -1;
    for (let i = 0; i < headerRow.cells.length; i++) {
        if (headerRow.cells[i].textContent.trim() === "Alocados - %") {
            percentageColumnIndex = i;
            break;
        }
    }

    if (percentageColumnIndex === -1) return;  // Se a coluna não foi encontrada, retorne

    const rows = Array.from(tbody.querySelectorAll("tr")).sort((a, b) => {
        const percentageA = parseFloat(a.cells[percentageColumnIndex].textContent);
        const percentageB = parseFloat(b.cells[percentageColumnIndex].textContent);
        return percentageB - percentageA;
    });

    // Anexar linhas ordenadas de volta ao tbody
    rows.forEach(row => tbody.appendChild(row));
}

// ------------------ FILTROS E NAVEGAÇÃO ------------------

const searchInput = document.querySelector('input[type="search"]');
searchInput.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase();
    filterTable('ufTableBody', searchTerm);
    filterTable('cityTableBody', searchTerm);
    filterTable('schoolTableBody', searchTerm);
});

function filterTable(tableId, term) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    // Iterar sobre as linhas da tabela
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let rowText = '';
        
        // Concatenar texto de todas as células
        cells.forEach(cell => {
            rowText += cell.textContent.toLowerCase();
        });
        
        // Comparar texto da linha com termo de pesquisa
        row.style.display = rowText.includes(term) ? '' : 'none';
    });
}

document.querySelectorAll('.btn-back').forEach(button => {
    button.addEventListener('click', navigateBack);
});

function navigateBack() {
    const section = this.closest('.orders');
    if (section.id === 'citySection') {
        switchSection('citySection', 'ufSection');
    } else if (section.id === 'schoolSection') {
        switchSection('schoolSection', 'citySection');
    } else if (section.id === 'functionSection') {
        switchSection('functionSection', 'schoolSection');
    }
}

function applyPercentageColor(tableId) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tr');

    let percentageCellIndex = 1; // Por padrão, é a segunda coluna

    switch(tableId) {
        case 'cityTableBody':
            percentageCellIndex = 2; // Terceira coluna
            break;
        case 'schoolTableBody':
            percentageCellIndex = 3; // Quarta coluna
            break;
        case 'functionTableBody':
            percentageCellIndex = 1; // Segunda coluna (padrão)
            break;
    }

    rows.forEach(row => {
        const percentageCell = row.querySelector(`td:nth-child(${percentageCellIndex + 1})`);
        if (percentageCell) {
            const value = parseFloat(percentageCell.textContent);
            if (value >= 0 && value <= 40.99) {
                percentageCell.classList.add('percentage-red');
            } else if (value >= 41 && value <= 60.99) {
                percentageCell.classList.add('percentage-orange');
            } else if (value >= 61 && value <= 80.99) {
                percentageCell.classList.add('percentage-blue');
            } else if (value >= 81 && value <= 100) {
                percentageCell.classList.add('percentage-green');
            }
        }
    });
}

