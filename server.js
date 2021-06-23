//-------------------------- DICHIARAZIONI GLOBALI --------------------------//
const express = require("express");
const app = express();

const cookieparser = require('cookie-parser');
app.use(cookieparser());

const sha256 = require('js-sha256');

const jwt = require('njwt');
const cod_segreto = process.env.JWT_SECRET;

app.use(express.json());


//username: gestore
//password: vivailmeteo123
const logins = new Map();
logins.set('gestore', {
  id: 1,
  salt: '72354',
  hash: '676078535870a7fc8b536ff352a9cdd74d376467c40b4ca542b2695abe9b507a'
});

//username: utente
//password: vivailmeteo456
logins.set('utente', {
  id: 2,
  salt: '69875',
  hash: 'd4aaaab9dfe83430fc06099a34996628c021d41e4e0eefc763b6b5665fcd7aa4'
});

//autenticazione utente con JWT
function autenticazioneUtente(req, res)
{
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
    
    const token = jwt.create(claims, cod_segreto);
    token.setExpiration(new Date().getTime() + 600000); //10 minuti
    console.log('New token: ' + token.compact());
    
    res.cookie('sessionToken', token.compact());
    res.sendStatus(200);
  }
  else {
    res.sendStatus(401);
  }
}

//POST https://meteo-tabarrini-lorenzo.glitch.me/login
app.post('/login', (req, res) => {
  if(autenticazioneUtente(req, res)) {
    res.sendStatus(200);
  }
  else {
    res.sendStatus(401);
  }
});

//Database interno del servizio meteo
const db = new Map();
db.set(1, { citta: 'Urbino', temperatura: { numero: '27', UM: 'celsius'},  fenomeniAtmosferici: 'Pioggia', umidita: { numero: '80', UM: 'percento'}});
db.set(2, { citta: 'Rimini', temperatura: { numero: '31', UM: 'celsius'},  fenomeniAtmosferici: 'Coperto', umidita: { numero: '77', UM: 'percento'}});
db.set(3, { citta: 'San Marino', temperatura: { numero: '28', UM: 'celsius'},  fenomeniAtmosferici: 'Sole', umidita: { numero: '50', UM: 'percento'}});

var prossimoId = 4;
// fare restfull!!!
//var nextId = 3;

//GET https://meteo-tabarrini-lorenzo.glitch.me/temperatura
//Tramite l'id della città, trova tutti i parametri metereologici
app.get('/temperatura', (req, res) => {
  if(!req.cookies.sessionToken) 
  {
    res.sendStatus(401);
    return;
  }
  
  const chiave = req.cookies.sessionToken;
  console.log('Token: ' + chiave);
  
  jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
    if(err) {
      console.log(err);
      res.sendStatus(401);
      
    }
    else {
      console.log(chiaveVerificata);
      if(chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
        //const temperatura = Math.floor(Math.random() * 35) + 1
      const id = Number.parseInt(req.query.id);
  
      if(isNaN(id)) 
      {
        res.sendStatus(400); //BAD REQUEST
        return;
      }
      if(!db.has(id)) {
        res.sendStatus(404); //NOT FOUND
        return;
      }
        
        const meteo = db.get(id);
        res.format({
              'application/json': () => {
            res.json({
        citta: meteo.citta,
        temperatura: meteo.temperatura,
        fenomeniAtmosferici: meteo.fenomeniAtmosferici,
        umidita: meteo.umidita
        });
      }
        });
      }
      else {
        res.sendStatus(401);
      }
    }
  });
});

app.post('/aggiungiCitta', (req, res) => {
  // Si accetta solo body con tipo application/json
  if(req.get('Content-Type') != 'application/json') {
    res.sendStatus(415); //UNSUPPORTED MEDIA TYPE
    return;
  }
  
  console.log("Payload: " + JSON.stringify(req.body));
  
  console.log('Sto aggiungendo ' + req.body.citta);
  
  // NB: manca la validazione dell'input
  var id = prossimoId++;
  //{ citta: 'Urbino', temperatura: { numero: '27', UM: 'celsius'},  fenomeniAtmosferici: 'Pioggia', umidita: { numero: '80', UM: 'percento'}});
  db.set(id, {
    citta: req.body.citta,
    temperatura:
    {
      numero: req.body.numero,
      UM: req.body.celsius
    },
    fenomeniAtmosferici: req.body.fenomeniAtmosferici,
    umidita:
    {
      numero: req.body.numero,
      UM: req.body.celsius
    }
  });
  
  // NB: nella risposta si aggiunge l'ID per notificare al client il nuovo ID della persona aggiunta
  res.json({
    id: id,
    citta: req.body.citta
  });
});

/*
app.put('/people/:id', (req, res) => {
  const id = Number.parseInt(req.params.id);
  if(isNaN(id)) {
    res.sendStatus(400);
    return;
  }
  
  if(!data.has(id)) {
    res.sendStatus(404);
    return;
  }
  
  console.log("Per ID " + id + ", payload: " + JSON.stringify(req.body));
  
  // NB: manca la validazione dell'input
  data.set(id, {
    name: req.body.name,
    surname: req.body.surname
  });
  
  res.sendStatus(200);
});*/

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
