# Firebase JWT doğrulama — Issue BE1-005, BE1-006
# Roller: admin | afad | stk | volunteer | victim
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
bearer = HTTPBearer()
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    raise NotImplementedError("Issue BE1-005")
def require_role(*roles: str):
    async def checker(user=Depends(get_current_user)):
        raise NotImplementedError("Issue BE1-006")
    return checker
