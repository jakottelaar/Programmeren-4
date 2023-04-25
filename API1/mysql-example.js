const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "sqlPassword1234",
  database: "share-a-meal-db",
});

connection.connect();

connection.query("SELECT * FROM meal", (err, rows, fields) => {
  if (err) throw err;

  console.log(rows);
});

connection.end();
