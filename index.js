const fetch = require("node-fetch");
const express = require("express");
const upload = require("express-fileupload");
const sharp = require("sharp");
const cors = require("cors");
const { Deta } = require("deta");

require("dotenv").config();

const deta = Deta(process.env.DETA_SECRET);

const icons = deta.Drive("icons");
const products = deta.Drive("products");

const app = express();

app.use(upload());

app.use(
  cors({
    origin: JSON.parse(process.env.CORS_DOMAINS),
  })
);

app.get("/", async (req, res) => {
  res.send("hello");
});

app.get("/image/:type/:name/", async (req, res) => {
  if (req.params.type === "icons") {
    const name = req.params.name;
    const buf = await icons.get(name);

    const iconBuff = Buffer.from(await buf.arrayBuffer());

    res.writeHead(200, {
      "Content-Type": "image/*",
      "Content-Length": iconBuff.length,
    });

    res.end(iconBuff);
  }

  if (req.params.type === "products") {
    const name = req.params.name;
    const image = await products.get(name);

    const imageBuff = Buffer.from(await image.arrayBuffer());

    const { width, height } = req.query;

    const buff = await sharp(imageBuff)
      .resize({ width: Number(height), height: Number(width) })
      .webp({ lossless: true })
      .toBuffer();

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buff.length,
    });

    res.end(buff);
  }
});

app.post("/upload", async (req, res) => {
  const { name, url, buffer } = req.body;

  if (url) {
    const response = await fetch(url);

    if (response) {
      const imageBuffer = Buffer.from(await response.arrayBuffer());
      await products.put(`${name}.png`, { data: imageBuffer });
    }
  }

  if (buffer) {
    await icons.put(name, { data: buffer });
  }

  res.send("ok");
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
