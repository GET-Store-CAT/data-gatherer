const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function main() {
  try {
    console.log('fetching peer list');
    let newNodes = [];

    const browserFetcher = await puppeteer.createBrowserFetcher({
      product: 'firefox',
    });
    const browserRevision = '114.0a1';
    console.log('DOWNLOADING STARTED');
    let revisionInfo = await browserFetcher.download(browserRevision);
    console.log('DOWNLOADING FINISHED', revisionInfo);
    const browser = await puppeteer.launch({
      executablePath: revisionInfo.executablePath,
      product: 'firefox',
      headless: 'new', // other options can be included here
    });



    const page = await browser.newPage();
    await page.goto('https://arweave.net' + '/peers');

    const html = await page.content();
    const $ = cheerio.load(html);
    console.log('html', html);

    $('body').each((i, el) => {
        let peers = $(el).find('pre').text();
        peers = peers.split(',');
        // console.log('peers', peers);
        newNodes = peers;
    });
    console.log('newNodes', newNodes);
  } catch (err) {
    console.log('ERROR IN SUBMIT DISTRIBUTION', err);
    }


    return newNodes;
}

main();
