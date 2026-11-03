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
