# ScrapFlat
Web scraper that can help find the best flat! With a webscraper and a small front end to display the data.

So far the web scraper values are hardcoded  to my preferences and only looking for [Vuokraovi](https://www.vuokraovi.com/). A finnish website.


## Motivation

I want to find good apartment in Helsinki area. And never liked the website I visited. And they expect me to know if an area is good or not.

## Tech used
*Built with*
* [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Headless chrome to scrape the data
* [Gatsby](https://www.gatsbyjs.org/) - As a simple front end
* [Mapbox](https://www.mapbox.com/)
* [Grommet](https://v2.grommet.io/) - React UI toolkit

<aside class="warnings">
I decided to use Puppeteer over other methods (like Cheerio or BeautifulSoup of scrapping since Vuokraovi store the search parameters in the localStorage.
</aside>

## Features
A modern UI with relevant search.

**COMING SOON** Recommendation and good deals by making sense of the data 

## Installation 

**Web scraper:** 

`npm install`

Launch it

`node app.js`

**Front:**

Go to front folder

`npm install`

Add the result of your scraping in `/data` with the name `data.json` then launch

`npm run develop`


