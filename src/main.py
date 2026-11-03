import logging
import httpx

from zoneinfo import ZoneInfoNotFoundError
from fastapi import FastAPI, Request, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from src.weather import get_coordinates, get_current_weather

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    city = city.strip()

    if not city:
        raise HTTPException(
            status_code=400,
            detail="لطفاً نام شهر را وارد کنید."
        )

    try:
        location = await get_coordinates(city)

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="زمان دریافت اطلاعات شهر به پایان رسید. لطفاً دوباره تلاش کنید."
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="ارتباط با سرویس جستجوی شهر برقرار نشد. اتصال اینترنت خود را بررسی کنید."
        )

    except (httpx.HTTPStatusError, ValueError, KeyError, TypeError):
        logger.exception("Geocoding service error")
        raise HTTPException(
            status_code=502,
            detail="سرویس جستجوی شهر در حال حاضر پاسخ مناسبی نمی‌دهد."
        )

    if location is None:
        raise HTTPException(
            status_code=404,
            detail="شهر موردنظر پیدا نشد. لطفاً نام شهر را بررسی کنید."
        )

    try:
        weather = await get_current_weather(
            location["latitude"],
            location["longitude"],
            location["timezone"],
        )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="دریافت اطلاعات آب‌وهوا بیش از حد طول کشید. لطفاً دوباره تلاش کنید."
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="ارتباط با سرویس هواشناسی برقرار نشد. اتصال اینترنت خود را بررسی کنید."
        )

    except ZoneInfoNotFoundError:
        logger.exception("Invalid timezone returned for city")
        raise HTTPException(
            status_code=502,
            detail="اطلاعات منطقه زمانی این شهر در دسترس نیست."
        )

    except (httpx.HTTPStatusError, ValueError, KeyError, IndexError, TypeError):
        logger.exception("Weather service returned invalid data")
        raise HTTPException(
            status_code=502,
            detail="سرویس هواشناسی در حال حاضر اطلاعات معتبری ارائه نمی‌دهد."
        )

    except Exception:
        logger.exception("Unexpected weather error")
        raise HTTPException(
            status_code=500,
            detail="خطای غیرمنتظره‌ای رخ داد. لطفاً بعداً دوباره تلاش کنید."
        )

    return {
        "شهر": location["name"],
        "کشور": location.get("country", ""),
        "ساعت محلی": weather["local_time"],
        "دما": weather["air_temperature"],
        "رطوبت": weather["relative_humidity"],
        "سرعت باد": weather["wind_speed"],
        "پوشش ابر": weather["cloud_area_fraction"],
        "فشار هوا": weather["air_pressure_at_sea_level"],
        "وضعیت هوا": weather["weather_symbol"],
        "میزان بارش": weather["rain_mm"],
    }
