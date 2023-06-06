const crypto = require('crypto');

const express = require('express');
const cors = require('cors');

const axios = require("axios");

const app = express();
require('dotenv').config();

const Database = require('better-sqlite3');
const db = new Database('database.sqlite', { verbose: console.log });

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World'
  });
});

//console.log(process.env.recaptchaSecret);

app.post('/register', async (req, res) => {
  let data = req.body;
  let captcha = data.captcha;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.recaptchaSecret}&response=${captcha}`
  );

  console.log('register');
  console.log(data.username);
  console.log(data.password);
  console.log(data.email);
  console.log(data.captcha);
  console.log(String(response.data.success));

  if (response.data.success == false) {
    console.log('invalid captcha');
    res.json({
      status: 'error',
      message: 'Invalid captcha'
    });
    return;
  }

  let token = crypto.randomBytes(32).toString('hex');
  let resp = JSON.stringify({ "status": "success", "token": token });
  try {
    let insertAccount = db.prepare(`
            INSERT INTO Accounts (Username, Password, Email, Elo)
            VALUES (?, ?, ?, 1000) `);
    let resp = insertAccount.run(

      data.username,
      crypto.createHash('sha256').update(data.password).digest("hex"),
      data.email,

    );

    const createToken = db.prepare(`
            INSERT INTO Tokens (Token, Account_ID, CreateDate)
            VALUES (?, ?, ?) `);
    const insertToken = createToken.run(
      token,
      resp.lastInsertRowid,
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    );

    console.log(resp);

  } catch (err) {
    resp = JSON.stringify({ "status": "error", "message": err });
  }
  console.log(resp);
  res.json(resp);
});

app.get('/checkname/:name', (req, res) => {
  let name = req.params.name;
  let insertAccount = db.prepare(`SELECT COUNT(Username) AS count FROM Accounts WHERE (Username=?) `);
  let resp = insertAccount.all(
    name
  );
  console.log(resp);
  res.json({
    available: resp[0].count == 0,
    name: name
  });
});

app.get('/checkemail/:email', (req, res) => {
  let email = req.params.email;
  let insertAccount = db.prepare(`SELECT COUNT(Email) AS count FROM Accounts WHERE (Email=?) `);
  let resp = insertAccount.all(
    email
  );
  console.log(resp);
  res.json({
    available: resp[0].count == 0,
    email: email
  });
});

app.post('/login', async (req, res) => {
  let data = req.body;
  let captcha = data.captcha;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.recaptchaSecret}&response=${captcha}`
  );

  console.log('register');
  console.log(data.email);
  console.log(data.password);
  console.log(data.captcha);
  console.log(response.data.success);

  if (response.data.success == false) {
    console.log('invalid captcha');
    res.json({
      status: 'error',
      message: 'Invalid captcha'
    });
    return;
  }

  // check if username and password match
  let passwordHash = crypto.createHash('sha256').update(data.password).digest("hex");

  let insertAccount = db.prepare(`
  SELECT Username, Account_ID
  FROM Accounts WHERE (Email=? AND Password=?) `);


  let accountResp = insertAccount.get(
    data.email,
    passwordHash
  )

  if (accountResp == undefined) {
    res.json(JSON.stringify({ "status": "invalid" }));
    console.log('invalid login');
    return;
  }

  let token = crypto.randomBytes(32).toString('hex');
  let resp = JSON.stringify({ "status": "success", "token": token });

  try {
    const createToken = db.prepare(`
            INSERT INTO Tokens (Token, Account_ID, CreateDate)
            VALUES (?, ?, ?) `);
    const insertToken = createToken.run(
      token,
      accountResp.Account_ID,
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    );
  } catch (err) {
    resp = JSON.stringify({ "status": "error", "message": err });
  }

  console.log(resp);
  res.json(resp);
});

app.listen(8081, () => {
  console.log('server is listening on port 8081');

});

//create a server object:
/*http.createServer(function (req, res) {

  if (req.method == 'POST') {
    console.log('POST');
    var body = '';
    req.on('data', function (data) {
      data = JSON.parse(data);
      console.log('Partial body: ' + body);

      // /register
      if (req.url == '/register') {
        console.log('register');
        console.log(data.username);
        console.log(data.password);
        let token = crypto.randomBytes(32).toString('hex');
        let resp = JSON.stringify({ "status": "success", "token": token });
        try {
          let insertAccount = db.prepare(`
            INSERT INTO Accounts (Username, Password, Email, Elo, Token, TokenCreateDate)
            VALUES (?, ?, ?, 1000, ?, ?) `);
          let resp = insertAccount.run(

            data.username,
            crypto.createHash('sha256').update(data.password).digest("hex"),
            data.email,
            token,
            new Date().toISOString().slice(0, 19).replace('T', ' ')

          );

          console.log(resp);
        
        } catch (err) {
          resp = JSON.stringify({ "status": "error", "message": err });
        }
        console.log(resp);
        res.writeHead(200, { 'Content-Type': 'text/json' });
        res.write(resp);
        res.end();
      }

    })
  } //end the response
}).listen(8081); //the server object listens on port 8080*/