var __importDefault = (this && this.__importDefault) || function(mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

const path = __importDefault(require("path"));
const express = __importDefault(require("express"));
const bodyParser = require('body-parser');
const axios = __importDefault(require('axios'));
var multer = require('multer');
var upload = multer();

const port = 6967;

const app = express.default();
var answers = [];

app.set('view engine', 'ejs');
app.set('views', path.default.join(__dirname, './views'))
app.use('/static', express.default.static(path.default.join(__dirname, './static')));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(upload.array());

app.get('/', async(req, res, next) => {

    if (!answers) {
        res.render('home');
    } else {
        res.render('home', { answers: answers });
    }
});

app.post('/get', async(req, res, next) => {
    var id = req.body.id;
    var url = `https://quizizz.com/quiz/${id}`;
    await axios.default({
        url: url,
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded'
        },


    }).then(async(resp) => {
        var i = 0;
        resp.data.data.quiz.info.questions.forEach(q => {
            if (q.type == "MCQ") {
                var a = q.structure.answer;
                answers[i] = { q: q.structure.query.text, a: q.structure.options[a].text };
            } else if (q.type == "BLANK") {
                meow = [];
                var ii = 0;
                q.structure.options.forEach(s => {
                    meow[ii] = s.text;
                    ii++;
                });
                answers[i] = { q: q.structure.query.text, a: meow };
            } else if (q.type == "MSQ") {

                var a = q.structure.answer;
                if (!isNaN(a)) {
                    a = Array(a);
                }
                var iq = 0;
                var mmm = [];
                a.forEach(b => {
                    mmm[iq] = q.structure.options[b].text;
                    iq++;
                })
                answers[i] = { q: q.structure.query.text, a: mmm };
            } else {
                answers[i] = { q: q.structure.query.text, a: `Answer not found!` };
            }

            i++
        })
    });

    res.redirect('/');

});

app.listen(port, () => { console.log(`Server running!\nGo to http://localhost:${port}`) });