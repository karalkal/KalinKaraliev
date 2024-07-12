//   ----    TILE LAYERS and INIT    ----    //
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
/*
const OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
	maxZoom: 22,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
});
*/


let map = L.map("map", { layers: [Jawg_Terrain] });

const baseMaps = { 		// last one in list will be displayed by default on initial render
	"Satellite (Esri_WorldImagery)": Esri_WorldImagery,
	"Topographical (OpenTopoMap)": OpenTopoMap,
	"Terrain (Jawg Lab)": Jawg_Terrain,
	// "General (OpenStreetMap)": OpenStreetMap_HOT,
};

// define extra layers
const citiesLayer = L.layerGroup([]);
const earthQuakeLayer = L.layerGroup([]);
const wikiLayer = L.layerGroup([]);

// define and add marker clusters
const wikiMarkersClusters = L.markerClusterGroup();
wikiMarkersClusters.addTo(wikiLayer);

const overlayMaps = {
	"Cities": citiesLayer,
	"Earthquakes": earthQuakeLayer,
	"Wiki Articles": wikiLayer,
};

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
/*
$(window).on("load", function () {
	console.log("preloading...")
	$('#preloader').show();
});
*/

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
	let [easternMost, westernMost, northersMost, southernMost] = [41.7488862, 34.7006096, 29.7296986, 19.2477876];
	let capitalLatLng = { lat: 37.983810, lng: 23.727539 }

	renderCountriesNamesAndCodes();			// Load Counties as <select> options

	/**	Set initial location:
		if user opts in => get latlng from event, send request to get countryCode and display map
		if user refuses, display default country map
	*/
	map.locate({ setView: true, maxZoom: 16 });
	map.once('locationfound', setCountryOfUserLocation); // gets code AND sets location and gets cities
	map.on('locationerror', (e) => {
		alert(`${e.message}\nBy default map will be set to Greece`);
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
		updateCapitalCoordinates(countryCodeIso2);		// needed for weather modal
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
						<h6>convert local to foreign:</h6>
					</div>
				</div>
				<div class="row mb-3">
					<div class="col-5 pr-1">
						<input type="text" class="form-control" 
						id="originalAmount1" placeholder="convert [amount]">
					</div>
					<div class="col-7 pl-1 align-self-end">
						<input readonly class="form-control text-truncate" id="originalCurrency1"
							value="${currencyArr[0].name} (${currencyArr[0].symbol})"></input>
					</div>
				</div>
				<div class="row">
					<div class="col-7 pr-1">
						<select class="form-control" id="currencySelect1">	
						${populateCurrencySelectContainer(allCurrenciesData.supported_codes, "to: &darr; [select currency] &darr;")}
						</select>
					</div>
					<div class="col-5 pl-1">
						<p class="form-control" id="resultAmount1">[result]</p>
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
				let result = (targetCurrencyExchangeRate * originalAmount1).toFixed(6);
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
						<h6>convert foreign to local:</h6>
					</div>
				</div>
				<div class="row mb-3">
					<div class="col-5 pr-1">
						<input type="text" class="form-control" 
						id="originalAmount2" placeholder="convert [amount]">
					</div>
					<div class="col-7 pl-1 align-self-end">
						<select class="form-control" id="currencySelect2">	
						${populateCurrencySelectContainer(allCurrenciesData.supported_codes, "&darr; [select currency] &darr;")}
						</select>						
					</div>
				</div>
				<div class="row">
					<div class="col-7 pr-1">
					<input readonly class="form-control text-truncate" id="originalCurrency2"
							value="to: ${currencyArr[0].name} (${currencyArr[0].symbol})"></input>						
					</div>
					<div class="col-5 pl-1">
						<p class="form-control" id="resultAmount2">[result]</p>
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
				let result = (originalAmount2 / targetCurrencyExchangeRate).toFixed(6);
				$('#resultAmount2').html(result).addClass('convertedAmount');
			}
			else {		// reinstate original state
				$('#resultAmount2').html('[result]').removeClass('convertedAmount');
			}
		}
	}

	function populateCurrencySelectContainer(allCurrenciesArr, optionsMenuTitle) {
		let options = `<option selected disabled hidden>${optionsMenuTitle}</option>`;
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

				centerMapOnSelectedCountry(countryCodeIso2);
				loadCountryBoundaries(countryCodeIso2);
				updateCapitalCoordinates(countryCodeIso2);		// needed for weather modal
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

	function updateCapitalCoordinates(countryCodeIso2) {
		$.ajax({
			url: "libs/php/getCapitalLatLngByCountryIso2Code.php",
			type: 'GET',
			async: false,
			dataType: 'json',
			data: { countryCodeIso2 },
			success: function (result) {
				const capitalCoordinatesArr = result.data.capitalLatLng
				capitalLatLng = { lat: capitalCoordinatesArr[0], lng: capitalCoordinatesArr[1] }
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
				// sometimes returns timeout error
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
				// if requesting too much data returns timeout error
				if (wikiRes.data.status) {
					alert(`Error ${wikiRes.data.status.value}:\nLoading Wikipedia data timed out.\nIf it is required, please try again later.`)
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
		console.log(lat, lng)
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
				"BN.CAB.XOKA.CD": { value: "N.A.", year: "no recent data is available" },
				"BM.GSR.GNFS.CD": { value: "N.A.", year: "no recent data is available" },
				"BX.GSR.GNFS.CD": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.MKTP.KD.ZG": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.MKTP.CD": { value: "N.A.", year: "no recent data is available" },
				"NY.GDP.PCAP.KD.ZG": { value: "N.A.", year: "no recent data is available" },
				"SI.POV.NAHC": { value: "N.A.", year: "no recent data is available" },			//Population below national poverty line (%)
				"SI.POV.GINI": { value: "N.A.", year: "no recent data is available" },			//Gini
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
				<div>
					<p class="modal-data-label mb-0">GDP (current US$):</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["NY.GDP.MKTP.CD"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.CD"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">GDP growth (annual %):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["NY.GDP.MKTP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.MKTP.KD.ZG"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">GDP per capita growth (annual %):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["NY.GDP.PCAP.KD.ZG"].value)} 
					<span class="dataYear">(${mostRecentData["NY.GDP.PCAP.KD.ZG"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Imports of goods and services (BoP, current US$):</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BM.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BM.GSR.GNFS.CD"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Exports of goods and services (BoP, current US$):</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BX.GSR.GNFS.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BX.GSR.GNFS.CD"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Current account balance (BoP, current US$):</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["BN.CAB.XOKA.CD"].value)} 
					<span class="dataYear">(${mostRecentData["BN.CAB.XOKA.CD"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Population below national poverty line (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SI.POV.NAHC"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.NAHC"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Gini index:</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SI.POV.GINI"].value)} 
					<span class="dataYear">(${mostRecentData["SI.POV.GINI"].year})</span>
					</p>
				</div>
			`)
		}
		//    ****    DEMOGRAPHICS    ****    //
		else if (dataType === "population") {
			// console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SP.DYN.LE00.MA.IN": { value: "N.A.", year: "no recent data is available" },	// "Life expectancy at birth, male (years)"
				"SP.DYN.LE00.FE.IN": { value: "N.A.", year: "no recent data is available" },	// "Life expectancy at birth, female (years)"
				"EN.POP.DNST": { value: "N.A.", year: "no recent data is available" },			// "Population density (people per sq. km of land area)"
				"SP.POP.GROW": { value: "N.A.", year: "no recent data is available" },			// "Population growth (annual %)"
				"SP.URB.TOTL.IN.ZS": { value: "N.A.", year: "no recent data is available" },	// "Urban population (% of total population)"
				"SP.RUR.TOTL.ZS": { value: "N.A.", year: "no recent data is available" },		// "Rural population (% of total population)"
				"SP.POP.TOTL": { value: "N.A.", year: "no recent data is available" },			// "Population, total"
				"AG.LND.TOTL.K2": { value: "N.A.", year: "no recent data is available" },		// "Land area (sq. km)"
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
				<div>
					<p class="modal-data-label mb-0">Population, total:</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["SP.POP.TOTL"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.TOTL"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Land area (sq. km):</p>
					<p class="modal-data-med">
					${Intl.NumberFormat('en-GB').format(mostRecentData["AG.LND.TOTL.K2"].value)} 
					<span class="dataYear">(${mostRecentData["AG.LND.TOTL.K2"].year})</span>
					</p>
				</div>			
				<div>
					<p class="modal-data-label mb-0">Population density (people/sq.km):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["EN.POP.DNST"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.DNST"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Population growth (annual %):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SP.POP.GROW"].value)} 
					<span class="dataYear">(${mostRecentData["SP.POP.GROW"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Urban population (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SP.URB.TOTL.IN.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.URB.TOTL.IN.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Rural population (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SP.RUR.TOTL.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SP.RUR.TOTL.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Life expectancy, male (years):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SP.DYN.LE00.MA.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.MA.IN"].year})</span>
					</p>
				</div>	
				<div>
					<p class="modal-data-label mb-0">Life expectancy, female (years):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SP.DYN.LE00.FE.IN"].value)} 
					<span class="dataYear">(${mostRecentData["SP.DYN.LE00.FE.IN"].year})</span>
					</p>
				</div>
			`)
		}
		//    ****    EDUCATION    ****    //
		else if (dataType === "education") {
			console.log("Actual Data:\n", data[1]);
			const actualData = data[1] || [];		// avoid error for countries with no data, i.e. North Cyprus
			let mostRecentData = {		// default values for required indicators
				"SE.XPD.TOTL.GD.ZS": { value: "N.A.", year: "no recent data is available" },	// "Government expenditure on education, total (% of GDP)"
				"SE.PRM.ENRL.TC.ZS": { value: "N.A.", year: "no recent data is available" },	// "Pupil-teacher ratio, primary"
				"SE.PRM.NENR": { value: "N.A.", year: "no recent data is available" },			// "School enrollment, primary (% net)"
				"SE.SEC.NENR": { value: "N.A.", year: "no recent data is available" },			// "School enrollment, secondary (% net)"
				"SL.UEM.TOTL.FE.ZS": { value: "N.A.", year: "no recent data is available" },	// "Unemployment, female (% of female labor force) (modeled ILO estimate)"
				"SL.UEM.TOTL.MA.ZS": { value: "N.A.", year: "no recent data is available" },	// "Unemployment, male (% of male labor force) (modeled ILO estimate)"
				"SL.TLF.0714.ZS": { value: "N.A.", year: "no recent data is available" },		// "Children in employment, total (% of children ages 7-14)"
				"EN.POP.SLUM.UR.ZS": { value: "N.A.", year: "no recent data is available" },	// "Population living in slums (% of urban population)"
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
				<div>
					<p class="modal-data-label mb-0">Government expenditure on education, total (% of GDP):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SE.XPD.TOTL.GD.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.XPD.TOTL.GD.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Pupil-teacher ratio, primary:</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SE.PRM.ENRL.TC.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.ENRL.TC.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">School enrollment, primary (% net):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SE.PRM.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.PRM.NENR"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">School enrollment, secondary (% net):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SE.SEC.NENR"].value)} 
					<span class="dataYear">(${mostRecentData["SE.SEC.NENR"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Unemployment, female (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SL.UEM.TOTL.FE.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.FE.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Unemployment, male (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SL.UEM.TOTL.MA.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.UEM.TOTL.MA.ZS"].year})</span>
					</p>
				</div>
				<div>
					<p class="modal-data-label mb-0">Children in employment, (% of age 7-14):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["SL.TLF.0714.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["SL.TLF.0714.ZS"].year})</span>
					</p>
				</div>	
				<div>
					<p class="modal-data-label mb-0">Population in slums (%):</p>
					<p class="modal-data-med">
					${Number(mostRecentData["EN.POP.SLUM.UR.ZS"].value)} 
					<span class="dataYear">(${mostRecentData["EN.POP.SLUM.UR.ZS"].year})</span>
					</p>
				</div>
			`)
		}
		//    ****    MONEY EXCHANGE    ****    //
		else if (dataType === "money") {
			const { allCurrenciesData, exchangeRatesData } = data
			const currencyArr = Object.values(exchangeRatesData.primaryCurrency);

			$(".modal-body").html(`
				< div class="divNames" >
					<h5>${exchangeRatesData.countryName || "Country not in DB"} - Money</h5>
					<h4>${currencyArr[0].name} (${currencyArr[0].symbol})</h4>
				</div > `);

			renderCurrencyConversionForm1(currencyArr, allCurrenciesData, exchangeRatesData);
			renderCurrencyConversionForm2(currencyArr, allCurrenciesData, exchangeRatesData);

			$(".modal-body").append(`
				< div class="divOneCol" >
					<h6>exchange rates as of UTC time</h6>
					<h6>${exchangeRatesData.exchangeRates.time_last_update_utc}</h6>
				</div >
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Euro (€):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.EUR}</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>US Dollar (US$): </p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.USD}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Japanese yen (¥ / 円):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.JPY}</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>British pound (£):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.GBP}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Swiss franc (CHF):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.CHF}</span></p>
					</div>
					<div class="divSplitColumnsRight">					
						<p>Renminbi (¥ / 元):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.CNY}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Australian dollar (A$):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.AUD}</span></p>
					</div>					
					<div class="divSplitColumnsRight">
						<p>Canadian dollar (C$):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.CAD}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Swedish krona (kr):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.SEK}</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>Norwegian krona (kr):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.NOK}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Danish krona (kr):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.DKK}</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>Polish złoty (zł):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.PLN}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Czech koruna (Kč):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.CZK}</span></p>
					</div>					
					<div class="divSplitColumnsRight">
						<p>Romanian leu (L):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.RON}</span></p>
					</div>
				</div>
				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Hungarian forint (Ft):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.HUF}</span></p>
					</div>					
					<div class="divSplitColumnsRight">
						<p>Bulgarian lev (лв):</p>
						<p class="modal-data-med"><span>${exchangeRatesData.exchangeRates.conversion_rates.BGN}</span></p>
					</div>
				</div>
			`)
		}
		//    ****    WEATHER    ****    //
		else if (dataType === "weather") {
			// console.log(data);
			const { capitalName, countryName, main, weatherArr, clouds, wind, epochDateTime } = data;
			// weather is array
			const weather = weatherArr[0];

			$(".modal-body").html(`
				< div class="divNames" >
					<h5>Current weather in ${capitalName}</h5>
					<h5 class="weatherSubHeading1">(capital of ${countryName || "Country not in DB"})</h5>
					<h5 class="weatherSubHeading1">at ${epochDateTime} (Unix time)</h5>
				</div >
				<div class="divTwoCols">
					<div class="divWeather">
						<div class="weatherIcon"><img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png"></div>
					</div>
					<div>
						<p class="weatherDescription1">${weather.main}</p>
						<p class="weatherDescription2">${weather.description}</p>
					</div>
				</div>


				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Temperature:</p>
						<p class="modal-data-med">${main.temp}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>Feels Like:</p>
						<p class="modal-data-med">${main.feels_like}<span class="weatherMeasurement">&deg;C</span></p>
					</div>
				</div>

				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Humidity:</p>
						<p class="modal-data-med">${main.humidity}<span class="weatherMeasurement">%</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>Pressure:</p>
						<p class="modal-data-med">${main.pressure}<span class="weatherMeasurement">hPa</p>
					</div>
				</div>

				<div class="divTwoColsSplit">
					<div class="divSplitColumnsLeft">
						<p>Wind:</p>
						<p class="modal-data-med">${wind}<span class="weatherMeasurement">m/s</span></p>
					</div>
					<div class="divSplitColumnsRight">
						<p>Clouds</p>
						<p class="modal-data-med">${clouds}<span class="weatherMeasurement">%</span></p>
					</div>
				</div>
			`)
		}

		// ... AND FINALLY, make the modal visible
		$("#genericModal").modal("show");
	}

	// end of $(document).ready(function {
})



