const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
    telegramId: {
        type: Number,
        required: true
    },
    kb: {
        type: [String],
        required: false,
        default: [1]
    },
    correct_ans: {
        type: Number,
        default: 0
    },
    incorrect_ans: {
        type: Number,
        default: 0
    },
    combo: {
        type: Number,
        default: 1
    }
});

mongoose.model('persons', PersonSchema);
