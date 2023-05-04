// Import required modules
require('dotenv').config();
const axios = require('axios');
const Data = require(__dirname + '/../model/data.js');
const Adapter = require(__dirname + '/../model/adapter.js');
const { Builder, Browser, By, Key, until } = require('selenium-webdriver');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class Amazon extends Adapter {
  constructor(credentials, maxRetry, db) {
    super(credentials, maxRetry, db);
    this.credentials = credentials || {};
    this.maxRetry = maxRetry || 3;
    this.db = db;
  }

  getAmazonProducts() {
    try {
      const chrome = puppeteer.launch();
      const page = chrome.newPage();
      page.goto(
        'https://www.amazon.com/s?crid=36QNR0DBY6M7J&k=shelves&ref=glow_cls&refresh=1&sprefix=s%2Caps%2C309',
      );

      let bodyHTML = page.evaluate(() => document.documentElement.outerHTML);
      const $ = cheerio.load(bodyHTML);

      const items = [];
      let products = $('.a-section.a-spacing-base');
      products.each((indx, el) => {
        const product = $(el);
        const title = product
          .find(
            'div > div > h2 > a > span.a-size-base-plus.a-color-base.a-text-normal',
          )
          .text();
        const image = product
          .find('div > span > a > div > img.s-image')
          .attr('src');

        const link = product
          .find(
            'div > div > h2 >a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal',
          )
          .attr('href');

        const price = product
          .find('div > div> div> a> span> span.a-offscreen')
          .text();

        let element = {
          title,
          image,
          link: `https://amazon.com${link}`,
          price,
        };

        items.push(element);
      });

      chrome.close();
      console.log(items);
      return items;
    } catch (error) {
      console.log(error);
    }
  }
  getNextPage = async query => {
    // there is only 1000 results per page in this model, so we don't need to have a second page
    return [];
  };

  parseNode = async node => {
    let peers = await this.getPeers(node);

    // TODO - add db updates here
    // 1. Remove from pending
    // 2. update db to reflect node status?

    return this;
  };

  negotiateSession = async () => {
    return true; // only leaving this here so it doesn't throw errors in gatherers
  };

  getNextPendingItem = async () => {
    return this.db.getPending(1);
  };

  checkNode = async () => {
    // TODO - need a clean way  to reintroduce this, for now it's wasting API credits
    // this.session.isValid = true
    return true;
  };

  getPendingItems() {
    return this.db.getPendingItems();
  }

  storeListAsPendingItems(list) {
    console.log('db', this.db);
    // TODO - store the list of nodes as pending items using db
    for (let node of list) {
      // the main difference with this adapter is that the node's IP address is the data for each item, so the ID === VALUE
      if (!this.db.isDataItem(node)) {
        this.db.addPendingItem(node, node);
      }
    }
    return true;
  }

  newSearch = async query => {
    console.log('fetching peer list');
    const items = [];
    try {
      const chrome = await puppeteer.launch({ headless: false });

      const page = await chrome.newPage();
      await page.goto(`https://www.amazon.com/s?k=${query}`);

      let bodyHTML = await page.evaluate(
        () => document.documentElement.outerHTML,
      );
      const $ = cheerio.load(bodyHTML);

      let products = $('.a-section.a-spacing-base');
      products.each((indx, el) => {
        const product = $(el);
        const title = product
          .find(
            'div > div > h2 > a > span.a-size-base-plus.a-color-base.a-text-normal',
          )
          .text();
        const image = product
          .find('div > span > a > div > img.s-image')
          .attr('src');

        const link = product
          .find(
            'div > div > h2 >a.a-link-normal.s-underline-text.s-underline-link-text.s-link-style.a-text-normal',
          )
          .attr('href');

        const price = product
          .find('div > div> div> a> span> span.a-offscreen')
          .text();

        let element = {
          title,
          image,
          link: `https://amazon.com${link}`,
          price,
        };

        items.push(element);
      });
      await chrome.close();
      console.log(items);
      return items;
    } catch (error) {
      console.log(error);
    }
    console.log(items);
    return items;
  };
}

module.exports = Amazon;
// yarn test:api
