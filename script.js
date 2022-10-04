
console.log(2.0)
/* * * * APIs * * * */
class APIs {
  rndWord = async (c, l) => {
    const bUrl = 'https://random-word-api.herokuapp.com/word',
      query = c
        ? l
          ? `?lang=en&number=${c}&length=${l}`
          : `?lang=en&number=${c}`
        : '';

    return await fetch(`${bUrl + query}`).then((res) => res.json());
  };
}

/* * * * Safari/Firefox Compatibility * * * */
(() => {
  if (!('path' in Event.prototype))
    Object.defineProperty(Event.prototype, 'path', {
      get: function () {
        var path = [];
        var currentElem = this.target;
        while (currentElem) {
          path.push(currentElem);
          currentElem = currentElem.parentElement;
        }
        if (path.indexOf(window) === -1 && path.indexOf(document) === -1)
          path.push(document);
        if (path.indexOf(window) === -1) path.push(window);
        return path;
      },
    });
})();
/* * * * View * * * */

class View {
  isActive = 0;
  typeArea = document.querySelector('type-area');
  time = document.querySelector('time');
  speed = document.querySelector('speed');
  accuracy = document.querySelector('accuracy');
  inputCon = this.typeArea.querySelector('input-con');
  txtDis = this.typeArea.querySelector('textarea-con');
  txtRec = this.typeArea.querySelector('commit');
  txtTrack = this.typeArea.querySelector('text#track');
  active = 'active';

  init(data = {time: 0, speed: 0, accuracy: 0}) {
    this.time.innerHTML = data.time || 0;
    this.speed.innerHTML = data.speed || 0;
    this.accuracy.innerHTML = data.accuracy || 0;
  }
  set activate(s) {
    const v = this.typeArea.classList;

    if (s) {
      v.add(this.active);
      this.isActive = 1;
    } else {
      v.remove(this.active);
      this.isActive = 0;
    }
  }
  set disTyped(t) {
    this.txtTrack.innerHTML = t;
  }
  set pushTyped(ele) {
    this.txtRec.appendChild(ele);
  }
  get reset() {
    this.disTyped = '';
    this.txtRec.innerHTML = '';
    this.txtDis.innerHTML = '';
  }
}

/* * * * Model * * * */

class Model {
  __time;
  time = this.tLimit = 60;
  isEnvokable = 1;
  pos = 0;
  score = {
    correct: 0,
    incorrect: 0,
    total: 0,
    accuracy: '',
    accuracyInt: 0,
    speed: '',
    speedInt: 0,
  };
  words = [];
  typed = '';
  committed = [];
  constructor(data) {
    this.apis = data.Apis || data.Api || data.apis || data.api;
    this.view = data.Views || data.View || data.views || data.view;
  }

  async getWords(c, l) {
    let promise = this.apis.rndWord(c, l);

    this.words = await promise;

    return this.words;
  }
  init() {
    const wrds = this.getWords(200, 4);

    this.view.init({time: this.time});

    wrds.then((res) => {
      this.disWords(res);
    });
  }
  get reset() {
    this.timer = 0;
    this.time = this.tLimit;
    this.view.isActive = 0;
    this.isEnvokable = 1;
    this.pos = 0;
    this.words = [];
    this.score = {
      correct: 0,
      incorrect: 0,
      total: 0,
      accuracy: '',
      accuracyInt: 0,
      speed: '',
      speedInt: 0,
    };
    this.typed = '';
    this.committed = [];
    this.view.reset;
    App.init;
  }
  get timer() {
    return this.time;
  }
  set timer(p) {
    let n = 1;

    if (p) {
      this.__time = setInterval(() => {
        this.time = +(parseFloat(this.time) - parseFloat(n)).toFixed(2);
        if (this.time === 0) this.timer = 0;
        this.view.time.innerHTML = this.time;
        this.calcScore();
        this.view.speed.innerHTML = this.score.speedInt;
        this.view.accuracy.innerHTML = this.score.accuracy;
      }, n * 1000);
    } else {
      this.end;
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
  format(t, d) {
    const ele = document.createElement('text'),
      txt = document.createTextNode(t);
    ele.appendChild(txt);
    if (typeof d !== 'undefined') {
      const s = d === false ? 'wrong' : 'correct';
      ele.classList.add(s);
    }
    return ele;
  }
  calcScore(r) {
    const s = this.score;
    if (r === true) {
      s.correct++;
      s.total++;
    } else if (r === false) {
      s.incorrect++;
      s.total++;
    }
    s.accuracyInt =
      ((s.correct / s.total) * 100).toFixed(0) !== 'NaN'
        ? ((s.correct / s.total) * 100).toFixed(0)
        : 0;
    s.accuracy = s.accuracyInt + '%';
    s.speedInt = ((s.total * 60) / Math.abs(this.tLimit - this.time)).toFixed(0);
    s.speed = s.speedInt + ' words per minute';
    console.log(r, s.accuracyInt);
    return s;
  }
  get commit() {
    const typed = this.typed,
      same = this.compare;
    this.calcScore(same);
    this.committed.push(typed);
    this.shift;
    this.typed = '';
    return { typed, same };
  }
  get compare() {
    if (this.typed === this.words[this.pos]) return true;
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
  disWords(c) {
    const tA = this.view.txtDis;
    c.forEach((v) => {
      const tmp = this.format(v);
      tA.appendChild(tmp);
    });
  }
  formatColor(t) {
    const ele =
      typeof t === 'object' ? this.format(t.typed, t.same) : this.format(t);
    return ele;
  }
  get end() {
    this.view.activate = 0;
    this.isEnvokable = 0;
    clearInterval(this.__time);
    this.__time = undefined;
  }
}

/* * * * Controller * * * */

class Controller {
  constructor(data) {
    this.model = data.Model || data.model;
    this.view = this.model.view;
    this.#listeners;
  }
  get init() {
    this.model.init();
  }
  keyDown(e) {
    const t = e.key.toLowerCase();
    if (view.isActive && model.isEnvokable) {
      if (t.length === 1 && t !== ' ') {
        model.trackTyped = e.key.toLowerCase();
        if (!model.__time) model.timer = 1;
      } else {
        const comm = () => {
          if (model.typed !== '') {
            e.preventDefault();
            const txt = model.commit,
              ele = model.formatColor(txt);
            view.pushTyped = ele;
          }
        };

        switch (t) {
          case 'backspace':
            model.remLast;
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
            model.end;
            console.log(t, 'cannot be logged');
            break;
          default:
            console.log(t, 'cannot be logged');
        }
      }
      view.disTyped = model.typed;
    }
  }

  get #listeners() {
    const view = this.view,
      model = this.model;

    window.addEventListener('blur', (e) => {
      view.activate = 0;
    });
    document.addEventListener('click', (e) => {
      if (e.path.includes(view.typeArea)) {
        view.activate = 1;
        if (!model.isEnvokable) model.reset;
      } else {
        view.activate = 0;
      }
    });
    document.addEventListener('keydown', (e) => {
      this.keyDown(e);
    });
  }
}

const api = new APIs(),
  view = new View(),
  model = new Model({ api, view }),
  App = new Controller({ model });

App.init;
