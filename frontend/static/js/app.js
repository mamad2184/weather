
const searchButton = document.getElementById("search-btn");
const cityInput = document.getElementById("city");
const weatherCard = document.getElementById("weather");

const weatherTranslations = {
    clear_day: "آفتابی",
    clear_night: "صاف",
    fair_day: "کمی آفتابی",
    fair_night: "کمی ابری",
    partlycloudy_day: "نیمه‌ابری",
    partlycloudy_night: "نیمه‌ابری",
    cloudy: "ابری",
    fog: "مه‌آلود",
    fog_light: "مه رقیق",
    rain: "بارانی",
    rainshowers_day: "رگبار باران",
    rainshowers_night: "رگبار باران",
    heavyrain: "باران شدید",
    lightrain: "باران سبک",
    snow: "برفی",
    snowshowers_day: "رگبار برف",
    snowshowers_night: "رگبار برف",
    heavysnow: "برف شدید",
    lightsnow: "برف سبک",
    sleet: "باران و برف",
    thunderstorm: "طوفان همراه با رعد و برق"
};

function showMessage(message) {
    weatherCard.replaceChildren();

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    weatherCard.appendChild(paragraph);
}

function addWeatherRow(label, value) {
    const paragraph = document.createElement("p");
    paragraph.textContent = `${label}: ${value}`;
    weatherCard.appendChild(paragraph);
}

async function searchWeather() {
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
            showMessage(
                "پاسخ سرور قابل خواندن نیست. لطفاً بعداً دوباره تلاش کنید."
            );
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

        const condition =
            weatherTranslations[data["وضعیت هوا"]] || "نامشخص";

        weatherCard.replaceChildren();

        const heading = document.createElement("h2");
        heading.textContent = data["شهر"];
        weatherCard.appendChild(heading);

        addWeatherRow("ساعت محلی", data["ساعت محلی"]);
        addWeatherRow("دما", `${data["دما"]}°C`);
        addWeatherRow("رطوبت", `${data["رطوبت"]}%`);
        addWeatherRow(
            "سرعت باد",
            `${data["سرعت باد"]} متر بر ثانیه`
        );
        addWeatherRow("پوشش ابر", `${data["پوشش ابر"]}%`);
        addWeatherRow(
            "فشار هوا",
            `${data["فشار هوا"]} هکتوپاسکال`
        );
        addWeatherRow("وضعیت هوا", condition);
        addWeatherRow(
            "میزان بارش در ساعت آینده",
            `${data["میزان بارش"]} میلی‌متر`
        );

    } catch (error) {
        console.error("Weather search error:", error);

        if (error instanceof TypeError) {
            showMessage(
                "ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی کنید."
            );
        } else {
            showMessage(
                "خطای غیرمنتظره‌ای رخ داد. لطفاً دوباره تلاش کنید."
            );
        }

    } finally {
        searchButton.disabled = false;
    }
}

searchButton.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});
