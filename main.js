// takes the name of a restaurant and fetches the json
// file for that restaurant, 
async function getAddress(name) {
  //if no name is passed as an argument
  if (!name) {
    console.log("no place name specfied");
    // return B. VT 05401 as the name of the place
    return 'Burlington, VT 05401'
  } else {
    console.log("fetching place named '" + name + "'");
  
    //fetch restaurant json as a Promise, wait for it to finish
    const response = await fetch(name + '.json');
    // convert response to json, wait for it to finsih
    const object = await response.json();
    //get address and return
    const address = object.address;
    console.log(address);
    return address;
    }
}

// displayMap function handles displaying the 
// pin on a particular restaurant
async function displayMap(restaurant) {
  // get the address of the restaurant passed into displayMap
  const address = await getAddress(restaurant);
  console.log({address: address});

  // fetch the json data from nomatim API for the address requested
  fetch(`https://nominatim.openstreetmap.org/search/?q=${address}&format=json`)
  .then(response => response.json())  // promise response to json
  .then(json => {
    console.log({lat: json[0].lat, lon: json[0].lon});
    // assing the map variable, set it to id of html div
    // and set the view to lat and lon of restaurant
    var map = L.map('mapid').setView([json[0].lat, json[0].lon], 20);
  
    // add tile layer to map, from Interactive Maps slides, change later?
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    // if there is an address passed into the function
    if(address !== 'Burlington, VT 05401') {
      // set marker on the coordinates of the restaurant
      L.marker([json[0].lat, json[0].lon]).addTo(map)
        // can set notes in popup for later story
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    // otherwise, address is Burlington so display all the pins
    } else {
      displayAllPins();
    }
  });
}

// function handles showing all of the markers
// on the map when an address is not specified
// uses async/await method to fetch json
async function displayAllPins() {
  console.log('were gonna display all the pins');
  // create an array to hold to lats and longs of all restaurants
  let latsLongs = [];
  // fetch all restaurant names & get json, wait to finish
  let response = await fetch('all.json');
  let json = await response.json();

  // find lat and long for each address and push to array
  for await (const elem of json) {
    let address = await getAddress(elem);
    let oneLatLong = await getLatLon(address);
    latsLongs.push(oneLatLong);
  }
}

// takes an address as an argument
async function getLatLon(address) {
  // fetch json data for address
  const response = await fetch(`https://nominatim.openstreetmap.org/search/?q=${address}&format=json`);
  const json = await response.json();
  // return the lat and lon as an object
  return {lat: json[0].lat, lon: json[0].lon};
}

// function creates the links for all restaurant names in all.json
function createLinks() {
  // get ul element that will hold the links
  const linkContainer = document.getElementById('links');
  // fetch all addresses, convert to json
  fetch('all.json').then(response => response.json())
  .then(json => {
    // for each address in json
    json.forEach(element => {

      // create list item and anchor elements 
      const listItem = document.createElement('li');
      const link = document.createElement('a');

      //set text content the the name of the restaurant. should capitalize
      link.textContent = spaceRestaurantName(element);
      // set path to query the restaurant name
      link.href = `index.html?restaurant=${element}`;

      // append link to li and li to ul 
      listItem.appendChild(link);
      linkContainer.appendChild(listItem);
    });
  })
}

// replaces dashes in a restaurant name with spaces, capitalize in here?
function spaceRestaurantName(restaurant) {
  restaurant = restaurant.split('-').join(' ');
  return restaurant;
}

// get the restaurant in the query parameter
let restaurantName = document.location.href.split('restaurant=').slice(-1)[0];
console.log({restaurantName: restaurantName});

// if there is no restuarant query
if(!restaurantName.includes('restaurant=')) {
  console.log('display all pins');
  // display map with all pins and create the links
  displayMap();
  createLinks();
  // otherwise, display the map with the pin for that restaurant
} else {
  displayMap(restaurantName);
  createLinks();
}