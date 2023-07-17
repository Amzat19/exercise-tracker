const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const exercisesSchema = new Schema({
    user_id: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

const ExercisesModel = mongoose.model('Exercises', exercisesSchema);
module.exports = ExercisesModel;