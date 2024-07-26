//   ----   MAP INIT    ----    //
// define base layers
const Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	maxZoom: 17,
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

const Jawg_Terrain = L.tileLayer('https://tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	maxZoom: 22,
	attribution: '<a href="https://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	accessToken: 'mJZnCYHFpNftBsC6PF64A1V0f7vwRW5xneYEg4rRfMoZimE53hjq2wJUuG1btLQ4'
});

const baseMaps = {
	"Satellite (Esri_WorldImagery)": Esri_WorldImagery,
	"Topographical (OpenTopoMap)": OpenTopoMap,
	"Terrain (Jawg Lab)": Jawg_Terrain,
	// "General (OpenStreetMap)": OpenStreetMap_HOT,
};

// define overlays
const citiesLayer = L.layerGroup([]);
const earthQuakeLayer = L.layerGroup([]);
const wikiLayer = L.layerGroup([]);

const overlayMaps = {
	"Cities": citiesLayer,
	"Earthquakes": earthQuakeLayer,
	"Wiki Articles": wikiLayer,
};

// define and add marker clusters
const wikiMarkersClusters = L.markerClusterGroup();
wikiMarkersClusters.addTo(wikiLayer);

let map = L.map("map", { layers: [Jawg_Terrain, citiesLayer] });
L.control.layers(baseMaps, overlayMaps).addTo(map);

// define polygon with zero values, in dedicated function remove prev. polygon, create new with actual values, add it map and center map
// i.e. when new country is selected polygon of previously selected country disappears
let polygon = L.polygon([[0, 0]]);


function createCityMarker(city) {
	// CAPITAL: "fcodeName": "capital of a political entity", "fcode": "PPLC"
	// OTHERS: "fcodeName": "seat of a first-order administrative division", "fcode": "PPLA"
	const { lat, lng, countrycode, name, toponymName, wikipedia, population, fcode } = city
	let cityIconUrl = fcode === "PPLC"
		? "libs/fontawesome/svgs/solid/building-flag(prussian-blue).svg"
		: "libs/fontawesome/svgs/solid/building(prussian-blue).svg";

	let cityIconSize = fcode === "PPLC"
		? [31, 31]
		: [22, 22];

	let cityIcon = L.icon({
		iconUrl: cityIconUrl,
		iconSize: cityIconSize,
		// iconAnchor: [22, 26],		// was asked to place marker right on top
		// popupAnchor: [11, -17],
	});

	let cityMarker = L.marker([lat, lng], { icon: cityIcon })
		.bindPopup(`
        <h5>${toponymName}</h5>
		<p>population:</span>&nbsp;&nbsp;<span class="popup-data">${Intl.NumberFormat('en-GB').format(population)}</span></p>
		<p><a href="https://${wikipedia}" target="_blank">Wikipedia article</a></p>
		`);

	// mouseover and mouseout not ok here because popups will not be clickable, i.e. cannot click wiki link
	cityMarker.addTo(citiesLayer);
}

function createEarthquakeMarker(earthquake) {
	const { lat, lng, datetime, magnitude } = earthquake;
	const date = new Date(datetime)
		.toLocaleString("en-GB", {
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
		});

	let eqMarkerIcon = L.icon({
		iconUrl: "libs/fontawesome/svgs/solid/circle-dot(red).svg",
		iconSize: [22, 22],
	});

	let eqMarker = L.marker([lat, lng], { icon: eqMarkerIcon })
		.bindPopup(`
    		<p>Magnitude:&nbsp;&nbsp;<span class="popup-data">${magnitude}</span>
    		<p>
			<i class="fa-regular fa-calendar popup-icon"></i>		
			&nbsp;&nbsp;${date || 'N.A.'}
			</p>
		`);

	eqMarker.on('mouseover', function (e) { this.openPopup(); });
	eqMarker.on('click', function (e) { this.openPopup(); });
	eqMarker.on('mouseout', function (e) { this.closePopup(); });

	eqMarker.addTo(earthQuakeLayer);
}

function createWikiMarker(article) {
	const { lat, lng, title, summary, thumbnailImg, wikipediaUrl } = article;
	const imageRow = thumbnailImg
		? `
		<div class="container mt-1">
  			<div class="row vh-50">
    			<div class="col d-flex justify-content-center">
					<img src="${thumbnailImg}" class="img-fluid">  
				</div>
			</div>
		</div>		
		`
		: ""

	let wikiIcon = L.icon({
		iconUrl: "libs/fontawesome/svgs/brands/wikipedia-w(orange).svg",
		iconSize: [22, 22],
	});

	// undefined summary sometimes, e.g. Dom. Rep.
	let truncatedSummary = summary !== undefined
		? summary.substr(0, 190) + '...'
		: "N.A.";

	let wikiMarker = L.marker([lat, lng], { icon: wikiIcon })
		.bindPopup(`
        <h5>${title}</h5>
		<p>${truncatedSummary}</p>
		${imageRow}
		<p class="text-center"><a href="https://${wikipediaUrl}" target="_blank">Wikipedia article</a></p>
		`);

	wikiMarkersClusters.addLayer(wikiMarker);
}

document.onreadystatechange = function (e) {
	if (document.readyState !== 'complete') {
		$('#preloader').show();
	}
};

// trigger preloader while ajax request is pending
$(document).on({
	ajaxStart: function () {
		// console.log("waiting for ajax response...")
		$('#preloader').show();
	},
	ajaxStop: function () {
		// console.log("got ajax response!")
		$('#preloader').hide();
	}
});

$(document).ready(function () {
	//hide preloader appearing before document.ready
	$("#preloader").hide();

	// default country set to Greece, these values are changed as required
	let countryCodeIso2 = "GR";
	let countryName = "Greece";		// updated from local json (countryBorders.geo.json)
	let [easternMost, westernMost, northersMost, southernMost] = [41.7488862, 34.7006096, 29.7296986, 19.2477876];
	let capitalName = "Athens";		// updated when getting its coordinates
	let capitalLatLng = { lat: 37.983810, lng: 23.727539 };

	renderCountriesNamesAndCodes();			// Load Counties as <select> options

	/**	Set initial location:
		if user opts in => get latlng from event, send request to get countryCode and display map
		if user refuses, display default country map
	*/
	map.locate({ setView: true, maxZoom: 16 });
	map.once('locationfound', setCountryOfUserLocation); // gets code AND sets location and gets cities
	map.on('locationerror', (e) => {
		alert(`${e.message}\nBy default map will be set to Greece`);
		$('#countrySelect').val("GR").change();

		centerMapOnSelectedCountry(countryCodeIso2);
		loadCountryBoundaries(countryCodeIso2);
		getMainCitiesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
		getEarthquakesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
		getWikiArticlesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
	});

	// Enable selection of country from menu
	$("#countrySelect").on("change", () => {
		countryCodeIso2 = $("#countrySelect").val();

		centerMapOnSelectedCountry(countryCodeIso2);
		loadCountryBoundaries(countryCodeIso2);
		updateCapitalNameAndCoordinates(countryCodeIso2);		// needed for weather modal
		getMainCitiesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
		getEarthquakesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
		getWikiArticlesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
	});

	//   ----    INFO BUTTONS    ----    //
	const infoBtn1 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Government',
			icon: 'fa-solid fa-landmark-flag',
			onClick: async function (btn, map) {
				getEssentials();
			}
		}]
	});

	const infoBtn2 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Economy',
			icon: 'fa-solid fa-money-check-dollar',
			onClick: async function (btn, map) {
				getEconomy();
			}
		}]
	});

	const infoBtn3 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Population',
			icon: 'fa-solid fa-people-group',
			onClick: async function (btn, map) {
				getPopulation();
			}
		}]
	});

	const infoBtn4 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Education',
			icon: 'fa-solid fa-person-chalkboard',
			onClick: async function (btn, map) {
				getEducation();
			}
		}]
	});

	const infoBtn5 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Currency',
			icon: 'fa-solid fa-money-bill-transfer',
			onClick: async function (btn, map) {
				getExchangeRates();
			}
		}]
	});

	const infoBtn6 = L.easyButton({
		leafletClasses: true,
		states: [{
			title: 'Weather in capital',
			icon: 'fa-solid fa-cloud-sun',
			onClick: async function (btn, map) {
				getWeather(capitalLatLng);
			}
		}]
	});

	infoBtn1.addTo(map);
	infoBtn2.addTo(map);
	infoBtn3.addTo(map);
	infoBtn4.addTo(map);
	infoBtn5.addTo(map);
	infoBtn6.addTo(map);

	$(".btnClose").on('click', function () {
		$("#genericModal").modal("hide");
	});


	function renderCountriesNamesAndCodes() {
		$.ajax({
			url: "libs/php/loadAllCountriesCodes.php",
			type: 'GET',
			dataType: 'json',

			success: function (result) {
				$.each(result.data.allCountriesArr, function (index, value) {
					$('#countrySelect')
						.append($("<option></option>")
							.attr("value", `${value.iso_a2}`)
							.text(value.name));
				});
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});
	}

	function renderCurrencyConversionForm1(currencyArr, allCurrenciesData, exchangeRatesData) {
		// Restricts input for each element in the set of matched elements to the given inputFilter.
		(function ($) {
			$.fn.inputFilter = function (callback, errMsg) {
				return this.on("input keydown keyup mousedown mouseup select contextmenu drop focusout", function (e) {
					if (callback(this.value)) {
						// Accepted value
						if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
							$(this).removeClass("input-error");
							this.setCustomValidity("");
						}
						this.oldValue = this.value;
						this.oldSelectionStart = this.selectionStart;
						this.oldSelectionEnd = this.selectionEnd;
					} else if (this.hasOwnProperty("oldValue")) {
						// Rejected value - restore the previous one
						$(this).addClass("input-error");
						this.setCustomValidity(errMsg);
						this.reportValidity();
						this.value = this.oldValue;
						this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
					} else {
						// Rejected value - nothing to restore
						this.value = "";
					}
				});
			};
		}(jQuery));

		$(".modal-body").append(`
			<form class="mt-2 mb-2" id="exchangeForm1">
				<div class="row mb-1">
					<div class="col-12">
						<h6 class="convertor-form-type">convert local to foreign:</h6>
					</div>
				</div>
				<div class="row mb-3">
					<div class="col-5 pr-1">
						<input type="number" class="form-control" 
						id="originalAmount1" value="100">
					</div>
					<div class="col-7 pl-1 align-self-end">
						<input readonly class="form-control text-truncate" id="originalCurrency1"
							value="${currencyArr[0].name} (${currencyArr[0].symbol})"></input>
					</div>
				</div>
				<div class="row">
					<div class="col-7 pr-1">
						<select class="form-control" id="currencySelect1">	
						${populateCurrencySelectContainer(allCurrenciesData.supported_codes)}
						</select>
					</div>
					<div class="col-5 pl-1">
						<p class="form-control" id="resultAmount1">${(100 * exchangeRatesData.exchangeRates.conversion_rates["USD"]).toFixed(2)}</p>
					</div>
				</div>				
			</form>`);

		// Numeric input only: can use dot or comma
		$("#originalAmount1").on("keyup").inputFilter(function (value) {
			return /^-?\d*[.,]?\d*$/.test(value);
		}, "Must be a positive real number");

		$("#exchangeForm1 #currencySelect1").
			on("change", calculateFromNativeToForeign);
		$("#exchangeForm1 #originalAmount1").
			on("change", calculateFromNativeToForeign);
		$("#exchangeForm1 #originalAmount1").
			on("keyup", calculateFromNativeToForeign);


		function calculateFromNativeToForeign(event) {
			event.preventDefault();
			// Number converts null, empty string to 0, i.e. still should not trigger currency conversion, 
			// BUT make user input of '0' valid
			let originalAmount1 = undefined;
			if ($('#originalAmount1').val() || $('#originalAmount1').val() === "0") {
				originalAmount1 = Number($('#originalAmount1').val())
			}
			let selectedCurrency = $("#currencySelect1").val();

			// confirm numeric and !NaN and !undefined (allow 0), confirm selected currency is not null
			if (originalAmount1 !== undefined && selectedCurrency) {
				let targetCurrencyExchangeRate = exchangeRatesData.exchangeRates.conversion_rates[selectedCurrency]
				let result = (targetCurrencyExchangeRate * originalAmount1).toFixed(2);
				$('#resultAmount1').html(result).addClass('convertedAmount');
			}
			else {		// reinstate original state
				$('#resultAmount1').html('[result]').removeClass('convertedAmount');
			}
		}
	}

	function renderCurrencyConversionForm2(currencyArr, allCurrenciesData, exchangeRatesData) {
		// Restricts input for each element in the set of matched elements to the given inputFilter.
		(function ($) {
			$.fn.inputFilter = function (callback, errMsg) {
				return this.on("input keydown keyup mousedown mouseup select contextmenu drop focusout", function (e) {
					if (callback(this.value)) {
						// Accepted value
						if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
							$(this).removeClass("input-error");
							this.setCustomValidity("");
						}
						this.oldValue = this.value;
						this.oldSelectionStart = this.selectionStart;
						this.oldSelectionEnd = this.selectionEnd;
					} else if (this.hasOwnProperty("oldValue")) {
						// Rejected value - restore the previous one
						$(this).addClass("input-error");
						this.setCustomValidity(errMsg);
						this.reportValidity();
						this.value = this.oldValue;
						this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
					} else {
						// Rejected value - nothing to restore
						this.value = "";
					}
				});
			};
		}(jQuery));

		$(".modal-body").append(`
			<form class="mt-2 mb-2" id="exchangeForm2">
				<div class="row mb-1">
					<div class="col-12">
						<h6 class="convertor-form-type">convert foreign to local:</h6>
					</div>
				</div>
				<div class="row mb-3">
					<div class="col-5 pr-1">
						<input type="number" class="form-control" 
						id="originalAmount2" value="100">
					</div>
					<div class="col-7 pl-1 align-self-end">
						<select class="form-control" id="currencySelect2">	
						${populateCurrencySelectContainer(allCurrenciesData.supported_codes)}
						</select>						
					</div>
				</div>
				<div class="row">
					<div class="col-7 pr-1">
					<input readonly class="form-control text-truncate" id="originalCurrency2"
							value="to: ${currencyArr[0].name} (${currencyArr[0].symbol})"></input>						
					</div>
					<div class="col-5 pl-1">
						<p class="form-control" id="resultAmount2">${(100 / exchangeRatesData.exchangeRates.conversion_rates["USD"]).toFixed(2)}</p>
					</div>
				</div>				
			</form>`);

		// Numeric input only: can use dot or comma
		$("#originalAmount2").on("keyup").inputFilter(function (value) {
			return /^-?\d*[.,]?\d*$/.test(value);
		}, "Must be a positive real number");

		$("#exchangeForm2 #currencySelect2").
			on("change", calculateFromForeignToLocal);
		$("#exchangeForm2 #originalAmount2").
			on("change", calculateFromForeignToLocal);
		$("#exchangeForm2 #originalAmount2").
			on("keyup", calculateFromForeignToLocal);


		function calculateFromForeignToLocal(event) {
			event.preventDefault();
			// Number converts null, empty string to 0, i.e. still should not trigger currency conversion, 
			// BUT make user input of '0' valid
			let originalAmount2 = undefined;
			if ($('#originalAmount2').val() || $('#originalAmount2').val() === "0") {
				originalAmount2 = Number($('#originalAmount2').val())
			}
			let selectedCurrency = $("#currencySelect2").val();

			// confirm numeric and !NaN and !undefined (allow 0), confirm selected currency is not null
			if (originalAmount2 !== undefined && selectedCurrency) {
				let targetCurrencyExchangeRate = exchangeRatesData.exchangeRates.conversion_rates[selectedCurrency]
				let result = (originalAmount2 / targetCurrencyExchangeRate).toFixed(2);
				$('#resultAmount2').html(result).addClass('convertedAmount');
			}
			else {		// reinstate original state
				$('#resultAmount2').html('[result]').removeClass('convertedAmount');
			}
		}
	}

	function populateCurrencySelectContainer(allCurrenciesArr) {
		let options = `<option selected value="USD">United States Dollar</option>`;
		allCurrenciesArr.forEach(curr => {
			options += `<option value="${curr[0]}">${curr[1]}</option>\n`
		});
		return options;
	}

	function centerMapOnSelectedCountry(countryCodeIso2) {		// get country boundaries, remove prev. polygon, create new and center map
		// select from options too
		$(`#countrySelect option[value='${countryCodeIso2}]`).prop("selected", true);

		$.ajax({
			url: "libs/php/loadCountryBoundaries.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCodeIso2: countryCodeIso2 }),

			success: function (result) {
				countryName = result.data.countryName;	// update var for current country
				// NB - we need latlng arrays but the STUPID json is providing longitude first, then latitude, hence need to invert them
				let latlngs = [];
				if (result.data.geometryType === "Polygon") {
					for (let tuple of result.data.coordinatesArray[0]) {
						latlngs.push([tuple[1], tuple[0]])
					}
				}
				else if (result.data.geometryType === "MultiPolygon") {		// island countries etc.
					for (let nestedArr of result.data.coordinatesArray) {
						let invertedTuple = []
						for (let tuple of nestedArr[0]) {
							invertedTuple.push([tuple[1], tuple[0]]);
						}
						latlngs.push(invertedTuple)
					}
				}
				else {
					throw new Error(`Invalid geometryType ${result.data.geometryType}`)
				}

				// polygon is used to determine borders of selected country and then "fill" screen 
				polygon.removeFrom(map);		// remove polygon from previous selected/set country

				polygon = L.polygon(latlngs, { color: 'orange' }).addTo(map);

				// zoom the map to the polygon, leave it on
				map.fitBounds(polygon.getBounds());
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});
	}

	function setCountryOfUserLocation(e) {
		const { lat, lng } = e.latlng;
		$.ajax({
			url: "libs/php/getCountryIso2CodeByLatLng.php",
			type: 'GET',
			async: false,		// to ensure we can update values of country codes
			dataType: 'json',
			data: {
				lat: lat,
				lng: lng
			},

			success: function (result) {
				countryCodeIso2 = result.data.countryCode;
				$('#countrySelect').val(countryCodeIso2).change();

				centerMapOnSelectedCountry(countryCodeIso2);
				loadCountryBoundaries(countryCodeIso2);
				updateCapitalNameAndCoordinates(countryCodeIso2);		// needed for weather modal
				getMainCitiesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
				getEarthquakesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
				getWikiArticlesAndSetMarkers(easternMost, westernMost, northersMost, southernMost);
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function loadCountryBoundaries(countryCodeIso2) {
		$.ajax({
			url: "libs/php/loadCountryBoundingBox.php",
			type: 'GET',
			async: false,
			dataType: 'json',
			data: { countryCodeIso2 },

			success: function (result) {
				// some "countries", e.g. N. Cyprus won't contain city data
				if (result.data.localCountryData) {
					easternMost = result.data.localCountryData.boundingBox.ne.lon;
					westernMost = result.data.localCountryData.boundingBox.sw.lon;
					northersMost = result.data.localCountryData.boundingBox.ne.lat;
					southernMost = result.data.localCountryData.boundingBox.sw.lat;
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		})
	}

	function updateCapitalNameAndCoordinates(countryCodeIso2) {
		$.ajax({
			url: "libs/php/getCapitalNameAndLatLngByCountryIso2Code.php",
			type: 'GET',
			async: false,
			dataType: 'json',
			data: { countryCodeIso2 },
			success: function (result) {
				const capitalCoordinatesArr = result.data.capitalLatLng;
				capitalLatLng = { lat: capitalCoordinatesArr[0], lng: capitalCoordinatesArr[1] };
				capitalName = result.data.capitalName;
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getMainCitiesAndSetMarkers(easternMost, westernMost, northersMost, southernMost) {
		// remove existing markers, so when country changed previous ones don't remain on map
		citiesLayer.clearLayers();
		const maxRows = 50;  // get plenty of cities as often most populated or capitals are in neighbouring countries, e.g. Greece/Turkey

		$.ajax({
			url: "libs/php/getLargestCitiesData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				east: easternMost, west: westernMost, north: northersMost, south: southernMost, maxRows
			}),
			success: function (citiesRes) {
				// sometimes returns timeout error
				if (citiesRes.data && citiesRes.data.geonames) {
					// limit cities to 20
					const citiesInCountry = (citiesRes.data.geonames)
						.filter(city => city.countrycode === countryCodeIso2)
						.splice(0, 20);
					for (let city of citiesInCountry) {
						createCityMarker(city);
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			},
		});
	}

	function getEarthquakesAndSetMarkers(easternMost, westernMost, northersMost, southernMost) {
		// remove existing markers, so when country changed previous ones don't remain on map
		earthQuakeLayer.clearLayers();
		const maxRows = 10;  // 10 is default anyway

		$.ajax({
			url: "libs/php/getEarthquakesData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				east: easternMost, west: westernMost, north: northersMost, south: southernMost, maxRows
			}),
			success: function (earthQuakeRes) {
				// sometimes returns timeout error, different from wiki timeout
				if (earthQuakeRes.status == "200" && !earthQuakeRes.data) {
					alert(`Error: ${earthQuakeRes.status.returnedIn / 1000} seconds passed:\nLoading Earthquakes data timed out.\nIf it is required, please try again later.`)
				}
				if (earthQuakeRes.data && earthQuakeRes.data.earthquakes) {
					for (let equake of earthQuakeRes.data.earthquakes) {
						createEarthquakeMarker(equake);
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			},
		});
	}

	function getWikiArticlesAndSetMarkers(easternMost, westernMost, northersMost, southernMost) {
		// remove existing markers, so when country changed previous ones don't remain on map
		wikiMarkersClusters.clearLayers();
		const maxRows = 88;

		$.ajax({
			url: "libs/php/getWikiData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				east: easternMost, west: westernMost, north: northersMost, south: southernMost, maxRows
			}),
			success: function (wikiRes) {
				// if requesting too much data returns timeout error (data.status.message)
				if (wikiRes.data && wikiRes.data.status) {
					alert(`Error ${wikiRes.data.status.message}:\nLoading Wikipedia data timed out.\nIf it is required, please try again later.`)
				}
				if (wikiRes.data && wikiRes.data.geonames) {
					// filter for country only
					const articlesForCountry = (wikiRes.data.geonames)
						.filter(article => article.countryCode === countryCodeIso2);

					for (let article of articlesForCountry) {
						createWikiMarker(article);
					}
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			},
		});
	}

	function getEssentials() {
		$.ajax({
			url: "libs/php/getEssentialCountryData.php",
			type: 'GET',
			dataType: 'json',
			data: ({ countryCodeIso2: countryCodeIso2 }),

			success: function (result) {
				renderCountryDataInModal(result.data[0], "essential");	// this API returns array with 1 element
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getEconomy() {
		$.ajax({
			url: "libs/php/getEconomyData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso2: countryCodeIso2,
				timeFrame: "2006:2024"
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "economy");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getPopulation() {
		$.ajax({
			url: "libs/php/getPopulationData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso2: countryCodeIso2,
				timeFrame: "2006:2024"
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "population");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getEducation() {
		$.ajax({
			url: "libs/php/getEducationData.php",
			type: 'GET',
			dataType: 'json',
			data: ({
				countryCodeIso2: countryCodeIso2,
				timeFrame: "1991:2024"			// get education since 1991, as less data is available
			}),

			success: function (result) {
				renderCountryDataInModal(result.data, "education");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function getExchangeRates() {
		// 1. get all currencies 
		// 2. get exchange rates for selected country's currency
		// 3. send data to rendering function
		$.ajax({
			url: "libs/php/getAllCurrencies.php",
			type: 'GET',
			dataType: 'json',

			success: function (allCurrenciesResult) {
				$.ajax({
					url: "libs/php/getExchangeRatesData.php",
					type: 'GET',
					dataType: 'json',
					data: ({
						countryCodeIso2: countryCodeIso2,
					}),
					success: function (ratesResult) {
						let combinedData = {
							allCurrenciesData: allCurrenciesResult.data,
							exchangeRatesData: ratesResult.data
						}
						renderCountryDataInModal(combinedData, "money");
					},
					error: function (jqXHR, textStatus, errorThrown) {
						console.log(jqXHR, textStatus, errorThrown)
					},
				});
			},

			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown);
				alert("Something went wrong")
			}
		});
	}

	function getWeather(capitalLatLng) {
		const { lat, lng } = capitalLatLng;
		$.ajax({
			url: "libs/php/getWeatherData.php",
			type: 'GET',
			async: false,		// to ensure we can update values of country codes
			dataType: 'json',
			data: {
				lat: lat,
				lng: lng,
				countryCodeIso2: countryCodeIso2,
			},

			success: function (result) {
				renderCountryDataInModal(result.data, "weather");
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR, textStatus, errorThrown)
			}
		});
	}

	function renderCountryDataInModal(data, dataType) {
		//    ****    GOVERNMENT    ****    //
		if (dataType === "essential") {
			$(".modal-title").text(`${data.name.common}`);
			$(".modal-body").html(`
				<div class="row mb-2">
					<div class="col">
						<p class="mb-1">Flag:</p>
						<img src="${data.flags.png}" alt="flag of ${data.name.common}">
					</div>
					<div class="col">
						<p class="mb-1">Coat of Arms:</p>
						<img src="${data.coatOfArms.png}" alt="coat of arms of ${data.name.common}">
					</div>
				</div>

				<div class="row">
					<div class="col">
						Area:
						<p class="modal-data-lrg">${Intl.NumberFormat('en-GB').format(data.area)} km&#178;</p>
					</div>
					<div class="col">
						Population:
						<p class="modal-data-lrg">${Intl.NumberFormat('en-GB').format(data.population)}</p>
					</div>
				</div>

				<div class="row">
					<div class="col">
						Capital:
						<p class="modal-data-lrg">${data.capital}</p>
					</div>
					<div class="col">
						TLD:
						<p class="modal-data-lrg">${data.tld}</p>
					</div>
				</div>
				`)
		}
		//    ****    ECONOMY    ****    //
		else if (dataType === "economy") {
			// console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"BN.CAB.XOKA.CD": { value: "N.A.", year: "N.A." },
				"BM.GSR.GNFS.CD": { value: "N.A.", year: "N.A." },
				"BX.GSR.GNFS.CD": { value: "N.A.", year: "N.A." },
				"NY.GDP.MKTP.KD.ZG": { value: "N.A.", year: "N.A." },
				"NY.GDP.MKTP.CD": { value: "N.A.", year: "N.A." },
				"NY.GDP.PCAP.KD.ZG": { value: "N.A.", year: "N.A." },
				"SI.POV.NAHC": { value: "N.A.", year: "N.A." },			//Population below national poverty line (%)
				"SI.POV.GINI": { value: "N.A.", year: "N.A." },			//Gini
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}
			// console.log("mostRecentData:\n", mostRecentData);
			$(".modal-title").text(`${mostRecentData.countryName || "Country not in DB"} - Economy`);
			$(".modal-body").html(`
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					GDP (current US$):
					</div>
					<div class="col-7 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["NY.GDP.MKTP.CD"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.CD"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					GDP growth (annual&nbsp;%):
					</div>
					<div class="col-7 text-end modal-data">
					${Number(mostRecentData["NY.GDP.MKTP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.KD.ZG"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					GDP per capita growth (annual&nbsp;%):
					</div>
					<div class="col-7 text-end modal-data">
					${Number(mostRecentData["NY.GDP.PCAP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.PCAP.KD.ZG"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					Imports of goods and services (BoP,&nbsp;current&nbsp;US$):
					</div>
					<div class="col-7 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BM.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BM.GSR.GNFS.CD"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					Exports of goods and services (BoP,&nbsp;current&nbsp;US$):
					</div>
					<div class="col-7 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BX.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BX.GSR.GNFS.CD"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					Current account balance (BoP,&nbsp;current&nbsp;US$):
					</div>
					<div class="col-7 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BN.CAB.XOKA.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BN.CAB.XOKA.CD"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					Population below national poverty line (%):
					</div>
					<div class="col-7 text-end modal-data">
					${Number(mostRecentData["SI.POV.NAHC"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.NAHC"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-5 modal-data-label mb-0">
					Gini index:
					</div>
					<div class="col-7 text-end modal-data">
					${Number(mostRecentData["SI.POV.GINI"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.GINI"].year})</span>
					</div>
				</div>
			`)
		}
		//    ****    DEMOGRAPHICS    ****    //
		else if (dataType === "population") {
			// console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SP.DYN.LE00.MA.IN": { value: "N.A.", year: "N.A." },	// "Life expectancy at birth, male (years)"
				"SP.DYN.LE00.FE.IN": { value: "N.A.", year: "N.A." },	// "Life expectancy at birth, female (years)"
				"EN.POP.DNST": { value: "N.A.", year: "N.A." },			// "Population density (people per sq. km of land area)"
				"SP.POP.GROW": { value: "N.A.", year: "N.A." },			// "Population growth (annual %)"
				"SP.URB.TOTL.IN.ZS": { value: "N.A.", year: "N.A." },	// "Urban population (% of total population)"
				"SP.RUR.TOTL.ZS": { value: "N.A.", year: "N.A." },		// "Rural population (% of total population)"
				"SP.POP.TOTL": { value: "N.A.", year: "N.A." },			// "Population, total"
				"AG.LND.TOTL.K2": { value: "N.A.", year: "N.A." },		// "Land area (sq. km)"
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}

			$(".modal-title").text(`${mostRecentData.countryName || "Country not in DB"} - Demographics`);
			$(".modal-body").html(`
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Population, total:
					</div>
					<div class="col-6 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["SP.POP.TOTL"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.TOTL"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Land area (sq. km):
					</div>
					<div class="col-6 text-end modal-data">
					${Intl.NumberFormat('en-GB').format(mostRecentData["AG.LND.TOTL.K2"].value)} 
					<span class="dataYear">(${mostRecentData["AG.LND.TOTL.K2"].year})</span>
					</div>
				</div>			
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Population density (people/sq.km):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["EN.POP.DNST"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.DNST"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Population growth (annual&nbsp;%):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["SP.POP.GROW"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.GROW"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Urban population (%):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["SP.URB.TOTL.IN.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.URB.TOTL.IN.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Rural population (%):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["SP.RUR.TOTL.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.RUR.TOTL.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Life expectancy, male (years):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["SP.DYN.LE00.MA.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.MA.IN"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-6 modal-data-label mb-0">
					Life expectancy, female (years):
					</div>
					<div class="col-6 text-end modal-data">
					${Number(mostRecentData["SP.DYN.LE00.FE.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.FE.IN"].year})</span>
					</div>
				</div>
			`)
		}
		//    ****    EDUCATION    ****    //
		else if (dataType === "education") {
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SE.XPD.TOTL.GD.ZS": { value: "N.A.", year: "N.A." },	// "Government expenditure on education, total (% of GDP)"
				"SE.PRM.ENRL.TC.ZS": { value: "N.A.", year: "N.A." },	// "Pupil-teacher ratio, primary"
				"SE.PRM.NENR": { value: "N.A.", year: "N.A." },			// "School enrollment, primary (% net)"
				"SE.SEC.NENR": { value: "N.A.", year: "N.A." },			// "School enrollment, secondary (% net)"
				"SL.UEM.TOTL.FE.ZS": { value: "N.A.", year: "N.A." },	// "Unemployment, female (% of female labor force) (modeled ILO estimate)"
				"SL.UEM.TOTL.MA.ZS": { value: "N.A.", year: "N.A." },	// "Unemployment, male (% of male labor force) (modeled ILO estimate)"
				"SL.TLF.0714.ZS": { value: "N.A.", year: "N.A." },		// "Children in employment, total (% of children ages 7-14)"
				"EN.POP.SLUM.UR.ZS": { value: "N.A.", year: "N.A." },	// "Population living in slums (% of urban population)"
			};
			for (let reading of actualData) {
				mostRecentData.countryId = reading.country.id;
				mostRecentData.countryName = reading.country.value;
				// For each indicator API returns the most recent data as first result
				// Hence if value in mostRecentData is no longer "N.A." we already have record => ignore next readings for this indicator
				// Sometimes value === null, write data only of value is not null. Get year of reading as well
				if (mostRecentData[reading.indicator.id].value === "N.A." && reading.value) {
					mostRecentData[reading.indicator.id] = {
						indicatorName: reading.indicator.value,
						year: reading.date,
						value: Number(reading.value).toFixed(2)
					};
				};
			}

			$(".modal-title").text(`${mostRecentData.countryName || "Country not in DB"} - Education`);
			$(".modal-body").html(`
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Government expenditure on education, total (% of GDP):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SE.XPD.TOTL.GD.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.XPD.TOTL.GD.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Pupil-teacher ratio, primary:
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SE.PRM.ENRL.TC.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.ENRL.TC.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					School enrollment,&nbsp;primary&nbsp;(%&nbsp;net):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SE.PRM.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.NENR"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					School enrollment, secondary&nbsp;(%&nbsp;net):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SE.SEC.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.SEC.NENR"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Unemployment, female&nbsp;(%):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SL.UEM.TOTL.FE.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.FE.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Unemployment, male&nbsp;(%):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SL.UEM.TOTL.MA.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.MA.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Children in employment, (%&nbsp;of&nbsp;age&nbsp;7-14):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["SL.TLF.0714.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.TLF.0714.ZS"].year})</span>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row mb-1">
					<div class="col-7 modal-data-label mb-0">
					Population in slums (%):
					</div>
					<div class="col-5 text-end modal-data">
					${Number(mostRecentData["EN.POP.SLUM.UR.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.SLUM.UR.ZS"].year})</span>
					</div>
				</div>
			`)
		}
		//    ****    MONEY EXCHANGE    ****    //
		else if (dataType === "money") {
			const { allCurrenciesData, exchangeRatesData } = data
			const currencyArr = Object.values(exchangeRatesData.primaryCurrency);

			$(".modal-title").text(`${exchangeRatesData.countryName || "Country not in DB"} - Exchange Rates`);

			$(".modal-body").html(``);	// just delete everything and render forms anew
			renderCurrencyConversionForm1(currencyArr, allCurrenciesData, exchangeRatesData);
			renderCurrencyConversionForm2(currencyArr, allCurrenciesData, exchangeRatesData);

			$(".modal-body").append(`
				<div>
					<h6 class="dataDateTitle">exchange rates last updated:</h6>
					<p class="dataDate">${new Date(exchangeRatesData.exchangeRates.time_last_update_utc)
					.toLocaleString("en-GB", {
						year: 'numeric', month: 'numeric', day: 'numeric',
						hour: 'numeric', minute: 'numeric', second: 'numeric',
					})
				}</p>
				</div >				
			`)
		}
		//    ****    WEATHER    ****    //
		else if (dataType === "weather") {
			// forecastData is with 3-hour step
			const { main, weatherArr, clouds, wind, forecastData } = data;
			// console.log(forecastData[0]);
			// console.log(forecastData[8]);
			// console.log(forecastData[16]);
			// console.log(forecastData[24]);
			const tomorrow = forecastData[8];
			const tomorrowPlusOne = forecastData[16];
			const tomorrowPlusTwo = forecastData[24];

			// weather is array
			const weather = weatherArr[0];

			$(".modal-title").text(`Current weather in capital ${capitalName}`);
			$(".modal-body").html(`
				<div class="row mb-2">
					<div class="col">
						<div class="weatherIcon">
							<img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png">
						</div>
					</div>
					<div class="col">
						<p class="weatherDescription1 mb-0">${weather.main}</p>
						<p class="weatherDescription2 mb-0">${weather.description}</p>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row">
					<div class="col">
						<p class="modal-data-label mb-0">Temperature:</p>
						<p class="text-start mb-1 modal-data">${Math.round(main.temp)}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
					<div class="col">
						<p class="modal-data-label mb-0">Feels Like:</p>
						<p class="text-start mb-1 modal-data">${Math.round(main.feels_like)}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
					<div class="col">
						<p class="modal-data-label mb-0">Humidity:</p>
						<p class="text-start mb-1 modal-data">${main.humidity}<span class="weatherMeasurement">%</span></p>
					</div>
				</div>
				<hr class="hr-modal">
				<div class="row">					
					<div class="col">
						<p class="modal-data-label mb-0">Pressure:</p>
						<p class="text-start mb-1 modal-data">${main.pressure}<span class="weatherMeasurement">hPa</p>
					</div>
					<div class="col">
						<p class="modal-data-label mb-0">Wind:</p>
						<p class="text-start mb-1 modal-data">${wind}<span class="weatherMeasurement">m/s</span></p>
					</div>
					<div class="col">
						<p class="modal-data-label mb-0">Clouds:</p>
						<p class="text-start mb-1 modal-data">${clouds}<span class="weatherMeasurement">%</span></p>
					</div>
				</div>
				
				<div class="bg-info p-1">
					<h6 class="text-center">Forecast for next 3 days</h6>
				</div>
				<div class="row">					
					<div class="col mx-auto">
						<div class="forecast-period">&#x223C;24 hours</div>
						<div class="weatherIcon">
							<img src="https://openweathermap.org/img/wn/${tomorrow.weather[0].icon}@2x.png">
						</div>
							<p class="text-start mb-1 modal-data">${Math.round(tomorrow.main.temp)}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
					<div class="col">
						<div class="forecast-period">&#x223C;48 hours</div>
						<div class="weatherIcon">
							<img src="https://openweathermap.org/img/wn/${tomorrowPlusOne.weather[0].icon}@2x.png">
						</div>
							<p class="text-start mb-1 modal-data">${Math.round(tomorrowPlusOne.main.temp)}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
					<div class="col">
						<div class="forecast-period">&#x223C;72 hours</div>
						<div class="weatherIcon">
							<img src="https://openweathermap.org/img/wn/${tomorrowPlusTwo.weather[0].icon}@2x.png">
						</div>
							<p class="text-start mb-1 modal-data">${Math.round(tomorrowPlusTwo.main.temp)}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
				</div>

				`)
		}

		// ... AND FINALLY, make the modal visible
		$("#genericModal").modal("show");
	}

	// end of $(document).ready(function {
})



