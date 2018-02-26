const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const {
  fallbackHandler,
  notFoundHandler,
  genericErrorHandler,
  poweredByHandler
} = require('./handlers.js')

// For deployment to Heroku, the port needs to be set using ENV, so
// we check for the port number in process.env
app.set('port', (process.env.PORT || 9001))

app.enable('verbose errors')

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(poweredByHandler)

// --- SNAKE LOGIC GOES BELOW THIS LINE ---

const moveSnake = data => {
  const myHead = data.you.body.data[0]
  const myBody = data.you.body.data
  const myTail = data.you.body.data[data.you.body.data.length - 1]
  const snakes = data.snakes.data

  const moves = [ {
    direction: "up",
    x: myHead.x,
    y: myHead.y,
    valid: true
  }, {
    direction: "right",
    x: myHead.x,
    y: myHead.y,
    valid: true
  }, {
    direction: "left",
    x: myHead.x,
    y: myHead.y,
    valid: true
  }, {
    direction: "down",
    x: myHead.x,
    y: myHead.y,
    valid: true
  } ]

  // Snakes
  for(let snake in snakes) {
    if(snakes[snake].name === 'MrBrown'){
      snakes.splice(snakes[snake])
    }

    if(snakes.length === 0){
      break;
    }

    snakes[snake].body.data.forEach( function(data) {
      if(data.y >= moves[0].y - 2) {
        moves[0].valid = false
      }
      if(data.x <= moves[1].x + 2) {
        moves[1].valid = false
      }
      if(data.x >= moves[3].x - 2) {
        moves[2].valid = false
      }
      if(data.y <= moves[0].y + 2) {
        moves[3].valid = false
      }
    })
  }


  // Wall boundries.
  if(moves[0].y === 0) {
    moves[0].valid = false
  }
  if(moves[1].x === data.width - 1) {
    moves[1].valid = false
  }
  if(moves[2].x === 0) {
    moves[2].valid = false
  }
  if(moves[3].y === data.height) {
    moves[3].valid = false
  }

  // Simple body boundries
  if(moves[0].y > myBody[1].y) {
    moves[0].valid = false
  }

  if(moves[1].x < myBody[1].x) {
    moves[1].valid = false
  }

  if(moves[2].x > myBody[1].x) {
    moves[2].valid = false
  }

  if(moves[3].y < myBody[1].y) {
    moves[3].valid = false
  }

  console.log(moves)

  for(let move in moves){
    if(moves[move].valid === true) {
      return moves[move].direction
    }
  }
}


// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game
  // console.log('startreq: ', request.body);

  // Response data
  const data = {
    color: '#DFFF00',
    head_url: 'http://www.placecage.com/c/200/200', // optional, but encouraged!
    taunt: "I'm a sneky boi!", // optional, but encouraged!
  }
  // console.log('startres: ', response.body);


  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move
  // console.log('movereq: ', request.body)
  // console.log('movereqBODY: ', request.body.you.body.data);
  // console.log('movereqSNAKES: ', request.body.snakes.data[0].body.data);
  // console.log('movereqFOOD: ', request.body.food);

  // Response data
  const data = {
    move: moveSnake(request.body), // one of: ['up','down','left','right']
    taunt: 'Outta my way, snake!', // optional, but encouraged!
  }

  // console.log('moveres: ', response.body);
  return response.json(data)
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
