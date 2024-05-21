$(window).on('load', function () {
	if ($('#preloader').length) {
		('#preloader').delay(1000).fadeOut('slow', function () {
			$(this).remove();
		});
	}
});

// get Data From Latitude And Longitude
$('#getDataFromLatAndLng').submit(function (e) {
	e.preventDefault();
	let inputLat = $('#lat').val();
	let inputLng = $('#lng').val();
	// no empty inputs
	if (inputLat === "" || inputLng === "") {
		alert("empty coordinate field(s)");
		return;
	}
	let numLat = Number(inputLat);
	let numLng = Number(inputLng);
	// no non-numeric
	if (isNaN(numLat) || isNaN(numLng)) {
		alert("non-numeric value(s)");
		return;
	}
	// no out of range
	if (numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
		console.log(-90 < numLat, numLat > 90, -180 < numLng, numLng > 180);
		alert("invalid coordinates");
		return;
	}

	// ELEVATION
	$.ajax({
		url: "libs/php/getElevationData.php",
		type: 'GET',
		dataType: 'json',		// will send request to JSON endpoint anyway but can set different format if one is available/required
		data: {
			lat: numLat,
			lng: numLng
		},

		success: function (result) {

			if (result.status.name == "ok") {
				if (result['data']['srtm1'] === -32768) {
					$('#srtm1Result')
						.html(`Point with 
					<br/>latitude ${result['data']['lat']} and 
					<br/>longitude ${result['data']['lng']} 
					<br/>seems to be 
					<br/><span>in the ocean</span>`);
				}
				else {
					$('#srtm1Result')
						.html(`<p>Elevation for point with latitude 
						<b>${result['data']['lat']}</b> 
						and longitude <b>${result['data']['lng']}</b> is 
						<br/><span>${result['data']['srtm1']} m</span></p>`);
				}
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		}
	});

	// SETTLEMENT
	$.ajax({
		url: "libs/php/getNearestSettlement.php",
		type: 'GET',
		dataType: 'json',
		data: {
			lat: numLat,
			lng: numLng
		},

		success: function (result) {
			if (result.status.name == "ok") {
				if (!result.status.foundTown) {
					$('#cityResult')
						.html(`API did not return result for a settlement with over 1000 population within 300 km radius of the location.`);
				}
				else {
					$('#cityResult')
						.html(`<p><span>${result.data.toponymName}</span>
					<br/><b>local name:</b> ${result.data.name} 
					<br/><b>distance:</b> ${result.data.distance}
					<br/><b>population:</b> ${result.data.population}
					<br/><b>country code:</b> ${result.data.countryCode}</p>`);
				}
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		}
	});

	// WEATHER
	$.ajax({
		url: "libs/php/getWeatherData.php",
		type: 'GET',
		dataType: 'json',
		data: {
			lat: numLat,
			lng: numLng
		},

		success: function (result) {
			if (result.status.name == "ok") {
				console.log(result.data)

				if (!result.status.foundWeatherStation) {
					$('#weatherResult')
						.html(`API did not return result for a weather station within 300 km radius of the location.`);
				}
				else {
					$('#weatherResult').html(`
					<p><b>meteo station:</b> ${result.data.stationName}
					<br/><b>date/time:</b> ${result.data.datetime} 
					<br/><b>temperature:</b> ${result.data.temperature}&deg;C
					<br/><b>clouds:</b> ${result.data.clouds}
					<br/><b>humidity:</b> ${result.data.humidity}</p>
					`);
				}
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		}
	});
});


// get Postcode 
$('#getPostCodeForm').submit(function (e) {
	e.preventDefault();
	let placename = $('#settlement').val();
	let country = $('#country').val();
	// no empty inputs
	if (placename === "" || country === "") {
		alert("blank field(s)");
		return;
	}
	// valid code is 2 char len
	if (country.length !== 2) {
		alert("country codes consist of 2 letters only,\nplease refer to:\nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements");
		return;
	}

	$.ajax({
		url: "libs/php/getPostCode.php",
		type: 'GET',
		dataType: 'json',
		data: {
			placename,
			country
		},

		success: function (result) {
			// console.log(result);
			if (result.status.name == "ok") {
				if (!result.status.foundPostCode) {
					$('#postcodeResultGrid')
						.empty()
						.append(`<h4 class="resultHeading">API did not return postcode data for selected location.</h4>`);
				}
				else {
					$('#postcodeResultGrid').empty();
					result.data.forEach(element => {
						$('#postcodeResultGrid')
							.append(`<li><p>placeName: </p><p>${element.placeName}</p>
									<p>adminName2: </p><p>${element.adminName2}</p>
									<p>postalCode: </p><p>${element.postalCode}</p></li>`);
					});
				}
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		}
	});
});


// get Neighbours 
$('#getNeighboursForm').submit(function (e) {
	e.preventDefault();
	let country = $('#state').val();
	console.log(country)
	// no empty inputs
	if (country === "") {
		alert("blank field(s)");
		return;
	}
	// valid code is 2 char len
	if (country.length !== 2) {
		alert("country codes consist of 2 letters only,\nplease refer to:\nhttps://en.wikipedia.org/wiki/ISO_3166-1_alpha-2#Officially_assigned_code_elements");
		return;
	}

	$.ajax({
		url: "libs/php/getNeighbours.php",
		type: 'GET',
		dataType: 'json',
		data: {
			country
		},

		success: function (result) {
			if (result.status.name == "ok") {
				if (!result.status.foundNeighbours) {
					$('#neighbourResultGrid')
						.empty()
						.append(`<h4 class="resultHeading">API did not return neighbours data for selected location.</h4>`);
				}
				else {
					console.log(result.data);

					$('#neighbourResultGrid').empty();
					result.data.forEach(element => {
						// 	console.log(element.countryCode, element.countryName, element.population)
						// })

						$('#neighbourResultGrid')
							.append(`<li><p>countryCode: </p><p>${element.countryCode}</p>
									<p>countryName: </p><p>${element.countryName}</p>
									<p>population: </p><p>${element.population}</p></li>`);
					});
				}
			}
		},

		error: function (jqXHR, textStatus, errorThrown) {
			console.log(jqXHR, textStatus, errorThrown)
		}
	});




});




