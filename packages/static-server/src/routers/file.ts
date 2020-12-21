import express from "express";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const router = express.Router({});

router.post("/:filename", (req, res) => {
  const params = req.params;
  const filename = params.filename;

  const zipFilePath = path.join(__dirname, "../../tmp/", filename);
  const writableStream = fs.createWriteStream(zipFilePath);
  writableStream.on("close", () => {
    try {
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(path.join(__dirname, "../../public/"), true);
      res.end();
    } catch (error) {
      res.status(500).send({
        msg: error.message,
      });
    }
  });

  req.pipe(writableStream);
  req.on("error", (err) => {
    if (err) {
      res.status(500).send({
        msg: err.message,
      });
    }
  });
});

export default router;
