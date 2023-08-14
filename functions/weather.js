import fetch from 'node-fetch'

const key = process.env.API_KEY

async function getLocationByZipcode(zip) {
    const url = `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},US&appid=${key}`
    const res = await fetch(url)
    const data = await res.json()
    return {latitude: data.lat, longitude: data.lon}
}

async function getCityName(locationObj) {
    const reverseGeolocationUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${locationObj.latitude}&lon=${locationObj.longitude}&limit=1&appid=${key}`
    const res = await fetch(reverseGeolocationUrl)
    const data = await res.json()
    const cityName = data[0].name
    return cityName
}

async function getWeatherData(locationObj) {
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${locationObj.latitude}&lon=${locationObj.longitude}&units=imperial&exclude={current,minutely,alerts}&appid=${key}`
    const res = await fetch(url)
    const data = await res.json()
    return data
}

export const handler = async (event, context) => {
    const eventBody = JSON.parse(event.body)
    const zipcode = JSON.parse(eventBody.zipcode)


    const location = await getLocationByZipcode(zipcode)
    const cityName = await getCityName(location)
    const weatherData = await getWeatherData(location)

    return {
        statusCode: 200,
        body: JSON.stringify({location, cityName, weatherData})
    }
}