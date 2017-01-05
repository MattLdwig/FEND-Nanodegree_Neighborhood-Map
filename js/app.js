var map;
/**
 * @function Google Map API Callback
 * @description Map initialization and Data loading
 */
function mapSuccess() {
  "use strict";
  initMap();
  loadFoursquarePlaces();
}

/**
 * @function Google Map API Callback
 * @description Displays an error message if a problem occurs when calling the Google Maps API.
 */
function mapError() {
  $('#map').html("<h2>Oops. It seems there was a problem. Map couldn't be loading. </h2>");
}

/**
 * @class Create the Place Class
 * @description Format Foursquare Data
 * @param {object} Foursquare data
 */
function Place(data) {

  this.name = data.venue.name;
  this.lat = data.venue.location.lat;
  this.lng = data.venue.location.lng;
  this.category = data.venue.categories[0].pluralName;
  this.address = data.venue.location.formattedAddress;
  this.phone = this.getPhone(data);
  this.url = this.getUrl(data);
}

/**
 * @function Update Place's prototype
 * @description Return the url if present or a message if it doesn't.
 * @param {object} Foursquare data
 */
Place.prototype.getUrl = function(data) {
  return data.venue.url ? data.venue.url : 'Website not available';
};

/**
 * @function Update Place's prototype
 * @description Return the phone if present or a message if it doesn't.
 * @param {object} Foursquare data
 */
Place.prototype.getPhone = function(data) {
  return data.venue.contact.formattedPhone ? data.venue.contact.formattedPhone : 'Contact not available';
};

/**
 * @function Knockout ViewModel
 * @description 
 */
function places() {
  var self = this;
  var defaultCity = 'paris';
  self.listOfPlaces = ko.observableArray([]);
  self.filteredPlaces = ko.observableArray([]);
  self.markers = ko.observableArray([]);
  self.cityQuery = ko.observable('');
  self.filter = ko.observable('');

  /**
   * @function Google Map Initialization
   * @description Create the map and center it on Paris, FR.
   * Style Map from: https://snazzymaps.com/style/151/ultra-light-with-labels
   */
  self.initMap = function() {

    var style = [{
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{
          "color": "#e9e9e9"
        }, {
          "lightness": 17
        }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{
          "color": "#f5f5f5"
        }, {
          "lightness": 20
        }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{
          "color": "#ffffff"
        }, {
          "lightness": 17
        }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [{
          "color": "#ffffff"
        }, {
          "lightness": 29
        }, {
          "weight": 0.2
        }]
      },
      {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{
          "color": "#ffffff"
        }, {
          "lightness": 18
        }]
      },
      {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [{
          "color": "#ffffff"
        }, {
          "lightness": 16
        }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{
          "color": "#f5f5f5"
        }, {
          "lightness": 21
        }]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{
          "color": "#dedede"
        }, {
          "lightness": 21
        }]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [{
          "visibility": "on"
        }, {
          "color": "#ffffff"
        }, {
          "lightness": 16
        }]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [{
          "saturation": 36
        }, {
          "color": "#333333"
        }, {
          "lightness": 40
        }]
      },
      {
        "elementType": "labels.icon",
        "stylers": [{
          "visibility": "off"
        }]
      }, {
        "featureType": "transit",
        "elementType": "geometry",
        "stylers": [{
            "color": "#f2f2f2"
          },
          {
            "lightness": 19
          }
        ]
      }, {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [{
          "color": "#fefefe"
        }, {
          "lightness": 20
        }]
      },
      {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [{
          "color": "#fefefe"
        }, {
          "lightness": 17
        }, {
          "weight": 1.2
        }]
      }
    ];

    map = new google.maps.Map(document.getElementById('map'), {
      center: {
        lat: 48.85341,
        lng: 2.3488
      },
      styles: style,
      disableDefaultUI: true,
      zoom: 14
    });
    // Resize the map if the sidebar is visible (vw > 1099)
    if ($(window).width() > 1099) {
      $('#map').width($(window).width() - $('.sidebar').width());
    }
    // Set the map height to the window height;
    $('#map').height($(window).height());
  };

  /**
   * @function filter
   * @description Empty filteredPlaces,
   * Use the self.filter() observable as global RegExp,
   * Iterate over listOfPlaces and for each place :
   * If the place has no marker, call placeMarker() 
   * and push the new marker to the markers([]) observables array. 
   * if the name or the category of the place match with the user input, 
   * push the place in filteredPlace and set its marker to visible.
   * Else, set its marker to hidden.
   * Return filteredPlaces();
   */
  self.filterPlace = ko.computed(function() {

    self.filteredPlaces([]);

    var regexp = new RegExp(self.filter(), 'i');

    self.listOfPlaces().forEach(function(place) {

      if (!place.marker) {
        placeMarker(place);
        markers.push(place.marker);
      }
      if ((place.category.search(regexp) !== -1) ||
        place.name.search(regexp) !== -1) {

        filteredPlaces.push(place);
        place.marker.setVisible(true);

      } else {
        place.marker.setVisible(false);
      }

    });

    return filteredPlaces();
  });

  /**
   * @function Animate Marker
   * @description When the user click on a place in the list : 
   * Animates the corresponding marker,
   * Set the map center to the place coordinates and zoom.
   * Close all infowindows and open the one corresponding to the place. 
   * @param {object} clicked place in the list 
   */
  self.animateMarker = function(place) {
    toggleBounce(place.marker);
    moveMapCenter(place.lat, place.lng);
    map.setZoom(16);

    for (var i = 0; i < markers().length; i++) {
      markers()[i].infowindow.close();
    }

    place.marker.infowindow.open(map, place.marker);
  };

  /**
   * @function Set the Google Map Center
   * @param {number} latitude coordinates
   * @param {number} longitude coordinates
   */
  function moveMapCenter(lat, lng) {
    var center = new google.maps.LatLng(lat, lng);
    map.panTo(center);
  }

  /**
   * @function Set the places markers
   * @description Create a new marker, set this marker to a new place's property 
   * @param {object} place from listOfPlaces observableArray
   */
  function placeMarker(place) {
    var marker;
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(place.lat, place.lng),
      map: map,
      icon: 'assets/marker_dark_blue.png',
      title: place.name,
      visible: true,
      animation: google.maps.Animation.DROP
    });
    place.marker = marker;

    infoWindow(place, marker);

  }

  /**
   * @function Set infowindow to the place's marker
   * @description Create infowindow, format and set content.
   * Add a click event listener to the place's marker.
   * @param {object} place from listOfPlaces observableArray
   * @param {object} marker property 
   */
  function infoWindow(place, marker) {

    var formattedUrl = function() {
      if (place.url !== 'Website not available') {
        return "<div class='urlContainer'>" +
          "<a href='" + place.url + "'class='infoWindowurl'>" +
          place.url + "</a> </div>";
      } else {
        return "<div class='urlContainer'>" +
          "<span class='infowindowUrl'>" +
          place.url + "</span> </div>";
      }
    };

    var infoWindowContent = "<div class='infoWindowContainer'>" +
      "<div class='nameContainer'>" +
      "<h3 class='infoWindowName'>" +
      place.name + "</h3> </div> " +
      "<div class='categoryContainer'>" +
      "<span class='infoWindowCategory'>" +
      place.category + "</span> </div>" +
      "<div class='addressContainer'>" +
      "<span class='infoWindowAddress'>" +
      place.address + "</span> </div>" +
      "<div class='contactContainer'>" +
      "<span class='infoWindowPhone'>" +
      place.phone + "</span> </div>" +
      formattedUrl(); +
    "</div>";

    var infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    marker.infowindow = infoWindow;

    google.maps.event.addListener(marker, 'click', function() {
      for (var i = 0; i < markers().length; i++) {
        markers()[i].infowindow.close();
      }
      toggleBounce(marker);
      map.setZoom(14);
      infoWindow.open(map, marker);
    });
  }

  /**
   * @function Marker Bounce Animation
   * @description from https://developers.google.com/maps/documentation/javascript/examples/marker-animations
   * @param {object} marker to animate.
   */
  function toggleBounce(marker) {
    if (marker.setAnimation() != null) {
      marker.setAnimation(null);
    } else {
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(function() {
        marker.setAnimation(null);
      }, 2100);
    }
  }

  /**
   * @function Call the Foursquare API
   * @description Empty the listOfPlaces observableArray.
   * If a cityQuery is not empty, use it as place parameter for the jSON query. Else use the defaultCity variable.
   * If successful, create a new object Place with the each place received and push them in the listOfPlaces observableArray.
   * Call the method moveMapCenter with the new coordinates.
   * If the loadinG fail, display an error message on the sidebar.
   */
  self.loadFoursquarePlaces = function() {

    self.listOfPlaces([]);

    var clientSecret = "UKDBXCJSYFG0AL3MDBMGWHHJSMAIR3S5V5NZISHJQOIKOMEP",
      clientId = "KKTBRM0OM2QIUW5TVMRYK42XV2FIU1AAN5SZY4OMOJB504VU",
      city = (cityQuery() !== "") ? cityQuery() : defaultCity,
      query = "topPicks";

    $.getJSON("https://api.foursquare.com/v2/venues/explore" +
        "?client_id=" + clientId +
        "&client_secret=" + clientSecret +
        "&near=" + city +
        "&v=20161222" +
        "&section=" + query
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
        $('.error-message').html(
          "Oops… It seems there was a problem during the request. Data couldn't be loaded from Foursquare.");
      });
  };

}

ko.applyBindings(places());