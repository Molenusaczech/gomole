
const fs = require('fs');
const Database = require('better-sqlite3');
const db = new Database('database.sqlite', { /*verbose: console.log*/ });
const sql = db.prepare(`CREATE TABLE IF NOT EXISTS Accounts (
  Account_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Username varchar(32) UNIQUE NOT NULL,
  Password varchar(32) NOT NULL,
  Email varchar(32) UNIQUE NOT NULL,
  RealName varchar(32),
  Country varchar(32),
  City varchar(32),
  Discord varchar(32),
  Elo int,
  IsEmailVerified BOOLEAN DEFAULT FALSE,
  IsAdmin BOOLEAN DEFAULT FALSE
)`);


sql.run();

const tokenSQL = db.prepare(`CREATE TABLE IF NOT EXISTS Tokens (
  Token_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Token varchar(32) UNIQUE NOT NULL,
  Account_ID int NOT NULL,
  CreateDate datetime NOT NULL,
  FOREIGN KEY (Account_ID) REFERENCES Accounts(Account_ID)
)`);

tokenSQL.run();
// Insert some data.
const insert = db.prepare(`INSERT INTO Accounts (
  Username, 
  Password, 
  Email, 
  RealName, 
  Country, 
  City, 
  Discord, 
  Elo, 
  IsEmailVerified,
  IsAdmin
)
VALUES (
  'guest', 
  'guest', 
  'guest@guest.com', 
  'Guest', 
  'Guestland', 
  'Guest City', 
  'Guest#1234', 
  1000, 
  0,
  0
  ) `);
insert.run();

const insertToken = db.prepare(`INSERT INTO Tokens (
  Token,
  Account_ID,
  CreateDate
)
VALUES (
  'guesttoken',
  1,
  '2050-01-01 00:00:00'
)
`);
insertToken.run();

console.log('Database initialized');