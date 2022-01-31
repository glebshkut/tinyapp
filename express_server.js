const { getUserByEmail, generateRandomString } = require('./helpers');
// require helpers functions
const bcrypt = require('bcryptjs');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['kenguru', 'Little Chkicken dancing in the prairie'],
}));

const PORT = 8080;

app.set("view engine", "ejs");

const users = {
  // "aJ48lW": {
  //   id: "aJ48lW",
  //   email: "user@example.com",
  //   password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  // },
  // "hdkU2s": {
  //   id: "hdkU2s",
  //   email: "user2@example.com",
  //   password: bcrypt.hashSync("dishwasher-funk", 10)
  // }
};

const urlDatabase = {
  // b6UTxQ: {
  //   longURL: "https://www.tsn.ca",
  //   userID: "aJ48lW"
  // },
  // i3BoGr: {
  //   longURL: "https://www.google.ca",
  //   userID: "aJ48lW"
  // }
};

app.get('/register', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user: null
  };

  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.redirect('/urls');
  }

  const templateVars = {
    user: null
  };

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("<html><body><p>Email and password fields can't be empty</p><a href='/login'>Try one more time</a></body></html>");
  }
  const user = getUserByEmail(req.body.email, users);

  if (user) {
    if (bcrypt.compareSync(req.body.password, users[user].password)) {
      req.session.user_id = user;
      res.redirect('/urls');
    } else {
      return res.status(403).send("<html><body><p>User doesn't exist or credentials are incorrect</p><a href='/login'>Try one more time</a></body></html>");
    }
  } else {
    return res.status(403).send("<html><body><p>User doesn't exist or credentials are incorrect</p><a href='/login'>Try one more time</a></body></html>");
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  } else {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const templateVars = {
      user: user,
      urls: urlDatabase
    };

    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  const user_id = req.session.user_id;
  const user = users[user_id];
  const templateVars = {
    user: user
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.user_id === undefined) {
    return res.redirect('/login');
  }

  const user_id = req.session.user_id;
  const user = users[user_id];

  // checking if such shortURL doesn't exist
  if (!urlDatabase[req.params.shortURL]) {
    return res.redirect('/404');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    // checking if this url belongs to the current user
    return res.send("Sorry. You don't have access to this page");
  }

  const templateVars = {
    user: user,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL] !== undefined) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.redirect('/404');
  }
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.status(400).send("<html><body><p>Email and password fields can't be empty</p><a href='/register'>Try one more time</a></body></html>");
  } else if (getUserByEmail(req.body.email, users)) {
    return res.status(400).send("<html><body><p>User already exists</p><a href='/register'>Try one more time</a></body></html>");
  }

  let randomUserId = generateRandomString();
  users[randomUserId] = {
    id: randomUserId,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
  };

  req.session.user_id = randomUserId;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  // clearing Cookies
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});

app.post("/urls/:shortURL", (req, res) => {
  // checking if this shortURL exists
  if (!urlDatabase[req.params.shortURL]) {
    return res.redirect('/404');
  }

  if (req.session.user_id === undefined || urlDatabase[req.params.shortURL].userID !== req.session.user_id) {
    return res.send("Sorry. You don't have access to this page");
  } else {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL].longURL = req.body.longURL;
    const user_id = req.session.user_id;
    urlDatabase[shortURL].userID = user_id;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  // creating a new shortURL
  if (!req.session.user_id) {
    return res.redirect('/login');
  }

  let shortURL = generateRandomString();
  const user_id = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL : req.body.longURL,
    userID : user_id
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.redirect('/404');
  }
  //checking if this shortURL exists

  const deletedURL = urlDatabase[req.params.shortURL];

  if (req.session.user_id === undefined || deletedURL.userID !== req.session.user_id) {
    return res.send("Sorry. You don't have access to this page");
  } else {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.get("/404", (req, res) => {
  let user = null;

  if (req.session.user_id !== undefined) {
    const user_id = req.session.user_id;
    user = users[user_id];
  }

  const templateVars = {
    user: user
  };

  res.render('404', templateVars);
});

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.get("/*", (req, res) => {
  res.redirect('/404');
});

app.listen(PORT, () => {
  console.log(`🤩🤩🤩 Example app listening on port ${PORT}! 🤩🤩🤩`);
});