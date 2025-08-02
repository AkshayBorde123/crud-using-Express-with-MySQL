const mysql = require("mysql2");
const express = require("express");
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const app = express();
const port = 8081;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true A

app.listen(port, () => {
  console.log(`app is runnig on ${port}`);
});

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "delta_app",
});

app.get("/user/new", (req, res) => {
  res.render("new.ejs", { uuidv4 });
});

app.post("/user", (req, res) => {
  let q = "INSERT INTO stud (id,name,password,email) VALUES (?,?,?,?)";
  let { id, name, password, email } = req.body;
  let data = [id, name, password, email];
  conn.query(q, data, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.redirect("/user");
  });
});

app.get("/", (req, res) => {
  let q = "SELECT count(*) FROM stud";
  conn.query(q, (err, result) => {
    if (err) throw err;
    let total = result[0];
    console.log(total);
    res.render("home.ejs", { total });
  });
});

app.get("/user", (req, res) => {
  let q = "SELECT * FROM stud";
  try {
    conn.query(q, (err, result) => {
      if (err) throw err;
      console.log(result);
      res.render("show.ejs", { users: result });
    });
  } catch (error) {
    console.log("some error in database");
  }
});

app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM stud WHERE id = '${id}'`;
  conn.query(q, (err, result) => {
    if (err) throw err;
    let user = result[0];
    console.log(user);
    res.render("edit.ejs", { user });
  });
});

app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { name: formname, password: formpassword } = req.body;
  try {
    let q = `SELECT * FROM stud WHERE id = '${id}'`;
    conn.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      console.log(user);
      if (user.password === formpassword) {
        let q = `UPDATE stud SET name = '${formname}' WHERE id = '${id}' `;
        conn.query(q, (err, result) => {
          if (err) throw err;
          console.log(result);
          res.redirect("/user");
        });
      } else {
        res.send("Wrong Password");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM stud WHERE id = '${id}'`;
  conn.query(q, (err, result) => {
    if (err) throw err;
    res.render("delete.ejs", { user: result[0] });
  });
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { email: formemail, password: formpassword } = req.body;
  let q = `SELECT * FROM stud WHERE id = '${id}'`;
  conn.query(q, (err, result) => {
    if (err) throw err;
    let user = result[0];
    if (user.password === formpassword) {
      let q = `DELETE FROM stud WHERE id = '${id}'`;
      conn.query(q, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.redirect("/user");
      });
    } else {
      res.send("<h1 class='text-danger'>Wrong password</h1>");
    }
  });
});
