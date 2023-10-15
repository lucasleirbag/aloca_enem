import pandas as pd
import os
import json
import numpy as np
from tqdm import tqdm
import subprocess
import uuid
from datetime import datetime

def default(o):
    if isinstance(o, np.int64): return int(o)
    raise TypeError

def process_excel_files(folder_path):
    consolidated_data = {}
    files = [f for f in os.listdir(folder_path) if f.endswith((".xls", ".xlsx"))]
    processed_files_count = 0
    
    start_time = datetime.now()
    
    for filename in tqdm(files, desc="Processando arquivos"):
        file_path = os.path.join(folder_path, filename)
        try:
            df = pd.read_excel(file_path)
            
            if df.empty:
                print(f"\nO arquivo {filename} está vazio e será ignorado.")
                continue

            df = df[df['DiaTurno'] == '05/11/2023 - Tarde']
            grouped = df.groupby(['UF', 'Cidade', 'Local', 'Funcao'])

            for (uf, city, location, function), group in grouped:
                total_allocated = group['Alocados'].sum()
                total_expected = group['Previstos'].sum()

                nro_coordenacao = group['NroCoordenacao'].iloc[0]
                local_prova_id = group['LocalProvaID'].iloc[0]

                if uf not in consolidated_data:
                    consolidated_data[uf] = {}
                if city not in consolidated_data[uf]:
                    consolidated_data[uf][city] = {'total_allocated': 0, 'total_expected': 0, 'details': {}}

                if location not in consolidated_data[uf][city]["details"]:
                    consolidated_data[uf][city]["details"][location] = {}

                consolidated_data[uf][city]["details"][location][function] = {
                    "allocated": total_allocated,
                    "expected": total_expected,
                    'nro_coordenacao': nro_coordenacao,
                    'local_prova_id': local_prova_id
                }

                consolidated_data[uf][city]["total_allocated"] += total_allocated
                consolidated_data[uf][city]["total_expected"] += total_expected
            
            processed_files_count += 1
            os.remove(file_path)

        except Exception as e:
            print(f"\nErro ao processar o arquivo {filename}: {e}")

    end_time = datetime.now()
    duration = (end_time - start_time).seconds

    return consolidated_data, processed_files_count, duration

def push_to_github():
    try:
        subprocess.check_output(['git', 'add', 'dados.json'])
        unique_id = str(uuid.uuid4())
        message = f"Atualizando dados.json - ID: {unique_id}"
        subprocess.check_output(['git', 'commit', '-m', message])
        subprocess.check_output(['git', 'push', 'origin', 'main'])
        print("\nDados atualizados e enviados ao GitHub com sucesso!")
    except subprocess.CalledProcessError as e:
        print(f"\nErro ao fazer push para o GitHub: {e.output.decode('utf-8')}")

def main():
    folder_path = "/Users/lucasgabriel/Documents/Base_planilha"
    if not os.path.exists(folder_path):
        print("Caminho não encontrado!")
        return

    data, processed_files, duration = process_excel_files(folder_path)

    if not data:
        print("\nOs arquivos .xls ou .xlsx encontrados na pasta fornecida estavam vazios ou ocorreu um erro no processamento.")
        return

    with open('dados.json', 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, default=default)

    print("\nDados consolidados salvos em dados.json.")
    print(f"Total de arquivos processados: {processed_files}")
    print(f"Tempo total de processamento: {duration} segundos")

    push_to_github()

if __name__ == "__main__":
    main()
