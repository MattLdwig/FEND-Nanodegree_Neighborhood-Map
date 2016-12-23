function Place(name, lat, lng, category, rating) {
	this.name = ko.observable(name);
	this.lat = ko.observable(lat);
	this.lng = ko.observable(lng);
	this.category = ko.observable(category);
	this.rating = ko.observable(rating);
}

function places() {
	var self = this;
	self.listOfPlaces = ko.observableArray([]);

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
	  			"&section="+typeOfQuery, function(data) {
	  				var response = data.response.groups[0].items;
	  					 response.forEach(function(element) {
	  					 	self.listOfPlaces.push(
	  					 		new Place(element.venue.name, element.venue.location.lat, 
	  							element.venue.location.lng, element.venue.categories[0].pluralName, element.venue.rating)
	  					 	);
	  					})
	  });
	}();

	self.userInput = ko.observable($('input').val().toLowerCase());
	self.filteredPlaces = ko.observableArray([]);

	self.filterPlace = function(target,event) {

		self.filteredPlaces = ([]);

		for ( var i = 0; i < self.listOfPlaces().length ; i++) {
			if (self.listOfPlaces()[i].category().toLowerCase().indexOf(userInput()) > -1 ) {
				console.log('true');
				self.filteredPlaces.push(self.listOfPlaces()[i]);
			}
			else {console.log('false');}
		}
		
	}
}

ko.applyBindings(places());
