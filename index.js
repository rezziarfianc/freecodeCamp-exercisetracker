const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const users = [];
const exercises = [];

const compareTwodate = (date1, date2, comparison = '>') => {
  const parsedDate1 = new Date(date1);
  if (isNaN(parsedDate1)) {
      throw new Error(`${date1} is not a valid date`);
  }

  // Check if date2 is a valid date
  const parsedDate2 = new Date(date2);
  if (isNaN(parsedDate2)) {
      throw new Error(`${date2} is not a valid date`);
  }

  switch (comparison) {
  case '>':
    return parsedDate1 > parsedDate2;
  case '<':
    return parsedDate1 < parsedDate2;
  case '==':
    return parsedDate1.getTime() === parsedDate2.getTime(); // Use getTime() for precise equality check
  case '>=':
    return parsedDate1 >= parsedDate2;
  case '<=':
    return parsedDate1 <= parsedDate2;
  default:
    throw new Error(`${comparison} is not a valid comparison operator`);
  }
}


app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.post('/api/users', urlencodedParser, (req, res) => {
  const { username } = req.body;

  const id = nanoid(16);
  const user = { username : "asddasdsad", _id : nanoid(16)}
  
  users.push(user);
  res.json(user);
});

app.post('/api/users/:_id/exercises', urlencodedParser, (req, res) => {
  const {description, duration, date=null } = req.body;
  const { _id } = req.params;

  if (!_id) {
    res.status(400).json({
      error : "id is required !"
    });
  }

  const userIndex = users.findIndex((el) => el._id == _id);

  if (userIndex == -1) {
    return res.status(404).json({
      error : "user Not found"
    });
  }
  if (isNaN(Number(duration))) {
    return res.status(400).json({
      error : "duration must be a number!"
    });
  }

  const user = users[userIndex];
  const newDate = new Date(date);

  const exercise = {
    _id : user._id,
    description, 
    duration : Number(duration), 
    date : newDate != 'invalid date' ? newDate.toDateString() : new Date().toDateString() ,
  };

  exercises.push(exercise);

  return res.json({
    ...user,
    ...exercise
  });
});


app.get('/api/users/:_id/logs', (req, res) => {

  const { _id } = req.params;
  const { from=null, to=null, limit=null } = req.query;

  const userIndex = users.findIndex((el) => el._id == _id);
  if (userIndex == -1) {
    return res.status(404).json({
      error : "user Not found"
    });
  }

  console.log(exercises);

  const user = users[userIndex];
  const filteredExercises = exercises.filter((exercise) => {
    if (exercise._id != _id) return false;
    let isWithinDateRange = true;

    const exerciseDate = new Date(exercise.date);

    if (from) {
      const fromDate = new Date(from);
      if (exerciseDate <= fromDate) {
        isWithinDateRange = false;
      }
    }

    if (to) {
      const toDate = new Date(to);
      if (exerciseDate >= toDate) {
        isWithinDateRange = false;
      }
    }
    return isWithinDateRange;

  });

  // Apply limit if provided
  if (limit) {
    filteredExercises = filteredExercises.slice(0, parseInt(limit));
  }

  res.json({
    ...user,
    log : filteredExercises
  });
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
