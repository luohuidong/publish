import http from "http";
import fs from "fs";
import path from "path";

// 获取文件路径
let filePath = process.argv[2];
if (!filePath) {
  throw new Error("缺少路径参数");
}
if (!/^\//.test(filePath)) {
  filePath = path.join(process.cwd(), filePath);
}

fs.stat(filePath, (err, stats) => {
  if (err) {
    console.log("Error", err);
    return;
  }

  const parseResult = path.parse(filePath);
  console.log("🚀 ~ file: index.ts ~ line 24 ~ fs.stat ~ parseResult", parseResult);

  const options = {
    hostname: "localhost",
    port: 8000,
    path: `/file/${parseResult.base}`,
    method: "POST",
    headers: {
      "Content-Length": stats.size,
    },
  };

  const req = http.request(options, (res) => {
    res.setEncoding("utf8");

    res.on("data", (chunk) => {
      console.log(`BODY: ${chunk}`);
    });

    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  req.on("error", (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  // 创建可写流读取需要上传的文件
  const stream = fs.createReadStream(filePath);
  stream.pipe(req);

  stream.on("end", () => {
    req.end();
  });
});
