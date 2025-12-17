import pandas as pd
from typing import Dict, Any, List
import re
from datetime import datetime

class DataNormalizer:
    @staticmethod
    def normalize_mother_data(df: pd.DataFrame) -> pd.DataFrame:
        # Required columns
        required_cols = ["Data Pedido", "Pedido", "Status do Dia", "Beep do Dia", "Cliente", "Conta", "Zona", "Responsabilidade"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Normalize dates
        df["Data Pedido"] = pd.to_datetime(df["Data Pedido"], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # Fill nulls
        df = df.fillna("N/A")
        
        return df

    @staticmethod
    def normalize_loose_data(df: pd.DataFrame) -> pd.DataFrame:
        # Required columns
        required_cols = ["Bipagem", "criacao", "deveria_ser_entregue", "pacote", "etiqueta", "pedido_marketplace", "Frete", "Vendedor", "Centro de custo", "status_dia", "Nome Comprador", "CEP", "Logradouro", "Número", "Bairro", "Cidade", "Complemento", "data_status_dia", "PREVISÃO DE ENTREGA", "ENTREGA", "SLA", "Prazo", "Atraso"]
        for col in required_cols:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")
        
        # Filter MELI
        df = df[df["Vendedor"].str.contains("meli", case=False, na=False)]
        df = df[df["pedido_marketplace"].str.match(r'^\d+$', na=False)]
        
        # Normalize dates
        date_cols = ["criacao", "deveria_ser_entregue", "data_status_dia", "PREVISÃO DE ENTREGA", "ENTREGA"]
        for col in date_cols:
            df[col] = pd.to_datetime(df[col], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # Normalize CEP
        df["CEP"] = df["CEP"].str.replace(r'\D', '', regex=True)
        
        # Normalize status
        df["status_dia"] = df["status_dia"].str.lower().str.strip()
        
        # Normalize Vendedor
        df["Vendedor"] = df["Vendedor"].str.strip().str.title()
        
        # Fill nulls
        df = df.fillna("N/A")
        
        return df

    @staticmethod
    def merge_data(mother_df: pd.DataFrame, loose_df: pd.DataFrame) -> pd.DataFrame:
        # Left join on Pedido = pedido_marketplace
        merged = mother_df.merge(loose_df, left_on="Pedido", right_on="pedido_marketplace", how="left")
        return merged