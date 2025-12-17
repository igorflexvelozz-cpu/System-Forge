from typing import List, Dict, Any
import pandas as pd

class AnalyticsEngine:
    @staticmethod
    def calculate_global_kpis(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        df = pd.DataFrame(data)
        total = len(df)
        on_time = len(df[df["sla_calculated"] == "Dentro do prazo"])
        sla_percentage = (on_time / total * 100) if total > 0 else 0
        return {
            "total_orders": total,
            "on_time": on_time,
            "late": total - on_time,
            "sla_percentage": sla_percentage
        }

    @staticmethod
    def calculate_sla_by_group(data: List[Dict[str, Any]], group_by: str) -> List[Dict[str, Any]]:
        df = pd.DataFrame(data)
        grouped = df.groupby(group_by).agg(
            total=('sla_calculated', 'count'),
            on_time=('sla_calculated', lambda x: (x == "Dentro do prazo").sum())
        ).reset_index()
        grouped["sla_percentage"] = (grouped["on_time"] / grouped["total"] * 100).round(2)
        return grouped.to_dict('records')

    @staticmethod
    def calculate_delays(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        df = pd.DataFrame(data)
        delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])]
        total_delays = len(delays)
        avg_delay = delays["Atraso"].astype(float).mean() if "Atraso" in delays.columns else 0
        return {
            "total_delays": total_delays,
            "average_delay_days": avg_delay
        }

    @staticmethod
    def generate_rankings(data: List[Dict[str, Any]]) -> Dict[str, Any]:
        df = pd.DataFrame(data)
        
        # Sellers with most delays
        seller_delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Vendedor").size().reset_index(name="delays")
        seller_volume = df.groupby("Vendedor").size().reset_index(name="volume")
        seller_sla = AnalyticsEngine.calculate_sla_by_group(data, "Vendedor")
        seller_rank = seller_delays.merge(seller_volume, on="Vendedor", how="left").merge(pd.DataFrame(seller_sla), left_on="Vendedor", right_on="Vendedor", how="left")
        seller_rank["sla_percentage"] = seller_rank["sla_percentage"].fillna(0)
        seller_rank["delays"] = seller_rank["delays"].fillna(0)
        sellers_most_delays = seller_rank.nlargest(10, "delays")[["Vendedor", "volume", "delays", "sla_percentage"]].to_dict('records')
        
        # Zones with most delays
        zone_delays = df[df["sla_calculated"].isin(["Entregue com atraso", "Fora do prazo"])].groupby("Zona").size().reset_index(name="delays")
        zone_volume = df.groupby("Zona").size().reset_index(name="volume")
        zone_sla = AnalyticsEngine.calculate_sla_by_group(data, "Zona")
        zone_rank = zone_delays.merge(zone_volume, on="Zona", how="left").merge(pd.DataFrame(zone_sla), left_on="Zona", right_on="Zona", how="left")
        zone_rank["sla_percentage"] = zone_rank["sla_percentage"].fillna(0)
        zone_rank["delays"] = zone_rank["delays"].fillna(0)
        zones_most_delays = zone_rank.nlargest(10, "delays")[["Zona", "volume", "delays", "sla_percentage"]].to_dict('records')
        
        # Sellers with highest volume
        sellers_highest_volume = seller_volume.merge(seller_delays, on="Vendedor", how="left").merge(pd.DataFrame(seller_sla), left_on="Vendedor", right_on="Vendedor", how="left")
        sellers_highest_volume["sla_percentage"] = sellers_highest_volume["sla_percentage"].fillna(0)
        sellers_highest_volume["delays"] = sellers_highest_volume["delays"].fillna(0)
        sellers_highest_volume = sellers_highest_volume.nlargest(10, "volume")[["Vendedor", "volume", "delays", "sla_percentage"]].to_dict('records')
        
        return {
            "sellers_most_delays": sellers_most_delays,
            "zones_most_delays": zones_most_delays,
            "sellers_highest_volume": sellers_highest_volume
        }