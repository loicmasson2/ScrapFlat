const puppeteer = require('puppeteer');
const { TimeoutError } = require('puppeteer/Errors');
const fs = require('file-system');

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

new Promise(async (resolve, reject) => {
    try {
        let pagesToScrape = 1;
        const websiteUrl = 'https://www.vuokraovi.com/?locale=en';
        const browser = await puppeteer.launch({ devtools: true });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 926 });
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
        await page.type('#rentalsMinRent', '600');
        await page.type('#rentalsMaxRent', '1200');
        // minimum surface and maximum
        await page.type('#surfaceMin', '30');
        await page.type('#surfaceMax', '90');
        await page.focus('#inputLocationOrRentalUniqueNo');

        await page.click('.row-quick-search-btn > .margin-top-xs-0 > button:nth-child(1)');

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
                    items.forEach(item => {
                        results.push({
                            name: item.querySelector('ul.list-unstyled > li.semi-bold:first-child').innerText,
                            moreInfo: item.querySelector('ul.list-unstyled > li.semi-bold:nth-child(2)').innerText,
                            price: item.querySelector('ul.list-unstyled > li:nth-child(4) > span:nth-child(1)')
                                .innerText,
                            link: item.querySelector('.list-item-link').getAttribute('href'),
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
            if (currentPage < pagesToScrape) {
                await delay(5000);
                await Promise.all([
                    await page.click('img[src*="/img/controls/arrow_orange_right.svg"]')[0],
                    await page.waitForSelector('#listContent')
                ]).catch(e => dumpError(e));
            }
            currentPage++;
        }
        let json = JSON.stringify(urls);
        fs.writeFile('myjsonfile.json', json, 'utf8');
        await browser.close();
        return resolve(urls);
    } catch (e) {
        return dumpError(e);
    }
}).then(console.log, e => dumpError(e));
