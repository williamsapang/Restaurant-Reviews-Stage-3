let restaurants,
  neighborhoods,
  cuisines
var maps
var markers = []


document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  initializeMapToggle();
  document.querySelectorAll('#neighborhoods-select,#cuisines-select').forEach(
    (el) => {
      el.addEventListener('change', updateRestaurants);
    }
  );
});


fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

function myFunction() {
  event.preventDefault();
  document.getElementById("map-container").style.display = "block";
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  li.tabIndex = 0;
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute("alt", "an image of "+restaurant.name + " resturant");
  image.setAttribute("src", DBHelper.imageUrlForRestaurant(restaurant));
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute("aria-label", "View more Details of "+restaurant.name);
  li.append(more);

  const fav_icon = document.createElement('p');
  if (restaurant.is_favorite == undefined) {
    restaurant.is_favorite = false;
  }
  if(restaurant.is_favorite == false) {
    fav_icon.innerHTML = '&#9734;';
  } else {
    fav_icon.innerHTML = '&#9733;';
  }
  fav_icon.setAttribute('class', 'fav');
  fav_icon.addEventListener('click', function() {
    //console.log(restaurant.is_favorite);
    if(fav_icon.innerHTML.charCodeAt(0) == 9734) {
      fav_icon.innerHTML = '&#9733;';
      // update restaurant
      DBHelper.update_fav_true(restaurant.id);
    } else {
      fav_icon.innerHTML = '&#9734;';
      // update restaurant
      DBHelper.update_fav_false(restaurant.id);
    }
  });
  li.append(fav_icon);

  return li
}


fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}


window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.maps = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  updateRestaurants();
}


updateRestaurants = () => {
  const cuisinesSelect = document.getElementById('cuisines-select');
  const neighborhoodsSelect = document.getElementById('neighborhoods-select');

  const cuisinesIndex = cuisinesSelect.selectedIndex;
  const neighborhoodsIndex = neighborhoodsSelect.selectedIndex;

  const cuisine = cuisinesSelect[cuisinesIndex].value;
  const neighborhood = neighborhoodsSelect[neighborhoodsIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.maps);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}


fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  let images = document.querySelectorAll(".restaurant-img");
  lazyload(images);
  addMarkersToMap();

}



// Initialise indexedDB

DBHelper.initIndexedDB();
