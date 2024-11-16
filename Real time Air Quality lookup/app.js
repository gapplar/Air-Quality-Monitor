async function fetchAirQuality() {
    const city = document.getElementById("city").value.trim();
    const output = document.getElementById("output");
    output.innerHTML = "Loading...";

    if (!city) {
        output.innerHTML = "<p>Please enter a valid city name.</p>";
        return;
    }

    const API_TOKEN = "4e9816a1b9cd9d16971f9e460cb82f8e7f39f6e6";

    try {
        // Fetch data from AQICN API
        const response = await fetch(`https://api.waqi.info/feed/${city}/?token=${API_TOKEN}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();

        console.log("API Response:", data);

        if (data.status !== "ok") {
            output.innerHTML = "City not found or data unavailable. Please try again.";
            return;
        }

        // Extract necessary data
        const aqi = data.data.aqi;
        const temperature = data.data.iaqi?.t?.v ?? "N/A"; // Temperature in °C
        const time = data.data.time?.s ?? "N/A"; // Time from API

        // Store initial time (in the city's timezone)
        let fullDateTime = "N/A";
        let initialDate = null;
        if (time !== "N/A") {
            initialDate = new Date(time); // Parse the time into a Date object (city's timezone)
            fullDateTime = initialDate.toLocaleString(); // Format it to local time string initially
        }

        // Determine AQI level and alert class
        let aqiLevel = "Unknown";
        let alertClass = "good";

        if (aqi <= 50) {
            aqiLevel = "Good";
            alertClass = "good";
        } else if (aqi <= 100) {
            aqiLevel = "Moderate";
            alertClass = "moderate";
        } else if (aqi <= 150) {
            aqiLevel = "Unhealthy for Sensitive Groups";
            alertClass = "moderate";
        } else if (aqi <= 200) {
            aqiLevel = "Unhealthy";
            alertClass = "unhealthy";
        } else if (aqi <= 300) {
            aqiLevel = "Very Unhealthy";
            alertClass = "unhealthy";
        } else {
            aqiLevel = "Hazardous";
            alertClass = "unhealthy";
        }

        // Display results without time changing every second
        output.innerHTML = `
            <div class="alert ${alertClass}">
                <h2>Air Quality: ${aqiLevel}</h2>
                <p><strong>AQI Index:</strong> ${aqi}</p>
                <p><strong>Temperature:</strong> ${temperature}°C</p>
                <p><strong>Time:</strong> <span id="currentTime">${fullDateTime}</span></p>
            </div>
        `;

        // Update time every second while keeping the hour based on the city's timezone
        setInterval(() => {
            const currentTimeElement = document.getElementById("currentTime");
            if (currentTimeElement && initialDate) {
                const currentDate = new Date(); // Get the current system time for minutes and seconds
                initialDate.setMinutes(currentDate.getMinutes());
                initialDate.setSeconds(currentDate.getSeconds());

                fullDateTime = initialDate.toLocaleString(); // Update time while preserving the timezone-based hour
                currentTimeElement.innerHTML = fullDateTime;
            }
        }, 1000);

    } catch (error) {
        console.error("Error fetching data:", error);
        output.innerHTML = "Error fetching data. Please check your connection or try again.";
    }
}
