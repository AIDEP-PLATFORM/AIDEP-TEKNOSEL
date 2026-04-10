# Bu dosya Redis'e nasıl bağlanacağımızı ve bağlantıyı nasıl yöneteceğimizi tanımlıyor.
import redis.asyncio as aioredis # Redis'in asenkron versiyonu. FastAPI async çalıştığı için Redis bağlantısı da async olmalı, yoksa uygulamayı bloke eder.

from app.core.config import settings


_redis_client: aioredis.Redis | None = None # Redis bağlantısını tutan global değişken. Başlangıçta None, ilk kullanımda oluşturulacak. _ ile başlaması "bu dosya dışında kullanma" anlamına gelen bir Python geleneği.


async def get_redis_client() -> aioredis.Redis:
    global _redis_client # Fonksiyon içinden global değişkeni değiştireceğimizi belirtiyoruz

    if _redis_client is None: # Bağlantı daha önce kurulmadıysa kur. Bu Singleton pattern'i — uygulama boyunca tek bir Redis bağlantısı olur, her seferinde yeni bağlantı açılmaz
        _redis_client = aioredis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,  # Redis normalde bytes döner, bu ayar onu otomatik string'e çevirir. Yoksa her değeri elle decode etmek zorunda kalırsın
            max_connections=20,
        )

    return _redis_client


async def close_redis_client() -> None:
    global _redis_client

    if _redis_client is not None: # Zaten kapalıysa tekrar kapatmaya çalışma
        await _redis_client.aclose() # Bağlantıyı düzgünce kapat, kaynakları serbest bırak
        _redis_client = None #  Değişkeni sıfırla, gerekirse tekrar get_redis_client ile yeniden açılabilsin
