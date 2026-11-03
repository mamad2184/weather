import httpx
from datetime import datetime
from zoneinfo import ZoneInfo


async def get_coordinates(city: str):
    url = "https://geocoding-api.open-meteo.com/v1/search"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={"name": city, "count": 1, "language": "fa"},
        )
        response.raise_for_status()
        data = response.json()

    if not data.get("results"):
        return None

    return data["results"][0]


async def get_current_weather(
    latitude: float,
    longitude: float,
    timezone_name: str,
):
    url = "https://api.met.no/weatherapi/locationforecast/2.0/compact"

    headers = {
        "User-Agent": "WeatherProject/1.0 (contact: m.test.test@gmail.com)"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params={
                "lat": round(latitude, 4),
                "lon": round(longitude, 4),
            },
            headers=headers,
        )
        response.raise_for_status()
        data = response.json()

    current = data["properties"]["timeseries"][0]

    details = current["data"]["instant"]["details"]

    next_hour = current["data"].get("next_1_hours", {})
    summary = next_hour.get("summary", {})

    local_time = datetime.now(
        ZoneInfo(timezone_name)
    ).strftime("%H:%M")

    return {
        "time": current["time"],
        "local_time": local_time,
        **details,
        "weather_symbol": summary.get("symbol_code"),
        "rain_mm": next_hour.get("details", {}).get(
            "precipitation_amount", 0
        ),
    }


async def get_weekly_forecast(
    latitude: float,
    longitude: float,
    timezone_name: str,
):
    """Return a seven-day daily forecast from Open-Meteo."""
    url = "https://api.open-meteo.com/v1/forecast"

    params = {
        "latitude": latitude,
        "longitude": longitude,
        "daily": (
            "weather_code,"
            "temperature_2m_max,"
            "temperature_2m_min,"
            "precipitation_sum"
        ),
        "timezone": timezone_name,
        "forecast_days": 7,
        "temperature_unit": "celsius",
        "precipitation_unit": "mm",
    }

    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    daily = data["daily"]
    forecast = []

    for index, forecast_date in enumerate(daily["time"]):
        forecast.append({
            "date": forecast_date,
            "weather_code": daily["weather_code"][index],
            "temperature_max": daily["temperature_2m_max"][index],
            "temperature_min": daily["temperature_2m_min"][index],
            "precipitation": daily["precipitation_sum"][index],
        })

    return forecast
