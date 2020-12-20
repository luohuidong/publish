import express from "express";
import http from "http";

const router = express.Router({});

router.get("/", (req, res) => {
  res.send("Hello file!");
});
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
  const newRequest = http.request(options, (res) => {
    res.setEncoding("utf8");
    let chunks = "";
    res.on("data", (chunk) => {
      chunks += chunk;
    });
    res.on("end", () => {
      if (res.statusCode !== 200) {
        console.log("Upload failed", chunks);
      }
    });
  });

  newRequest.on("error", (err) => {
    if (err) {
      res.status(500).send(err.message);
    }
  });

  newRequest.on("end", () => {
    console.log("test");
    res.send("post file finished");
  });

  req.pipe(newRequest);
  req.on("end", () => {
    newRequest.end();
  });
});

export default router;
