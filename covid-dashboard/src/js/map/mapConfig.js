export default function createConfig(map) {
  addSourseCountries(map);
  addLayerCountries(map);
  addLayerCountriesHover(map);
  return map;
}

function addSourseCountries(map) {
  map.addSource('countries', {
    type: 'geojson',
    data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson',
  });
}

function addLayerCountries(map) {
  map.addLayer({
    id: 'countries',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': 'rgba(98, 123, 193, 1)',
      'fill-opacity': 0,
    },
  });
}

function addLayerCountriesHover(map) {
  map.addLayer({
    id: 'countries-fills-hover',
    type: 'fill',
    source: 'countries',
    paint: {
      'fill-color': 'rgba(98, 123, 193, 1)',
      'fill-opacity': 0.4,
    },
    filter: ['==', 'name', ''],
  });
}
