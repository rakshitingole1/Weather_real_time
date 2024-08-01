import { config } from "dotenv";
config({path:"./config.env"});
import http from 'http';
import fs from 'fs';
import requests from 'requests';



const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const fetchWeatherData = (city) => {
  return new Promise((resolve, reject) => {
    const { APPID } = process.env;
    requests(`http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${APPID}`)
      .on("data", chunk => resolve(JSON.parse(chunk)))
      .on("end", err => {
        if (err) reject(`Connection closed due to errors: ${err}`);
      });
  });
};

const server = http.createServer(async (req, res) => {
  if (req.url === "/") {
    try {
      const weatherData = await fetchWeatherData("Pune");
      const realTimeData = replaceVal(homeFile, weatherData);
      res.write(realTimeData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
      res.end("Error fetching weather data");
    } finally {
      res.end();
    }
  } else {
    res.end("File not found");
  }
});

server.listen(process.env.PORT, "127.0.0.1", () => {
  console.log("Server is running at http://127.0.0.1:8000");
});
