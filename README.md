# ScrapFlat

Web scraper that can help find the best flat! With a webscraper and a small front end to display the data.

So far the web scraper values are hardcoded to my preferences and only looking for [Vuokraovi](https://www.vuokraovi.com/). A Finnish website. # VUOKRAOVI IS NOT OK WITH SCRAPING OUTSIDE OF PERSONNAL USE

I will switch to facebook groups since those can be scrapped.

## Motivation

I want to find good apartment in Helsinki area. And never liked the website I visited. And they expect me to know if an area is good or not.

## Tech used

_Built with_

- [Puppeteer](https://github.com/GoogleChrome/puppeteer) - Headless chrome to scrape the data
- [Gatsby](https://www.gatsbyjs.org/) - As a simple front end
- [Mapbox](https://www.mapbox.com/)
- [Grommet](https://v2.grommet.io/) - React UI toolkit

_And_
sklearn
folium
numpy
pandas
plotly
matplotlib
seaborn

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

** Filter **

Run filter.js to remove useless or faulty properties.

## ROADMAP

I unfortunately lost my last version :(

So redo those :

- get the construction year with the scrapper
- add a time estimate for scrapping
- save the state before it fails. Web scraping is quite flaky so remember where you were when it failed so you start again from this point.
- better filter js and/or do the filtering in Python
- translate post code to ranking with https://pdfs.semanticscholar.org/2f08/25ddb17cf5ae4c47cbe1a4d33e64988830ae.pdf
- get the model back to 75 of accuracy
- list of most important features

Then next features could be:

- better interpretability
- store the model in an API
