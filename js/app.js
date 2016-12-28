var map;

function Place(data) {
	var marker;
	this.name = data.venue.name;
	this.lat = data.venue.location.lat;
	this.lng = data.venue.location.lng;
	this.category = data.venue.categories[0].pluralName;
	this.rating = data.venue.rating;
	this.marker = {};
}

function places() {
	var marker,
		placeLat,
		placeLng,
		service;
	var defaultLocation = 'paris';

	var self = this;
	self.listOfPlaces = ko.observableArray([]);
	self.filteredPlaces = ko.observableArray([]);
	self.keyword = ko.observable('');
	//self.place = ko.observable(defaultLocation);

	self.initMap = function() {
		map = new google.maps.Map(document.getElementById('map'), { 
    		center: {lat: 45.5016889, lng: -73.567256},
    		zoom: 13
  		});
	};

	function getLocation(location) {

		var request = {
			query: location
		};


		service = new google.maps.places.PlacesService(map);
		service.textSearch(request, callback);
	}

	function callback(results, status) {
  		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		getPlacesInLocation(results[0]);
  		}
  		else {
  			console.log(status);
  		}
	}

	function getPlacesInLocation(place) {
		console.log(place.location);
		placeLat = place.geometry.location.lat();
		placeLng = place.geometry.location.lng();

		map.setCenter(new google.maps.LatLng(placeLat, placeLng));

		loadFoursquarePlaces();
	}

	function initializeLocation(location) {
		getPlacesInLocation(location)
	};


	self.loadFoursquarePlaces = function() {

	  var clientSecret = "UKDBXCJSYFG0AL3MDBMGWHHJSMAIR3S5V5NZISHJQOIKOMEP",
	  	  clientId = "KKTBRM0OM2QIUW5TVMRYK42XV2FIU1AAN5SZY4OMOJB504VU",
	  	  typeOfQuery = "outdoors"

	  $.getJSON("https://api.foursquare.com/v2/venues/explore"+
	  			"?client_id="+clientId+
	  			"&client_secret="+clientSecret+
	  			"&query="+ self.keyword() +
	  			"&v=20161222"+
	  			"&ll="+ placeLat + ',' + placeLng
	  			)
	  			.done(function(data) {
	  				var response = data.response.groups[0].items;
	  					 response.forEach(function(data) {
	  					 	self.listOfPlaces.push(
	  					 		new Place(data)
	  					 	);
	  					 	listOfPlaces.forEach(function(place){
	  					 		setMarkerPlace(place)
	  					 	});
	  					});
	  			})
	  			.fail(function() {
	  				$('.error-message').html("Oops… It seems there was a problem during the request. Data couldn't be loaded from Foursquare.");
	  			})
	};

	self.userInput = ko.observable($('input').val());


	function setMarkerPlace(place) {
		marker = new google.maps.Marker ({
	    	position: new google.maps.LatLng(place.lat, place.lng),
	   		map: map,
	    	title: place.name
  		});
  		place.marker = marker;
	}
	getLocation(defaultLocation);
	//initializeLocation(defaultLocation);
}



ko.applyBindings(places());

