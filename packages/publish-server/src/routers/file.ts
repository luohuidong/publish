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

  const newRequest = http.request({
    hostname: "localhost",
    port: 8001,
    path: `/file/${filename}`,
    method: "POST",
    headers: {
      "Content-Length": headers["content-length"],
    },
  });

  newRequest.on("error", (err) => {
    if (err) {
      console.log("err", err);
    }
  });

  req.pipe(newRequest);

  req.on("end", () => {
    const body = req.body;
    console.log("🚀 ~ file: index.ts ~ line 15 ~ app.post ~ body", body);
    newRequest.end();
    res.send("post file finished");
  });
});

export default router;
