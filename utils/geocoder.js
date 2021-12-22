const NodeGeocoder = require('node-geocoder');

const options = {
//   provider: process.env.GEOCODER_PROVIDER,
    provider : 'mapquest',
    httpAdapter : 'https',
  apiKey: "vAyVVk2oCPTob0sbgioyAjQSqZAAAl7D", // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder