const searchForm = document.getElementById("search-form");
const searchButton = document.getElementById("search-btn");
const cityInput = document.getElementById("city");
const weatherCard = document.getElementById("weather");

const weatherTranslations = {
    clearsky_day: "آفتابی",
    clearsky_night: "صاف",
    clear_day: "آفتابی",
    clear_night: "صاف",
    fair: "کمی آفتابی",
    fair_day: "کمی آفتابی",
    fair_night: "کمی ابری",
    partlycloudy: "نیمه‌ابری",
    partlycloudy_day: "نیمه‌ابری",
    partlycloudy_night: "نیمه‌ابری",
    cloudy: "ابری",
    fog: "مه‌آلود",
    fog_light: "مه رقیق",
    rain: "بارانی",
    rainshowers: "رگبار باران",
    rainshowers_day: "رگبار باران",
    rainshowers_night: "رگبار باران",
    heavyrain: "باران شدید",
    lightrain: "باران سبک",
    snow: "برفی",
    snowshowers: "رگبار برف",
    snowshowers_day: "رگبار برف",
    snowshowers_night: "رگبار برف",
    heavysnow: "برف شدید",
    lightsnow: "برف سبک",
    sleet: "باران و برف",
    thunderstorm: "طوفان همراه با رعد و برق"
};

const forecastConditions = {
    0: { label: "آفتابی", icon: "☀️" },
    1: { label: "عمدتاً آفتابی", icon: "🌤️" },
    2: { label: "نیمه‌ابری", icon: "⛅" },
    3: { label: "ابری", icon: "☁️" },
    45: { label: "مه‌آلود", icon: "🌫️" },
    48: { label: "مه یخ‌زده", icon: "🌫️" },
    51: { label: "نم‌نم باران", icon: "🌦️" },
    53: { label: "باران ملایم", icon: "🌦️" },
    55: { label: "باران شدید", icon: "🌧️" },
    56: { label: "باران یخ‌زده", icon: "🌧️" },
    57: { label: "باران یخ‌زده", icon: "🌧️" },
    61: { label: "باران سبک", icon: "🌧️" },
    63: { label: "بارانی", icon: "🌧️" },
    65: { label: "باران شدید", icon: "🌧️" },
    66: { label: "باران یخ‌زده", icon: "🌧️" },
    67: { label: "باران یخ‌زده شدید", icon: "🌧️" },
    71: { label: "برف سبک", icon: "🌨️" },
    73: { label: "برفی", icon: "❄️" },
    75: { label: "برف شدید", icon: "❄️" },
    77: { label: "دانه‌های برف", icon: "❄️" },
    80: { label: "رگبار باران", icon: "🌦️" },
    81: { label: "رگبار باران", icon: "🌧️" },
    82: { label: "رگبار شدید", icon: "🌧️" },
    85: { label: "رگبار برف", icon: "🌨️" },
    86: { label: "رگبار برف شدید", icon: "❄️" },
    95: { label: "رعدوبرق", icon: "⛈️" },
    96: { label: "رعدوبرق و تگرگ", icon: "⛈️" },
    99: { label: "رعدوبرق و تگرگ شدید", icon: "⛈️" }
};

function weatherIconFor(symbol) {
    if (!symbol) return "🌡️";

    if (symbol.includes("thunder")) return "⛈️";
    if (symbol.includes("snow")) return "❄️";
    if (symbol.includes("sleet")) return "🌨️";
    if (symbol.includes("rain")) return "🌧️";
    if (symbol.includes("fog")) return "🌫️";
    if (symbol.includes("cloud")) return "☁️";
    if (symbol.includes("clear") || symbol.includes("sun")) return "☀️";
    if (symbol.includes("fair")) return "🌤️";

    return "🌡️";
}

function showMessage(message) {
    weatherCard.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.className = "status-message";
    paragraph.textContent = message;

    weatherCard.appendChild(paragraph);
}

function addMetric(label, value, icon) {
    const metric = document.createElement("div");
    metric.className = "metric";

    const metricLabel = document.createElement("span");
    metricLabel.className = "metric-label";

    const metricIcon = document.createElement("span");
    metricIcon.className = "metric-icon";
    metricIcon.setAttribute("aria-hidden", "true");
    metricIcon.textContent = icon;

    const labelText = document.createElement("span");
    labelText.textContent = label;

    const metricValue = document.createElement("strong");
    metricValue.className = "metric-value";
    metricValue.textContent = value;

    metricLabel.append(metricIcon, labelText);
    metric.append(metricLabel, metricValue);
    weatherCard.appendChild(metric);
}

function renderForecast(forecast) {
    const section = document.createElement("section");
    section.className = "forecast-section";

    const heading = document.createElement("div");
    heading.className = "forecast-heading";

    const title = document.createElement("h3");
    title.textContent = "پیش‌بینی ۷ روز آینده";

    const subtitle = document.createElement("p");
    subtitle.textContent = "پیش‌بینی روزانه دما و وضعیت هوا";

    heading.append(title, subtitle);
    section.appendChild(heading);

    if (!Array.isArray(forecast) || forecast.length === 0) {
        const unavailable = document.createElement("p");
        unavailable.className = "forecast-unavailable";
        unavailable.textContent = "در حال حاضر پیش‌بینی هفتگی در دسترس نیست.";
        section.appendChild(unavailable);
        weatherCard.appendChild(section);
        return;
    }

    const list = document.createElement("div");
    list.className = "forecast-grid";

    forecast.forEach((day, index) => {
        const card = document.createElement("article");
        card.className = "forecast-day";

        const date = new Date(`${day.date}T12:00:00`);
        const dayName = document.createElement("p");
        dayName.className = "forecast-date";
        dayName.textContent = index === 0
            ? "امروز"
            : new Intl.DateTimeFormat("fa-IR", {
                weekday: "long"
            }).format(date);

        const dateNumber = document.createElement("span");
        dateNumber.className = "forecast-date-number";
        dateNumber.textContent = new Intl.DateTimeFormat("fa-IR", {
            day: "numeric",
            month: "short"
        }).format(date);

        const condition = forecastConditions[day.weather_code] || {
            label: "نامشخص",
            icon: "🌡️"
        };

        const icon = document.createElement("span");
        icon.className = "forecast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = condition.icon;

        const description = document.createElement("p");
        description.className = "forecast-condition";
        description.textContent = condition.label;

        const temperatures = document.createElement("div");
        temperatures.className = "forecast-temperatures";

        const max = document.createElement("strong");
        max.textContent = `${Math.round(day.temperature_max)}°`;

        const min = document.createElement("span");
        min.textContent = `${Math.round(day.temperature_min)}°`;

        temperatures.append(max, min);

        const rain = document.createElement("p");
        rain.className = "forecast-rain";
        rain.textContent = `💧 ${Number(day.precipitation || 0).toLocaleString("fa-IR", {
            maximumFractionDigits: 1
        })} میلی‌متر`;

        card.append(
            dayName,
            dateNumber,
            icon,
            description,
            temperatures,
            rain
        );
        list.appendChild(card);
    });

    section.appendChild(list);
    weatherCard.appendChild(section);
}

function renderWeather(data) {
    weatherCard.replaceChildren();

    const symbol = data["وضعیت هوا"] || "";
    const condition = weatherTranslations[symbol] || "نامشخص";
    const country = data["کشور"] || "کشور نامشخص";
    const city = data["شهر"] || "";

    const overview = document.createElement("div");
    overview.className = "weather-overview";

    const location = document.createElement("div");

    const locationKicker = document.createElement("p");
    locationKicker.className = "location-kicker";
    locationKicker.textContent = `${country} — ${city}`;

    const heading = document.createElement("h2");
    heading.textContent = city;

    const conditionText = document.createElement("p");
    conditionText.className = "weather-condition";
    conditionText.textContent = condition;

    location.append(locationKicker, heading, conditionText);

    const temperatureBlock = document.createElement("div");
    temperatureBlock.className = "temperature-block";

    const weatherSymbol = document.createElement("span");
    weatherSymbol.className = "weather-symbol";
    weatherSymbol.setAttribute("aria-hidden", "true");
    weatherSymbol.textContent = weatherIconFor(symbol);

    const temperature = document.createElement("strong");
    temperature.className = "temperature";
    temperature.textContent = data["دما"] ?? "—";

    const unit = document.createElement("span");
    unit.className = "temperature-unit";
    unit.textContent = "°C";
    temperature.appendChild(unit);

    temperatureBlock.append(weatherSymbol, temperature);
    overview.append(location, temperatureBlock);
    weatherCard.appendChild(overview);

    const metrics = document.createElement("div");
    metrics.className = "metrics-grid";
    weatherCard.appendChild(metrics);

    addMetric("ساعت محلی", data["ساعت محلی"] ?? "—", "🕒");
    addMetric("رطوبت", `${data["رطوبت"] ?? "—"}٪`, "💧");
    addMetric("سرعت باد", `${data["سرعت باد"] ?? "—"} متر بر ثانیه`, "💨");
    addMetric("پوشش ابر", `${data["پوشش ابر"] ?? "—"}٪`, "☁️");
    addMetric("فشار هوا", `${data["فشار هوا"] ?? "—"} هکتوپاسکال`, "◉");
    addMetric("بارش ساعت آینده", `${data["میزان بارش"] ?? "—"} میلی‌متر`, "🌧️");

    renderForecast(data["پیش‌بینی هفتگی"]);
}

async function searchWeather(event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showMessage("لطفاً نام شهر را وارد کنید.");
        cityInput.focus();
        return;
    }

    searchButton.disabled = true;
    showMessage("در حال دریافت اطلاعات آب‌وهوا...");

    try {
        const response = await fetch(
            `/weather/${encodeURIComponent(city)}`
        );

        let data;

        try {
            data = await response.json();
        } catch {
            showMessage("پاسخ سرور قابل خواندن نیست. لطفاً دوباره تلاش کنید.");
            return;
        }

        if (!response.ok) {
            showMessage(
                data.detail ||
                data.error ||
                "دریافت اطلاعات با مشکل مواجه شد."
            );
            return;
        }

        renderWeather(data);

    } catch (error) {
        console.error("Weather search error:", error);

        if (error instanceof TypeError) {
            showMessage(
                "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید."
            );
        } else {
            showMessage("خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید.");
        }

    } finally {
        searchButton.disabled = false;
    }
}

searchForm.addEventListener("submit", searchWeather);
