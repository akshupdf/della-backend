const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'della-crm',
  api_key: '295394913666124',
  api_secret: 'GL65zrffKwvjDIk-oaxb-U1ee2g',
});

module.exports = cloudinary;
