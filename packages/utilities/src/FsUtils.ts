import fs from "fs";
import path from "path";

interface FileInfo {
  basename: string;
  path: string;
  relativePath: string;
}

interface Cb {
  (fileInfo: FileInfo): void;
}

export default class FsUtils {
  static instance: FsUtils | null = null;
  static getInstance(): FsUtils {
    let instance = FsUtils.instance;
    if (!instance) {
      instance = new FsUtils();
    }
    return instance;
  }

  private constructor() {}

  private _checkPathIsFolder(path: string): boolean {
    let isFolder = true;
    const stats = fs.statSync(path);
    if (!stats.isDirectory()) {
      console.error("该目录不是文件夹");
      isFolder = false;
    }
    return isFolder;
  }

  /**
   * 递归遍历目录
   * @param dir
   * @param rootDir
   * @param cb
   */
  private _traversalFolder(dir: string, rootDir: string, cb: Cb) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        this._traversalFolder(filePath, rootDir, cb);
      } else {
        cb({
          basename: file,
          relativePath: path.relative(rootDir, filePath),
          path: filePath,
        });
      }
    });
  }

  /**
   * 遍历指定目录
   * @param dir 递归的目录
   * @param cb 回调函数
   */
  traversalFolder(dir: string, cb: Cb): void {
    if (!this._checkPathIsFolder(dir)) return;

    this._traversalFolder(dir, dir, cb);
  }

  /**
   * 检查指定目录路径是否存在，如果不存在则创建对应目录
   * @param dirPath
   */
  checkDirPath(dirPath: string): void {
    try {
      fs.accessSync(dirPath);
    } catch (error) {
      fs.mkdirSync(dirPath, {
        recursive: true,
      });
    }
  }
}
