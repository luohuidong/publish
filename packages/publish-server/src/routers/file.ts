import express from "express";
import http from "http";
import fs from "fs";
import path from "path";

const router = express.Router({});

router.get("/", (req, res) => {
  res.send("Hello file!");
});

// router.post("/:filename", (req, res) => {});

router.post("/:filename", (req, res) => {
  const params = req.params;
  const filename = params.filename;
  const headers = req.headers;

  const options = {
    hostname: "localhost",
    port: 8001,
    path: `/file/${filename}`,
    method: "POST",
    headers: {
      "Content-Length": headers["content-length"],
    },
  };
  const newRequest = http.request(options, (newRequestRes) => {
    newRequestRes.setEncoding("utf8");
    let chunks = "";
    newRequestRes.on("data", (chunk) => {
      chunks += chunk;
    });
    newRequestRes.on("end", () => {
      if (newRequestRes.statusCode !== 200) {
        res.status(500).send(JSON.parse(chunks));
      }
    });
  });
  newRequest.on("error", (err) => {
    if (err) {
      res.status(500).send(JSON.parse(err.message));
    }
  });

  req.pipe(newRequest);
  req.on("end", () => {
    newRequest.end();
    res.end();
  });
});

export default router;
