console.log('3.0');
const overlay = document.querySelector('overlay')
window.addEventListener('mouseover', (e) => {
  if (e.target.hasAttribute('x-tip')) {
    create_tooltip(e)
  }
})

const create_tooltip = (e) => {
  const t = e.target,
    ele = t.getBoundingClientRect(),
    info = overlay.getBoundingClientRect(),
    tool = document.createElement('tooltip'),
    txt = document.createElement('tool-bg')
  txt.innerHTML = t.getAttribute('x-tip')
  tool.appendChild(txt)
  overlay.appendChild(tool)


  t.addEventListener('mouseout', () => {
    tool.remove()
  }, { once: true })

  tool.style.left = `${(ele.left + ele.width / 2) / info.width * 100}%`
  tool.style.top = `${ele.top / info.height * 100}%`
}
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
        if (path.indexOf(window) === -1
          && path.indexOf(document) === -1)
          path.push(document);
        if (path.indexOf(window) === -1) path.push(window);
        return path;
      },
    });
})();
/* * * * View * * * */

class View {
  isActive = 0;
  best = document.querySelector('best');
  no_score = document.querySelector('no-score');
  attempts = document.querySelector('attempts');
  typeArea = document.querySelector('type-area');
  time = document.querySelector('time');
  speed = document.querySelector('speed');
  accuracy = document.querySelector('accuracy');
  inputCon = this.typeArea.querySelector('input-con');
  txtDis = this.typeArea.querySelector('textarea-con');
  txtRec = this.typeArea.querySelector('commit');
  txtTrack = this.typeArea.querySelector('text#track');
  active = 'active';
  tool = document.querySelector('#txt-area')
  tooltxt = document.querySelector('#txt-area tool-bg')

  init(data = { time: 0, speed: 0, accuracy: 0}) {
    this.time.innerHTML = data.time || 0;
    this.speed.innerHTML = data.speed || 0;
    this.accuracy.innerHTML = data.accuracy || 0;

    const info = this.typeArea.getBoundingClientRect(),
    o_info = overlay.getBoundingClientRect()
    this.tool.style.left = (info.left + info.width/2)/o_info.width*100 + '%'
    this.tool.style.top = `${info.y/o_info.height*100}%`
  }
  set activate(s) {
    const v = this.typeArea.classList;

    if (s) {
      v.add(this.active);
      this.isActive = 1;
      this.tool.style.opacity = '0'
    } else {
      v.remove(this.active);
      this.isActive = 0;
      this.tool.style.opacity = '1'
    }
  }
  set scores(s) {
    if(this.no_score){
      this.no_score.style.display = 'none';
    }
    if (s.best) {
      let t = s.score.outerHTML
      const h = document.getElementById('highest')
      if(h){
        h.id = ''
      }
      this.best.innerHTML = ''
      this.best.innerHTML = t
      
      s.score.id = 'highest'
      this.attempts.appendChild(s.score)
    }else{
      this.attempts.appendChild(s.score)
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
    rank: 0,
    accuracy: '',
    accuracyInt: 0,
    speed: '',
    speedInt: 0,
  };
  results = {
    highest: 0,
    scores: [{
      score: {...this.score},
      words: {
        origional: [],
        typed: []
      }
    }]
  }
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
  get saveResults(){
    const t = this.results,
    tmp = {
      score: this.score,
      words: {
        origional: this.words.slice(0, this.pos),
        typed: this.committed
      }
    }
    t.scores.push(tmp)
    if(this.score.rank > t.scores[t.highest].score.rank){
      t.highest = t.scores.length - 1
      return 1
    }
    return 0
  }
  init() {
    const wrds = this.getWords(200, 4);

    this.view.init({ time: this.time });

    wrds.then((res) => {
      this.disWords(res);
    });
  }
  get reset() {
    this.timer = 2;
    this.time = this.tLimit;
    this.view.activate = 1;
    this.isEnvokable = 1;
    this.pos = 0;
    this.words = [];
    this.score = {
      correct: 0,
      incorrect: 0,
      total: 0,
      rank: 0,
      accuracy: '',
      accuracyInt: 0,
      speed: '',
      speedInt: 0,
    };
    this.typed = '';
    this.committed = [];
    this.view.reset;
    this.init();
  }
  get timer() {
    return this.time;
  }
  set timer(p) {
    let n = 1;

    if (p === 1) {
      this.__time = setInterval(() => {
        this.time = +(parseFloat(this.time) - parseFloat(n)).toFixed(2);
        if (this.time === 0) this.end;
        this.view.time.innerHTML = this.time;
        this.calcScore();
        this.view.speed.innerHTML = this.score.speedInt;
        this.view.accuracy.innerHTML = this.score.accuracy;
      }, n * 1000);
    } else if (p === 2) {
      clearInterval(this.__time);
    } else {
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
    const s = this.score, sI = ((s.total * 60) / Math.abs(this.tLimit - this.time)).toFixed(0), aI = ((s.correct / s.total) * 100).toFixed(0)
    if (r === true) {
      s.correct++;
      s.total++;
    } else if (r === false) {
      s.incorrect++;
      s.total++;
    }
    s.accuracyInt =
      aI !== 'NaN'
        ? +aI
        : 0;
    s.accuracy = s.accuracyInt + '%';
    s.speedInt = sI !== 'NaN' ? +sI : 0;
    s.speed = s.speedInt + ' words per minute';
    s.rank = s.speedInt * s.accuracyInt / 100 + 1
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
  formatScore(s) {
    const score = document.createElement('score'),
      ind = document.createElement('text'),
      speed = document.createElement('text'),
      accuracy = document.createElement('text')

      ind.innerHTML = s.index
      speed.innerHTML = s.speedInt
      accuracy.innerHTML = s.accuracyInt
      score.appendChild(ind)
      score.appendChild(speed)
      score.appendChild(accuracy)

      return score
  }
  get start(){
    this.timer = 1
  }
  get end() {
    this.timer = 2
    this.calcScore();
    this.view.activate = 0;
    this.isEnvokable = 0;
    this.__time = undefined;
    if (this.time === 0) {
      const best = this.saveResults

      const format = {
        index: this.results.scores.length - 1,
        ...this.results.scores[this.results.scores.length - 1].score
      },
        scores = {
          best,
          score: this.formatScore(format)
        }

      this.view.scores = scores
    }
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
        if (!model.__time) model.start;
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
            break;
          case 'control':
            e.preventDefault();
            if(model.tLimit - model.time > 0)
            model.end;
            break;
          default:
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
      if (e.composedPath().includes(view.typeArea)) {
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


