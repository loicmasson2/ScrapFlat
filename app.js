const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');
const fs = require('file-system');

process.setMaxListeners(Infinity); // <== Important line

function dumpError(err) {
    if (typeof err === 'object') {
        if (err.message) {
            console.log('\nMessage: ' + err.message);
        }
        if (err.stack) {
            console.log('\nStacktrace:');
            console.log('====================');
            console.log(err.stack);
        }
    } else {
        console.log('dumpError :: argument is not an object');
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function getInitialData() {
    try {
        let pagesToScrape = 1;
        const websiteUrl = 'https://www.vuokraovi.com/?locale=en';
        const browser = await puppeteer.launch({ devtools: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await page.goto(websiteUrl);

        // wait to have the input for the city
        await page.waitForSelector('#inputLocationOrRentalUniqueNo');
        // add the city
        await page.type('#inputLocationOrRentalUniqueNo', 'Helsinki');
        // await page.keyboard.press('Enter');
        // select the number of rooms that I want
        let ROOM_2_BUTTON = '#roomCountButtons > div:nth-child(2) > button:nth-child(1)';
        await page.click(ROOM_2_BUTTON);
        let ROOM_3_BUTTON = '#roomCountButtons > div:nth-child(3) > button:nth-child(1)';
        await page.click(ROOM_3_BUTTON);
        // pick the minimum price and the maximum
        await page.type('#rentalsMinRent', '800');
        await page.type('#rentalsMaxRent', '1600');
        // minimum surface and maximum
        await page.type('#surfaceMin', '30');
        await page.type('#surfaceMax', '90');
        await page.focus('#inputLocationOrRentalUniqueNo');

        await page.click('.margin-top-xs-0 > button:nth-child(1)');
        // await page.waitForNavigation();

        await page.waitForSelector('#listContent');
        const nbrFlastText = await page.evaluate(() =>
            document.querySelector('span.bold:nth-child(1)').innerText.split(' ')
        );

        pagesToScrape = Math.ceil(nbrFlastText[0] / 20);
        let currentPage = 1;
        let urls = [];
        while (currentPage <= pagesToScrape) {
            let newUrls = await page.evaluate(() => {
                function dumpError(err) {
                    if (typeof err === 'object') {
                        if (err.message) {
                            console.log('\nMessage: ' + err.message);
                        }
                        if (err.stack) {
                            console.log('\nStacktrace:');
                            console.log('====================');
                            console.log(err.stack);
                        }
                    } else {
                        console.log('dumpError :: argument is not an object');
                    }
                }
                try {
                    let results = [];
                    let items = document.querySelectorAll('div.list-item-container');
                    let hasSauna = new RegExp('\\s*\\+*(s|sauna)\\+*\\s*', 'gi');
                    let hasKitchen = new RegExp('\\s*\\+*(k|Keittiö)\\+*\\s*', 'gi');
                    let hasBalcony = new RegExp('\\s*\\+*(p|Parveke)\\+*\\s*', 'gi');
                    let hasBathroom = new RegExp('\\s*\\+*(kph|kh|Kylpyhuone)\\+*\\s*', 'gi');
                    items.forEach(item => {
                        let moreInfo = item.querySelector('ul.list-unstyled > li.semi-bold:nth-child(2)').innerText;
                        results.push({
                            name: item.querySelector('ul.list-unstyled > li.semi-bold:first-child').innerText,
                            moreInfo: {
                                moreInfo,
                                nbrRooms: moreInfo.substr(0, moreInfo.indexOf('h')),
                                hasSauna: hasSauna.test(moreInfo),
                                hasKitchen: hasKitchen.test(moreInfo),
                                hasBalcony: hasBalcony.test(moreInfo),
                                hasBathroom: hasBathroom.test(moreInfo)
                            },
                            price: item.querySelector('ul.list-unstyled > li:nth-child(4) > span:nth-child(1)')
                                .innerText,
                            link:
                                'https://www.vuokraovi.com' +
                                item.querySelector('.list-item-link').getAttribute('href'),
                            image: item.querySelector('a > div > img ').src.replace('108x81', '640x480'),
                            address: item.querySelector('.address').innerText,
                            availability: item.querySelector('span:nth-child(2) > ul:nth-child(1) > li:nth-child(1)')
                                .innerText
                        });
                    });
                    return results;
                } catch (e) {
                    dumpError(e);
                }
            });
            urls = urls.concat(newUrls);
            console.log(`current page ${currentPage}`);
            if (currentPage < pagesToScrape) {
                await Promise.all([
                    await page.evaluate(selector => document.querySelector(selector).click(), 'img[src*="right.svg"]'),
                    await page.waitForSelector('#listContent')
                ]).catch(e => dumpError(e));
            }
            await delay(5000);
            currentPage++;
        }

        // page.removeAllListeners();
        try {
            for (let i = 0; i < urls.length; i++) {
                if (urls[i] !== null || urls[i] !== 'undefined') {
                    const url = urls[i].link;
                    await page.goto(`${url}`);
                    let functionToInject = function() {
                        return window.digitalData;
                    };
                    let data = await page.evaluate(functionToInject);
                    let [productInfo] = data.product;
                    urls[i].productInfo = productInfo;
                    urls[i].imageGallery = await page.evaluate(() => {
                        let allImages = [];
                        let els = document.getElementsByClassName('cycle-slide');
                        Array.from(els).forEach(el => {
                            // Do stuff here
                            allImages.push('https:' + el.attributes[0].value);
                        });
                        return allImages;
                    });
                    await delay(5000);
                }
            }
        } catch (e) {
            dumpError(e);
        }
        let json = JSON.stringify(urls);
        fs.writeFile('myjsonfile.json', json, 'utf8');

        await browser.close();
        return urls;
    } catch (e) {
        return dumpError(e);
    }
}
// async function getMoreData() {
//     let listFlats = await getInitialData();
//     const browser = await puppeteer.launch({ devtools: true });
//     const page = await browser.newPage();
//     await page.setViewport({ width: 1920, height: 1080 });
//     listFlats.map(async flat => {
//         // console.log(flat.link);
//         await page.goto(flat.link);
//         await page.waitForNavigation();
//         let functionToInject = function() {
//             return window.digitalData;
//         };
//         let data = await page.evaluate(functionToInject);
//         console.log(data);
//         let imageGallery = await page.evaluate(() => {
//             let allImages = [];
//             let items = document.getElementsByClassName('cycle-slide');
//             items.map(item => {
//                 allImages.push(item);
//             });
//             return allImages;
//         });
//         console.log(imageGallery);
//         await delay(5000);
//     });
// }

getInitialData();
