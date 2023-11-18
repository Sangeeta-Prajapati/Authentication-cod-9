const express = require("express");
const app = express();
const path = require("path");
const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};
const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBServer();

//     API 1

app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  let hashedPassword = await bcrypt.hash(password, 10);
  const selectUserQuery = `
        SELECT * FROM user
        WHERE 
        username = '${username}';`; // Fix the typo in 'username'
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    const createUserQuery = `
            INSERT INTO
            user (username,name,password,gender,location)
            user (username, name, password, gender, location)
            VALUES (
                '${username}',
                '${name}',
                '${hashedPassword}',
                '${gender}',
                '${location}'
            );`;

    if (password.length < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let newUserDetail = await db.run(createUserQuery);
      response.status(200);
      response.send("User created successfully");
    }
    } else {
    response.status(400);
    response.send("User already exists");
}

  };
  }
});

//    API 2

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  const selectUserQuery = `
    SELECT * FROM user 
    WHERE username = '${username}';`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

//     API 3
app.put("/change-password", async (request, response) => {
  const { username, oldPassword, newPassword } = request.body;
  const checkUserQuery = `
    SELECT * FROM user 
    WHERE username = ${username};`;
  const dbUser = await db.get(checkUserQuery);
  if (dbUser === undefined) {
    response.send(400);
    response.send("User not register");
  } else {
    const isValidPassword = await bcrypt.compare(oldPassword, dbUser.password);
    if (isValidPassword === true) {
        const lenOfNewPassword = newPassword.length;
        if (lenOfNewPassword < 5) {
            response.status(400);
            response.send("Password is too short");
        }
    } else {
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatePasswordQuery = `
          UPDATE user 
          SET password = '${encryptedPassword}',
          WHERE 
          username = '${username}';`;
        await db.run(updatePasswordQuery);
        response.send("Password updated");
      }
    }
});