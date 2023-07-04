// create db and collections
const database = 'games';
const lobbyCollection = 'lobby';
const userCollection = 'user';
const gameStateCollection = 'gameState';

use(database);

db.createCollection(lobbyCollection);
db.createCollection(userCollection);
db.createCollection(gameStateCollection);

// insert 
use(database);

const { insertedId: userInsertId } = db.getCollection('user').insertOne({
  "name": "test"
});
const { insertedId: gameStateInsertId } = db.getCollection('gameState').insertOne({
  "turnRotation": [],
  "currentMove": {
    'cards': [],
    'type': "",
    'player': "",
    'playersInPlay': [],
  },
  'playerStates': [
    {
      'player': "",
      'cardCount': 0,
    },
  ],
});
const { insertedId: lobbyInsertId } = db.getCollection('lobby').insertOne({
  "host": new ObjectId(userInsertId).toString(),
  "players": 1,
  "gameState": new ObjectId(gameStateInsertId).toString()
});

// delete all records
use('games');
db.user.deleteMany({})
db.lobby.deleteMany({})
db.gameState.deleteMany({})