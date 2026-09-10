const menuToggle = document.querySelector('.menu-toggle');
const siteMenu = document.getElementById('site-menu');
const menuLabel = menuToggle && menuToggle.querySelector('.sr-only');

function setMenuState(isOpen) {
	if (!menuToggle || !siteMenu) return;
	menuToggle.setAttribute('aria-expanded', String(isOpen));
	siteMenu.hidden = !isOpen;
	if (menuLabel) menuLabel.textContent = isOpen ? 'Close menu' : 'Open menu';
}

if (menuToggle && siteMenu) {
	menuToggle.addEventListener('click', function () {
		setMenuState(menuToggle.getAttribute('aria-expanded') !== 'true');
	});

	siteMenu.querySelectorAll('a').forEach(function (link) {
		link.addEventListener('click', function () {
			setMenuState(false);
		});
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') setMenuState(false);
	});
}

const weatherContent = document.getElementById('weather-content');
const weatherLocation = document.getElementById('weather-location');

if (weatherContent && weatherLocation) {
	const weatherConditions = {
		0: ['sun', 'Clear sky'],
		1: ['sun', 'Mostly clear'],
		2: ['cloud-sun', 'Partly cloudy'],
		3: ['cloud', 'Overcast'],
		45: ['fog', 'Foggy'],
		48: ['fog', 'Rime fog'],
		51: ['rain', 'Light drizzle'],
		53: ['rain', 'Drizzle'],
		55: ['rain', 'Heavy drizzle'],
		61: ['rain', 'Light rain'],
		63: ['rain', 'Rain'],
		65: ['rain', 'Heavy rain'],
		71: ['snow', 'Light snow'],
		73: ['snow', 'Snow'],
		75: ['snow', 'Heavy snow'],
		80: ['rain', 'Rain showers'],
		81: ['rain', 'Rain showers'],
		82: ['storm', 'Heavy showers'],
		95: ['storm', 'Thunderstorm'],
		96: ['storm', 'Storm with hail'],
		99: ['storm', 'Storm with hail']
	};

	function weatherIcon(type) {
		const sun = '<circle cx="12" cy="12" r="4" fill="var(--lime)" stroke="var(--orange)" stroke-width="1.2"/><g class="sun-rays" stroke="var(--orange)" stroke-width="1.2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1"/></g>';
		const cloud = '<path class="cloud" d="M5.5 18h11.8a3.7 3.7 0 0 0 .4-7.4A5.5 5.5 0 0 0 7.1 9.5 4.2 4.2 0 0 0 5.5 18Z" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.2" stroke-linejoin="round"/>';
		const rain = '<g class="rain-lines" stroke="var(--blue)" stroke-width="1.5" stroke-linecap="round"><path d="m8 20-1 2M12 20l-1 2M16 20l-1 2"/></g>';
		const snow = '<g class="snow-flakes" stroke="var(--blue)" stroke-width="1.2" stroke-linecap="round"><path d="M8 20v3M6.5 21.5h3M12 20v3M10.5 21.5h3M16 20v3M14.5 21.5h3"/></g>';
		const fog = '<g class="fog-lines" stroke="var(--blue)" stroke-width="1.5" stroke-linecap="round"><path d="M3 19h18M5 22h14"/></g>';
		const storm = '<path d="m13 16-2 4h2l-1 3 4-5h-2l2-4Z" fill="var(--orange)" stroke="var(--ink)" stroke-width=".7" stroke-linejoin="round"/>';
		let content = sun;
		if (type === 'cloud') content = cloud;
		if (type === 'cloud-sun') content = '<g transform="translate(-2 -2) scale(.75)">' + sun + '</g>' + cloud;
		if (type === 'rain') content = cloud + rain;
		if (type === 'snow') content = cloud + snow;
		if (type === 'fog') content = fog;
		if (type === 'storm') content = cloud + rain + storm;
		return '<svg class="weather-svg" viewBox="0 0 24 24" aria-hidden="true">' + content + '</svg>';
	}

	function loadingIcon() {
		return '<svg class="weather-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="var(--line)" stroke-width="2"/><path d="M12 4a8 8 0 0 1 8 8" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" class="sun-rays"/></svg>';
	}

	function locationIcon() {
		return '<svg class="weather-svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="var(--blue)" fill-opacity=".45" stroke="var(--ink)" stroke-width="1.2"/><path d="M4 12h16M12 4c2.2 2.3 2.2 13.7 0 16M12 4c-2.2 2.3-2.2 13.7 0 16" fill="none" stroke="var(--ink)" stroke-width=".9"/></svg>';
	}

	async function getPlaceName(latitude, longitude) {
		const endpoint = 'https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en';
		const response = await fetch(endpoint);
		if (!response.ok) throw new Error('Location lookup failed');
		const data = await response.json();
		const city = data.city || data.locality || data.principalSubdivision;
		const stateCode = data.principalSubdivisionCode && data.principalSubdivisionCode.split('-').pop();
		return city ? city + (stateCode ? ', ' + stateCode : '') : 'Current location';
	}

	const locationCacheKey = 'vmv-weather-location';
	const locationCookieName = 'vmv_weather_location';
	const locationCacheDays = 30;

	function readLocationCache() {
		let rawValue = '';
		const cookie = document.cookie.split('; ').find(function (item) {
			return item.startsWith(locationCookieName + '=');
		});
		if (cookie) rawValue = decodeURIComponent(cookie.split('=').slice(1).join('='));
		if (!rawValue) {
			try {
				rawValue = localStorage.getItem(locationCacheKey) || '';
			} catch (error) {
				rawValue = '';
			}
		}
		if (!rawValue) return null;
		try {
			const cachedLocation = JSON.parse(rawValue);
			const cacheAge = Date.now() - cachedLocation.cachedAt;
			const cacheDuration = locationCacheDays * 24 * 60 * 60 * 1000;
			return Number.isFinite(cachedLocation.latitude) && Number.isFinite(cachedLocation.longitude) && cacheAge >= 0 && cacheAge < cacheDuration ? cachedLocation : null;
		} catch (error) {
			return null;
		}
	}

	function writeLocationCache(location) {
		const value = encodeURIComponent(JSON.stringify(location));
		document.cookie = locationCookieName + '=' + value + '; max-age=' + (locationCacheDays * 24 * 60 * 60) + '; path=/; SameSite=Lax';
		try {
			localStorage.setItem(locationCacheKey, JSON.stringify(location));
		} catch (error) {
			// Some privacy modes block localStorage; the cookie remains the primary cache.
		}
	}

	function clearLocationCache() {
		document.cookie = locationCookieName + '=; max-age=0; path=/; SameSite=Lax';
		try {
			localStorage.removeItem(locationCacheKey);
		} catch (error) {
			// Ignore storage cleanup failures.
		}
	}

	function showWeatherError(message) {
		weatherLocation.textContent = 'Location unavailable';
		weatherContent.innerHTML = '<span class="weather-icon">' + locationIcon() + '</span><p class="weather-status">' + message + ' <button class="weather-retry" type="button">Try again</button></p>';
		weatherContent.querySelector('.weather-retry').addEventListener('click', function () {
			clearLocationCache();
			loadWeather(true);
		});
	}

	async function fetchWeather(latitude, longitude, cachedLocation) {
		const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current=temperature_2m,weather_code&temperature_unit=fahrenheit';
		const response = await fetch(endpoint);
		if (!response.ok) throw new Error('Weather request failed');
		const data = await response.json();
		const condition = weatherConditions[data.current.weather_code] || ['sun', 'Current conditions'];
		let placeName = cachedLocation || 'Current location';
		if (!cachedLocation) {
			try {
				placeName = await getPlaceName(latitude, longitude);
			} catch (error) {
				placeName = 'Current location';
			}
		}
		writeLocationCache({ latitude: latitude, longitude: longitude, placeName: placeName, cachedAt: Date.now() });
		weatherLocation.textContent = placeName;
		weatherContent.innerHTML = '<span class="weather-icon">' + weatherIcon(condition[0]) + '</span><div><div class="weather-temperature">' + Math.round(data.current.temperature_2m) + '°F</div><p class="weather-description">' + condition[1] + '</p></div>';
	}

	async function loadWeather(forceLocation) {
		weatherLocation.textContent = 'Finding your location…';
		weatherContent.innerHTML = '<span class="weather-icon">' + loadingIcon() + '</span><p class="weather-status">Checking…</p>';
		const cachedLocation = forceLocation ? null : readLocationCache();
		if (cachedLocation) {
			try {
				await fetchWeather(cachedLocation.latitude, cachedLocation.longitude, cachedLocation.placeName);
			} catch (error) {
				showWeatherError('Weather is taking a moment.');
			}
			return;
		}
		if (!navigator.geolocation) {
			showWeatherError('Geolocation is not supported here.');
			return;
		}
		navigator.geolocation.getCurrentPosition(async function (position) {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			try {
				await fetchWeather(latitude, longitude);
			} catch (error) {
				showWeatherError('Weather is taking a moment.');
			}
		}, function () {
			showWeatherError('Enable location to see your weather.');
		}, { enableHighAccuracy: false, maximumAge: 0, timeout: 10000 });
	}

	loadWeather();
}
