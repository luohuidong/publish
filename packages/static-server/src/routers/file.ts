import express from "express";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { FsUtils } from "@luohuidong/publish-utilities";

const router = express.Router({});

router.post("/:filename", (req, res) => {
  const params = req.params;
  const filename = params.filename;

  const fsUtils = FsUtils.getInstance();

  // 将 zip 包保存到 tmp 目录中
  const zipFilePath = path.join(__dirname, "../../tmp/", filename);
  fsUtils.checkDirPath(path.dirname(zipFilePath));

  const writableStream = fs.createWriteStream(zipFilePath);
  writableStream
    .on("close", () => {
      try {
        const publicPath = path.join(__dirname, "../../public/");
        fsUtils.checkDirPath(publicPath);

        // 清除 public 文件夹中的所有内容
        fs.rmSync(publicPath, {
          recursive: true,
          force: true,
        });

        // 将上传的 zip 包解压到 public 文件夹中
        const zip = new AdmZip(zipFilePath);

        zip.extractAllTo(publicPath, true);

        res.end();
      } catch (error) {
        res.status(500).send({
          msg: error.message,
        });
      }
    })
    .on("error", (err) => {
      res.status(500).send({
        msg: err.message,
      });
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
