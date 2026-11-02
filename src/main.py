from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi import Request
from fastapi import FastAPI
from src.weather import get_coordinates, get_current_weather

app = FastAPI(title="Weather API")

app.mount("/static", StaticFiles(directory="frontend/static"), name="static")
templates = Jinja2Templates(directory="frontend/templates")

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
    )

@app.get("/weather/{city}")
async def get_weather(city: str):
    location = await get_coordinates(city)

    if location is None:
        return {"error": "City not found"}

    weather = await get_current_weather(
        location["latitude"],
        location["longitude"],
    )

    return {
        "شهر": location["name"],
        "دما": weather["air_temperature"],
        "رطوبت": weather["relative_humidity"],
        "سرعت باد": weather["wind_speed"],
        "پوشش ابر": weather["cloud_area_fraction"],
        "فشار هوا": weather["air_pressure_at_sea_level"],
    }