var map = L.map('map').setView([51.505, -0.09], 3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

layerGroup = L.layerGroup().addTo(map);

const getLog = async () => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/Dalmocabral/infinteflightaerobrasil_atc/master/Planilha1.json');
    const logo = await response.json();
    return logo;
  } catch (error) {
    console.error(error);
  }
};




// Implementando função getPlan para obter informacões do plano de voo
const getFlightPlan = async flightId => {
  try {
    const response = await fetch(`https://api.infiniteflight.com/public/v2/sessions/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856/flights/${flightId}/flightplan?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw`);
    const { result: flightPlan } = await response.json();
    return flightPlan.flightPlanItems;
  } catch (error) {
    console.error(error);
  }
};



const aircraftIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/Dalmocabral/react_if_tracker/main/src/components/airplane.png',
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

let markers = [];
let trajectoryLine = null;
let firstMarker = null;
let lastMarker = null;

const getFlights = async () => {
  try {
    const response = await fetch('https://api.infiniteflight.com/public/v2/flights/7e5dcd44-1fb5-49cc-bc2c-a9aab1f6a856?apikey=nvo8c790hfa9q3duho2jhgd2jf8tgwqw');
    const { result: flights } = await response.json();
    const ifabFlights = flights.filter(flight => flight.virtualOrganization && flight.virtualOrganization.includes('IFAB'));
    const logos = getLog()
    // atualizando a posição dos macadores no mapa
    for (const flight of ifabFlights) {

      

      const markerIndex = markers.findIndex(marker => marker.flightId === flight.flightId);
      if (markerIndex !== -1) {
        // atualiza a posição do marcador
        markers[markerIndex].setLatLng([flight.latitude, flight.longitude]);
      } else {
        // cria um novo marcador
        const marker = L.marker([flight.latitude, flight.longitude], { icon: aircraftIcon, rotationAngle: flight.heading }).addTo(layerGroup);
        const locatual = [flight.latitude, flight.longitude]
        


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
            map.flyTo(marker.getLatLng(), 5);

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
  } catch (error) {
    console.error(error);
  }
};

setInterval(getFlights, 5000)