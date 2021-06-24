//-------------------------- INCLUSIONE DELLE LIBRERIE --------------------------//
const express = require("express");
const app = express();

const cookieparser = require('cookie-parser');
app.use(cookieparser());

const sha256 = require('js-sha256');

const jwt = require('njwt');
const cod_segreto = process.env.JWT_SECRET;

app.use(express.json());

//------------------------------------------------------------------------------//

//-------------------------- REGISTRAZIONE UTENTI --------------------------//
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

//------------------------------------------------------------------------//

//funzione per autenticare l'utente e generare il JWT
function autenticazioneUtente(req, res) {
    if (!req.headers.authorization) {
        res.sendStatus(401);
        return;
    }

    console.log('Authorization: ' + req.headers.authorization);

    if (!req.headers.authorization.startsWith('Basic ')) {
        res.sendStatus(401);
        return;
    }

    console.log('Basic authentication');

    const auth = req.headers.authorization.substr(6);
    const decoded = Buffer.from(auth, 'base64').toString();
    console.log('Decoded: ' + decoded);

    const [login, password] = decoded.split(':');

    if (!logins.has(login)) {
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

    if (hashed == user.hash) {
        const claims = {
            sub: login,
            iss: 'meteorologia'
        };

        const token = jwt.create(claims, cod_segreto);
        token.setExpiration(new Date().getTime() + 600000); //10 minuti
        console.log('New token: ' + token.compact());

        res.cookie('sessionToken', token.compact());
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
}

//POST https://meteo-tabarrini-lorenzo.glitch.me/meteo/login
//chiamata della funzione per effetturare il login utente
//destinato a: chiunque
app.post('/meteo/login', (req, res) => {
    if (autenticazioneUtente(req, res)) {
        res.sendStatus(200);
    } else {
        res.sendStatus(401);
    }
});

//Database interno del servizio meteo
const db = new Map();
db.set(1, {
    citta: 'Urbino',
    temperatura: {
        numero: 27,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Pioggia',
    umidita: {
        numero: 80,
        UM: 'percento'
    }
});
db.set(2, {
    citta: 'Rimini',
    temperatura: {
        numero: 31,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Coperto',
    umidita: {
        numero: 77,
        UM: 'percento'
    }
});
db.set(3, {
    citta: 'San Marino',
    temperatura: {
        numero: 28,
        UM: 'celsius'
    },
    fenomeniAtmosferici: 'Sole',
    umidita: {
        numero: 50,
        UM: 'percento'
    }
});

var prossimoId = 4;

//GET https://meteo-tabarrini-lorenzo.glitch.me/meteo
//restituisce tutti i dati meteo presenti nel servizio
//destinato a: gestore, utente
app.get('/meteo', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                res.type('application/json').send(Array.from(db));
            } else {
                res.sendStatus(401);
            }
        }
    });
});

//GET https://meteo-tabarrini-lorenzo.glitch.me/meteo/meteoCitta/:id
//restituisce tutti i dati meteo di una certa città, tramite l'id di essa
//destinato a: gestore, utente
app.get('/meteo/meteoCitta/:id', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore' || chiaveVerificata.body.sub == 'utente') {
                const id = Number.parseInt(req.params.id);

                if (isNaN(id)) {
                    res.sendStatus(400); //BAD REQUEST
                    return;
                }
                if (!db.has(id)) {
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
            } else {
                res.sendStatus(401);
            }
        }
    });
});

//funzione per verificare la struttura di due file JSON, restituisce true se hanno la stessa struttura,
//false se le strutture sono diverse
function verificaJson(primoJson, secondoJson) {
    for (var i in primoJson)
        if (!secondoJson.hasOwnProperty(i))
            return false;
    return true;
}

//POST https://meteo-tabarrini-lorenzo.glitch.me/meteo/aggiungiCitta
//Aggiunge una nuova riga nel database interno nel sistema. Accetta solo body in JSON.
//destinato a: gestore
app.post('/meteo/aggiungiCitta', (req, res) => {
    // Si accetta solo body con tipo application/json
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);
        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') {
                if (req.get('Content-Type') != 'application/json') {
                    res.sendStatus(415); //UNSUPPORTED MEDIA TYPE
                    return;
                }


                var baseJson = {
                    citta: 'Rimini',
                    temperatura: {
                        numero: 30,
                        UM: 'celsius'
                    },
                    fenomeniAtmosferici: 'Sole',
                    umidita: {
                        numero: 80,
                        UM: 'percento'
                    }
                };
                if (verificaJson(baseJson, req.body) != true) {
                    res.sendStatus(400);
                    return;
                }
              
                console.log('Sto aggiungendo ' + req.body.citta);
              
                var id = prossimoId++;
                db.set(id, {
                    citta: req.body.citta,
                    temperatura: {
                        numero: req.body.temperatura.numero,
                        UM: req.body.temperatura.UM
                    },
                    fenomeniAtmosferici: req.body.fenomeniAtmosferici,
                    umidita: {
                        numero: req.body.umidita.numero,
                        UM: req.body.umidita.UM
                    }
                });

                res.json({
                    id: id,
                    citta: req.body.citta
                });
            }
        }
    });
});

//DELETE https://meteo-tabarrini-lorenzo.glitch.me/meteo/eliminaCitta/:id
//elimina una riga nel "database" tramite l'id della città.
//destinato a: gestore
app.delete('/meteo/eliminaCitta/:id', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);
        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') {
                const id = Number.parseInt(req.params.id);
                if (isNaN(id)) {
                    res.sendStatus(400);
                    return;
                }

                if (!db.has(id)) {
                    res.sendStatus(404);
                    return;
                }

                db.delete(id);

                res.sendStatus(200);
            }
        }
    });

});

//POST https://meteo-tabarrini-lorenzo.glitch.me/meteo/modificaDato
//modifica un certo parametro del servizio metereologo.
//destinato a: gestore
app.post('/meteo/modificaDato', (req, res) => {
    if (!req.cookies.sessionToken) {
        res.sendStatus(401);
        return;
    }

    const chiave = req.cookies.sessionToken;
    console.log('Token: ' + chiave);

    jwt.verify(chiave, cod_segreto, (err, chiaveVerificata) => {
        if (err) {
            console.log(err);
            res.sendStatus(401);

        } else {
            console.log(chiaveVerificata);
            if (chiaveVerificata.body.sub == 'gestore') {
                const id = Number.parseInt(req.query.id);
                const campo = req.query.campo;
                const nuovoValore = req.query.nuovoValore;

                if (isNaN(id)) {
                    res.sendStatus(400); //BAD REQUEST
                    return;
                }
                if (!db.has(id)) {
                    res.sendStatus(404); //NOT FOUND
                    return;
                }

                const riga = db.get(id);
                if (campo == 'c') {
                    riga.citta = nuovoValore;
                } else if (campo == 'tn') {
                    if (isNaN(nuovoValore)) {
                        res.sendStatus(400); //BAD REQUEST
                        return;
                    }
                    riga.temperatura.numero = nuovoValore;
                } else if (campo == 'tum') {
                    riga.temperatura.UM = nuovoValore;
                } else if (campo == 'fa') {
                    riga.fenomeniAtmosferici = nuovoValore;
                } else if (campo == 'un') {
                    if (isNaN(nuovoValore)) {
                        res.sendStatus(400); //BAD REQUEST
                        return;
                    }
                    riga.umidita.numero = nuovoValore;
                } else if (campo == 'uum') {
                    riga.umidita.UM = nuovoValore;
                } else {
                    res.sendStatus(404); //NOT FOUND
                    return;
                }
                res.sendStatus(200);
            } else {
                res.sendStatus(401);
            }
        }
    });
});



const listener = app.listen(process.env.PORT, () => {
    console.log("Your app is listening on port " + listener.address().port);
});