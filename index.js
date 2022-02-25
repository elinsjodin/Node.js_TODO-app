const express = require("express");
const exphbs = require("express-handlebars");
const todosRouter = require("./routes/todos-router.js");
require("dotenv").config();

const app = express();

app.use(express.urlencoded({ extended: true }));

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    extname: ".hbs",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.redirect("/todos");
});

app.set("view engine", "hbs");

app.use(express.static("public"));

app.use("/todos", todosRouter);

app.use("/", (req, res) => {
  res.status(404).render("not-found");
});

app.listen(8000, () => {
  console.log("http://localhost:8000/");
});
