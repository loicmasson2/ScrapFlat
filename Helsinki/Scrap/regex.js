let hasSauna = new RegExp('\\s*\\+*(s|sauna)\\+*\\s*', 'gi');
let hasKitchen = new RegExp('\\s*\\+*(k|Keittiö)\\+*\\s*', 'gi');
let hasBalcony = new RegExp('\\s*\\+*(p|Parveke)\\+*\\s*', 'gi');
let hasBathroom = new RegExp('\\s*\\+*(kph|kh|Kylpyhuone)\\+*\\s*', 'gi');
let superMoreInfoRoom = product.productRoomDescription.match(/(\d+\s*[hyrk])/gi);
let whichCharacter = 'h';
if (superMoreInfoRoom[0].substr(0, superMoreInfoRoom[0].toLowerCase().indexOf('h')) === '') {
    whichCharacter = 'r';
}
