const puppeteer = require('puppeteer');
const http = require('http')
const fs = require('fs')

const port = 3001;

let browser;
let page;

const startBrowser = async () => {
    browser = await puppeteer.launch({headless: false});
    const pages = await browser.pages();
    page = pages[0];
    await page.goto("http://localhost:" + port);
    await page.setViewport({ width: 0, height: 0});
}

startBrowser();

http.createServer(async (request, response) => {
    const url = request.url;
    if (url === '/') {
        getFile("index.html", response);
    }
    if (url === '/index.css') {
        getFile("index.css", response);
    }
    if (url === '/addToCart' && request.method === 'POST') {
        const body = [];
        request.on('data', (chunk) => {
            console.log(chunk);
            body.push(chunk);
        });
        request.on('end', () => {
            const parseBody = Buffer.concat(body).toString();
            const url = parseBody.split('url=')[1].replace('\r\n', "");
            console.log(url);
            addToCart(url, browser, page);
        });
    }
}).listen(port);

const getFile = (fileName, res) => {
    fs.readFile(fileName, (err,data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify(err));
          return;
        }
        res.writeHead(200);
        res.end(data);
      });
}

const addToCart = async (inputURL, browser, page) => {
    await page.goto(inputURL);
    await page.setViewport({ width: 0, height: 0});
    await page.click('#AddToCart');
}

console.log("listening on port "+ port);