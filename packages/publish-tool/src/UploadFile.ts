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

    const req = http.request(options, (res) => {
      res.setEncoding("utf8");

      let chunks = "";

      res.on("data", (chunk) => {
        chunks += chunk;
      });
      res.on("end", () => {
        if (res.statusCode !== 200) {
          log(chalk.red("Upload failed:", chunks));
        } else {
          log(chalk.green("No more data in response."));
        }
      });
    });

    req.on("error", (e) => {
      log(chalk.red(`problem with request: ${e.message}`));
    });

    req.on("finish", () => {
      log(chalk.green("Upload file finished."));
    });

    // 创建可写流读取需要上传的文件
    const stream = fs.createReadStream(filePath);
    stream.pipe(req);
    stream.on("end", () => {
      req.end();
    });
  }

  /**
   * 递归文件夹
   * @param dir 需要递归的目录
   * @param rootDir 递归的根目录
   * @param cb 回调函数
   */
  recurseDir(dir: string, rootDir: string, cb: (filePath: string) => void): void {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        const newDir = path.join(dir, file);
        this.recurseDir(newDir, rootDir, cb);
      } else {
        cb(filePath);
      }
    });
  }

  /**
   * 压缩文件夹
   * @param dir
   */
  compress(dir: string): string {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const date = currentDate.getDate();

    // create a file to stream archive data to.
    const archiveFilePath = path.join(__dirname, "../tmp/", `${year}-${month}-${date}.zip`);
    const output = fs.createWriteStream(archiveFilePath);
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on("close", function () {
      log(
        chalk.green(
          "archiver has been finalized and the output file descriptor has closed.",
          archive.pointer() + " total bytes"
        )
      );
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on("warning", function (err) {
      if (err.code === "ENOENT") {
        log(chalk.yellow(err.message));
      } else {
        throw err;
      }
    });

    // good practice to catch this error explicitly
    archive.on("error", function (err) {
      throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(dir, false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();

    return archiveFilePath;
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
