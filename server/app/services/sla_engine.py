from typing import Dict, Any
from datetime import datetime

class SLAEngine:
    @staticmethod
    def calculate_sla(record: Dict[str, Any]) -> str:
        previsao = record.get("PREVISÃO DE ENTREGA")
        entrega = record.get("ENTREGA")
        prazo = record.get("Prazo")
        
        if not previsao or not entrega:
            return "Não entregue"
        
        try:
            previsao_date = datetime.fromisoformat(previsao)
            entrega_date = datetime.fromisoformat(entrega)
            prazo_days = int(prazo) if prazo else 0
        except:
            return "Dados inválidos"
        
        if entrega_date <= previsao_date:
            return "Dentro do prazo"
        elif entrega_date > previsao_date:
            return "Entregue com atraso"
        else:
            return "Fora do prazo"