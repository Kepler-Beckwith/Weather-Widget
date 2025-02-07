import config from '../config.json';

interface WeatherData {
    main: {
        temp: number;
        humidity: number;
        feels_like: number;
    };
    weather: Array<{
        description: string;
        icon: string;
    }>;
    wind: {
        speed: number;
    };
    name: string;
}

interface ForecastData {
    list: Array<{
        dt: number;
        main: {
            temp: number;
        };
        weather: Array<{
            icon: string;
            description: string;
        }>;
    }>;
}

class WeatherWidget {
    private apiKey: string = config.weather.apiKey;
    private lat: string = config.weather.location.lat;   
    private lon: string = config.weather.location.lon;  
    private updateInterval: number = 1800000; 

    constructor() {
        console.log('WeatherWidget initialized');
        this.updateAllWeather();
        setInterval(() => this.updateAllWeather(), this.updateInterval);
        
        const refreshButton = document.getElementById('refresh');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.updateAllWeather());
        }
    }

    private celsiusToFahrenheit(celsius: number): number {
        return (celsius * 9/5) + 32;
    }

    private async updateAllWeather(): Promise<void> {
        await Promise.all([
            this.updateWeather(),
            this.updateForecast()
        ]);
    }

    private async updateWeather(): Promise<void> {
        console.log('Fetching weather data...');
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}&units=metric`;
            console.log('Fetching from URL:', url);
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: WeatherData = await response.json();
            console.log('Weather data received:', data);
            
            this.updateUI(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
            this.showError();
        }
    }

    private async updateForecast(): Promise<void> {
        try {
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${this.lat}&lon=${this.lon}&appid=${this.apiKey}&units=metric`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: ForecastData = await response.json();
            this.updateForecastUI(data);
        } catch (error) {
            console.error('Error fetching forecast:', error);
        }
    }

    private showError(): void {
        const elements = {
            location: document.getElementById('location'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            feelsLike: document.getElementById('feels-like'),
            additionalInfo: document.getElementById('additional-info'),
            weatherIcon: document.getElementById('weather-icon') as HTMLImageElement
        };

        if (elements.location) elements.location.textContent = 'Error';
        if (elements.temperature) elements.temperature.textContent = '---';
        if (elements.description) elements.description.textContent = 'Unable to fetch weather';
        if (elements.feelsLike) elements.feelsLike.textContent = '---';
        if (elements.additionalInfo) elements.additionalInfo.textContent = '';
        if (elements.weatherIcon) elements.weatherIcon.style.display = 'none';
    }

    private updateUI(data: WeatherData): void {
        console.log('Updating UI with data');
        const tempF = this.celsiusToFahrenheit(data.main.temp);
        const feelsLikeF = this.celsiusToFahrenheit(data.main.feels_like);
        
        const elements = {
            location: document.getElementById('location'),
            temperature: document.getElementById('temperature'),
            description: document.getElementById('description'),
            feelsLike: document.getElementById('feels-like'),
            additionalInfo: document.getElementById('additional-info'),
            weatherIcon: document.getElementById('weather-icon') as HTMLImageElement
        };

        if (elements.location) {
            elements.location.textContent = data.name;
        }
        if (elements.temperature) {
            elements.temperature.textContent = `${Math.round(tempF)}°F`;
        }
        if (elements.description) {
            elements.description.textContent = data.weather[0].description.charAt(0).toUpperCase() + 
                                            data.weather[0].description.slice(1);
        }
        if (elements.feelsLike) {
            elements.feelsLike.textContent = `${Math.round(feelsLikeF)}°F`;
        }
        if (elements.additionalInfo) {
            elements.additionalInfo.textContent = 
                `Humidity: ${data.main.humidity}% • Wind: ${Math.round(data.wind.speed * 2.237)}mph`;
        }
        if (elements.weatherIcon) {
            elements.weatherIcon.src = 
                `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
            elements.weatherIcon.style.display = 'block';
        }
    }

    private updateForecastUI(data: ForecastData): void {
        const forecastContainer = document.getElementById('forecast');
        if (!forecastContainer) return;

        forecastContainer.innerHTML = '';
        
        data.list.slice(0, 8).forEach(item => {
            const temp = Math.round(this.celsiusToFahrenheit(item.main.temp));
            const time = new Date(item.dt * 1000);
            const hour = time.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            forecastItem.innerHTML = `
                <div class="forecast-time">${hour12}${ampm}</div>
                <img class="forecast-icon" 
                     src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" 
                     alt="${item.weather[0].description}">
                <div class="forecast-temp">${temp}°</div>
            `;
            
            forecastContainer.appendChild(forecastItem);
        });
    }
}

(() => {
    
    window.onload = () => {
        console.log('Window loaded');
        new WeatherWidget();
    };
})();