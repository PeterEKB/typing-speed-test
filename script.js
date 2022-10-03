/* * * * APIs * * * */
class APIs {
  rndWord = async (c,l) => {
    const bUrl = 'https://random-word-api.herokuapp.com/word',
      query = c ? (l ? `?number=${c}&length=${l}` : `?number=${c}`) : '';

    return await fetch(`${bUrl + query}`).then((res) => res.json());
  };
}

/* * * * View * * * */

class View {
  typeArea = document.querySelector('type-area');
  time = document.querySelector('time')
  speed = document.querySelector('speed')
  accuracy = document.querySelector('accuracy')
  inputCon = this.typeArea.querySelector('input-con');
  txtDis = this.typeArea.querySelector('textarea-con');
  txtRec = this.typeArea.querySelector('commit');
  txtTrack = this.typeArea.querySelector('text#track');
  active = 'active';
}

/* * * * Model * * * */

class Model {
  #time
  time = 0
  tLimit = 60
  isActive = 0;
  isEnvokable = 1;
  pos = 0;
  score = {
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: '',
    accuracyInt: 0,
    speed: '',
    speedInt: 0
  }
  words = [];
  typed = '';
  committed = [];
  constructor(data) {
    this.apis = data.Apis || data.Api || data.apis || data.api;
    this.view = data.Views || data.View || data.views || data.view;
    this.#listeners;
  }
  
  async getWords(c, l) {
    let promise = this.apis.rndWord(c, l);
    
    this.words = await promise;
    
    return this.words;
  }
  
  get reset(){
    this.timer = 0
    this.time = 0
    this.isActive = 0;
    this.isEnvokable = 1;
    this.pos = 0;
    this.words = [];
    this.pos = 0;
    this.score = {
      correct: 0,
      incorrect: 0,
      total: 0,
      accuracy: '',
      accuracyInt: 0,
      speed: '',
      speedInt: 0
    }
    this.typed = '';
    this.committed = [];
    this.view.txtRec.innerHTML = ''
    this.view.txtDis.innerHTML = ''
    this.disTyped
    App.init
  }
  get timer(){
    return this.time
  }
  set timer(p){
    let n = 1

    if(p){
      this.#time = setInterval(()=>{
        this.time = +(parseFloat(this.time) + parseFloat(n)).toFixed(2)
        if(this.time === this.tLimit)
        this.timer = 0
        this.view.time.innerHTML = this.time
        this.calcScore()
        this.view.speed.innerHTML = this.score.speedInt
        this.view.accuracy.innerHTML = this.score.accuracy
      },n*1000)
    }else{
      this.end
    }
  }

  get trackTyped() {
    return this.typed;
  }
  set trackTyped(t) {
    this.typed += t;
  }
  get remLast() {
    this.typed = this.typed.slice(0, -1);
  }
  set remLast(t) {
    this.typed = this.typed.slice(0, -t);
  }
  format(t,d) {
    const ele = document.createElement('text'),
      txt = document.createTextNode(t);
    ele.appendChild(txt);
    if(typeof(d) !== 'undefined'){
      const s = d === false? 'wrong': 'correct'
      ele.classList.add(s)
    }
    return ele;
  }
  calcScore(r) {
    const s = this.score
    if (r === true) {
      s.correct++
      s.total++
    } else if (r === false) {
      s.incorrect++
      s.total++
    }
    s.accuracyInt = (s.correct / s.total * 100).toFixed(0)
    s.accuracy = s.accuracyInt + '%'
    s.speedInt = (s.total * 60 / this.time).toFixed(0)
    s.speed = s.speedInt + ' words per minute'
    console.log(r, s.speed)
    return s
  }
  get commit() {
    const typed = this.typed,
      same = this.compare;
    this.calcScore(same)
    this.committed.push(typed);
    this.shift;
    this.typed = '';
    return { typed, same };
  }
  get compare() {
    if (this.typed === this.words[this.pos]) 
      return true;
    return false;
  }
  get shift() {
    let tmp = this.words[this.pos];
    this.shift = 1;
    return tmp;
  }
  set shift(n) {
    this.pos++;
    let d = this.view.txtDis;
    for (let i = 0; i < n; i++) {
      let t = d.querySelector('text');
      if (t) {
        t.remove();
      } else {
        break;
      }
    }
  }
  get disTyped() {
    this.view.txtTrack.innerHTML = this.typed;
  }
  display()
  disWords(c) {
    const tA = this.view.txtDis;
    c.forEach((v) => {
      const tmp = this.format(v);
      tA.appendChild(tmp);
    });
  }
  set pushTyped(t) {
    const ele =
      typeof(t) === 'object'
        ? this.format(t.typed, t.same)
        : this.format(t);
    this.view.txtRec.appendChild(ele);
  }
  set activate(s){
    const v = this.view;
    
    if(s){
      v.typeArea.classList.add(v.active)
      this.isActive = 1
    }else{
      v.typeArea.classList.remove(v.active)
      this.isActive = 0;
    }
  }
  get end(){
    this.activate = 0
    this.isEnvokable = 0
    clearInterval(this.#time)
    this.#time = undefined
  }
  get #listeners() {
    const v = this.view;
    
    window.addEventListener('blur', (e) => {
    });
    document.addEventListener('click', (e) => {
      if (e.path.includes(v.typeArea)) {
        this.activate = 1
        if(!this.isEnvokable)
          this.reset
      } else {
        this.activate = 0
      }
    });
    document.addEventListener('keydown', (e) => {
      const t = e.key.toLowerCase();
      if (this.isActive && this.isEnvokable) {
        if (t.length === 1 && t !== ' ') {
          this.trackTyped = e.key.toLowerCase();
          if(!this.#time)
          this.timer = 1
        } else {
          const comm = () => {
            if (this.typed !== '') {
              e.preventDefault();
              const txt = this.commit;
              this.pushTyped = txt;
            }
          };

          switch (t) {
            case 'backspace':
              this.remLast;
              break;
            case ' ':
              comm();
              break;
            case 'enter':
              comm();
              break;
            case 'alt':
              e.preventDefault();
              console.log(t, 'cannot be logged');
              break;
            case 'control':
              e.preventDefault();
              this.end
              console.log(t, 'cannot be logged');
              break;
            default:
              console.log(t, 'cannot be logged');
          }
        }
        this.disTyped;
      }
    });
  }
}

/* * * * Controller * * * */

class Controller {
  constructor(data) {
    this.model = data.Model || data.model;
    this.view = data.Views || data.View || data.views || data.view;
  }
  get init() {
    const m = this.model,
      wrds = m.getWords(200, 4);

    wrds.then((res) => {
      this.showModel = res;
    });
    
  }

  set showModel(s) {
    const d = this.model;

    d.disWords(s);
  }
}

const api = new APIs(),
  view = new View(),
  model = new Model({ api, view }),
  App = new Controller({ model, view });

App.init;
