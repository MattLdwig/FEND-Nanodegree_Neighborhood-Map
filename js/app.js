var map;
var mapSuccess = function() {
	"use strict";
		initMap();
		loadFoursquarePlaces();
}
var mapError = function() {
	$('#map').html("<h2>Oops. It seems there was a problem. Map couldn't be loading. </h2>")
}

function Place(name, lat, lng, category, rating) {
	var marker;
	this.name = ko.observable(name);
	this.lat = ko.observable(lat);
	this.lng = ko.observable(lng);
	this.category = ko.observable(category);
	this.rating = ko.observable(rating);

	marker = new google.maps.Marker ({
	    position: new google.maps.LatLng(this.lat(), this.lng()),
	    map: map,
	    title: this.name()
  	});
	this.marker = ko.observable(marker);
}

function places() {
	var self = this;
	self.listOfPlaces = ko.observableArray([]);
	self.filteredPlaces = ko.observableArray([]);

	self.initMap = function() {
		map = new google.maps.Map(document.getElementById('map'), { 
    		center: {lat: 45.5016889, lng: -73.567256},
    		zoom: 13
  		});
	};

	self.loadFoursquarePlaces = function() {

	  var clientSecret = "UKDBXCJSYFG0AL3MDBMGWHHJSMAIR3S5V5NZISHJQOIKOMEP",
	  	  clientId = "KKTBRM0OM2QIUW5TVMRYK42XV2FIU1AAN5SZY4OMOJB504VU",
	  	  city = "montreal",
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
	  					 response.forEach(function(element) {
	  					 	self.listOfPlaces.push(
	  					 		new Place(element.venue.name, element.venue.location.lat, 
	  							element.venue.location.lng, element.venue.categories[0].pluralName, element.venue.rating)
	  					 	);
	  					});
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
						if( item.category().toLowerCase() == userInput().toLowerCase() ) {
							filteredPlaces.push(item);
							item.marker().setMap(map);
						} else {
							item.marker().setMap(null);
						}
				});
			} else {
				self.filteredPlaces(listOfPlaces());
				self.filteredPlaces().forEach(function(item) {
					item.marker().setMap(map);
				})
			}
	});
}

ko.applyBindings(places());

