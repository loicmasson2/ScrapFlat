const fs = require('file-system');

const scraperData = require('./save22_02.json');
let removeWrongValues = scraperData.filter(d => {
    let product = d.productInfo;
    let split = d.name.split(' ');
    let size = split[split.length - 2];
    let moreInfo = d.moreInfo;
    return !(
        size === 0 ||
        moreInfo === 'Omahuone' ||
        moreInfo.length > 40 ||
        product.productRoomCount === 'Yksiö' ||
        moreInfo.toLowerCase().substr(0, moreInfo.toLowerCase().indexOf('h')) === '' ||
        isNaN(product.geoCoordinates.latitude) ||
        isNaN(product.geoCoordinates.longitude)
    );
});

let filteredData = removeWrongValues.map(d => {
    let product = d.productInfo;
    let split = d.name.split(' ');
    let size = split[split.length - 2];
    let superMoreInfoRoom = product.productRoomDescription.match(/(\d+\s*[hyrk])/gi);
    let whichCharacter = 'h';
    if (superMoreInfoRoom[0].substr(0, superMoreInfoRoom[0].toLowerCase().indexOf('h')) === '') {
        whichCharacter = 'r';
    }

    return {
        address: product.geoCoordinates.address.streetAddress,
        latitude: Number(product.geoCoordinates.latitude),
        longitude: Number(product.geoCoordinates.longitude),
        nbr_rooms: superMoreInfoRoom[0].substr(0, superMoreInfoRoom[0].toLowerCase().indexOf(whichCharacter)),
        postal_code: product.geoCoordinates.address.postalCode,
        price: Number(product.basePrice),
        // price_per_meter: Number(product.basePrice) / Number(size),
        size: Number(size)
    };
});

let json = JSON.stringify(filteredData);
fs.writeFile('filtered.json', json, 'utf8');
