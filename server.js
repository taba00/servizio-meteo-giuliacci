//-------------------------- DICHIARAZIONI GLOBALI --------------------------//
const express = require("express");
const app = express();

const cookieparser = require('cookie-parser');
app.use(cookieparser());

const sha256 = require('js-sha256');

const jwt = require('njwt');
const secret = process.env.JWT_SECRET;

//username: giuliacci
//password: vivailmeteo123
const logins = new Map();
logins.set('giuliacci', {
  id: 1,
  salt: '72354',
  hash: '676078535870a7fc8b536ff352a9cdd74d376467c40b4ca542b2695abe9b507a'
});

const sessions = new Map();

app.post('/login', (req, res) => {
  if(!req.headers.authorization) {
    res.sendStatus(401);
    return;
  }
  
  console.log('Authorization: ' + req.headers.authorization);
    
  if(!req.headers.authorization.startsWith('Basic ')) {
    res.sendStatus(401);
    return;
  }
  
  console.log('Basic authentication');

  const auth = req.headers.authorization.substr(6);
  const decoded = Buffer.from(auth, 'base64').toString();
  console.log('Decoded: ' + decoded);

  const [login, password] = decoded.split(':');
  // console.log('Login: ' + login + ' password: ' + password)
  
  if(!logins.has(login)) {
    res.sendStatus(401);
    return false;
  }
  const user = logins.get(login);
  console.log('Login come ' + login + ', utente ' + user.id);

  const compound = user.salt + password;
  let h = sha256.create();
  h.update(compound);
  const hashed = h.hex();
  
  console.log('Hash: ' + hashed + ', expected: ' + user.hash);

  if(hashed == user.hash) {
    const claims = {
      sub: login,
      iss: 'meteorologia'
    };
    
    const token = jwt.create(claims, secret);
    token.setExpiration(new Date().getTime() + 10000);
    console.log('New token: ' + token.compact());
    
    res.cookie('sessionToken', token.compact());
    res.sendStatus(200);
  }
  else {
    res.sendStatus(401);
  }
});

app.get('/secret', (req, res) => {
  if(!req.cookies.sessionToken) {
    res.sendStatus(401);
    return;
  }
  
  const token = req.cookies.sessionToken;
  console.log('Token: ' + token);
  
  jwt.verify(token, secret, (err, verifiedToken) => {
    if(err) {
      console.log(err);
      res.sendStatus(401);
      
    }
    else {
      console.log(verifiedToken);
      if(verifiedToken.body.sub == 'giuliacci') {
        res.send('Documento segreto di Taba');
      }
      else {
        res.sendStatus(403);
        
      }
    }
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
