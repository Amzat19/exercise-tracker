const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const UserModel = require("./model/UserModel");
const ExercisesModel = require("./model/ExercisesModel");

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const userName = req.body.username;

  const newUser = new UserModel({
    username: userName
  });

  try {
    const savedUser = await newUser.save();
    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, 'username _id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  const userId = req.params._id;
  const { description, duration, date } = req.body;

  try {
    const user = await UserModel.findOne({ _id: userId });

    if (user) {
      const username = user.username;
      const dateValue = date ? new Date(date) : new Date();

      const newExercise = new ExercisesModel({
        user_id: userId,
        username,
        description,
        duration,
        date: dateValue.toISOString(),
      });

      await newExercise.save();

      res.json({
        _id: newExercise.user_id,
        username: newExercise.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: new Date(newExercise.date).toDateString()
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query

  try {
    const user = await UserModel.findOne({ _id: userId });

    if (user) {
      let query = { user_id: userId };

      // Apply date filters if 'from' parameter is provided
      if (from) {
        query.date = { $gte: new Date(from) };
      }

      // Apply date filters if 'to' parameter is provided
      if (to) {
        query.date = { ...query.date, $lte: new Date(to) };
      }

      let exercisesQuery = ExercisesModel.find(query).select("-user_id -__v");

      // Apply limit if 'limit' parameter is provided
      if (limit) {
        exercisesQuery = exercisesQuery.limit(parseInt(limit));
      };

      const exercises = await exercisesQuery;
      const formattedExercises = exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date: new Date(e.date).toDateString()
      }))

      const response = {
        username: user.username,
        count: exercises.length,
        _id: user._id,
        log: formattedExercises
      };

      res.json(response);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
