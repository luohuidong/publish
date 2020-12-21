import path from "path";
import UploadFile from "./UploadFile";

// 获取文件夹路径
let dirPath = process.argv[2];
if (!dirPath) {
  throw new Error("缺少路径参数");
}
if (!/^\//.test(dirPath)) {
  dirPath = path.join(process.cwd(), dirPath);
}

new UploadFile().main(dirPath);
