// express.js basic
//require https
const https = require("https");
const express = require("express");
const app = express();
const port = 3007;

app.use(express.static("client"));

// app.get("/", (req, res) => {
//   //send index.html file
//   //res.sendFile(__dirname + "/index.html");
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
