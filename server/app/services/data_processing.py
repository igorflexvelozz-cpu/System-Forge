from ..utils.data_normalizer import DataNormalizer
from ..services.sla_engine import SLAEngine
from typing import Dict, Any, List
import pandas as pd

class DataProcessingService:
    def __init__(self):
        self.normalizer = DataNormalizer()
        self.sla_engine = SLAEngine()

    async def process_files(self, mother_path: str, loose_path: str) -> List[Dict[str, Any]]:
        mother_df = pd.read_excel(mother_path)
        loose_df = pd.read_excel(loose_path)
        
        mother_df = self.normalizer.normalize_mother_data(mother_df)
        loose_df = self.normalizer.normalize_loose_data(loose_df)
        
        merged_df = self.normalizer.merge_data(mother_df, loose_df)
        
        return merged_df.to_dict('records')

    def calculate_sla(self, record: Dict[str, Any]) -> str:
        return self.sla_engine.calculate_sla(record)