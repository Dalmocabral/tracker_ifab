




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
             
  .addTo(map)
      
    
  
    }
  }
})();
