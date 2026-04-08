"""
Demo verisi — make seed
Kahramanmaraş koordinatları etrafında (Issue BE2-016)
"""
import asyncio

# Rapor: Kahramanmaraş retroaktif simülasyon (BE2-013)
KAHRAMANMARAS_DAMAGE = [
    (37.5753, 36.9228, "road_blocked"),
    (37.5820, 36.9310, "building_collapse"),
    (37.5689, 36.9150, "road_damaged"),
    (37.5901, 36.9450, "road_blocked"),
    (37.5634, 36.9080, "building_damaged"),
    (37.5780, 36.9380, "debris_pile"),
    (37.5712, 36.9201, "road_damaged"),
    (37.5845, 36.9290, "building_collapse"),
    (37.5670, 36.9170, "road_blocked"),
    (37.5923, 36.9420, "clear"),
]
DEMO_USERS = [
    {"role": "admin",     "email": "admin@aidep.test",    "display_name": "Admin"},
    {"role": "afad",      "email": "afad@aidep.test",     "display_name": "AFAD Koordinatör"},
    {"role": "stk",       "email": "stk@aidep.test",      "display_name": "STK Yönetici"},
    {"role": "volunteer", "email": "vol1@aidep.test",     "display_name": "Gönüllü 1"},
    {"role": "volunteer", "email": "vol2@aidep.test",     "display_name": "Gönüllü 2"},
]
async def seed():
    print(f"{len(DEMO_USERS)} kullanıcı, {len(KAHRAMANMARAS_DAMAGE)} hasar noktası hazır")
    # TODO: DB'ye ekle
if __name__ == "__main__":
    asyncio.run(seed())
