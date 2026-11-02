const searchButton = document.getElementById("search-btn");
const cityInput = document.getElementById("city");
const weatherCard = document.getElementById("weather");

async function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        weatherCard.textContent = "لطفاً نام شهر را وارد کنید.";
        return;
    }

    weatherCard.textContent = "در حال دریافت اطلاعات...";

    try {
        const response = await fetch(`/weather/${encodeURIComponent(city)}`);
        const data = await response.json();

        if (!response.ok || data.error) {
            weatherCard.textContent = "شهر پیدا نشد.";
            return;
        }

        weatherCard.innerHTML = `
            <h2>${data["شهر"]}</h2>
            <p>دما: ${data["دما"]}°C</p>
            <p>رطوبت: ${data["رطوبت"]}%</p>
            <p>سرعت باد: ${data["سرعت باد"]} m/s</p>
            <p>پوشش ابر: ${data["پوشش ابر"]}%</p>
            <p>فشار هوا: ${data["فشار هوا"]} hPa</p>
        `;
    } catch (error) {
        weatherCard.textContent = "خطا در دریافت اطلاعات هواشناسی.";
    }
}

searchButton.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});