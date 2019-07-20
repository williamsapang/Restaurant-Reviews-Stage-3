let restaurant;
var maps;


window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { 
      console.error(error);
    } else {
      self.maps = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.maps);
    }
  });
}


fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { 
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) {
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML(self.restaurant);
      callback(null, restaurant)
    });
  }
}

fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

fillReviewsHTML = (reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.tabIndex = 0;
  title.innerHTML = 'Add a Review';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
}

createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  li.setAttribute("tabIndex", "0");
  name.innerHTML = review.name;
  name.className = 'review-name';
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  rating.className ='review-rating';
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  comments.className = 'review-comments';
  li.appendChild(comments);

  return li;
}

function addReview() {
  var name = document.getElementById('name').value;
  var res_id = document.getElementById('res_id').value;
  var rate = document.getElementById('rate').value;
  var comment = document.getElementById('subject').value;

 
  DBHelper.addNewReview(name, res_id, rate, comment);
  location.reload()
}

getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

fillRestaurantHTML = (restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.setAttribute("alt", restaurant.name + " restaurant");
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  fillReviewsHTML(restaurant.reviews);
}

fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.innerHTML = restaurant.name;
  a.setAttribute("href", "#");
  a.setAttribute("aria-label", restaurant.name);
  li.append(a);
  breadcrumb.appendChild(li);
}


DBHelper.initIndexedDB();