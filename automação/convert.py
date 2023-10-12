import pandas as pd
import os
import json
import numpy as np

def default(o):
    if isinstance(o, np.int64): return int(o)
    raise TypeError

def process_excel_files(folder_path):
    consolidated_data = {}

    for filename in os.listdir(folder_path):
        if filename.endswith(".xls") or filename.endswith(".xlsx"):
            file_path = os.path.join(folder_path, filename)
            try:
                df = pd.read_excel(file_path)
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

            except Exception as e:
                print(f"Erro ao processar o arquivo {filename}: {e}")

    return consolidated_data

def main():
    folder_path = "automação/base_planilha"
    if not os.path.exists(folder_path):
        print("Caminho não encontrado!")
        return
    
    data = process_excel_files(folder_path)
    
    with open('dados.json', 'w', encoding='utf-8') as json_file:
        json.dump(data, json_file, ensure_ascii=False, default=default)

    print("Dados consolidados salvos em dados.json")

if __name__ == "__main__":
    main()
