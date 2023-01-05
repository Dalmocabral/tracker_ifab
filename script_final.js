let markers = [];
let trajectoryLine = null;
let firstMarker = null;
let lastMarker = null;




/* Nessa parte estarei criando as funcões para calculo matemático
como distancia, tempo e curvatura da terra.*/

// Essa função faz a conveção de grau em radioano
const toRadians = (degrees) => (degrees * Math.PI) / 180;


// Calcular a distância em milhas náuticas entre dois pontos
const getDistanceInNauticalMiles = (lat1, lon1, lat2, lon2) => {
    const R = 3440.069; // Earth's radius in nautical miles
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    lat1 = toRadians(lat1);
    lat2 = toRadians(lat2);
  
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };


  // Calcula aprocemadamente a hora de chegada do destino final.
  const calculateArrivalTime = (distance, speed) => {
    const secondsPerHour = 3600;
    const travelTimeInSeconds = distance / speed * secondsPerHour;
    const arrivalTime = new Date(Date.now() + travelTimeInSeconds * 1000);
    return arrivalTime;
  };




//Aqui as funções que tratara o consumo de informações da API do Infinite flight e api criado por mim.


// Essa funcão tras dados de logos de companhia aerea que estão no IF
const getLog = async () => {
    try {
      const response = await fetch(
        'https://raw.githubusercontent.com/Dalmocabral/infinteflightaerobrasil_atc/master/Planilha1.json'
      );
      const logos = await response.json();
      return logos;
    } catch (error) {
      console.error(error);
    }
  };

// Função que tras informação do plano de voo de cada usuario tendo como paramentro flightID
const getFlightPlan = async (flightId) => {
    try {
      const response = await fetch(
        `https://api.infiniteflight.com/public/v2/sessions/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856/flights/${flightId}/flightplan?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw`
      );
      const { result: flightPlan } = await response.json();
      return flightPlan.flightPlanItems;
    } catch (error) {
      console.error(error);
    }
  };

/*Função que tras informações de ATIS (Automatic Terminal Information Service 
ou Serviço Automático de Informação Terminal) tendo como paramentro ICAO do aeroporto*/
  const getAtcAtis = async airportIcao => {
    try {
      const response = await fetch(
        `https://api.infiniteflight.com/public/v2/sessions/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856/airport/${airportIcao}/atis?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw`
      );
      const { result: atcAtis } = await response.json();
  
      return atcAtis;
    } catch (error) {
      console.error(error);
    }
  };

  const getFlightWord = async () => {
    try {
      const response = await fetch(
        'https://api.infiniteflight.com/public/v2/sessions/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856/world?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw'
      );
      const { result: worlds } = await response.json();
  
      return worlds;
    } catch (error) {
      console.error(error);
    }
  };

const getFlightATC = async () => {
    try {
      const response = await fetch(
        'https://api.infiniteflight.com/public/v2/sessions/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856/atc?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw'
      );
      const { result: atcs } = await response.json();
  
      return atcs;
    } catch (error) {
      console.error(error);
    }
  };



var map = L.map('map').setView([-11.474998561324318, -30.927220353856082], 2);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

layerGroup = L.layerGroup().addTo(map);
openAirportsLayer = L.layerGroup().addTo(map);

var sentral = L.control({position: "bottomleft"});
sentral.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend");
    div.innerHTML = '<img width="90" src="https://i.ibb.co/zX0Q92G/logo-ifab.png">';
    return div;
}
sentral.addTo(map); 


var osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});



var satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19,
  attribution: 'Tiles © Esri'
});

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var baseLayers = {
  "OpenStreetMap": osmLayer,  
  "Satellite": satelliteLayer,
  "Dark": CartoDB_DarkMatter
};

var overlays = {
  "IFATC": openAirportsLayer
};

L.control.layers(baseLayers, overlays).addTo(map);









const aircraftIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/Dalmocabral/react_if_tracker/main/src/components/airplane.png',
    iconSize: [26, 26],
    iconAnchor: [12, 24],
    labelAnchor: [6, 0]
  });

  const aircraftIconAdm = L.icon({
    iconUrl: 'https://i.ibb.co/zXmYPYf/airplane-1.png',
    iconSize: [26, 26],
    iconAnchor: [12, 24],
    labelAnchor: [6, 0]
  });
  
  const torre = L.icon({
    iconUrl: 'https://i.ibb.co/6HPskx4/torre.png',
    iconSize: [26, 26],
    iconAnchor: [12, 24],
    labelAnchor: [6, 0]
  });

  

(async () => {

    var atcsloc = L.icon({
      iconUrl: 'https://i.ibb.co/4RzzXBz/atc11.png', //https://i.ibb.co/4RzzXBz/atc11.png
      iconSize: [25, 25],
      iconAnchor: [12, 24]
    });
  
    // Chame a função getFlightATC e armazene o resultado em uma variável
    const atcs = await getFlightATC();
    const world = await getFlightWord();
  
    
  // Itera sobre a lista de atcs e adiciona cada um deles ao mapa
    for (const atc of atcs) {
      // Encontre o elemento correspondente ao airportName do atc na lista worlds
      const matchingWorld = world.find(world => world.airportIcao === atc.airportName);
  
      if (typeof atc === 'object' && atc !== null && matchingWorld) {
        const atis = await getAtcAtis(atc.airportName);
  
        L.marker([atc.latitude, atc.longitude], { icon: atcsloc })
    .bindPopup(`<b>Airport:</b> ${atc.airportName}<br> 
                <b>Aeronave Saindo: </b> ${matchingWorld.outboundFlightsCount}<br>
                <b>Aeronave Chegando: </b> ${matchingWorld.inboundFlightsCount}<br>
                <hr>
                <b>Atis:</b> ${atis}              
                
                `)               
    .addTo(openAirportsLayer)    
      
    
      }
    }
  })();
  


const getFlights = async () => {
    try {
      const response = await fetch('https://api.infiniteflight.com/public/v2/flights/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw');
      const { result: flights } = await response.json();
      const ifabFlights = flights.filter(flight => flight.virtualOrganization && flight.virtualOrganization.includes('IFAB'));
      
      
      if (ifabFlights.length > 0){
      document.getElementById('quant').textContent = ifabFlights.length;
      } else {
        document.getElementById('quant').textContent = '0';
      }
  
      const getlogos = await getLog()
      // atualizando a posição dos macadores no mapa
      for (const flight of ifabFlights) {
        for (const logo of getlogos){
          
  
        
  
        const markerIndex = markers.findIndex(marker => marker.flightId === flight.flightId);
        if (markerIndex !== -1) {
          // atualiza a posição do marcador
          markers[markerIndex].setLatLng([flight.latitude, flight.longitude]);
        } else {
          if (flight.liveryId == logo.LiveryId){

            if(flight.username == 'Gabriel_f' || flight.username == 'Maverick_Brasil' || flight.username == 'Andre_Siqueira2' ||
             flight.username == 'Mozart_Passaredo' || flight.username == 'dalmo_cabral' || flight.username == 'Matheus_Etges' || 
             flight.username == 'Guilherme_Carvalho'){

                // cria um novo marcador
          const marker = L.marker([flight.latitude, flight.longitude], { icon: aircraftIconAdm, rotationAngle: flight.heading }).addTo(layerGroup);
          const locatual = [flight.latitude, flight.longitude]        
  
          marker.bindTooltip('<img src="' + logo.Logo + '" width="25px">', { className: 'labelstyle', permanent: true, color: "#FF000080", radius: 12, direction: 'auto'})
          marker.bindPopup(`<h3>${flight.username}</h3>
                            <hr>
                           <b> Callsign:</b> ${flight.callsign}<br>
                           <b> Speed:</b> ${flight.speed.toFixed(0)} kts<br>
                           <b> Altitude:</b> FL${flight.altitude.toFixed(0) / 100}<br>
                           `);
          marker.flightId = flight.flightId;
  
          marker.on('click', async function () {
            // Obtém o flightPlan do voo
            const flightPlan = await getFlightPlan(flight.flightId);
  
            // Verifica se o flightPlan não está vazio
            if (flightPlan.length > 0) {
              // Obtém as coordenadas do primeiro e último item do flightPlan
              const coordinates = flightPlan.map(item => [item.location.latitude, item.location.longitude]);
              const firstCoordinate = coordinates[0];
              const lastCoordinate = coordinates[coordinates.length - 1];
              // Verifica se os marcadores da primeira e última coordenadas já foram criados
              if (firstMarker) {
                // Remove o marcador da primeira coordenada do mapa
                map.removeLayer(firstMarker);
                firstMarker = null;
              }
              if (lastMarker) {
                // Remove o marcador da última coordenada do mapa
                map.removeLayer(lastMarker);
                lastMarker = null;
              }
  
              // Cria um marcador para a primeira coordenada usando o ícone desejado
              firstMarker = L.marker(firstCoordinate, { icon: torre }).addTo(map);
  
              // Cria um marcador para a última coordenada usando o ícone desejado
              lastMarker = L.marker(lastCoordinate, { icon: torre }).addTo(map);
  
              // Mover e redimensionar o mapa de forma suave para a posição do marcador
             // map.flyTo(marker.getLatLng(), 2);
  
              // Verifica se o marcador clicado é diferente do marcador anteriormente clicado
              if (trajectoryLine && marker !== lastClickedMarker) {
                // Remove a linha de trajetória do mapa
                layerGroup.removeLayer(trajectoryLine);
                trajectoryLine = null;
              }
  
              // Cria uma nova instância de L.polyline usando as coordenadas
              trajectoryLine = L.polyline([firstCoordinate, locatual, lastCoordinate], { color: 'red', dashArray: '5 5' });
  
              // Adiciona a linha de trajetória ao layerGroup
              layerGroup.addLayer(trajectoryLine);
  
              // Atualiza o marcador clicado mais recentemente
              lastClickedMarker = marker;
            }
          });
          markers.push(marker);

             }else {
            
          // cria um novo marcador
          const marker = L.marker([flight.latitude, flight.longitude], { icon: aircraftIcon, rotationAngle: flight.heading }).addTo(layerGroup);
          const locatual = [flight.latitude, flight.longitude]        
  
          marker.bindTooltip('<img src="' + logo.Logo + '" width="25px">', { className: 'labelstyle', permanent: true, color: "#FF000080", radius: 12, direction: 'auto'})
          marker.bindPopup(`<h3>${flight.username}</h3>
                            <hr>
                           <b> Callsign:</b> ${flight.callsign}<br>
                           <b> Speed:</b> ${flight.speed.toFixed(0)} kts<br>
                           <b> Altitude:</b> FL${flight.altitude.toFixed(0) / 100}<br>
                           `);
          marker.flightId = flight.flightId;
  
          marker.on('click', async function () {
            // Obtém o flightPlan do voo
            const flightPlan = await getFlightPlan(flight.flightId);
  
            // Verifica se o flightPlan não está vazio
            if (flightPlan.length > 0) {
              // Obtém as coordenadas do primeiro e último item do flightPlan
              const coordinates = flightPlan.map(item => [item.location.latitude, item.location.longitude]);
              const firstCoordinate = coordinates[0];
              const lastCoordinate = coordinates[coordinates.length - 1];
              // Verifica se os marcadores da primeira e última coordenadas já foram criados
              if (firstMarker) {
                // Remove o marcador da primeira coordenada do mapa
                map.removeLayer(firstMarker);
                firstMarker = null;
              }
              if (lastMarker) {
                // Remove o marcador da última coordenada do mapa
                map.removeLayer(lastMarker);
                lastMarker = null;
              }
  
              // Cria um marcador para a primeira coordenada usando o ícone desejado
              firstMarker = L.marker(firstCoordinate, { icon: torre }).addTo(map);
  
              // Cria um marcador para a última coordenada usando o ícone desejado
              lastMarker = L.marker(lastCoordinate, { icon: torre }).addTo(map);
  
              // Mover e redimensionar o mapa de forma suave para a posição do marcador
             // map.flyTo(marker.getLatLng(), 2);
  
              // Verifica se o marcador clicado é diferente do marcador anteriormente clicado
              if (trajectoryLine && marker !== lastClickedMarker) {
                // Remove a linha de trajetória do mapa
                layerGroup.removeLayer(trajectoryLine);
                trajectoryLine = null;
              }
  
              // Cria uma nova instância de L.polyline usando as coordenadas
              trajectoryLine = L.polyline([firstCoordinate, locatual, lastCoordinate], { color: 'black', dashArray: '5 5' });
  
              // Adiciona a linha de trajetória ao layerGroup
              layerGroup.addLayer(trajectoryLine);
  
              // Atualiza o marcador clicado mais recentemente
              lastClickedMarker = marker;
            }
          });
          markers.push(marker);
        }
        }
        }
      }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFlightIfab = async () => {

    const table = document.getElementById('myTable');
    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }
  
    try {
      const response = await fetch(
        'https://api.infiniteflight.com/public/v2/flights/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw'
      );
      const { result: flights } = await response.json();
      const ifabFlights = flights.filter(
        (flight) =>
          flight.virtualOrganization && flight.virtualOrganization.includes('IFAB')
      );
  
      const logos = await getLog();
  
      const table = document.getElementById('myTable');
  
  
      let rows = '';
      for (const flight of ifabFlights) {
        const flightPlan = await getFlightPlan(flight.flightId);
  
        if (flightPlan != null && typeof flightPlan === 'object') {
          const logo = logos.find((logo) => logo.LiveryId === flight.liveryId);
          const logoUrl = logo ? logo.Logo : '';
          const dep = flightPlan[0].identifier
          const arr = flightPlan[flightPlan.length - 1].identifier;
          const depDistance = flightPlan[0]
          const arrDistance = flightPlan[flightPlan.length - 1]
          const speed = flight.speed
  
  
  
          const totalDistance = getDistanceInNauticalMiles(
            depDistance.location.latitude,
            depDistance.location.longitude,
            arrDistance.location.latitude,
            arrDistance.location.longitude,
          );
  
          // Calculate the current distance of the flight
          const currentDistance = getDistanceInNauticalMiles(
            flight.latitude,
            flight.longitude,
            depDistance.location.latitude,
            depDistance.location.longitude,
          );
  
          const distance = getDistanceInNauticalMiles(
            flight.latitude,
            flight.longitude,
            arrDistance.location.latitude,
            arrDistance.location.longitude,
          )
  
  
          // Calculate the percentage of the distance traveled
          const percentageTraveled = (currentDistance / totalDistance) * 100;
  
          const arrivalTime = calculateArrivalTime(distance, speed);
          let arrivalTimeString;
          if (flight.speed > 50) {
            arrivalTimeString = arrivalTime.toLocaleString([], { hour: '2-digit', minute: '2-digit', weekday: 'short' });
  
          } else {
            arrivalTimeString = "Ground";
          }
  
          rows += `
    <tr>
      <td>IFAB ${flight.username}</td>
      <td><img src="${logoUrl}" alt="" style="width: 30px; height: 30px;"></td>
      <td>${flight.callsign}</td>
      <td>${dep}</td>
      <td>${arr}</td>
      <td>${Math.trunc(distance)} mn </td>
      <td>${arrivalTimeString}</td>
      <td>
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: ${percentageTraveled}%" aria-valuenow="${percentageTraveled}" aria-valuemin="0" aria-valuemax="100">${percentageTraveled.toFixed(1)}%</div>
  
        </div>
      </td>
    </tr>
  `;
        } else {
          const logo = logos.find((logo) => logo.LiveryId === flight.liveryId);
          const logoUrl = logo ? logo.Logo : '';
          rows += `
        <tr>
          <td>IFAB ${flight.username}</td>
          <td><img src="${logoUrl}" alt="" style="width: 30px; height: 30px;"></td>
          <td>${flight.callsign}</td>
          <td>N/D</td>
          <td>N/D</td>
          <td>N/D</td>
          <td>N/D</td>
          <td>
            <div class="progress">
              <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">0 %</div>
  
            </div>
          </td>
        </tr>
      `;
        }
      }
      table.innerHTML += rows;
    } catch (error) {
      console.error(error);
    }
  };
  
  getFlightIfab();
  
  setInterval(getFlights, 5000)

