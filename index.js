const express = require('express');
const http = require("http");
const cool = require('cool-ascii-faces');
const inquirer = require('inquirer');
const MongoClient = require('mongodb').MongoClient;
const { IgApiClient } = require('instagram-private-api');
const { get } = require('lodash');

const PORT = process.env.PORT || 5000;
const ig = new IgApiClient();

let auth;

const jokes = [
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    - Mi az? Se keze se lába, de mégis felmegy a padlásra?
    - Ügyes nyomorék
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Cseng a telefon. Csak a kutya van otthon, ő veszi fel a kagylót.
    - Vau! - jelentkezik barátságosan.
    - Tessék? - szól egy döbbent hang a vonal túlsó végén.
    - Vau! - ismétel készségesen a kutya.
    - Halló, nem értem! - kiáltja kétségbeesetten a férfihang.
    Mire a kutya mérgesen:
    - Akkor betűzöm, V, mint Viktor. A, mint Aladár, U, mint Ubul!
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Egy fickó moziba megy, és meglepetten tapasztalja, hogy melette egy kutya ül. A kutya elmélyülten nézi a filmet, a vidám jeleneteknél nevet, a szomorúaknál sírva fakad. Előadás után kíváncsian kíséri a hazafelé tartó kutyát. A kutya bemegy egy házba, ahol egy nő már várja.
    - Magáé ez a kutya? - szólítja meg a nőt.
    - Igen, miért?
    - Ez fantasztikus, melettem ült a moziban és nézte a filmet. A vidám jeleneteknél nevetett, a szomorúaknál sírva fakadt.
    - Mit láttak?
    - A háború és békét.
    - Hát ez nagyon furcsa, nem is értem, hogy lehet... - mondja a gazda.
    - Ugye? Maga is csodálkozik?
    - Hát persze. Hiszen amikor a könyvet olvasta, azt végig nagyon unta...
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Az iskolában azt kéri a tanár a gyerekektől, hogy mondjanak különböző állatokat.
    - Macska - mondja Kati.
    - Ló - mondja Pistike.
    - Kutya - mondja Józsi.
    - Kutya - válaszol Móricka.
    - Kutya? De hiszen az már volt.
    - Tudom, de ez egy másik kutya.
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Egy férfi felkeresi a pszichiátert, és elmondja a panaszát:
    - Doktor úr, segítsen rajtam, folyton azt képzelem, hogy kutya vagyok.
    - Úgy tűnik, Önnek egyszerű kutya-komplexusa van. Jöjjön, feküdjön le ide a kanapéra.
    - Nem lehet, nekem tilos felmennem a kanapékra.
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Egy férfi le akar foglalni egy szobát a nyaralása időtartamára Florida egyik tengerparti üdülőhelyén.
    Ír egy levelet a tulajdonosnak: "Lehetséges lenne-e hogy magammal hozzam a kutyámat? Nagyon jólnevelt és tisztántartott állat. Tarthatom-e a szobában az éjjelek folyamán?"
    Postafordultával jön a válasz: "Én évek óta vezetem ezt az üdülőt. Még soha nem történt, hogy egy kutya ellopott volna törülközőket, ágynemüt, ezüst étkészletet, vagy képeket a falról. Soha nem lettek részegek, és soha nem mentek el úgy hogy nem fizették volna a számlát. Szóval, a kutyája nagyon is szivesen van látva.
    És ha a kutyája hajlandó jótállni magáért, akkor maga is maradhat."
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    Bemegy egy kutya a postára és fel akar adni egy táviratot. Elkezdi diktálni:
    - Vau, vau, vau, Vau, vau, vau, vau, vau, vau.
    A postás felírja, majd megszólal:
    - Ez csak 9 szó, és mi minimum 10-et számlázunk. Most ingyen beletehet még egy szót.
    Megszólal a kutya:
    - Jó lenne, de sajnos semmi más nem jut az eszembe...
    🐶🐾`,
  `Woof woof 🐶
    Köszi, hogy írtál nekem, bár révén, hogy én csak egy kutya vagyok, nem tudom válaszolni, de talán a gazdi :)
    Viszont addig is itt egy vicc:
    - Miért verte szét a rendőr a kutyaházat?
    - ???
    - Hogy ne kapja el az ebolát.
    🐶🐾`,
]

const checkIfExists = async () => {
  let client = null;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (e) {
    throw new Error(e);
  }
  const result = await client.db('heroku_8v05lcq1').collection('users').find().toArray();
  return result;
}

const insertToDatabase = async (users) => {
  let client = null;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (e) {
    throw new Error(e);
  }
  const result = await client.db('heroku_8v05lcq1').collection('users').insertMany(users);
  return result;
}

const deleteWeavers = async (users) => {
  let client = null;
  var query = { _id: { $in: users } };
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  } catch (e) {
    throw new Error(e);
  }
  const result = await client.db('heroku_8v05lcq1').collection('users').deleteMany(query);
  return result;
}

const instagramLogin = async () => {
  let status = null;
  console.log('Attempting to log in...');
  ig.state.generateDevice('szupermaszat');
  console.log(process.env.IG_USERNAME);
  try {
    console.log('Logged in successfully');
    status = true;
    auth = await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);
  } catch (e) {
    console.log('Login failed, checking for resolvers...');
    const twoFactorIdentifier = get(e, 'response.body.two_factor_info.two_factor_identifier');
    if (!twoFactorIdentifier) {
      throw new Error('Unable to login, no 2fa identifier found');
    }
    console.log('Login failed because of 2FA is enabled on the account');
    console.log('Requesting auth code...');
    const { code } = await inquirer.prompt([{
      type: 'input',
      name: 'code',
      message: 'Enter code',
    }]);
    console.log('Attempting to log in again...');
    auth = await ig.account.twoFactorLogin({
      username: process.env.IG_USERNAME,
      verificationCode: code,
      twoFactorIdentifier,
      verificationMethod: '1',
      trustThisDevice: '1',
    });
    console.log('Logged in successfully');
  }
  if (!status) throw new Error('Login cannot be done');
  return status; 
}

const getFollowers = async () => {
  console.log('Getting list of followers...');
  const followersFeed = await ig.feed.accountFollowers(auth.pk);
  const wholeResponse = await followersFeed.request();
  return wholeResponse.users;
};

const checkForFollowers = async () => {
  const users = [];
  const ids = [];
  const followers = await getFollowers();
  followers.forEach((user) => {
    users.push({
      id: user.pk,
      name: user.username,
    });
    ids.push(user.pk);
  });
  const dbUsers = await checkIfExists();
  const leavers = dbUsers.filter((elem) => !users.find(({ id }) => elem.id === id));
  const newFollowers = users.filter((elem) => !dbUsers.find(({ id }) => elem.id === id));
  console.log('#############################################');
  console.log('Users stopped following @szupermaszat :(');
  console.log('#############################################');
  console.log(leavers);
  console.log('#############################################');
  console.log('Users started following @szupermaszat :)');
  console.log('#############################################');
  console.log(newFollowers);
  if(leavers.length > 0) {
    const weavers = [];
    leavers.forEach((leaver) => {
      weavers.push(leaver._id);
    });
    for (let i = 0; i < leavers.length; i += 1) {
      console.log('Sending leaving message for: ' + leavers[i].name);
      const thread = ig.entity.directThread([leavers[i].id.toString()]);
      await thread.broadcastText(`Woof woof 🐶
        Kár, hogy elmész 😢
        Azért remélem visszatérsz 🐕
        Pacsi 🐾😢`);
    }
    await deleteWeavers(weavers);
    console.log('#############################################');
    console.log('The following users has been deleted from the database');
    console.log('#############################################');
    console.log(leavers);
  }
  if(newFollowers.length > 0) {
    for (let i = 0; i < newFollowers.length; i += 1) {
      console.log('Sending welcome message for: ' + newFollowers[i].name);
      const thread = ig.entity.directThread([newFollowers[i].id.toString()]);
      await thread.broadcastText(`Woof woof 🐶
        Köszönöm, hogy bekövettél! ♥️
        Van facebookom is, ha gondolod ott is bökj a lájkra: https://fb.com/szupermaszat 🐕
        Ha esetleg összefutnánk Debrecenben, pacsizzunk le 🐾
        Pacsi 🐾`);
    }
    await insertToDatabase(newFollowers);
    console.log('#############################################');
    console.log('The following users has been added to the database');
    console.log('#############################################');
    console.log(newFollowers);
  }
};

const checkForNewMessages = async () => {
  const items = await ig.feed.directInbox().items();
  const users = [];
  const unread = items.filter(x => x.read_state > 0);
  unread.forEach((msg) => {
    if(msg.users.length > 0) {
      users.push(msg.users[0].username);
    }
  });
  console.log('#############################################');
  console.log(`The following users has left us message that we didn't read yet`);
  console.log('#############################################');
  console.log(users);
  for(let i = 0; i < unread.length; i += 1) {
    const thread = ig.entity.directThread([unread[i].users[0].pk.toString()]);
    await thread.broadcastText(jokes[Math.floor(Math.random() * jokes.length)]);
  }
  return unread;
}

(async() => {
  let loggedIn = null;
  try {
    loggedIn = await instagramLogin();
  } catch (e) {
    throw new Error(e);
  }
  await checkForNewMessages();
  if(loggedIn) {
    setInterval(async () => {
      console.log('Started checking for follower changes');
      // await checkForFollowers();
      console.log('Checking for followers ended, going to next task...');
      console.log('Started checking for follower changes');
      // await checkForNewMessages();
      console.log('Checking for followers ended, now sleeping for 30s');
    }, 30000);
  }
})();

setInterval(() => {
  console.log('Keepalive');
  http.get("http://ancient-shelf-31612.herokuapp.com/");
}, 300000);

express()
  .get('/', (req, res) => res.send(cool()))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))