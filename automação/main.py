import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.edge.options import Options
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.edge.service import Service
import os

# Configurações do Edge
edge_options = Options()
edge_options.add_argument("--disable-dev-shm-usage")
edge_options.add_argument("--no-sandbox")

# Defina o diretório de download
download_dir = "C:/Users/lucas.ribeiro/Rela_aloca/automação/base_planilha"

# Remova todos os arquivos do diretório de download
for file_name in os.listdir(download_dir):
    file_path = os.path.join(download_dir, file_name)
    try:
        if os.path.isfile(file_path):
            os.unlink(file_path)
    except Exception as e:
        print(f"Erro ao deletar o arquivo {file_path}. Erro: {e}")

# Configurações de preferência para o diretório de download
prefs = {
    "download.default_directory": download_dir,
    "download.prompt_for_download": False,  # para evitar a janela de confirmação de download
    "download.directory_upgrade": True,
    "safebrowsing.enabled": True,
}

edge_options.add_experimental_option("prefs", prefs)

driver_path = EdgeChromiumDriverManager().install()
edge_service = Service(driver_path)

# Iniciar o serviço do EdgeDriver usando webdriver_manager
navegador = webdriver.Edge(service=edge_service, options=edge_options)

# Cria uma variável para armazenar as credenciais de login
credenciais = {
    'cpf': '04345416132',
    'senha': 'Lu021805',
}

# Acessa o site do Cebraspe
navegador.get('https://extranet.cebraspe.org.br/Sinapse/aspx/autenticarusuario/AutenticarUsuario.aspx?client_id=SinCef&scope=&response_type=code&redirect_uri=https://extranet.cebraspe.org.br/SinCef/Callback&state=eyJyZWRpcmVjdFVSSSI6Imh0dHBzOi8vZXh0cmFuZXQuY2VicmFzcGUub3JnLmJyL1NpbkNlZi8iLCJkYXRhIjp7ImRhdGV0aW1lIjoxNjk2ODg0NzgyNzc4fX0=')

# Insere as credenciais de login
navegador.find_element(By.XPATH, '//*[@id="ctl00_conteudo_Login"]').send_keys(credenciais['cpf'])
navegador.find_element(By.XPATH, '//*[@id="ctl00_conteudo_Senha"]').send_keys(credenciais['senha'])

# Clica no botão para efetuar o login
navegador.find_element(By.XPATH, '//*[@id="ctl00_conteudo_cmdAutenticarUsuario"]').click()

# Selecionar Evento
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="form"]/button[2]'))).click()

# Espera até que o modal esteja visível
modal_xpath = '//*[@role="dialog" and contains(@class, "modal show")]'
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, modal_xpath)))

# Insere o código do evento
campo_evento_xpath = '//*[@id="idEvento"]'
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, campo_evento_xpath))).send_keys('1985')

# Click em pesquisar
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[3]/div/div/div[2]/form/div/div[5]/div[1]/button'))).click()

# Clica no evento que foi pesquisado
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '/html/body/div[3]/div/div/div[2]/div/div/table/tbody/tr/td[4]/button'))).click()

# Clica no ícone de gerar relatório
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="group"]/li[3]/div/button'))).click()

# Clica em Relatório de Evento
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="448"]/ul/li[3]/span'))).click()

# Clica em filtrar
WebDriverWait(navegador, 10).until(EC.visibility_of_element_located((By.XPATH, '//*[@id="root"]/div[2]/div[2]/main/div/div[2]/form/div/div[2]/div/div[1]/button'))).click()

botao_gerar_relatorio = WebDriverWait(navegador, 10).until(EC.element_to_be_clickable((By.XPATH, '//td[text()="Colaboradores Previstos x Alocados"]/following-sibling::td/button/span[text()="Gerar relatório"]')))
botao_gerar_relatorio.click()

time.sleep(30)