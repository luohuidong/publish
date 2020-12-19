import path from "path";
import express from "express";

const app = express();
const port = 8001;
express.static(path.join(__dirname, ".."));

app.use(express.static("public"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
