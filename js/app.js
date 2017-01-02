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
	this.address = data.venue.location.formattedAddress;
	this.phone = this.getPhone(data);
	this.url = this.getUrl(data);
}

Place.prototype = {
	getUrl: function (data) {
		return data.venue.url ? data.venue.url : 'Website not available';
	},
	getPhone: function(data) {
		return data.venue.contact.formattedPhone ? data.venue.contact.formattedPhone : 'Contact not available';
	}
}

function places() {
	var self = this;
	var defaultCity = 'montreal';
	var defaultQuery = 'best nearby'
	self.listOfPlaces = ko.observableArray([]);
	self.filteredPlaces = ko.observableArray([]);
	self.markers = ko.observableArray([]);
	self.cityQuery = ko.observable('');
	self.filter = ko.observable('');
	self.selectedMarker = ko.observable();
	
	self.initMap = function() {
		
		var style = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#e9e9e9"},{"lightness":17}]},
					{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":20}]},
					{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffffff"},{"lightness":17}]},
					{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#ffffff"},{"lightness":29},{"weight":0.2}]},
					{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":18}]},
					{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},
					{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f5f5f5"},{"lightness":21}]},
					{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":21}]},
					{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},
					{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},
					{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},
					{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},
					{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];

		map = new google.maps.Map(document.getElementById('map'), { 
    		center: {lat: 45.5016889, lng: -73.567256},
    		styles: style,
    		disableDefaultUI: true,
    		zoom: 16
  		});

  		$('#map').height($(window).height());
	};


	self.filterPlace = ko.computed(function() {

		self.filteredPlaces([]);

		var regexp = new RegExp(self.filter(), 'i');

		self.listOfPlaces().forEach(function(place){

			if(!place.marker) {
				placeMarker(place);
				markers.push(place.marker);
			}
			if ((place.category.search(regexp) !== -1) || 
				place.name.search(regexp) !== -1)  {

	            filteredPlaces.push(place);
	            place.marker.setVisible(true);

	        } 
	        else {
	            place.marker.setVisible(false);
	        }

		});

		return filteredPlaces();
	});

	self.animateMarker = function(place) {
		self.selectedMarker(place.marker);
		toggleBounce(place.marker);
		moveMapCenter(place.lat, place.lng);
		map.setZoom(16);
		for (var i = 0 ; i < markers().length; i++) {
			markers()[i].infowindow.close();
		}

		place.marker.infowindow.open(map,place.marker);
	}

			

	function moveMapCenter(lat, lng) {
		 var center = new google.maps.LatLng(lat, lng);
		  map.panTo(center);
	}


	function placeMarker(places){
		var marker;
		

		marker = new google.maps.Marker ({
	    	position: new google.maps.LatLng(places.lat, places.lng),
	    	map: map,
	    	icon: 'assets/marker_dark_blue.png',
	    	title: places.name,
	    	visible: true,
	    	animation: google.maps.Animation.DROP
  		});
		places.marker = marker;

		infoWindow(places, marker);


	}


	function infoWindow(places,marker) {

		var formattedUrl = function (){
			if (places.url !== 'Website not available'){
				return "<div class='urlContainer'>"
						+ "<a href='"+places.url+"'class='infoWindowurl'>"
						+ places.url + "</a> </div>"
			}
			else {
				return "<div class='urlContainer'>"
						+ "<span class='infowindowUrl'>"
						+ places.url + "</span> </div>"
			}
		}

		var infoWindowContent = "<div class='infoWindowContainer'>"
								+ "<div class='nameContainer'>"
								+ "<h3 class='infoWindowName'>"
								+ places.name + "</h3> </div> "
								+ "<div class='categoryContainer'>"
								+ "<span class='infoWindowCategory'>"
								+ places.category + "</span> </div>"
								+ "<div class='addressContainer'>"
								+ "<span class='infoWindowAddress'>"
								+ places.address + "</span> </div>"
								+ "<div class='contactContainer'>"
								+ "<span class='infoWindowPhone'>"
								+ places.phone + "</span> </div>"
								+ formattedUrl();
								+ "</div>";

		var infoWindow = new google.maps.InfoWindow({
      		content: infoWindowContent
    	});

    	marker.infowindow = infoWindow;

		google.maps.event.addListener(marker, 'click', function() {
			for (var i = 0 ; i < markers().length; i++) {
			markers()[i].infowindow.close();
		}
      		toggleBounce(marker);
      		map.setZoom(16);
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

	self.loadFoursquarePlaces = function() {

	self.listOfPlaces([]);

	  var clientSecret = "UKDBXCJSYFG0AL3MDBMGWHHJSMAIR3S5V5NZISHJQOIKOMEP",
	  	  clientId = "KKTBRM0OM2QIUW5TVMRYK42XV2FIU1AAN5SZY4OMOJB504VU",
	  	  city = (cityQuery() != "") ? cityQuery() : defaultCity,
	  	  query = defaultQuery

	  $.getJSON("https://api.foursquare.com/v2/venues/explore"+
	  			"?client_id="+clientId+
	  			"&client_secret="+clientSecret+
	  			"&near="+ city +
	  			"&v=20161222"+
	  			"&query="+ query
	  			)
	  			.done(function(data) {
	  				var response = data.response.groups[0].items;
	  					 response.forEach(function(data) {
	  					 	self.listOfPlaces.push(
	  					 		new Place(data)
	  					 	);
	  					});
	  					moveMapCenter(data.response.geocode.center.lat, data.response.geocode.center.lng);

	  			})
	  			.fail(function() {
	  				$('.error-message').html("Oops… It seems there was a problem during the request. Data couldn't be loaded from Foursquare.");
	  			})
	};

}


ko.applyBindings(places());



