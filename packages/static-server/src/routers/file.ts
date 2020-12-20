import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router({});

router.post("/:filename", (req, res) => {
  const params = req.params;
  const filename = params.filename;

  const writableStream = fs.createWriteStream(path.join(__dirname, "../../public/", filename));

  req.pipe(writableStream);
  req.on("error", (err) => {
    if (err) {
      console.log("err", err);
    }
  });
  req.on("end", () => {
    res.send("post file finished");
  });
});

export default router;
