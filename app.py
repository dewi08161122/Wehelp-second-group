from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
app=FastAPI()

from controllers.airquality import router as airquality_router

app.include_router(airquality_router)

@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/city/{city}", include_in_schema=False)
async def city(request: Request, city: str):
	return FileResponse("./static/city.html", media_type="text/html")

app.mount("/css", StaticFiles(directory="public/css"), name="css")
app.mount("/js", StaticFiles(directory="public/javascript"), name="js")
app.mount("/img", StaticFiles(directory="public/image"), name="img")
app.mount("/", StaticFiles(directory="static", html=True))