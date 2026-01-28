import os 
from dotenv import load_dotenv
import requests

load_dotenv()
API_KEY = os.getenv("API_KEY")
url="https://data.moenv.gov.tw/api/v2"


def get_AQI_by_gov(county:str = None):
    
    AQI_url = f"{url}/aqx_p_432"
    query_params = {
            "format": "json",
            "api_key": API_KEY,
        }
    if county:
        query_params["filters"] = f"county,EQ,{county}"
    try:
        response = requests.get(AQI_url, params=query_params, verify=False)
        data = response.json()
        cleandata=[]
        for i in data:
            newdata={
                "city":i["county"],
                "location":i["sitename"],
                    "airquality":{
                        "AQI":i["aqi"],
                        "status":i["status"],
                        "pm2.5":i["pm2.5"],
                        "pm2.5_avg":i["pm2.5_avg"],
                        "pm10":i["pm10"],
                        "pm10_avg":i["pm10_avg"],
                        "o3":i["o3"],
                        "o3_8hr":i["o3_8hr"],
                        "co":i["co"],
                        "co_8hr":i["co_8hr"],
                        "so2":i["so2"],
                        "no2":i["no2"]
                    },
                "time":i["publishtime"]
            }
            cleandata.append(newdata)
        return cleandata
    except Exception as e:
        print(e)
        return {"error": True, "msg": "與環境部連線失敗"}
