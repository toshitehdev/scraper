const express = require("express");
const app = express();
const cors = require("cors");

const runScrapper = require("./scrapper");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/", (req, res) => {
  const url = `https://etherscan.io/address/${req.body.address}`;
  console.log(url);
  const { body } = req;
  runScrapper(url, body).then(() => {
    res.status(200).json({
      messae: "oaask",
    });
  });
});

app.post("/data", async (req, res) => {
  //
});

const port = process.env.PORT || 80;

app.listen(port);
