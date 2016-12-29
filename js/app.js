var map;
var mapSuccess = function() {
	"use strict";
		initMap();
		loadFoursquarePlaces();
}
var mapError = function() {
	$('#map').html("<h2>Oops. It seems there was a problem. Map couldn't be loading. </h2>")
}

function Place(data) {

	this.name = data.venue.name;
	this.lat = data.venue.location.lat;
	this.lng = data.venue.location.lng;
	this.category = data.venue.categories[0].pluralName;
	this.rating = data.venue.rating;
}

function places() {
	var self = this;
	self.listOfPlaces = ko.observableArray([]);
	self.filteredPlaces = ko.observableArray([]);
	self.markers = ko.observableArray([]);
	
	self.initMap = function() {
		map = new google.maps.Map(document.getElementById('map'), { 
    		center: {lat: 45.5016889, lng: -73.567256},
    		zoom: 13
  		});
	};

	self.cityQuery = ko.observable($('.city').val());
	var defaultCity = 'montreal';

	self.loadFoursquarePlaces = function() {

	self.listOfPlaces([]);

	  var clientSecret = "UKDBXCJSYFG0AL3MDBMGWHHJSMAIR3S5V5NZISHJQOIKOMEP",
	  	  clientId = "KKTBRM0OM2QIUW5TVMRYK42XV2FIU1AAN5SZY4OMOJB504VU",
	  	  city = (cityQuery() != "") ? cityQuery() : defaultCity,
	  	  typeOfQuery = "outdoors"

	  $.getJSON("https://api.foursquare.com/v2/venues/explore"+
	  			"?client_id="+clientId+
	  			"&client_secret="+clientSecret+
	  			"&near="+ city +
	  			"&v=20161222"+
	  			"&section="+typeOfQuery
	  			)
	  			.done(function(data) {
	  				var response = data.response.groups[0].items;
	  					 response.forEach(function(data) {
	  					 	self.listOfPlaces.push(
	  					 		new Place(data)
	  					 	);
	  					});
	  					listOfPlaces().forEach(function(item){
	  						placeMarker(item);
	  					})

	  					moveMapCenter(data.response.geocode.center.lat, data.response.geocode.center.lng);

	  			})
	  			.fail(function() {
	  				$('.error-message').html("Oops… It seems there was a problem during the request. Data couldn't be loaded from Foursquare.");
	  			})
	};

	self.userInput = ko.observable($('input').val());

	self.filterPlace = ko.computed(function() {
		self.filteredPlaces([]);
			if(userInput() !== ""){
				return ko.utils.arrayFilter(self.listOfPlaces(), function(item) {
						if( item.category.toLowerCase() == userInput().toLowerCase() ) {
							filteredPlaces.push(item);
						} else {
							item.marker.setMap(null);
						}
				});
			} else {
				self.filteredPlaces(listOfPlaces());
			}
	});

	function moveMapCenter(lat, lng) {
		 var center = new google.maps.LatLng(lat, lng);
		  map.panTo(center);
	}


	function placeMarker(places){
		var marker;

		marker = new google.maps.Marker ({
	    	position: new google.maps.LatLng(places.lat, places.lng),
	    	map: map,
	    	title: places.name,
	    	animation: google.maps.Animation.DROP
  		});
		places.marker = marker;

		var infoWindow = new google.maps.InfoWindow({
      		content: places.name
    	});

    	marker.infowindow = infoWindow;

		google.maps.event.addListener(marker, 'click', function() {
      		toggleBounce(marker);
      		infoWindow.open(map, marker);
    	});

	}


	function toggleBounce(marker) {  
  		if (marker.setAnimation() != null) {
    		marker.setAnimation(null);
  		} else {
    		marker.setAnimation(google.maps.Animation.BOUNCE);
    		setTimeout(function() {
     		marker.setAnimation(null);
    		}, 2000);
  		}
	}

}

ko.applyBindings(places());

