import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Hello World!");
});
router.post("/", (req, res) => {
  const body = req.body;
  console.log("🚀 ~ file: index.ts ~ line 15 ~ app.post ~ body", body);
  res.send("你好");
});

export default router;
