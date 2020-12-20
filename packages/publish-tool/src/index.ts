import path from "path";
import UploadFile from "./UploadFile";

// // 获取文件路径
// let filePath = process.argv[2];
// if (!filePath) {
//   throw new Error("缺少路径参数");
// }
// if (!/^\//.test(filePath)) {
//   filePath = path.join(process.cwd(), filePath);
// }

new UploadFile().main(path.join(__dirname, "../dist"));
