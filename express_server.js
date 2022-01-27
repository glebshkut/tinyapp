const goForEveryEmail = (email) => {
  for (const user in users) {
    if (users[user].email === email) {
      return user;
    }
  }
}

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * 
charactersLength));
 }
 return result;
}
const cookieParser = require('cookie-parser')
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const PORT = 8080; 

app.set("view engine", "ejs");

const users = { 
  "aJ48lW": {
    id: "aJ48lW", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "hdkU2s": {
    id: "hdkU2s", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

app.get('/register', (req, res) => {
  const templateVars = {
    user: null
  }
  res.render('register', templateVars);
})

app.get('/login', (req, res) => {
  const templateVars = {
    user: null
  }
  res.render('login', templateVars);
})

app.post('/login', (req, res) => {
  const user = goForEveryEmail(req.body.email);
  if (user) {
    if (users[user].password === req.body.password) {
      res.cookie('user_id', user);
      res.redirect('/urls');
    } else {
      res.status(403).end();
    }
  } else {
    res.status(403).end();
  }
});
// CHANGED!
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  console.log('😙', user_id);
  if (user_id === undefined) {
    res.redirect('/login');
    res.end();
  }
  const user = users[user_id];
  const templateVars = { 
    user: user,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { 
    user: user
  };
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});
// CHANGED!
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (user_id === undefined) {
    res.redirect('/login');
    res.end();
  }
  const user = users[user_id];
  const templateVars = { 
    user: user, 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
  };
  res.render("urls_show", templateVars);
});
// CHANGED!
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).end();
  } else if (goForEveryEmail(req.body.email)) {
    res.status(400).end();
  }
  let randomUserId = generateRandomString();
  users[randomUserId] = {
    id: randomUserId,
    email: req.body.email,
    password: req.body.password,
  };
  res.cookie('user_id', randomUserId);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})
// CHANGED!
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  const user_id = req.cookies['user_id'];
  urlDatabase[shortURL].userID = user_id;
  res.redirect("/urls");
})
// CHANGED!
app.post("/urls", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  let shortURL = generateRandomString();
  console.log("😁", urlDatabase);
  const user_id = req.cookies['user_id'];
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : user_id
  };
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.get("/*", (req, res) => {
  res.send("<html><body>Hello <b>World!</b><p>To be redirected to our app, click <a href=/urls>here</a></p></body></html>");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});