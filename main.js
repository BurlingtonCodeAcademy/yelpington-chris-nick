
async function getAddress(name) {
  if (!name) {
    console.log("no place name specfied");
    return 'Burlington, VT 05401'
  } else {
    console.log("fetching place named '" + name + "'");
  
    const response = await fetch(name + '.json');
    const object = await response.json();
    const address = object.address;
    console.log(address);
    return address;
    }
}


async function displayMap(location) {

  const address = await getAddress(location);
  console.log({address: address});

  fetch(`https://nominatim.openstreetmap.org/search/?q=${address}&format=json`)
  .then(response => response.json())
  .then(json => {
    console.log({lat: json[0].lat, lon: json[0].lon});
    var map = L.map('mapid').setView([json[0].lat, json[0].lon], 20);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
    }).addTo(map);

    if(address !== 'Burlington, VT 05401') {
      // return {lat: json[0].lat, lon: json[0].lon};
      L.marker([json[0].lat, json[0].lon]).addTo(map)
        .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
        .openPopup();
    } else {
      displayAllPins();
    }
  });
}

async function displayAllPins() {
  console.log('were gonna display all the pins');
  let latsLongs = [];
  let response = await fetch('all.json');
  let json = await response.json();
  
  for await (const elem of json) {
    let address = await getAddress(elem);
    let oneLatLong = await getLatLon(address);
    console.log({oneLatLong})
    latsLongs.push(oneLatLong);
  }
  
  console.log({latsLongs})
}

async function getLatLon(location) {
  const request = await fetch(`https://nominatim.openstreetmap.org/search/?q=${location}&format=json`);
  const response = await request.json();
  return {lat: response[0].lat, lon: response[0].lon};
}

function createLinks() {
  const linkContainer = document.getElementById('links');
  
  fetch('all.json').then(response => response.json())
  .then(json => {
    // console.log(json);
    json.forEach(element => {
      console.log(element);
      const linkItem = document.createElement('li');
      const link = document.createElement('a');
      
      link.textContent = spaceRestaurantName(element);
      link.href = `index.html?restaurant=${element}`;

      linkItem.appendChild(link);
      linkContainer.appendChild(linkItem);
    });
    
  })
}

// replaces dashes in a restaurant name with spaces
function spaceRestaurantName(restaurant) {
  restaurant = restaurant.split('-').join(' ');
  return restaurant;
}


let restaurantName = document.location.href.split('restaurant=').slice(-1)[0];
console.log({restaurantName: restaurantName});

if(restaurantName.includes('index.html')) {
  console.log('display all pins');
  
  displayMap();
  createLinks();
} else {
  // getAddress(restaurantName);
  displayMap(restaurantName);
  createLinks();
}