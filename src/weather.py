
import httpx

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


async def get_current_weather(latitude: float, longitude: float):
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

    return {
        "time": current["time"],
        **current["data"]["instant"]["details"],
    }
