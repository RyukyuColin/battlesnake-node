const bodyParser = require('body-parser')
const express = require('express')
const logger = require('morgan')
const app = express()
const PF = require('pathfinding');
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

function findNearestFood(headX, headY, food) {
  let nearestFood = 0;
  let c = 100;

  for(let point in food){
    let a = headX - food[point].x;
    let b = headY - food[point].y;
    if(Math.sqrt( a*a + b*b ) < c) {
      nearestFood = point;
      c = Math.sqrt( a*a + b*b );
    } else {
      c = c
    }
  }
  return food[nearestFood];
}

const moveSnake = gameData => {
  const myHead = gameData.you.body.data[0]
  const myBody = gameData.you.body.data
  const myTail = gameData.you.body.data[gameData.you.body.data.length - 1]
  const snakes = gameData.snakes.data
  const food = gameData.food.data

  nearestFood = findNearestFood(myHead.x, myHead.y, food);

  const grid = new PF.Grid(gameData.width, gameData.height)
  const finder = new PF.AStarFinder();
  const path = finder.findPath(myHead.x, myHead.y, nearestFood.x, nearestFood.y, grid) || null;

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

  // Wall boundries
  // if(myHead.y === 0) {
  //   moves[0].valid = false;
  // }
  // if(myHead.x + 1 === gameData.width) {
  //   moves[1].valid = false;
  // }
  // if(myHead.x === 0) {
  //   moves[2].valid = false;
  // }
  // if(myHead.y + 1 === gameData.height) {
  //   moves[3].valid = false;
  // }

  // Food


  // Snakes
  for(let snake in snakes) {
      snakes[snake].body.data.splice(- 1, 1);

      // console.log('SNAKE HEAD: ', snakes[snake].body.data[0]);

    snakes[snake].body.data.forEach( function(data) {
      grid.setWalkableAt(data.x, data.y, false);


      if(data.y === myHead.y - 1 && data.x === myHead.x) {
        moves[0].valid = false
      }
      // else if(data.y === myHead.y - 2 && data.x === myHead.x) {
      //   moves[0].valid = false
      // }

      if(data.x === myHead.x + 1 && data.y === myHead.y) {
        moves[1].valid = false
      }
      // else if(data.x === myHead.x + 2 && data.y === myHead.y){
      //   moves[1].valid = false
      // }

      if(data.x === myHead.x - 1 && data.y === myHead.y) {
        moves[2].valid = false
      }
      // else if(data.x === myHead.x - 2 && data.y === myHead.y) {
      //   moves[2].valid = false
      // }

      if(data.y === myHead.y + 1 && data.x === myHead.x) {
        moves[3].valid = false
      }
      // else if(data.y === myHead.y + 2 && data.x === myHead.x) {
      //   moves[3].valid = false
      // }
    })
  }

  // Wall boundries.
  if(moves[0].y === 0) {
    moves[0].valid = false
  }
  if(moves[1].x === gameData.width - 1) {
    moves[1].valid = false
  }
  if(moves[2].x === 0) {
    moves[2].valid = false
  }
  if(moves[3].y === gameData.height - 1) {
    moves[3].valid = false
  }

  // Simple body boundries
  // if(moves[0].y > myBody[1].y) {
  //   moves[0].valid = false
  // }
  // if(moves[1].x < myBody[1].x) {
  //   moves[1].valid = false
  // }
  // if(moves[2].x > myBody[1].x) {
  //   moves[2].valid = false
  // }
  // if(moves[3].y < myBody[1].y) {
  //   moves[3].valid = false
  // }

  for(let nodes in grid.nodes){
    // console.log('GRID: ', grid.nodes[nodes].length)
    grid.nodes[nodes].forEach(function(node) {
      // if(node.walkable === false){
      // console.log('HEAD: ', myHead)
      // console.log('NODE: ', node.x, node.y)
      if(node.walkable === false) {
        if(myHead.y - 1 === node.y && myHead.x === node.x) {
          moves[0].valid = false
          // console.log('NO UP')
        }
        if(myHead.x + 1 === node.x && myHead.y === node.y) {
          moves[1].valid = false
          // console.log('NO RIGHT')
        }
        if(myHead.x - 1 === node.x && myHead.y === node.y) {
          moves[2].valid = false
          // console.log('NO LEFT')
        }
        if(myHead.y + 1 === node.y && myHead.x === node.x) {
          moves[3].valid = false
          // console.log('NO DOWN')
        }
      }
    })
    // for(let singleNode in grid.nodes[nodes]){
    //   console.log('NODE: ', singleNode)
    // }
  }

  // Path boundries
  if(path[0][0] === path[1][0] && path[0][1] > path[1][1] && moves[0].valid) {
    moves[1].valid = false; //right
    moves[2].valid = false; //left
    moves[3].valid = false; //down
  }
  if(path[0][1] === path[1][1] && path[0][0] < path[1][0] && moves[1].valid) {
    moves[0].valid = false; //up
    moves[2].valid = false; //left
    moves[3].valid = false; //down
  }
  if(path[0][1] === path[1][1] && path[0][0] > path[1][0] && moves[2].valid) {
    moves[0].valid = false; //up
    moves[1].valid = false; //right
    moves[3].valid = false; //down
  }
  if(path[0][0] === path[1][0] && path[0][1] < path[1][1] && moves[3].valid) {
    moves[0].valid = false; //up
    moves[1].valid = false; //right
    moves[2].valid = false; //left
  }

  // console.log(moves);
  // if((path[0][1] > path[path.length - 1][1]) && moves[0].valid) {
  //   console.log('CURRENT MOVE: UP')
  //   return 'up'
  // }
  // if((path[0][0] < path[path.length - 1][0]) && moves[1].valid) {
  //   console.log('CURRENT MOVE: RIGHT')
  //   return 'right'
  // }
  // if((path[0][0] > path[path.length - 1][0]) && moves[2].valid) {
  //   console.log('CURRENT MOVE: LEFT')
  //   return 'left'
  // }
  // if((path[0][1] < path[path.length - 1][1]) && moves[3].valid) {
  //   console.log('CURRENT MOVE: DOWN')
  //   return 'down'
  // }

  for(let move in moves){
    if(moves[move].valid === true){
      // console.log('CURRENT MOVE: ', moves[move].direction)
      return moves[move].direction
    }
  }
}


// Handle POST request to '/start'
app.post('/start', (request, response) => {
  // NOTE: Do something here to start the game

  // Response data
  const data = {
    color: '#42F4BC',
    head_url: 'http://www.placecage.com/c/200/200', // optional, but encouraged!
    taunt: "I'm a sneky boi!", // optional, but encouraged!
  }


  return response.json(data)
})

// Handle POST request to '/move'
app.post('/move', (request, response) => {
  // NOTE: Do something here to generate your move

  // Response data
  const data = {
    move: moveSnake(request.body), // one of: ['up','down','left','right']
    taunt: 'The Sauce is loose!', // optional, but encouraged!
  }

  return response.json(data)
})

// --- SNAKE LOGIC GOES ABOVE THIS LINE ---

app.use('*', fallbackHandler)
app.use(notFoundHandler)
app.use(genericErrorHandler)

app.listen(app.get('port'), () => {
  console.log('Server listening on port %s', app.get('port'))
})
