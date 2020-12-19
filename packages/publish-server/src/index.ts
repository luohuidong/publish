import fs from "fs";
import path from "path";
import express from "express";

import user from "./user";

const app = express();
const port = 8000;

app.use("/user", user);

app.get("/", (req, res) => {
  fs.writeFileSync(path.join(__dirname, "../tmp/1.html"), "Hello world!");
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
