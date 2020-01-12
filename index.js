class View {
    constructor(container) {
        this.container = container;
    }

    init() {
        this.startBlock = document.createElement('div');
        this.startBlock.className = 'start_block';
        this.createLoginBlock();
        this.createDifficultyBlock(['легкий', 'средний', 'сложный']);
        this.createStartButton();
        this.container.append(this.startBlock);
    }

    createLoginBlock() {
        this.loginBlock = document.createElement('div');
        this.loginBlock.className = 'login_block';
        this.loginBlockTitle = document.createElement('H2');
        this.loginBlockTitle.innerText = 'Введите ваше имя и фамилию';
        this.loginForm = document.createElement('form');
        this.loginInputName = document.createElement('input');
        this.loginInputName.placeholder = 'Ваше имя';
        this.loginInputName.type = 'text';
        this.loginInputFamily = document.createElement('input');
        this.loginInputFamily.placeholder = 'Ваша фамилия';
        this.loginInputFamily.type = 'text';
        this.loginForm.append(this.loginInputName, this.loginInputFamily);
        this.loginBlock.append(this.loginBlockTitle, this.loginForm);
        this.startBlock.append(this.loginBlock);
    }

    createDifficultyBlock(options) {
        this.difficultyBlock = document.createElement('div');
        this.difficultyBlock.className = 'difficulty_block';
        this.difficultyBlockTitle = document.createElement('h2');
        this.difficultyBlockTitle.innerText = 'Выберите сложность';
        this.difficultyBlock.append(this.difficultyBlockTitle);
        this.difficultyInputsArr = [];
        for (let i = 0; i < 3; i++) {
            let inputLabel = {};
            inputLabel.input = document.createElement('input');
            inputLabel.input.name = 'difficulty';
            inputLabel.input.id = i;
            inputLabel.input.value = i;
            inputLabel.input.type = 'radio';
            if (i == 0) {
                inputLabel.input.checked = true;
            }
            inputLabel.label = document.createElement('label');
            inputLabel.label.innerText = options[i];
            inputLabel.label.setAttribute('for', i);
            this.difficultyInputsArr.push(inputLabel);
        }
        this.difficultyInputsArr.forEach(item => this.difficultyBlock.append(item.input, item.label));
        this.startBlock.append(this.difficultyBlock);
    }

    createStartButton() {
        this.startBtn = document.createElement('button');
        this.startBtn.innerText = 'Начать';
        this.startBtn.disabled = true;
        this.startBlock.append(this.startBtn);
    }

    unblockStartBtn(state) {
        this.startBtn.disabled = state;
    }

    drawNameBlock(settings) {
        this.startBlock.remove();
        this.nameBlock = document.createElement('div');
        this.nameBlock.className = 'name_block';
        this.nameBlock.innerHTML = `${settings.name}, уровень сложности ${+settings.level + 1}`;
    }

    drawQuestion(questionObj) {
        this.questionBlock = document.createElement('div');
        this.questionBlock.className = 'question_block';
        this.questionTitle = document.createElement('h2');
        this.questionTitle.innerText = 'Вопрос';
        this.questionItem = document.createElement('p');
        this.questionItem.className = 'question_item';
        this.questionItem.innerText = questionObj.question;
        this.drawAnswers(questionObj);
        this.drawAnswerBtn();
        this.questionBlock.append(this.questionItem, this.answersBlock);
        this.container.append(this.nameBlock, this.questionTitle, this.questionBlock);
    }

    drawAnswers(questionObj) {
        this.answersBlock = document.createElement('div');
        this.answersBlock.className = 'answers_block';
        this.answersTitle = document.createElement('h2');
        this.answersTitle.innerText = 'Варианты ответов:';
        this.answersInputs = [];

        for (let i = 0; i < 4; i++) {
            let inputLabel = {};
            inputLabel.input = document.createElement('input');
            inputLabel.input.id = i;
            inputLabel.input.name = 'question';
            inputLabel.input.value = questionObj.variants[i];
            inputLabel.input.type = 'radio';
            inputLabel.label = document.createElement('label');
            inputLabel.label.innerText = questionObj.variants[i];
            inputLabel.label.setAttribute('for', i);
            this.answersInputs.push(inputLabel);
        }

        this.answersBlock.append(this.answersTitle);
        this.answersInputs.forEach(item => this.answersBlock.append(item.input, item.label));
    }

    drawAnswerBtn() {
        this.answerBtn = document.createElement('button');
        this.answerBtn.className = 'answer_btn';
        this.answerBtn.innerText = 'Ответить';
        this.answersBlock.append(this.answerBtn);
    }

    getAnswer() {
        return this.answersInputs.find(item => item.input.checked).input.value;
    }

    drawRight() {
        alert('Это правильный ответ!');
    }

    drawWrong() {
        alert('Это неправильный ответ!')
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
    }

    init() {
        this.view.init();
        this.prevalidation();
        this.setStartBtn();
    }

    prevalidation() {
        this.form = document.querySelectorAll('input[type = text]');
        this.form.forEach(item => item.addEventListener('input', () => {
            if (this.form[0].value && this.form[1].value) {
                this.view.unblockStartBtn(false);
            } else this.view.unblockStartBtn(true); 
        }))
    }

    setStartBtn() {
        const startBtn = document.querySelector('button');
        const settings = {};
        startBtn.addEventListener('click', () => {    
            const inputs = [...document.querySelectorAll('input')];       
            settings.name = inputs[0].value;
            settings.family = inputs[1].value;
            settings.level = inputs.find(item => item.checked).value;       
            
            
            
            this.model.saveSettings(settings);
            this.model.generateQuestions();
            let currentQuestion = this.model.getQuestion();
            this.view.drawNameBlock(settings);
            this.view.drawQuestion(currentQuestion);
            this.setAnswerBtn();
        });
    }

    setAnswerBtn() {
        this.answerBtn = document.querySelector('.answer_btn');
        this.answerBtn.addEventListener('click', () => {
            let answer = this.view.getAnswer();
            if (this.model.checkAnswer(answer)) {
                this.view.drawRight();
            } else this.view.drawWrong();
        })

    }
}

class Model {
    constructor() {
        this.currentQuestionNum = 0;
        this.questionsArr = [
            {
            level: 0,
            question: 'Как правильно закончить пословицу: «Не откладывай на завтра то, что можно…»?',
            variants: [
                'сделать сегодня',
                'сделать послезавтра',
                'сделать через месяц',
                'никогда не делать'
            ],
            answer: 'сделать сегодня'
        },
            {
            level: 0,
            question: 'Что говорит человек, когда замечает нечто необычное?',
            variants: [
                'попало в лоб',
                'залетело в рот',
                'накапало в уши',
                'бросилось в глаза'
            ],
            answer: 'сделать сегодня'
        } ,
            {
            level: 0,
            question: 'Что не бывает морским?',
            variants: [
                'рельс',
                'огурец',
                'гребешок',
                'узел',
            ],
            answer: 'рельс'
            },
            { level: 0,
            question: 'Что помогает туристу ориентироваться в незнакомом городе?',
            variants: [
                'путепровод',
                'путеукладчик',
                'путеводитель',
                'путеводная звезда',
            ],
            answer: 'путеводитель'},
            {level: 0,
            question: 'Какой наряд прославил баснописец Крылов?',
            variants: [
                'тришкин кафтан',
                'ивашкин армяк',
                'прошкин зипун',
                'машкин сарафан'
            ],
            answer: 'тришкин кафтан'},
            {level: 1,
            question: 'В какой стране появилась мандолина?',
            variants: [
                'Испания',
                'Италия',
                'Венгрия',
                'Греция',
            ],
            answer: 'Италия'
            },
            {level: 1,
            question: 'Как жители Лондона прозвали небоскреб Мэри-Экс, спроектированный Норманом Фостером?',
            variants: [
                '«корнишон»',
                '«баклажан»',
                '«кабачок»',
                '«патиссон»',
            ],
            answer: 'корнишон'},
            {level: 1,
            question: 'Что на Руси называли «голова садовая»?',
            variants: [
                'репу',
                'свеклу',
                'капусту',
                'яблоко',
            ],
            answer: 'капусту'},
            {level: 1,
            question: 'В какой из этих городов Новый год приходит раньше?',
            variants: [
                'Пермь',
                'Красноярск',
                'Омск',
                'Новосибирск',
            ],
            answer: 'Красноярск'},
            {level: 1,
            question: 'Что можно сделать, используя крупчатку?',
            variants: [
                'покрыть дорогу',
                'слепить снежок',
                'замесить тесто',
                'оседлать лошадь'
            ],
            answer:'замесить тесто' },
            {level: 2,
            question: 'До конца 18 века при английском королевском дворе была должность откупорщика бутылок. Какие бутылки он открывал?',
            variants: [
                'с вином для королевы',
                'с уксусом для кухни',
                'прибитые к берегу',
                'с заграничными благовониями',
            ], answer: 'прибитые к берегу'},
            {level: 2,
            question: 'В какой стране был построен ледокол «Ермак»?',
            variants: [
                'Россия',
                'Германия',
                'Нидерланды',
                'Великобритания'
            ], answer:'Великобритания' },
            {level: 2,
            question: 'Чем увлекался знаменитый сказочник Ганс-Христан Андерсен?',
            variants: [
                'вязанием',
                'вырезанием из бумаги',
                'выжиганием',
                'выпиливанием лобзиком',
            ], answer: 'вырезанием из бумаги'},
            {level: 2,
            question: 'Как называется один из видов жуков?',
            variants: [
                'артиллерист',
                'командор',
                'канонир',
                'бомбардир'
            ], answer: 'бомбардир'},
            {level: 2,
            question: 'Что не входило в обязанности первых стюардесс?',
            variants: [
                'заправлять самолет',
                'носить багаж',
                'кормить пассажиров',
                'уничтожать мух',
            ], answer: 'кормить пассажиров'}

        ];
    }

    saveSettings(settings) {
        this.settings = settings;
    }

    generateQuestions() {
        this.currentLvlQuestions = this.questionsArr.filter(item => item.level == this.settings.level);
        this.currentLvlQuestions = this.shuffleArray(this.currentLvlQuestions);
        this.currentLvlQuestions.forEach(item => this.shuffleArray(item.variants));

    }

    shuffleArray(array) {

        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    getQuestion() {
        this.currentQuestion = this.currentLvlQuestions[this.currentQuestionNum];
        ++this.currentQuestionNum;
        return this.currentQuestion;
    }

    checkAnswer(answer) {
        if(answer == this.currentQuestion.answer) {
            return true;
        } else return false;
    }











}

const container = document.querySelector('#app');
const view = new View(container);
const model = new Model();
const controller = new Controller(model, view);

controller.init();

