if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(function() {
      console.log('Service Worker Registered');
    }
  );
  navigator.serviceWorker.ready.then(function(swRegistration) {
    return swRegistration.sync.register('myFirstSync');
  });
}

class DBHelper {

  static get DATABASE_URL() {
    const port = 1337
    return `http://localhost:${port}/restaurants`;
  }
  static get DATABASE_URL_reviews() {
    const port = 1337
    return `http://localhost:${port}/reviews`;
  }

  static initIndexedDB() {
    this.dbPromise = idb.open('restaurant-db', 1, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
        case 1:
        case 2:
          const restaurantStore = upgradeDb.createObjectStore('restaurants', {
            keyPath: 'id',
            autoIncrement: true
          });
          restaurantStore.createIndex('photographs', 'photograph');
      }
    });
  }

  static fetchRestaurantsFromIndexedDb() {
    return this.dbPromise.then(function (db) {
      var tx = db.transaction(['restaurants']);
      var restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.getAll();
    })
  }
  static fetchRestaurants(callback) {
    var self = this;
    DBHelper.fetchRestaurantsFromIndexedDb().then((restaurants) => {
      
      callback(null, restaurants);
    });

    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) {
        var restaurants = JSON.parse(xhr.responseText);

        restaurants.map(function (restaurant) {
          let xhr_rev = new XMLHttpRequest();
          xhr_rev.open(
            'GET', DBHelper.DATABASE_URL_reviews+'/?restaurant_id='+restaurant.id);
          xhr_rev.onload = () => {
            const reviews = JSON.parse(xhr_rev.responseText);
            restaurant.reviews = reviews;
            self.dbPromise.then(function (db) {
              var tx = db.transaction(['restaurants'], 'readwrite');
              var restaurantStore = tx.objectStore('restaurants');
              return restaurantStore.put(restaurant);
            });
          }
          xhr_rev.send();
          return restaurant;
        });
        callback(null, restaurants);
      } else {
      
        this.dbPromise.then(() => {
          return DBHelper.fetchRestaurantsFromIndexedDb();
        }).then(function (restaurants) {
          callback(null, restaurants);
        }).catch(function () {
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        });
      }
    };
    xhr.onerror = function () {
      DBHelper.fetchRestaurantsFromIndexedDb().then((restaurants) => {
        callback(null, restaurants);
      });
    }
    xhr.send();
  }

 
  static fetchRestaurantFromIndexedDb(id) {
    return this.dbPromise.then(function (db) {
      var tx = db.transaction(['restaurants'], 'readwrite');
      var restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.get(parseInt(id));
    })
  }

 
  static update_fav_true(id) {
    var data = {};
    data.is_favorite = true;
    var json = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", DBHelper.DATABASE_URL + '/' + id);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = function () {
      var restaurant = JSON.parse(xhr.responseText);
      console.log(restaurant);
    }
    xhr.send(json);
  }

  
  static update_fav_false(id) {
    var data = {};
    data.is_favorite = false;
    var json = JSON.stringify(data);

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", DBHelper.DATABASE_URL + '/' + id);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = function () {
      var restaurant = JSON.parse(xhr.responseText);
      console.log(restaurant);
    }
    xhr.send(json);
  }

  static offlinepost(Json_data) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", DBHelper.DATABASE_URL_reviews, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.send(Json_data);
  }

  
  static addNewReview(name, res_id, rate, comment) {
    var self = this;
    var data = {};
    data.restaurant_id = res_id;
    data.name = name;
    data.rating = rate;
    data.comments = comment;
    var json = JSON.stringify(data);
    console.log(self.Json_data);
    var xhr = new XMLHttpRequest();
    xhr.open("POST", DBHelper.DATABASE_URL_reviews, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = function () {
      if (xhr.status === 200) {
        var review = JSON.parse(xhr.responseText);
      } else {
        self.dbPromise.then(() => {
          return DBHelper.fetchRestaurantFromIndexedDb(res_id)
        }).then(function (restaurant) {
          console.log(restaurant);
          restaurant.reviews.push(json);
          console.log(restaurant.reviews);
          self.dbPromise.then(function (db) {
            var tx = db.transaction(['restaurants'], 'readwrite');
            var restaurantStore = tx.objectStore('restaurants');
            return restaurantStore.put(restaurant);
          });
        });
      }
    };

    xhr.onerror = function () {
      DBHelper.fetchRestaurantFromIndexedDb(res_id).then((restaurant) => {
        restaurant.reviews.push(data);
        self.dbPromise.then(function (db) {
          var tx = db.transaction(['restaurants'], 'readwrite');
          var restaurantStore = tx.objectStore('restaurants');
          return restaurantStore.put(restaurant);
        }).then(() => {
          alert("You are Working offline");
        }).then(() => {
          DBHelper.offlinepost(json);
        });
      });
    }
    xhr.send(json);
  }

  static fetchRestaurantById(id, callback) {

    var self = this;
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL + '/?id=' + id);
    xhr.onload = () => {
      if (xhr.status === 200) {
        var restaurant = JSON.parse(xhr.responseText);
        let xhr_rev = new XMLHttpRequest();
        xhr_rev.open(
          'GET', DBHelper.DATABASE_URL_reviews+'/?restaurant_id='+restaurant.id);
        xhr_rev.onload = () => {
          const Reviews = JSON.parse(xhr_rev.responseText);
          restaurant.reviews = Reviews;
          self.dbPromise.then(function (db) {
            var tx = db.transaction(['restaurants'], 'readwrite');
            var restaurantStore = tx.objectStore('restaurants');
          
            return restaurantStore.put(restaurant);
          });
          callback(null, restaurant);
        }
        xhr_rev.send();
      } else {
        this.dbPromise.then(() => {
          return DBHelper.fetchRestaurantFromIndexedDb(id)
        }).then(function (restaurant) {
          callback(null, restaurant);
        }).catch(function () {
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        });
      }
    };

    xhr.onerror = function () {
      DBHelper.fetchRestaurantFromIndexedDb(id).then(function (restaurant) {
        callback(null, restaurant);
      });
    }
    xhr.send();
  }

 
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
   
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
   
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') {
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  
  static fetchNeighborhoods(callback) {
    
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
       
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
       
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  
  static fetchCuisines(callback) {
    
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
       
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
       
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

 
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }


 
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph === undefined) {
      return (`/img/1.webp`);
    }
    return (`/img/${restaurant.photograph}.webp`);
  }
  
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}

