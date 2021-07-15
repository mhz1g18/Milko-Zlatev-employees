const express = require("express");
const cors = require("cors");
const parser = require("./script");
const fs = require("fs");
const path = require("path");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const app = express();
const port = 3001;

app.use(cors({ origin: "*" }));

// File upload endpoint
app.post("/upload", upload.single("file"), function (req, res, next) {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
  }

  parser
    .getEmployeeData(`./uploads/${file.filename}`)
    .then((data) => res.json({ rows: data }))
    .catch((err) => {
      res.status(400).json({ error: err });
    })
    .finally(() => {
      fs.unlink(`./uploads/${file.filename}`, function (error) {
        if (error) {
          console.log(error);
          return;
        }
      });
    });
});

// Serve react build
app.use(express.static(path.join(__dirname, "build")));
app.use("*", (req, res) =>
  res.sendFile(path.join(__dirname, "build", "index.html"))
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
