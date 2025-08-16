const express = require("express");
const mysql = require("mysql");
const bodyParser = require('body-parser');


var username;
var email;
var password;
var notes;
var homestring;

var goals;

const app = express();

app.set('view engine', 'ejs');
app.use(express.static("./views"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("index", { errormsg: "" })
});

app.post("/login", (req, res) => {

  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM users WHERE Username = '${req.body.username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw res.render("index", { errormsg: "Incorrect Credentials" });;

      if (result == undefined || result.length == 0) {
        res.render("index", { errormsg: "Incorrect Credentials" });
      } else {
        if (result[0]['Password'] == req.body.password) {
          username = req.body.username;
          password = req.body.password;
          notes = result[0]['Notes']
          email = result[0]['Email'];
        } else {
          res.render("index", { errormsg: "Incorrect Credentials" });
          return;
        }

        var conn = mysql.createConnection({
          host: 'localhost',
          user: 'root',
          password: '',
          database: 'connections'
        });


        sql1 = `SELECT * FROM goals WHERE Username = '${req.body.username}'`;
        conn.connect(function (err) {
          if (err) throw err;
          conn.query(sql1, function (err, result) {
            if (err) throw err;
            homestring = "";

            for (var i = 0; i < result.length; i++) {
              homestring += `<li> ${result[i]["Goal"]} </li>`;
            }


            res.render("home", { username: username, password: password, email: email, List: homestring, Notes: notes });

          });


          conn.end();

        });
      }

    });


    con.end();

  });

})

app.post("/notes", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });

  notes = req.body.notes;

  sql = `UPDATE users SET Notes = '${req.body.notes}' WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;
      res.render("home", { username: username, password: password, email: email, List: homestring, Notes: notes });
    });

    con.end();

  });

});


app.get("/home", (req, res) => {
  var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql1 = `SELECT * FROM goals WHERE Username = '${username}'`;
  conn.connect(function (err) {
    if (err) throw err;
    conn.query(sql1, function (err, result) {
      if (err) throw err;
      homestring = "";

      for (var i = 0; i < result.length; i++) {
        homestring += `<li> ${result[i]["Goal"]} </li>`;
      }


      res.render("home", { username: username, password: password, email: email, List: homestring, Notes: notes });

    })
  })
});

app.post("/signup", (req, res) => {
  if (req.body.password != req.body.passwordVerify) {
    res.render("signup", { errormsg: " The passwords do not match. " })
  } else {

    var connect = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'connections'
    });


    var sql1 = `SELECT 1
                  FROM users
                  WHERE Username = '${req.body.username}';`

    connect.connect(function (err) {
      if (err) throw err;
      connect.query(sql1, function (err, result) {
        if (err) throw err;

        if (result.length > 0) {
          res.render("signup", { errormsg: "This username already exists. Please choose another one." });
        } else {
          var con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'connections'
          });

          var sql2 = `INSERT INTO users (Username, Password, Email, Notes) 
                        VALUES ('${req.body.username}','${req.body.password}','${req.body.email}', '')`;

          con.connect(function (err) {
            if (err) throw err;
            con.query(sql2, function (err) {
              if (err) throw err;

              con.end();
            });
          });

          connect.end();

          res.render("index", { errormsg: "" });
        }
      });


    });

  }
});

app.get("/signup", (req, res) => {
  res.render("signup", { errormsg: "" })
});

app.get("/goals", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM goals WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;

      goals = [];
      string = "";
      homestring = "";

      for (var i = 0; i < result.length; i++) {
        goals.push(result[i]);

        string += `<div class="goal">
                <h1>${result[i]["Goal"]}</h1>
                <p>${result[i]["Description"]}</p>
                <button onclick='updateForm("${result[i]["Goal"]}")'> View More → </button>
            </div>`
        homestring += `<li> ${result[i]["Goal"]} </li>`;
      }


      res.render("goals", { code: string });
    });

    con.end();

  });

});

app.post("/viewgoals", (req, res) => {

  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM goals WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;
      var desc;
      var list;

      for (var i = 0; i < result.length; i++) {
        if (result[i]["Goal"] == req.body.hiddenName) {
          desc = result[i]["Description"];
          list = JSON.parse(result[i]["Steps"]);
        }

      }

      var stringList = '';

      for (var i = 0; i < list.length; i++) {
        if (list[i][2]) {
          stringList += `<input type="checkbox" id="Step-${1}" checked onclick="return false" name="Step-${1}">
          <label for="Step-${1}">${list[i][0]} (${list[i][1]})</label><br>`
        } else {
          stringList += `<input type="checkbox" id="Step-${1}" onclick="return false" name="Step-${1}">
          <label for="Step-${1}">${list[i][0]} (${list[i][1]})</label><br>`
        }
      }
      res.render("viewgoal", { goal: req.body.hiddenName, summary: desc, lists: stringList })

    });

    con.end();

  });
})

app.post("/newGoal", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });

  var sql2 = `INSERT INTO goals (Username, Goal, Description, Completion, Steps) 
                VALUES ('${username}','${req.body.name}','${req.body.summary}', '${req.body.date}', '${JSON.stringify([])}')`;

  con.connect(function (err) {
    if (err) throw err;
    con.query(sql2, function (err) {
      if (err) throw err;


      var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'connections'
      });


      sql = `SELECT * FROM goals WHERE Username = '${username}'`;
      conn.connect(function (err) {
        if (err) throw err;
        conn.query(sql, function (err, result) {
          if (err) throw err;

          goals = [];
          string = "";

          for (var i = 0; i < result.length; i++) {
            goals.push(result[i]);

            string += `<div class="goal">
              <h1>${result[i]["Goal"]}</h1>
              <p>${result[i]["Description"]}</p>
              <button onclick='updateForm("${result[i]["Goal"]}")'> View More → </button>
          </div>`

          }

          res.render("goals", { code: string });
        });

        conn.end();

        con.end();
      });
    });

  });
})

app.post("/newTask", (req, res) => {
  var list = [];
  var goalName;
  var summary;

  var connect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  var sql1 = `SELECT *
                FROM goals
                WHERE Username = '${username}' AND Goal = '${req.body.newgoalName}';`

  connect.connect(function (err) {
    if (err) throw err;
    connect.query(sql1, function (err, result) {
      if (err) throw err;
      goalName = req.body.newgoalName;
      summary = result[0]["Description"];
      list = JSON.parse(result[0]["Steps"]);
      list.push([req.body.newStepName, req.body.newStepDate, false]);
      connect.end();

      var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'connections'
      });


      sql = `UPDATE goals SET Steps = '${JSON.stringify(list)}' WHERE Goal = '${req.body.newgoalName}'`;
      conn.connect(function (err) {
        if (err) throw err;
        conn.query(sql, function (err, result) {
          if (err) throw err;
        });

        var stringList = '';

        for (var i = 0; i < list.length; i++) {
          if (list[i][2]) {
            stringList += `<input type="checkbox" id="Step-${1}" checked onclick="return false" name="Step-${1}">
            <label for="Step-${1}">${list[i][0]} (${list[i][1]})</label><br>`
          } else {
            stringList += `<input type="checkbox" id="Step-${1}" onclick="return false" name="Step-${1}">
            <label for="Step-${1}">${list[i][0]} (${list[i][1]})</label><br>`
          }
        }

        res.render("viewgoal", { goal: goalName, summary: summary, lists: stringList })

        conn.end();
      });
    });
  });

})

app.get("/calendar", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM goals WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;
      var tasks = [];
      for (var i = 0; i < result.length; i++) {
        var array = JSON.parse(result[i]["Steps"]);
        for (var j = 0; j < array.length; j++) {
          tasks.push([array[j][0], array[j][1], result[i]["Goal"], array[j][2]]);
        }
      }

      res.render("calendar", { Data: JSON.stringify(tasks) });

    });

    con.end();

  });

})

app.post("/completeTask", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM goals WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;
      var tasks = [];
      for (var i = 0; i < result.length; i++) {
        var array = JSON.parse(result[i]["Steps"]);
        for (var j = 0; j < array.length; j++) {
          if (array[j][0] == req.body.TaskName) {
            array[j][2] = true;
          }

          tasks.push([array[j][0], array[j][1], result[i]["Goal"], array[j][2]]);
        }
      }
      var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'connections'
      });

      sql = `UPDATE goals SET Steps = '${JSON.stringify(array)}' WHERE Goal = '${req.body.goalName}'`;
      conn.connect(function (err) {
        if (err) throw err;
        conn.query(sql, function (err, result) {
          if (err) throw err;
        });

        conn.end();
      });


      res.render("calendar", { Data: JSON.stringify(tasks) });

    });

    con.end();

  });
})

app.post("/moveTask", (req, res) => {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'connections'
  });


  sql = `SELECT * FROM goals WHERE Username = '${username}'`;
  con.connect(function (err) {
    if (err) throw err;
    con.query(sql, function (err, result) {
      if (err) throw err;
      var tasks = [];
      for (var i = 0; i < result.length; i++) {
        var array = JSON.parse(result[i]["Steps"]);
        for (var j = 0; j < array.length; j++) {
          if (array[j][0] == req.body.TaskName2) {
            array[j][1] = req.body.newDate;
          }

          tasks.push([array[j][0], array[j][1], result[i]["Goal"], array[j][2]]);
        }
      }
      var conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'connections'
      });

      sql = `UPDATE goals SET Steps = '${JSON.stringify(array)}' WHERE Goal = '${req.body.goalName2}'`;
      conn.connect(function (err) {
        if (err) throw err;
        conn.query(sql, function (err, result) {
          if (err) throw err;
        });

        conn.end();
      });


      res.render("calendar", { Data: JSON.stringify(tasks) });

    });

    con.end();

  });
})

app.get("/interview", (req, res) => {
  res.render("interview", { sample: " " });
})

const { default: ollama } = require('ollama');

app.post("/analyze", (req, res) => {

  var modelResponse = ""

  let chatConfig = {
    model: "llama2",
    role: "user",
    content: "Provide suggestions to improve this job interview response to the question: " + req.body.question + "Given the response: " + req.body.results
  }

  async function invokeLLM(props) {
    console.log(`-----`)
    console.log(`[${props.model}]: ${props.content}`)
    console.log(`-----`)
    try {
      console.log(`Running prompt...`)
      const response = await ollama.chat({
        model: props.model,
        messages: [{ role: props.role, content: props.content }],
      })
      res.render("interview", { sample: `${response.message.content}\n` });
    }
    catch (error) {
      console.log(`Query failed!`)
      console.log(error)
    }
  }

  invokeLLM(chatConfig)
})

app.listen(5000, () => {
  console.log("Server started on Port 5000");
})


