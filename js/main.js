/**
 * Created by pila on 08/06/2017.
 */

$('document').ready(function () {

	// Get weather information when my Location is clicked
	$('#myLocation').click(function () {
		var errorAlert = $('#errorAlert');
		errorAlert.addClass('hidden');
		model.getLocation();
	});

	$(':checkbox').change(function () {
		// this will contain a reference to the checkbox   
		if (this.checked) {
			views.changeTempValues('C');
		} else {
			views.changeTempValues('F');
		}
	});

	handlers.searchCity();
	model.getLocation();
});

var errorAlert = $('#errorAlert');
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

		current_url = current_url + extension + '&appid=5ec090e12404bc4a962dc2176af41883&units=imperial';

		$.ajax({
			type: 'GET',
			url: current_url,
			success: views.populateCurrentWeatherPanel,
			error: function (xhr, status, error) {
				handlers.ajaxErrorHandler(xhr, status, error)
			},
			cache: false
		});
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

		forcast_url = forcast_url + extension + '&appid=5ec090e12404bc4a962dc2176af41883&units=imperial';

		$.ajax({
			type: 'GET',
			url: forcast_url,
			success: views.populateForecastWeatherPanel,
			error: function (xhr, status, error) {
				// handlers.ajaxErrorHandler(xhr, status, error)
			},
			cache: false
		});
	},

	fetchSearchWeatherData: function (city) {
		//implement Ajax call to search for city
	}
}

var views = {

	changeTempValues: function (from) {
		var tempValues = $('.temp-value');
		var tempValue;
		if (from === 'F') {
			Object.values(tempValues).forEach(function (temp) {
				if (temp.innerText !== undefined) {
					tempValue = parseFloat(temp.innerText.split(' ')[0])
					temp.innerHTML = utils.convertTemp(tempValue, from) + ' &degC';
				}
			});
		} else {
			Object.values(tempValues).forEach(function (temp) {
				if (temp.innerText !== undefined) {
					tempValue = parseFloat(temp.innerText.split(' ')[0])
					temp.innerHTML = utils.convertTemp(tempValue, from) + ' &degF';
				}
			});
		}
	},

	displayError: function (errorMessage) {
		errorAlert.html(' <strong>Oh snap!</strong> ' + errorMessage);
		errorAlert.removeClass('hidden');

		// errorAlert.parentElement.
	},
	/**
	 * views element that takes in weather data 
	 * and uses it to populate the weather panel
	 * 
	 * @param {object} data 
	 */
	populateCurrentWeatherPanel: function (data) {

		var decorations = utils.getBackgroundAndWeatherIcon(data.weather[0].icon);
		var iconCanvas = '<canvas id="currently-' + decorations.weatherCondition + '" width="128" height="128"></canvas>';

		var currentWeatherPanels = document.getElementById('currentWeatherPanels').childNodes;

		currentWeatherPanels.forEach(function (child) {
			if (child.id == 'cityAndDate') {
				child.innerHTML = '<h1 id="cityAndDate">Current Weather Condition in ' + data.name + '</h1>';
			} else if (child.id == 'weatherPanel') {
				child.querySelector('.panel-body').innerHTML = iconCanvas;
				child.querySelector('.panel-footer').innerHTML = "<span><strong>" + utils.toTitleCase(data.weather[0].description) + '</strong></span>';
			} else if (child.id == 'tempPanel') {
				child.querySelector('.panel-body').innerHTML = '<span class="values-large temp-value">' + parseInt(data.main.temp) + ' &degF</span>';
				var footer = child.querySelector('.panel-footer');

				footer.querySelector('#minTemp').innerHTML = '<i class="fa fa-arrow-down fa-2x" aria-hidden="true"></i> <span class="values-small temp-value">' + parseInt(data.main.temp_min) + ' &degF</span>';
				footer.querySelector('#maxTemp').innerHTML = '<i class="fa fa-arrow-up fa-2x" aria-hidden="true"></i> <span class="values-small temp-value">' + parseInt(data.main.temp_max) + ' &degF</span>';
			} else if (child.id == 'windPanel') {
				child.querySelector('.panel-body').querySelector('#windDirection').innerHTML = '<span><strong>Wind Direction</strong><br><br></span><span class="values-medium">' + parseInt(data.wind.deg) + '&deg</span>';
				child.querySelector('.panel-body').querySelector('#windSpeed').innerHTML = '<span><strong>Wind Speed</strong></span><br><br><span class="values-medium">' + data.wind.speed + '</span>';
				child.querySelector('.panel-footer').innerHTML = '<span><i class="wi wi-wind towards-' + parseInt(data.wind.deg) + '-deg"></i><span><br>';
			} else if (child.id == 'otherPanel') {
				child.querySelector('.panel-body').querySelector('#humidity').innerHTML = '<span><strong>Humidity</strong><br><br><i class="wi wi-humidity"></i><br><br></span><span class="values-small">' + data.main.humidity + ' %</span>';
				child.querySelector('.panel-body').querySelector('#pressure').innerHTML = '<span><strong>Pressure</strong><br><br><i class="wi wi-barometer"></i><br><br></span><span class="values-small">' + data.main.pressure + ' hPa</span>';
				// child.querySelector('.panel-footer').innerHTML = '<div class="col-xs-6"><span>H</span></div><div class="col-xs-6"><span>P</span></div>';

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
		accordion.innerHTML = ''; // Clear all the children of the accordion before appending new ones

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
				<div data-toggle="collapse" data-parent="#accordion" href="#collapse' + dayId + '" aria-expanded="false" aria-controls="collapse' + dayId + '">\
						' + day + '\
				</div>\
		</div>';

		return $.parseHTML(heading)[0];
	},

	createWeatherPanel: function (data, dayId) {

		var decorations = utils.getBackgroundAndWeatherIcon(data.weather[0].icon);
		var iconCanvas = '<canvas  width="128" height="128" class="' + decorations.weatherCondition + '"></canvas>';
		var weartherPanel = $.parseHTML('<div class="panel panel-info col-xs-12 col-sm-3"><div class="row panel-heading"><h4>The Weather</h4></div><div class="panel-body"></div><div class="row panel-footer">#footer</div></div>')[0];

		weartherPanel.querySelector('.panel-body').innerHTML = iconCanvas;
		weartherPanel.querySelector('.panel-footer').innerHTML = "<span><strong>" + utils.toTitleCase(data.weather[0].description) + '</strong></span>';
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

		tempPanel.querySelector('.panel-body').innerHTML = '<span><strong>Daily Average</strong></span><br><span class="values-large temp-value">' + utils.getAverageTemp(data.temp.day, data.temp.morn, data.temp.eve, data.temp.night) + ' &degF</span>';
		var footer = tempPanel.querySelector('.panel-footer');

		footer.querySelector('#' + dayId + 'minTemp').innerHTML = '<i class="fa fa-arrow-down fa-2x" aria-hidden="true"></i> <span class="values-small temp-value">' + parseInt(data.temp.min) + ' &degF</span>';
		footer.querySelector('#' + dayId + 'maxTemp').innerHTML = '<i class="fa fa-arrow-up fa-2x" aria-hidden="true"></i> <span class="values-small temp-value">' + parseInt(data.temp.max) + ' &degF</span>';

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

		windPanel.querySelector('.panel-body').querySelector('#' + dayId + 'WindSpeed').innerHTML = '<span><strong>Wind Speed</strong><br><br></span><span class="values-medium">' + data.speed + ' mPH</span>';
		windPanel.querySelector('.panel-body').querySelector('#' + dayId + 'WindDirection').innerHTML = '<span><strong>Wind Direction</strong></span><br><br><span class="values-medium">' + data.deg + '&deg</span>';
		windPanel.querySelector('.panel-footer').innerHTML = '<span><i class="wi wi-wind towards-' + data.deg + '-deg"></i><span><br>';

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
                                </div>')[0];


		otherPanel.querySelector('.panel-body').querySelector('#' + dayId + 'Humidity').innerHTML = '<span><strong>Humidity</strong><br><br><i class="wi wi-humidity"></i><br><br></span><span class="values-small">' + data.humidity + '%</span>';
		otherPanel.querySelector('.panel-body').querySelector('#' + dayId + 'Pressure').innerHTML = '<span><strong>Pressure</strong><br><br><i class="wi wi-barometer"></i><br><br></span><span class="values-small">' + data.pressure + 'hPa</span>';
		// otherPanel.querySelector('.panel-footer').innerHTML = '<div class="l col-xs-6"><span>H</span></div><div class="r col-xs-6"><span>P</span></div>';

		return otherPanel;
	}


}

var handlers = {
	searchCity: function () {
		var searchField = document.getElementById('search');

		searchField.onkeydown = function (event) {
			if (event.keyCode === 13) {
				var searchTerm = searchField.value.trim();

				if (searchTerm.length < 1) {
					views.displayError(' Come on... You can\'t search for \'void\', now can you?');
				} else {
					errorAlert.addClass('hidden');

					model.getLocation(searchTerm)
					searchField.value = '';
				}
			}
		};

	},

	ajaxErrorHandler: function (xhr, status, error) {
		var msg;
		if (xhr.status === 0) {
			msg = 'Internet connectivity is what makes all of these possible. You don\'t seem to have one';
		} else if (xhr.status == 404) {
			msg = 'Lol... Such a place doesn\'t seem to be existing yet';
		} else if (xhr.status == 500) {
			msg = 'Oh mehn, something seems to have gone wrong on our end';
		} else if (exception === 'parsererror') {
			msg = 'I couldn\'t make sense of the data these people sent me. Signed: browser.';
		} else if (exception === 'timeout') {
			msg = 'I opened my doors for the server but he took too long to respond. Time is out!';
		} else if (exception === 'abort') {
			msg = 'Damn, I was doing some work here!';
		} else {
			msg = 'I don\'t know what happened but Something went wrong: ' + xhr.responseJSON.message;
		}
		views.displayError(msg);
	}
}

var utils = {
	convertTemp: function(value, from) {
		if (from === 'F') {
			return parseInt((parseFloat(value) - 32) * (5 / 9));
		} else {
			return parseInt((parseFloat(value) * (9 / 5)) + 32);
		}
	},
	getDate: function (utcDate) {
		return new Date(utcDate * 1000);
	},

	getAverageTemp: function () {

		var arguments = Object.values(arguments);
		var sum = arguments.reduce(function (acc, b) {
			return acc += b;
		});
		return parseInt(sum / arguments.length);
	},

	toTitleCase: function (str) {
		return str.replace(/\w\S*/g, function (txt) {
			return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
		});
	},
	getBackgroundAndWeatherIcon: function (iconCode) {
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