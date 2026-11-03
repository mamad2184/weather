
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
