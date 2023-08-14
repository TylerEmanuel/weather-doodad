const locationForm = document.getElementById('location-form')
const zipcodeInput = document.getElementById('zipcode-input')
const zipcodeSubmitBtn = document.getElementById('zipcode-submit')

const weatherLocation = document.getElementById('weather-location')
const currentWeather = document.getElementById('current-weather')
const currentForecast = document.getElementById('current-forecast')
const futureWeather = document.getElementById('future-weather')
const futureForecast = document.getElementById('future-forecast')

let weatherData = {}

function convertUnixDate(unixTimestamp, options) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('en-US', options)
}

function isValidUSZipcode(zip) {
    return /^\d{5}(-\d{4})?$/.test(zip)
}

function hideElement(el) {
    el.classList.add("hide-el")
}

function showElement(el) {
    el.classList.remove("hide-el")
}

function setCurrentForecastHtml() {
    const {dt, humidity, temp, weather: [{icon, main}], wind_speed, uvi} = weatherData.current
    const dateOptions = {month: 'long', day: 'numeric'}

    const weather = {
        date: convertUnixDate(dt, dateOptions),
        temp: Math.floor(temp),
        maxTemp: Math.floor(weatherData.daily[0].temp.max),
        minTemp: Math.floor(weatherData.daily[0].temp.min),
        iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
        desc: main,
        precip: weatherData.daily[0].pop * 100,
        humidity: humidity,
        wind: Math.floor(wind_speed),
        uvi: Math.floor(uvi)
    }

    const currentWeatherHtml = `
        <div class="forecast_container">
            <p class="weather__date weather__date--current">${weather.date}</p>
            
            <div class="weather__main_info weather__main_info--current">
                <p class="weather__temp weather__temp--current">
                    ${weather.temp}
                    <span class="weather__temp_units">°F</span>
                </p>

                <div class="weather__condition">
                    <img class="weather__condition_icon" src=${weather.iconUrl} alt="${weather.desc} icon" />
                    <p class="weather__condition_text">${weather.desc}</p>
                </div>
                
                <div class="weather__outlook">
                    <div class="weather__precip">
                        <img class="weather__precip_icon" src="./images/percip-icon.png" alt="precipitation icon"/>
                        <p class="weather__precip_text">${weather.precip}%</p>
                    </div>

                    <div class="weather__wind">
                        <img class="weather__wind_icon" src="./images/wind-icon.png" alt="wind icon"/>
                        <p class="weather__wind_text">${weather.wind} mph</p>
                    </div>
                </div>
            </div>
            
            <div class="weather__secondary_info">
                <p class="weather__high_temp">High: ${weather.maxTemp}°</p>
                <p class="weather__low_temp">Low: ${weather.minTemp}°</p>
                <p class="weather__humidity">Humidity: ${weather.humidity}%</p>
                <p class="weather__uvi">UV Index: ${weather.uvi} of 10</p>
            </div>
        </div>
    `

    currentForecast.innerHTML = currentWeatherHtml
}

function setFutureForecastHtml() {
    const forecastWeatherHtml = weatherData.daily.map((forecast, index) => {
        const {dt, temp, weather: [{icon, main}], wind_speed} = forecast

        const dateOptions = {weekday: 'short', day: 'numeric'}
        
        const weather = {
            date: convertUnixDate(dt, dateOptions),
            tempMax: Math.floor(temp.max),
            tempMin: Math.floor(temp.min),
            iconUrl: `https://openweathermap.org/img/wn/${icon}@2x.png`,
            desc: main,
            precip: Math.floor(forecast.pop * 100),
            wind: Math.floor(wind_speed)
        }

        const futureWeatherHtml = `
            <div class="forecast_container forecast_container--future">
                <p class="weather__date weather__date--future">${weather.date}</p>

                <div class="weather__main_info weather__main_info--future">
                    <p class="weather__temp weather__temp--future">
                        <span class="weather__temp--max">${weather.tempMax}°</span>
                        <span class="weather__temp--min">/${weather.tempMin}°</span>
                    </p>
                    
                    <div class="weather__condition weather__condition--future">
                        <img class="weather__condition_icon" src=${weather.iconUrl} alt="${weather.desc} icon" />
                        <p class="weather__condition_text">${weather.desc}</span>
                    </div>
                    
                    <div class="weather__outlook weather__outlook--future">
                        <div class="weather__precip">
                            <img class="weather__precip_icon" src="./images/percip-icon.png" alt="precipitation icon"/>
                            <p class="weather__precip_text">${weather.precip}%</p>
                        </div>

                        <div class="weather__wind">
                            <img class="weather__wind_icon" src="./images/wind-icon.png" alt="wind icon"/>
                            <p class="weather__wind_text">${weather.wind} mph</p>
                        </div>
                    </div>
                </div>
            </div>
        `

        if (index > 0) {
            return futureWeatherHtml
        }
    }).join("")

    futureForecast.innerHTML = forecastWeatherHtml
}

async function setWeather(zip) {
    const res = await fetch('/weather/', {
        method: 'POST',
        body: JSON.stringify({
            zipcode: zip
        })
    })
    const data = await res.json()

    weatherData = data.weatherData
    weatherLocation.textContent = data.cityName
    setCurrentForecastHtml()
    setFutureForecastHtml()
}

zipcodeSubmitBtn.addEventListener('click', async (e) => {
    e.preventDefault()

    const zipcode = zipcodeInput.value
    const isValidZipcode = isValidUSZipcode(zipcode)

    if (isValidZipcode) {
        zipcodeSubmitBtn.disabled = true
        hideElement(locationForm)
        showElement(currentWeather)
        showElement(futureWeather)
        await setWeather(zipcode)
    } else {
        zipcodeInput.value = null
        alert("Please enter a valid 5 digit US zipcode")
    }
})
