import http from "http";
import fs from "fs";
import path from "path";
import util from "util";
import chalk from "chalk";
import archiver from "archiver";

const promisify = util.promisify;
const fsStat = promisify(fs.stat);

const log = console.log;
const error = console.error;

export default class UploadFile {
  /**
   * 上传文件
   * @param filePath 上传文件的本地路径
   * @param fileSize 上传文件的大小
   */
  private async uploadFile(filePath: string) {
    const states = await fsStat(filePath);
    const filePathParseResult = path.parse(filePath);

    const options = {
      hostname: "localhost",
      port: 8000,
      path: `/file/${filePathParseResult.base}`,
      method: "POST",
      headers: {
        "Content-Length": states.size,
      },
    };
    const request = http.request(options, (res) => {
      res.setEncoding("utf8");
      let chunks = "";
      res.on("data", (chunk) => {
        chunks += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          log(chalk.red(res.statusCode, "Upload failed:", chunks));
        } else {
          log(chalk.green("No more data in response."));
        }
      });
    });

    request.on("error", (e) => {
      log(chalk.red(`problem with request: ${e.message}`));
    });
    request.on("finish", () => {
      log(chalk.green("Upload file finished."));
    });

    // 创建可写流读取需要上传的文件
    const stream = fs.createReadStream(filePath);
    stream.on("close", () => {
      request.end();
    });
    stream.on("error", (err) => {
      console.log("🚀 ~ file: UploadFile.ts ~ line 62 ~ UploadFile ~ stream.on ~ err", err);
    });
    stream.pipe(request);
  }

  /**
   * 压缩文件夹
   * @param dir
   */
  compress(dir: string): Promise<string> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();

    const archiveFilePath = path.join(
      __dirname,
      "../tmp/",
      `${year}-${month}-${date}-${Date.now()}.zip`
    );

    return new Promise((resolve, reject) => {
      // create a file to stream archive data to.
      const output = fs.createWriteStream(archiveFilePath);
      const archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on("close", function () {
        resolve(archiveFilePath);
      });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on("warning", function (err) {
        if (err.code === "ENOENT") {
          log(chalk.yellow(err.message));
        } else {
          reject(err.message);
        }
      });

      // good practice to catch this error explicitly
      archive.on("error", function (err) {
        reject(err.message);
      });

      // pipe archive data to the file
      archive.pipe(output);

      // append files from a sub-directory, putting its contents at the root of archive
      archive.directory(dir, false);

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
      archive.finalize();
    });
  }

  async main(dir: string): Promise<void> {
    const stats = await fsStat(dir);
    if (!stats.isDirectory()) {
      error(chalk.red("当前路径不是目录"));
      return;
    }
    const archiveFilePath = await this.compress(dir);
    await this.uploadFile(archiveFilePath);
  }
}
