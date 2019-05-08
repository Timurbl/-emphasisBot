const config = require('./config');
const lists = require('./lists');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/persons_emphasis_bot', {
    useMongoClient: true
})
    .then(() => console.log('MongoBD has started.'))
    .catch((e => console.log(e)));

require('./person.model');

const TelegramBot = require('node-telegram-bot-api');
const Person = mongoose.model('persons');
const bot = new TelegramBot(config.TOKEN, {
    polling: true
});


bot.onText(/\/start/, msg => {

    const text = `Здравствуй, ${msg.from.first_name}! Я бот, который поможет тебе подготовиться к 4ому заданию ЕГЭ по русскому языку.`;
    bot.sendMessage(msg.chat.id, text)
});


bot.onText(/\/go/, msg => {

    const min = 0;
    const max = correct_all.length;
    const value = [];
    let rand;
    while (value.length < 4) {
        rand = min + Math.floor(Math.random() * (max + 1 - min));
        while (value.indexOf(correct_all[rand]) != -1) {
            rand = min + Math.floor(Math.random() * (max + 1 - min));
        }
        value.push(correct_all[rand]);
    }
    rand = min + Math.floor(Math.random() * (max + 1 - min));
    value.push(incorrect_all[rand]);
    value.sort();

    const text = `Вопрос №1\nВ одном из приведённых ниже слов допущена ошибка в постановке ударения: НЕВЕРНО выделена буква, обозначающая ударный гласный звук. Выпишите это слово.
${value[0]}
${value[1]}
${value[2]}
${value[3]}
${value[4]}`;

    Person.updateOne({telegramId: msg.chat.id}, {
       combo: 2
    })
        .then(_ => console.log('combo updated'))
        .catch(e => console.log(e));

    Person.updateOne({telegramId: msg.chat.id}, {
        kb: [value[0], value[1], value[2], value[3], value[4]]
    })
        .then(_ => console.log('updated keyboard'))
        .catch(e => console.log(e));

    Person.findOne({telegramId: msg.chat.id})
        .then(person => console.log(person))
        .catch(e => console.log(e));

    bot.sendMessage(msg.chat.id, text, {
        reply_markup: {
            keyboard: [
                [value[0], value[1]],
                [value[2], value[3], value[4]]
            ]
        }
    })
});


bot.onText(/\/stats/, msg => {
    Person.findOne({telegramId: msg.chat.id})
        .then(person => {
            html1 = `Верных ответов: ${person.correct_ans}`;
            html2 = `Неверных ответов: ${person.incorrect_ans}`;
            bot.sendMessage(msg.chat.id, html1 + '\n' + html2)
        })
        .catch(e => console.log(e));
});


bot.on('message', msg => {

    /*finding new person*/
    Person.findOne({telegramId: msg.from.id})
        .then((person) => {
            if (person == null) {
                console.log('new person!');

                const user = new Person({
                    telegramId: msg.chat.id
                });
                user.save()
                    .then(user => console.log(user))
                    .catch(err => console.log(err));
                console.log('new person has added! ', person)
            }
        });


    /*main part*/
    Person.findOne({telegramId: msg.chat.id})
        .then(person => {

            if (person.kb.length == 5) {
                let well_done = true;
                let correct;

                /*finding correct answer*/
                for (let i = 0; i < 5; i++) {
                    if (dictionary[person.kb[i]] != undefined) {
                        correct = dictionary[person.kb[i]];
                        break
                    }
                }

                let correct_ans, incorrect_ans; /*in Person*/

                switch (msg.text) {
                    case person.kb[0]:
                        if (dictionary[msg.text] != undefined) {
                            well_done = true
                        }
                        else well_done = false;
                        check(well_done, msg, correct);
                        break;
                    case person.kb[1]:
                        if (dictionary[msg.text] != undefined) {
                            well_done = true;
                        }
                        else well_done = false;
                        check(well_done, msg, correct);
                        break;
                    case person.kb[2]:
                        if (dictionary[msg.text] != undefined) {
                            well_done = true;
                        }
                        else well_done = false;
                        check(well_done, msg, correct);
                        break;
                    case person.kb[3]:
                        if (dictionary[msg.text] != undefined) {
                            well_done = true;
                        }
                        else well_done = false;
                        check(well_done, msg, correct);
                        break;
                    case person.kb[4]:
                        if (dictionary[msg.text] != undefined) {
                            well_done = true;
                        }
                        else well_done = false;
                        check(well_done, msg, correct);
                        break;
                }
            }
            else {
                bot.sendMessage(msg.chat.id, 'Для работы с ботом введите команду.')
            }
        })
});


function check(well_done, msg, correct) {

    if (well_done) {
        bot.sendMessage(msg.chat.id, 'Верно! Попробуй еще.')
            .then(_ => {
                Person.findOne({telegramId: msg.chat.id})
                    .then(person => {
                        let combo = person.combo;
                        Person.updateOne({telegramId: msg.chat.id}, {
                            combo: combo + 1
                        })
                            .then(_ => console.log('updated combo1'))
                            .catch(e => console.log(e));

                        let correct_ans = person.correct_ans;
                        Person.updateOne({telegramId: msg.chat.id}, {
                            correct_ans: correct_ans + 1
                        })
                            .then(person => console.log(person))
                            .catch(e => console.log(e));
                    });

                go(msg);
            })
            .catch(e => console.log(e));
    }
    else {
        const html = `Неверно. Правильный ответ: ${correct}\nЧтобы начать новый раунд, нажмите /go`;
        bot.sendMessage(msg.chat.id, html, {
            reply_markup: {
                remove_keyboard: true
            }
        });

        const combo = 1;
        Person.updateOne({telegramId: msg.chat.id}, {
            combo: combo
        })
            .then(_ => console.log('updated combo2'))
            .catch(e => console.log(e));


        Person.findOne({telegramId: msg.chat.id})
            .then(person => {
                let incorrect_ans = person.incorrect_ans;
                Person.updateOne({telegramId: msg.chat.id}, {
                    incorrect_ans: incorrect_ans + 1
                })
                    .then(person => console.log(person))
                    .catch(e => console.log(e));

            })
            .catch(e => console.log(e));
    }
}

function sleep() {
    let i = 0;
    let b = 0;
    for (i = 0; i < 1000000000; i++) {
        b += 1;
    }
    return 0;
}

function go(msg) {
    const min = 0;
    const max = correct_all.length;
    const value = [];
    let rand;
    while (value.length < 4) {
        rand = min + Math.floor(Math.random() * (max + 1 - min));
        while (correct_all[rand] in value){
            rand = min + Math.floor(Math.random() * (max + 1 - min));
        }
        value.push(correct_all[rand]);
    }
    rand = min + Math.floor(Math.random() * (max + 1 - min));
    value.push(incorrect_all[rand]);
    value.sort();

    let text;

    Person.findOne({telegramId: msg.chat.id})
        .then(person => {
            text = `Вопрос №${person.combo}\nВ одном из приведённых ниже слов допущена ошибка в постановке ударения: НЕВЕРНО выделена буква, обозначающая ударный гласный звук. Выпишите это слово.
${value[0]}
${value[1]}
${value[2]}
${value[3]}
${value[4]}`;

            Person.updateOne({telegramId: msg.chat.id}, {
                kb: [value[0], value[1], value[2], value[3], value[4]]
            })
                .then(_ => console.log('updated'))
                .catch(e => console.log(e));

            bot.sendMessage(msg.chat.id, text, {
                reply_markup: {
                    keyboard: [
                        [value[0], value[1]],
                        [value[2], value[3], value[4]]
                    ]
                }
            })
        })
        .catch(e => console.log(e));
}
