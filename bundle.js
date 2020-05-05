(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// this object holds configuration data used by instantions of Modal and Section classes


const UserFunctions = require("./userfunctions.js");

module.exports = {

  booksSection: {
    type: "li",
    classes: ["book"],
    attributes: {
      itemtype: "http://schema.org/Book",
      itemscope: "",
    },
    dataset: {
      number: null,
    },
    innerHTMLcreator: function createItem(bookObject, functionObj) {
      return "\n <a class = 'book__cover'  data-href = ".concat(bookObject.cover.large, ">\n <img itemprop = 'image' alt = 'book cover'class='book__cover__image fadein' src=").concat(bookObject.cover.small, ">\n                                    </a>\n                                    <div class='bookInfo'>\n                                        <div class='bookInfo__titleContainer'>\n                                            <p class= 'bookInfo__title' itemprop ='name'>").concat(bookObject.title, "</p>\n                                           \n                                            \n                                        </div>\n                                        <div class='book__details'>\n                                            <p itemprop ='author' class= \"book__details_author\"><span> ").concat(functionObj.processedFirstName(bookObject.author), "</span> ")
        .concat(functionObj.getSurname(bookObject.author), "</p>\n <p itemprop ='datePublished'><span>Release Date:</span> ")
        .concat(bookObject.releaseDate, "</p>\n  <p itemprop = 'numberOfPages'><span>Pages:</span> ")
        .concat(bookObject.pages, "</p>\n <p itemprop ='discussionUrl'><span>Link:</span> <a href = ")
        .concat(bookObject.link, ">shop</a></p>\n  </div>\n </div>\n    \n    \n  ");
    },
    extraFunction: UserFunctions.name,
  },
  noBooksModal: {

    type: "div",
    classes: ["noBooksModal__content"],
    attributes: {
      id: "noBooksModal-content",
    },
    innerHTMLcreator: function createItem() { return "<span id ='closeNoBooksScreen' class='noBooksModal__close'>&times;</span><div><span>Nie znaleziono przedmiotów </span><br><span>spełniających kryteria wyszukiwania</span></div>"; },
  },


  modal: {

    type: "div",
    classes: ["myModal__content"],
    attributes: {
      id: "myModal-content",
    },

    innerHTMLcreator: function createItem() { const src = (this.target).dataset.href; return "<span id ='close' class=\"myModal__close icon-circle-regular icon-times-solid \"> </span><img  class = 'myModal__image' src=".concat(src, "></img>"); },
  },

};

},{"./userfunctions.js":3}],2:[function(require,module,exports){

const UserFunctions = require("./userfunctions.js");
const config = require("./config.js");

//= ========== Event Emitter ===============================

class EventEmitter {
  constructor() {
    this._events = {};
  }

  on(evt, listener) {
    (this._events[evt] || (this._events[evt] = [])).push(listener);
    return this;
  }

  emit(evt, arg) {
    (this._events[evt] || []).slice().forEach(lsn => lsn(arg));
  }
}

//  ========== Class nodeMaker =======================================
//  this class supplies few methods that are later on implemented by classes Modal and Section
class nodeMaker {
  constructor(location, cnfg) { this.location = location; this.config = cnfg; this.el = null; }

  createNode() {
    if (this.config.hasOwnProperty("type")) { this.el = document.createElement(this.config.type); }

    if (this.config.hasOwnProperty("classes")) { this.config.classes.forEach(item => this.el.classList.add(item)); }

    this.setFromObject("attributes");
    this.setFromObject("dataset");
    return this.el;
  }

  setFromObject(prop) {
    if (this.config.hasOwnProperty(prop)) {
      for (const x in this.config[prop]) {
        if ((this.config[prop]).hasOwnProperty(x)) { this.el[prop][x] = this.config[prop][x]; }
      }
    }
  }

  removeNode() {
    while (this.location.hasChildNodes()) {
      this.location.removeChild(this.location.lastChild);
    }
  }

  attachInnerHTML(x) {
    x.innerHTML = this.config.innerHTMLcreator();
  }

  appendNode() {
    this.location.appendChild(this.el);
  }
}
//= ======================================================= class Modal ===========
// creates modal
class Modal extends nodeMaker {
  create() {
    if (this.location.style.display === "none") {
      this.location.style.display = "flex";
    }
    const el = this.createNode();
    el.innerHTML = this.config.innerHTMLcreator();
    this.appendNode(el);
  }

  clear() {
    this.removeNode();
    if (this.location.style.display === "flex") {
      this.location.style.display = "none";
    }
  }
}
//= ======================================================= class Section ===================================
class Section extends nodeMaker {
  constructor(data, location, config) {
    super(location, config);
    this.data = data;
    this.name = config.extraFunction;
  }

  create() {
    if (this.data.length > 0) {
      this.data.forEach((item, index) => {
        this.config.dataset = {
          number: index + 1,
        };

        const el = this.createNode();
        el.innerHTML = this.config.innerHTMLcreator(item, this.name);      
        this.appendNode(el);
        
      });
    }
  }

  clear() { this.removeNode(); return this; }
}


//= ============== Class Books ========================
//= Books represents core books data and implements sorting and filtering thereof
class Books {
  constructor(dane, func) {
    this.func = func;
    this.emptyQuery = {
      filter: null,
      sort: null,
    };
    if (!Array.isArray(dane)) {
      this.basicBooks = dane.basicBooks;
      this.processedBooks = dane.processedBooks;
      this.query = dane.query;
    } else {
      this.basicBooks = dane;
      this.processedBooks = dane;
      this.query = this.emptyQuery;
    }
  }

  clearQuery() {
    this.query = this.emptyQuery;
  }

  updateQuery(newConditions) {
    this.query = newConditions;
  }

  filtrate() {
    const filter = Number(this.query.filter);
    if (filter === null) {
      this.processedBooks = this.basicBooks;
    } else {
      const check = function check(book) {
        return book.pages > filter;
      };

      this.processedBooks = this.basicBooks.filter(check);
    }
    return this;
  }

  sort() {
    if (this.query.sort === null || this.processedBooks.length === 0) {} else {
      const comparator = {
        pages: function pages(a, b) {
          return a.pages - b.pages;
        },
        releaseDate: function releaseDate(a, b) {
          const split = function split(x) {
            return x.releaseDate.split("/");
          };

          const reverseOrder = function reverseOrder(z) {
            const x = z[1].concat(z[0]);

            return x;
          };

          return Number(reverseOrder(split(a))) - Number(reverseOrder(split(b)));
        },

        author: (a, b) => this.func.getSurname(a.author.toLowerCase()) > this.func.getSurname(b.author.toLowerCase()),
      };

      this.processedBooks.sort(comparator[this.query.sort]);
    }
  }

  processContent() {
    this.filtrate().sort();
  }

  get data() {
    const data = {};
    data.basicBooks = this.basicBooks.slice();
    data.processedBooks = this.processedBooks.slice();
    data.query = Object.assign({}, this.query);
    return data;
  }

  get processedItems() {
    return this.processedBooks.slice();
  }
}

//= ================================class Model======================================================
//= Model in MVC sense, accepts argument being instance of above Books and encapsultes it with extra methods
class Model extends EventEmitter {
  constructor(data, location) {
    super();
    this.location = location;
    this.storageAvailable = Modernizr.sessionstorage;
    this.create(data);
  }

  saveToStorage() {
    if (this.storageAvailable) {
      sessionStorage.setItem(this.location, JSON.stringify(this.Books.data));
      this.saveToStorage = () => {
        sessionStorage.setItem(this.location, JSON.stringify(this.Books.data));
      };
    }
  }

  update(newFilters) {
    if (arguments.length === 0) {
      this.Books.clearQuery();
      this.saveToStorage();
      this.emit("reset_filters");
    } else if (JSON.stringify(newFilters) === JSON.stringify(this.Books.query)) {} else {
      this.Books.updateQuery(newFilters);
      this.Books.processContent();
      this.saveToStorage();
      if (!this.Books.processedItems.length > 0) { this.emit("no_books_found"); }
      this.emit("updated", this.Books.data);
    }
  }

  getData() {
    return this.Books.data;
  }

  getProcessedItems() {
    return this.Books.processedItems;
  }

  create(data) {
    this.Books = new Books(data, UserFunctions.name);
    this.Books.processContent();
    this.saveToStorage();
  }
}
//= ==============================================class View===================================================================
// View in MVC sense

class View extends EventEmitter {
  constructor(nodes, model) {
    super();
    this.nodes = nodes;
    this.data = model.getProcessedItems();
    this.BooksSection = new Section(model.getProcessedItems(), this.nodes.booksContainer, config.booksSection);
    this.showBooks().mountHandlers(this.nodes);
    this.query = model.getData().query;
    this.setFilters();
  }

  setFilters() {
    this.nodes.pageQueryInput.value = this.query.filter;
    const sort_node = document.getElementById(this.query.sort);
    if (sort_node) { sort_node.setAttribute("checked", true); }
  }

  resetFilters() {
    this.nodes.resetFilters();
  }

  getFilters() {
    const Queries = {};

    Queries.filter = this.nodes.pageQueryInput.value ? this.nodes.pageQueryInput.value : null;

    const filteredRadio = this.nodes.radio.filter(element => (!!element.checked));
    Queries.sort = filteredRadio.length > 0 ? filteredRadio[0].value : null;
    return Queries;
  }

  mountHandlers(nodes) {
    nodes.resetButton.addEventListener("click", () => this.emit("reset_filters"));

    nodes.form.addEventListener("change", () => {
      this.emit("changed_radios", this.getFilters());
    });

    window.addEventListener("keyup", (e) => { e.preventDefault(); this.emit("any_key_pressed", e); }, false);


    nodes.textInput.addEventListener("keydown", (e) => {
      const eventCode = e.keyCode;

      if ((e.keyCode < 48 || e.keyCode > 57 && e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 13 && e.keyCode !== 8) {
        if (e.preventDefault) e.preventDefault();
        return false;
      }

      if (eventCode === 13) {
        e.preventDefault();
        this.emit("enter_pressed", this.getFilters());
      }
    });
    this.mountModalTriggers();
  }

  showBooks() {
    this.BooksSection.clear().create();
    this.emit("booksLoaded");
    return this;
  }

  showBookModal(x) {
    const configCopy = Object.assign({}, config.modal);
    configCopy.target = x;
    this.Modal = new Modal(this.nodes.myModal, configCopy);
    this.Modal.create();
    const close = document.getElementById("close"); // close jest u za mało specyficzne na wszelki wypadek coś bardziej specyficznego jako id
    close.addEventListener("click", e => this.emit("modal_close_clicked", this.Modal));
  }

  update(data) {
    this.BooksSection.clear();
    this.BooksSection = new Section(data.processedBooks, this.nodes.booksContainer, config.booksSection);
    this.BooksSection.create();
    this.nodes.pageQueryInput.value = data.query.filter;
    this.mountModalTriggers();
  }

  mountModalTriggers() {
    const Images = Array.from(document.getElementsByClassName("book__cover"));
    Images.forEach((element) => {
      element.addEventListener("click", e => this.emit("image_clicked", e.currentTarget));
    });
  }

  showNoBooksModal() {
    this.noBooksModal = new Modal(this.nodes.noBooksScreen, config.noBooksModal);
    this.noBooksModal.create();
    document.getElementById("closeNoBooksScreen").addEventListener("click", e => this.emit("no_books_modal_close_clicked", this.noBooksModal));
  }
}

//= ================================ class Controller ====================================================================
//= Controller in MVC sense

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.combineHandlers();
  }

  combineHandlers() {
    view.on("changed_radios", x => model.update(x));
    model.on("loaded", x => view.update(x));
    model.on("updated", x => view.update(x));
    view.on("any_key_pressed", x => this.AltR(x));
    model.on("reset_filters", x => view.resetFilters(x));
    view.on("reset_filters", x => view.resetFilters(x));
    view.on("enter_pressed", x => model.update(x));
    view.on("image_clicked", x => view.showBookModal(x));
    view.on("modal_close_clicked", x => x.clear());
    model.on("no_books_found", x => view.showNoBooksModal(x));
    view.on("no_books_modal_close_clicked", x => x.clear());
  }

  AltR(ev) {
    ev.stopPropagation();
    ev.preventDefault();

    if (!ev) ev = window.event;
    if (ev.isComposing || ev.keyCode === 229) {
      return;
    }

    if (ev.which === 82) {
      view.resetFilters();
    }
  }
}

//= =========== START===============


window.onload = function () { initializer("localBooks", "https://api.jsonbin.io/b/5eaffc1a8284f36af7b53291/5"); };

let model;
let view;
let controller;

function initializer(storageLocation, remoteLocation) {
  const pageNodes = {
    booksContainer: document.getElementById("booksContainer"),
    pageQueryInput: document.getElementById("pageQueryInput"),
    radio: Array.from(document.getElementById("radioInputs").getElementsByTagName("input")),
    noBooksScreen: document.getElementById("noBooksModal"),
    noBooksScreenContent: document.getElementById("noBooksModal-content"),
    myModal: document.getElementById("myModal"),
    form: document.getElementById("radioInputs"), //
    textInput: document.getElementById("textInput"),
    resetButton: document.getElementById("resetButton"), //
    resetFilters() {
      this.pageQueryInput.value = null;
      this.radio.forEach((element) => {
        element.checked = false;
      });
    },
  };

  const storage = JSON.parse(sessionStorage.getItem(storageLocation));
  if (!Modernizr.sessionstorage || !storage) {
    remoteLoad(remoteLocation, storageLocation, pageNodes);
  } else if (Modernizr.sessionstorage && storage) {
    model = new Model(storage, storageLocation);
    view = new View(pageNodes, model);
    controller = new Controller(model, view);
    
  }
}

async function remoteLoad(remote, storage, nodes) {
  try {
    const x = await fetch(remote);
    const resp = await x.json();
    
    model = new Model(resp, storage);
    view = new View(nodes, model);
    controller = new Controller(model, view);
    return resp;
  } catch (e) { console.log(e); }// to musi przełaczać na modal w razie bledu coś w rodzaju showbookModal
}

},{"./config.js":1,"./userfunctions.js":3}],3:[function(require,module,exports){
// various functions used elesewhere in application

module.exports = {
  name: {
    getSurname: function getSurname(str) {
      const lastspace = function lastspace(x) {
        return x.lastIndexOf(" ");
      };

      return lastspace(str) === -1 ? str : str.slice(lastspace(str) + 1);
    },
    getFirstname: function getFirstname(str) {
      const lastspace = function lastspace(y) {
        return y.lastIndexOf(" ");
      };

      return lastspace(str) === -1 ? str : str.slice(0, lastspace(str));
    },
    processedFirstName: function processedFirstName(str) {
      return `By ${this.getFirstname(str)}`;
    },
  },
};

},{}]},{},[2]);
