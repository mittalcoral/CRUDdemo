const mysql = require("mysql2");
const { faker } = require('@faker-js/faker');
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const getRandomUser = () => {
    return [
        faker.string.uuid(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password(),
    ];
}

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "delta_app",
    password: "ccmm,,08"
});

let q = "INSERT INTO user (id, username, email, pwd) VALUES ?"

app.get("/", (req, res) => {
    let q = `SELECT count(*) FROM user`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let count = result[0]["count(*)"];
            res.render("home.ejs", { count });
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
});

// connection.end();

//To show all the users
app.get("/user", (req, res) => {

    let q = `SELECT * FROM user`;
   let showDeleted = req.query.deleted === "true";
   let showAdded = req.query.added === "true";

    try {
        connection.query(q, (err, users) => {
            if (err) throw err;
            res.render("table.ejs", { users, showDeleted, showAdded });
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

//Edit route
app.get("/user/:id/edit", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE  id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render("edit.ejs", { user });
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})


//Update username
app.patch("/user/:id", (req, res) => {
    let { id } = req.params;
    let { password: formpwd, username: newUsername } = req.body;
    let q = `SELECT * FROM user WHERE  id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formpwd != user.pwd) {
                res.send("Wrong Password entered");
            } else {
                let q2 = `UPDATE user SET username='${newUsername}' WHERE  id='${id}'`;
                    connection.query(q2, (err, result) => {
                        if (err) throw err;
                        res.redirect("/user");
                    });
            }
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

//Delete form route
app.get("/user/:id/delete", (req, res) => {
    let { id } = req.params;
    let q = `SELECT * FROM user WHERE  id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            console.log(user);
            res.render("delete.ejs", {user});
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

//Delelte query 
app.delete("/user/:id", (req, res)=>{
    let { id } = req.params;
    let { password: formpwd, email: newEmail } = req.body;
    let q = `SELECT * FROM user WHERE  id='${id}'`;
    try {
        connection.query(q, (err, result) => {
            if (err) throw err;
            let user = result[0];
            if (formpwd != user.pwd || newEmail != user.email) {
                res.send("Wrong details entered");
            } else {
                let q2 = `DELETE FROM user WHERE id='${id}'`;
                    connection.query(q2, (err, result) => {
                        if (err) throw err;
                       res.redirect("/user?deleted=true");
                    });
            }
        })
    } catch (err) {
        console.log(err);
        res.send("Some error in database");
    }
})

app.get("/user/new", (req, res) => {
    res.render("add.ejs");  // You'll create this file next
});

app.post("/user", (req, res) => {
    const { username, email, password } = req.body;
    const id = faker.string.uuid(); // generate a unique id

    const q = `INSERT INTO user (id, username, email, pwd) VALUES (?, ?, ?, ?)`;
    const values = [id, username, email, password];

    connection.query(q, values, (err, result) => {
        if (err) {
            console.log(err);
            return res.send("Error inserting new user");
        }
        res.redirect("/user?added=true");
    });
});


app.listen("3000", () => {
    console.log("Server is listening on port 3000");
});