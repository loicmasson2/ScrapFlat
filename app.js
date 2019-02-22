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
    console.time('ALL');
    try {
        let pagesToScrape = 3;
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
        // await page.click(ROOM_2_BUTTON);
        let ROOM_3_BUTTON = '#roomCountButtons > div:nth-child(3) > button:nth-child(1)';
        // await page.click(ROOM_3_BUTTON);
        // pick the minimum price and the maximum
        // await page.type('#rentalsMinRent', '800');
        // await page.type('#rentalsMaxRent', '1600');
        // minimum surface and maximum
        // await page.type('#surfaceMin', '30');
        // await page.type('#surfaceMax', '90');
        await page.focus('#inputLocationOrRentalUniqueNo');

        await page.click('.margin-top-xs-0 > button:nth-child(1)');
        // await page.waitForNavigation();

        await page.waitForSelector('#listContent');
        const nbrFlastText = await page.evaluate(() =>
            document.querySelector('span.bold:nth-child(1)').innerText.split(' ')
        );
        const nbrFlash = parseFloat(nbrFlastText[0].replace(/,/g, ''));
        pagesToScrape = Math.ceil(nbrFlash / 20);
        let currentPage = 1;
        let urls = [];
        console.log('Page to scrape: ' + pagesToScrape);
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
                            link:
                                'https://www.vuokraovi.com' +
                                item.querySelector('.list-item-link').getAttribute('href'),
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
        try {
            console.log('NORMAL LENGTH');
            console.log(urls.length);
            let last_element = urls[urls.length - 1];
            console.log(last_element);
            for (let i = urls.length - 1; i >= 0; i--) {
                if (!urls[i]) {
                    console.log('ERROR at index: ' + i);
                    console.log(urls[i]);
                    console.log(typeof urls[i]);
                    continue;
                }
                const url = urls[i].link;
                await page.goto(`${url}`);
                let functionToInject = function() {
                    return window.digitalData;
                };
                let data = await page.evaluate(functionToInject);
                // when we try to go to a link and the function fail, that means the offer is not available anymore
                if (typeof data === 'undefined') {
                    console.log('SHOULD REMOVE');
                    console.log(i);
                    console.log(url);
                    urls.splice(i, 1);
                    continue;
                } else {
                    let [productInfo] = data.product;
                    urls[i].productInfo = productInfo.productInfo;
                    urls[i].imageGallery = await page.evaluate(() => {
                        let allImages = [];
                        let els = document.getElementsByClassName('cycle-slide');
                        Array.from(els).forEach(el => {
                            // Do stuff here
                            allImages.push('https:' + el.attributes[0].value);
                        });
                        return allImages;
                    });
                }
                await delay(5000);
            }
        } catch (e) {
            dumpError(e);
        }
        let filtered = urls.filter(function(el) {
            return el != null;
        });

        let json = JSON.stringify(filtered);
        fs.writeFile('myjsonfile.json', json, 'utf8');

        await browser.close();
        console.timeEnd('ALL');
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
