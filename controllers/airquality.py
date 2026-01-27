from fastapi import APIRouter, Query
from infrastructure.airtwgov import get_AQI_by_gov

router = APIRouter()

@router.get("/api/airquality")
def getAirquality(county:str = Query(None)):
    try:
        airquality = get_AQI_by_gov(county)
        if airquality is None: 
            return {"error": True, "message": "無法取得資料"}
        return airquality
    except Exception as e:
        print(e)
        return{"error":True,"message":"伺服器內部錯誤"}