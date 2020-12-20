import path from "path";
import express from "express";

import middleware from "./middleware";
import routers from "./routers";

const app = express();
const port = 8001;

express.static(path.join(__dirname, ".."));
app.use(express.static("public"));

middleware(app).then(() => {
  routers(app);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
