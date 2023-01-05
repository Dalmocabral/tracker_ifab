// Convert degrees to radians
const toRadians = (degrees) => (degrees * Math.PI) / 180;

// Calculate the distance in nautical miles between two points
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


const calculateArrivalTime = (distance, speed) => {
  const secondsPerHour = 3600;
  const travelTimeInSeconds = distance / speed * secondsPerHour;
  const arrivalTime = new Date(Date.now() + travelTimeInSeconds * 1000);
  return arrivalTime;
};


const getCompanyLogos = async () => {
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

    const logos = await getCompanyLogos();

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