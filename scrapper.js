const puppeteer = require("puppeteer");
const { db } = require("./config");

//Bot test pass
const preparePageForTests = async (page) => {
  const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
  await page.setUserAgent(userAgent);
};

async function runScrapper(address, body) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await preparePageForTests(page);
  await page.goto(address);

  //get token balance in USD
  const tokenBalanceUSD = await page.evaluate(() => {
    const docSelector = document.querySelector("#availableBalanceDropdown");
    if (!docSelector) {
      return 0;
    }
    const docText = docSelector.innerText;

    //sanitate the string
    const pureNum = docText.split(" ")[0];
    const num = pureNum
      .replaceAll("$", "")
      .replaceAll(">", "")
      .replaceAll(",", "");
    return Number(num);
  });

  //get eth balance in USD
  const ethBalanceUSD = await page.evaluate(() => {
    const docSelector = document.querySelector(
      "#ContentPlaceHolder1_divSummary > div.row.mb-4 > div.col-md-6.mb-3.mb-md-0 > div > div.card-body > div:nth-child(3) > div.col-md-8"
    );
    if (!docSelector) {
      return 0;
    }
    const docText = docSelector.innerText;
    const pureNum = docText.split(" ")[0];
    const num = pureNum
      .replaceAll("$", "")
      .replaceAll(">", "")
      .replaceAll(",", "");
    return Number(num);
  });

  //get tokens count
  const tokensCount = await page.evaluate(() => {
    const docSelector = document.querySelector(
      "#availableBalanceDropdown > span"
    );
    if (!docSelector) {
      return 0;
    }
    const docText = docSelector.innerText;
    const num = docText
      .replaceAll("$", "")
      .replaceAll(">", "")
      .replaceAll(",", "");
    return Number(num);
  });

  //get trx count
  const trxCount = await page.evaluate(() => {
    const docSelector = document.querySelector(
      "#transactions > div.d-md-flex.align-items-center.mb-3 > p > a:nth-child(2)"
    );
    if (!docSelector) {
      return 0;
    }
    const docText = docSelector.innerText;

    const num = docText
      .replaceAll("$", "")
      .replaceAll(">", "")
      .replaceAll(",", "");
    return Number(num);
  });

  const balance = tokenBalanceUSD + ethBalanceUSD;
  const tokens = tokensCount;
  const trx = trxCount;
  //const lastin = "";
  //const lastout = "";

  //check data validity
  if (balance + tokens + trx > 0) {
    //send to firestore
    const userJson = {
      balance,
      tokens,
      trx,
    };
    db.collection("wallets").doc(body.address).set(userJson);
    console.log(body);
  }
  if (balance + tokens + trx < 1) {
    //throw error
    console.log("nothin here");
  }

  await browser.close();
}

module.exports = runScrapper;
