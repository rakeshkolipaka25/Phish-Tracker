const fs = require('fs');
const path = require('path');

const imagePath = path.join(__dirname, 'public', 'amazon_image.png');
const imageData = fs.readFileSync(imagePath);
const base64 = imageData.toString('base64');
console.log(base64);
