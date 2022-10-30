var express = require("express");
var router = express.Router();
const { spawn } = require("child_process");
const fs = require("fs");

const IMAGES_PATH = "/media/andre/OneTouch4/digitalframe-images";
const CONFIG_FILE = "config.json";

router.put("/play/:album", function (req, res, next) {
  const album = decodeURIComponent(req.params.album);

  //// read speed from config file
  const speed = 5;

  const ls = spawn("feh", [
    "--draw-filename",
    "--hide-pointer",
    "--borderless",
    "--quiet",
    "--slideshow-delay",
    speed,
    "--image-bg",
    "black",
    "--fullscreen",
    "--randomize",
    "--recursive",
    `${IMAGES_PATH}/${album}`,
  ]);

  console.log("album", album);

  ls.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
  });

  ls.stderr.on("data", (data) => {
    console.log(`stderr: ${data}`);
  });

  ls.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });

  res.status(200).send('{"success": true}');
});

router.get("/list", function (req, res, next) {
  try {
    const files = fs.readdirSync(IMAGES_PATH);

    console.log("files", files); ////

    res.status(200).send({ albums: files });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: err });
  }
});

router.get("/config", function (req, res, next) {
  console.log("get config"); ////

  let data = fs.readFileSync(CONFIG_FILE);
  let config = JSON.parse(data);
  res.status(200).send({ config: config });
});

function writeConfig(config) {
  let data = JSON.stringify(config);
  fs.writeFileSync(CONFIG_FILE, data);
}

router.put("/defaultConfig", function (req, res, next) {
  const defaultConfig = {
    rootPath: "/media/andre/OneTouch4/digitalframe-images",
    speed: 5,
  };
  writeConfig(defaultConfig);
  res.status(200).send('{"success": true}');
});

router.put("/config", function (req, res, next) {
  console.log("put config, body", req.body); ////

  const config = req.body;

  if (!config.rootPath) {
    res.status(400).send('{"success": false, "\'rootPath\' is required"}');
    return;
  }

  if (!config.speed) {
    res.status(400).send('{"success": false, "\'speed\' is required"}');
    return;
  }

  writeConfig(config);
  res.status(200).send('{"success": true}');
});

module.exports = router;
