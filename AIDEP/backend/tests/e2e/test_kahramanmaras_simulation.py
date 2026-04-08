"""
Kahramanmaraş Retroaktif Simülasyon — Issue BE2-013
Hedef: riskli segment %60 → %10 altı
10 rota çifti, Geleneksel vs AIDEP karşılaştırması
"""
import pytest, json, os

def load_data():
    p = os.path.join(os.path.dirname(__file__), "../../app/data/kahramanmaras_damage.json")
    return json.load(open(p))

@pytest.mark.asyncio
async def test_route_comparison():
    pytest.skip("Kahramanmaraş verisi hazırlanınca aktif et — Issue BE2-013")
