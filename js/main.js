/**
 * Created by pila on 08/06/2017.
 */

$('document').ready(function () {
	model.getLocation();
});

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var list = ["clear-day", "clear-night", "partly-cloudy-day", "partly-cloudy-night", "cloudy", "rain", "sleet", "snow", "wind", "fog"];

var model = {

	getLocation: function (city) {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function (location) {
				model.fetchForcastWeatherData(location, city)
				model.fetchCurrentWeatherData(location, city)
			});
		} else {
			console.log('Geolocation is not supported by this browser');
		}
	},
	fetchCurrentWeatherData: function (location) {
		var extension;

		var current_url = 'http://api.openweathermap.org/data/2.5/weather?';

		if (arguments[1] !== undefined) {
			extension = 'q=' + arguments[1];
		} else {
			extension = 'lat=' + location.coords.latitude + '&lon=' + location.coords.longitude;
		}

		current_url = current_url + extension + '&appid=5ec090e12404bc4a962dc2176af41883';

		$.ajax({
			type: 'GET',
			url: current_url,
			success: views.populateCurrentWeatherPanel,
			error: function (xhr, status, error) {},
			cache: false
		});

		// console.log(current_url);

	},

	/**
	 * 
	 * 
	 * @param {object} location 
	 */
	fetchForcastWeatherData: function (location) {
		var extension;

		var forcast_url = 'http://api.openweathermap.org/data/2.5/forecast/daily?';

		if (arguments[1] !== undefined) {
			extension = 'q=' + arguments[1];
		} else {
			extension = 'lat=' + location.coords.latitude + '&lon=' + location.coords.longitude;
		}

		forcast_url = forcast_url + extension + '&appid=5ec090e12404bc4a962dc2176af41883';

		$.ajax({
			type: 'GET',
			url: forcast_url,
			success: views.populateForecastWeatherPanel,
			error: function (xhr, status, error) {
				console.log(error);
			},
			cache: false
		});
		// console.log(forcast_url);
	},

	fetchSearchWeatherData: function (city) {
		//implement Ajax call to search for city
	}
}

var views = {

	processIcons: function () {

	},
	/**
	 * views element that takes in weather data 
	 * and uses it to populate the weather panel
	 * 
	 * @param {object} data 
	 */
	populateCurrentWeatherPanel: function (data) {
		// console.log(data);

		var decorations = utils.getBackgroundAndWeatherIcon(data.weather[0].icon);
		var iconCanvas = '<canvas id="currently-' + decorations.weatherCondition + '" width="128" height="128"></canvas>';

		var currentWeatherPanels = document.getElementById('currentWeatherPanels').childNodes;

		currentWeatherPanels.forEach(function (child) {
			if (child.id == 'cityAndDate') {
				child.innerHTML = '<h1 id="cityAndDate">Current Weather Condition in ' + data.name + '</h1>';
			} else if (child.id == 'weatherPanel') {
				child.querySelector('.panel-body').innerHTML = iconCanvas;
				child.querySelector('.panel-footer').innerHTML = "<span>" + utils.toTitleCase(data.weather[0].description) + '</span>';
			} else if (child.id == 'tempPanel') {
				child.querySelector('.panel-body').innerHTML = '<span id="temperatureValue" class="values-large temp-value">' + data.main.temp + ' &degF</span>';
				var footer = child.querySelector('.panel-footer');

				footer.querySelector('#minTemp').innerHTML = '<span><img src="https://png.icons8.com/minimum-value/ios7/25" title="Minimum Value" width="20" height="20"></span> <span class="values-small temp-value">' + data.main.temp_min + ' &degF</span>';
				footer.querySelector('#maxTemp').innerHTML = '<span><img src="https://png.icons8.com/maximum-value/ios7/25" title="Maximum Value" width="20" height="20"></span> <span class="values-small temp-value">' + data.main.temp_max + ' &degF</span>';
			} else if (child.id == 'windPanel') {
				child.querySelector('.panel-body').querySelector('#windDirection').innerHTML = '<span>Wind Direction<br>' + data.wind.deg + '&deg</span>';
				child.querySelector('.panel-body').querySelector('#windSpeed').innerHTML = '<span>Wind Speed</span><br><span>' + data.wind.speed + '</span>';
				child.querySelector('.panel-footer').innerHTML = '<span><i class="wi wi-wind towards-' + data.wind.deg + '-deg"></i><span>';
				// console.log(child);
			} else if (child.id == 'otherPanel') {
				child.querySelector('.panel-body').querySelector('#humidity').innerHTML = '<span>Humidity<br><i class="wi wi-humidity"></i><br>' + data.main.humidity + '</span>';
				child.querySelector('.panel-body').querySelector('#pressure').innerHTML = '<span>Pressure<br><i class="wi wi-barometer"></i><br>' + data.main.pressure + '</span>';
				child.querySelector('.panel-footer').innerHTML = '<div class="col-xs-6"><span>H</span></div><div class="col-xs-6"><span>P</span></div>';

			}
		});

		var skycons = new Skycons({
			"color": "#cde7f5"
		});

		skycons.set("currently-" + decorations.weatherCondition, decorations.weatherCondition);
		skycons.play();

	},
	/**
	 * method for populating the weather panels of all the forcast days.
	 * 
	 * @param {any} data 
	 */
	populateForecastWeatherPanel: function (data) {
		var accordion = document.getElementById('accordion');

		data.list.forEach(function (dailyData) {
			if (data.list.indexOf(dailyData) !== 0) {

				var dayId = 'Day' + data.list.indexOf(dailyData);
				var card = document.createElement('div');
				card.className = 'card';
				card.appendChild(views.createDayHeading(dailyData, dayId));

				var dailyCollapse = $.parseHTML('<div id="collapse' + dayId + '" class="collapse" role="tabpanel" aria-labelledby="heading' + dayId + '"></div>')[0];

				dailyCollapse.appendChild(views.createWeatherPanel(dailyData, dayId));
				dailyCollapse.appendChild(views.createTempPanel(dailyData, dayId));
				dailyCollapse.appendChild(views.createWindPanel(dailyData, dayId));
				dailyCollapse.appendChild(views.createOtherPanel(dailyData, dayId));

				card.appendChild(dailyCollapse);
				accordion.appendChild(card);
				// console.log(dailyData);
			}
		});

		var skycons = new Skycons({
			"color": "#cde7f5"
		});

		list.forEach(function (weatherType) {
			elements = document.getElementsByClassName(weatherType);
			for (e = elements.length; e--;) {
				skycons.set(elements[e], weatherType);
			}
		});
		skycons.play();
	},

	createDayHeading: function (data, dayId) {

		var day = days[utils.getDate(data.dt).getDay()];
		if (day == days[new Date().getDay() + 1]) {
			day = 'Tomorrow';
		}

		var heading = '<div class="card-header" role="tab" id="heading' + dayId + '">\
			<h5 class="mb-0">\
				<a data-toggle="collapse" data-parent="#accordion" href="#collapse' + dayId + '" aria-expanded="false" aria-controls="collapse' + dayId + '">\
						' + day + '\
				</a>\
			</h5>\
		</div>';

		return $.parseHTML(heading)[0];
	},

	createWeatherPanel: function (data, dayId) {

		var decorations = utils.getBackgroundAndWeatherIcon(data.weather[0].icon);
		var iconCanvas = '<canvas  width="128" height="128" class="' + decorations.weatherCondition + '"></canvas>';
		var weartherPanel = $.parseHTML('<div class="panel panel-info col-xs-12 col-sm-3"><div class="row panel-heading"><h4>The Weather</h4></div><div class="panel-body"></div><div class="row panel-footer">#footer</div></div>')[0];
		// console.log(weartherPanel);

		weartherPanel.querySelector('.panel-body').innerHTML = iconCanvas;
		weartherPanel.querySelector('.panel-footer').innerHTML = "<span>" + utils.toTitleCase(data.weather[0].description) + '</span>';
		return weartherPanel;
	},


	createTempPanel: function (data, dayId) {
		var tempPanel = $.parseHTML('<div class="panel panel-info col-xs-12 col-sm-3">\
                                    <div class="row panel-heading">\
                                        <h4>Temperature</h4>\
                                    </div>\
                                    <div class="panel-body">\
                                    </div>\
                                    <div class="row panel-footer">\
                                        <div id="' + dayId + 'minTemp" class="l col-xs-6"></div>\
                                        <div id="' + dayId + 'maxTemp" class="r col-xs-6"></div>\
                                    </div>\
                                </div>')[0];

		tempPanel.querySelector('.panel-body').innerHTML = '<span>Daily Average</span><br><span id="temperatureValue" class="values-large temp-value">' + utils.getAverageTemp(data.temp.day, data.temp.morn, data.temp.eve, data.temp.night) + ' &degF</span>';
		var footer = tempPanel.querySelector('.panel-footer');

		footer.querySelector('#' + dayId + 'minTemp').innerHTML = '<span><img src="https://png.icons8.com/minimum-value/ios7/25" title="Minimum Value" width="20" height="20"></span> <span class="values-small temp-value">' + data.temp.min + ' &degF</span>';
		footer.querySelector('#' + dayId + 'maxTemp').innerHTML = '<span><img src="https://png.icons8.com/maximum-value/ios7/25" title="Maximum Value" width="20" height="20"></span> <span class="values-small temp-value">' + data.temp.max + ' &degF</span>';

		return tempPanel;
	},

	createWindPanel: function (data, dayId) {
		var windPanel = $.parseHTML('<div class="panel panel-info col-xs-12 col-sm-3" >\
                                    <div class="row panel-heading">\
                                        <h4>Wind</h4>\
                                    </div>\
                                    <div class="row panel-body">\
                                        <div id="' + dayId + 'WindSpeed" class="l col-xs-6"></div>\
                                        <div id="' + dayId + 'WindDirection" class="r col-xs-6"></div>\
                                    </div>\
                                    <div class="row panel-footer">#footer</div>\
                                </div>')[0];

		windPanel.querySelector('.panel-body').querySelector('#' + dayId + 'WindSpeed').innerHTML = '<span>Wind Speed<br>' + data.speed + '&deg</span>';
		windPanel.querySelector('.panel-body').querySelector('#' + dayId + 'WindDirection').innerHTML = '<span>Wind Direction</span><br><span>' + data.deg + '</span>';
		windPanel.querySelector('.panel-footer').innerHTML = '<span><i class="wi wi-wind towards-' + data.deg + '-deg"></i><span>';

		return windPanel;
	},
	createOtherPanel: function (data, dayId) {
		var otherPanel = $.parseHTML('<div class="panel panel-info col-xs-12 col-sm-3" >\
                                    <div class="row panel-heading">\
                                        <h4>Other Info</h4>\
                                    </div>\
                                    <div class="row panel-body">\
                                        <div id="' + dayId + 'Humidity" class="l col-xs-6"></div>\
                                        <div id="' + dayId + 'Pressure" class="r col-xs-6"></div>\
                                    </div>\
                                    <div class="row panel-footer">#footer</div>\
                                </div>')[0];


		otherPanel.querySelector('.panel-body').querySelector('#' + dayId + 'Humidity').innerHTML = '<span>Humidity<br><i class="wi wi-humidity"></i><br>' + data.humidity + '</span>';
		otherPanel.querySelector('.panel-body').querySelector('#' + dayId + 'Pressure').innerHTML = '<span>Pressure<br><i class="wi wi-barometer"></i><br>' + data.pressure + '</span>';
		otherPanel.querySelector('.panel-footer').innerHTML = '<div class="l col-xs-6"><span>H</span></div><div class="r col-xs-6"><span>P</span></div>';

		return otherPanel;
	}


}

var utils = {
	getDate: function (utcDate) {
		return new Date(utcDate * 1000);
	},
	getAverageTemp: function () {

		var arguments = Object.values(arguments);
		var sum = arguments.reduce(function (acc, b) {
			return acc += b;
		});
		return (sum / arguments.length).toFixed(2);
	},

	toTitleCase: function (str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	},
	getBackgroundAndWeatherIcon: function (iconCode) {
		// console.log(iconCode);
		var canvas,
			weatherCondition,
			backgroundImage;

		switch (iconCode) {
			case '01d':
				weatherCondition = 'clear-day';
				break;
			case '02d':
				weatherCondition = 'partly-cloudy-day';
				break;
			case '03d':
			case '04d':
			case '03n':
			case '04n':
				weatherCondition = 'cloudy';
				break;
			case '09d':
			case '09n':
				weatherCondition = 'sleet';
				break;
			case '10d':
			case '11d':
			case '10n':
			case '11n':
				weatherCondition = 'rain';
				break;
			case '13d':
			case '13n':
				weatherCondition = 'snow';
				break;
			case '50d':
			case '50n':
				weatherCondition = 'fog';
				break;
			case '01n':
				weatherCondition = 'clear-night';
				break;
			case '02n':
				weatherCondition = 'partly-cloudy-night';
				break;
		}

		return {
			'weatherCondition': weatherCondition,
			'backgroundImage': backgroundImage
		}
	}
}