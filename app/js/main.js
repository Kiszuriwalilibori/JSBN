const commonJS = require("./commonJS.js");
var { showError } = require("./showError");

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
class BooksSection {
  constructor(data, location) {
    this.data = data;
    this.location = location;
  }

  create(){
    this.location.style.display ='none';
    const bookTemplate = document.getElementById("book_template").content.querySelector("li");
    const breakTemplate = document.getElementById("separator_template").content.querySelector("li");

    if (this.data.length > 0) {
      this.data.forEach((item, index) => {
        index +=1;
        const book = document.importNode(bookTemplate, true);
        book.dataset.number = (index).toString();
        book.querySelector("a").dataset.href = item.cover.large ||'';
        book.querySelector("img").onload = function(){book.classList.add('activated')};
        book.querySelector("img").src = item.cover.small ||'';
        book.querySelector("img").alt = 'cover of book' + item.title ||'';
        book.querySelector('.book__title').textContent = item.title ||'';
        book.querySelector('.author__firstname').textContent ="By" +" " + commonJS.name.getFirstname(item.author)  ||'';
        book.querySelector('.author__surename').textContent = commonJS.name.getSurname(item.author)  ||'';
        book.querySelector('.bookInfo__release-date').textContent =" " + item.releaseDate  ||'';
        book.querySelector('.bookInfo__pages').textContent =" "+ item.pages  ||'';
        book.querySelector('.bookInfo__shop').href = item.link  ||'';
        this.location.appendChild(book);
        index%3 ===0 &&this.location.appendChild(document.importNode(breakTemplate, true));
      })
  }
    this.location.style.display ='flex';
  }
  clear(){
    this.location.style.display ='none';
    while (this.location.lastChild) {
      this.location.removeChild(this.location.lastChild);
    }
    this.location.style.display ='flex';
    return this;
  }
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
    if (this.query.sort === null || this.processedBooks.length === 0) {
    } else {
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
    } else if (JSON.stringify(newFilters) === JSON.stringify(this.Books.query)) {
    } else {
      this.Books.updateQuery(newFilters);
      this.Books.processContent();
      this.saveToStorage();
      if (!this.Books.processedItems.length > 0) {
        this.emit("no_books_found");
      }
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
    this.Books = new Books(data, commonJS.name);
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
    this.BooksSection = new BooksSection(model.getProcessedItems(), this.nodes.booksContainer);
    this.showBooks().mountHandlers(this.nodes);
    this.query = model.getData().query;
    this.setFilters();
  }

  setFilters() {
    this.nodes.pageQueryInput.value = this.query.filter;
    const sort_node = document.getElementById(this.query.sort);
    if (sort_node) {
      sort_node.setAttribute("checked", true);
    }
  }

  resetFilters() {
    this.nodes.resetFilters();
  }

  getFilters() {
    const Queries = {};

    Queries.filter = this.nodes.pageQueryInput.value ? this.nodes.pageQueryInput.value : null;

    const filteredRadio = this.nodes.radio.filter(element => !!element.checked);
    Queries.sort = filteredRadio.length > 0 ? filteredRadio[0].value : null;
    return Queries;
  }

  mountHandlers(nodes) {
    nodes.resetButton.addEventListener("click", () => this.emit("reset_filters"));

    nodes.form.addEventListener("change", () => {
      this.emit("changed_radios", this.getFilters());
    });

    window.addEventListener(
      "keyup",
      e => {
        e.preventDefault();
        this.emit("any_key_pressed", e);
      },
      false
    );

    nodes.textInput.addEventListener("keydown", e => {
      const eventCode = e.keyCode;

      if ((e.keyCode < 48 || (e.keyCode > 57 && e.keyCode < 96) || e.keyCode > 105) && e.keyCode !== 13 && e.keyCode !== 8) {
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
    const modal = document.getElementById("myModal");
    document.getElementById("book_modal_image").src = x.dataset.href;
    modal.style.display = "flex";
    modal.style.visibility = 'visible';
    console.log(modal);

    document.getElementById("close").addEventListener("click", e => this.emit("book_modal_close_clicked", modal));
  }

  hideModal(x) {
    x.style.display = "none";
  }

  update(data) {
    this.BooksSection.clear();

    this.BooksSection = new BooksSection(data.processedBooks, this.nodes.booksContainer);
    this.BooksSection.create();
    this.nodes.pageQueryInput.value = data.query.filter;
    this.mountModalTriggers();
  }

  mountModalTriggers() {
    const Images = Array.from(document.getElementsByClassName("book__cover"));
    Images.forEach(element => {
      element.addEventListener("click", e => this.emit("image_clicked", e.currentTarget));
    });
  }

  showNoBooksModal() {
    document.getElementById("error_description").textContent = "Nie znaleziono książek spełniających kryteria wyszukiwania";
    const errorModal = document.getElementById("errorModal");
    document.getElementById("closeErrorScreen").addEventListener("click", e => this.emit("error_modal_close_clicked", errorModal));
    errorModal.style.display = "flex";
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
    view.on("error_modal_close_clicked", x => view.hideModal(x));
    view.on("book_modal_close_clicked", x => view.hideModal(x));
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

window.onload = function () {

  const initiallyInvisibleElements = document.getElementsByClassName('initially-invisible');
  Array.prototype.forEach.call(initiallyInvisibleElements, (element) =>{element.style.visibility ='visible'});
  
  initializer("localBooks", "https://api.jsonbin.io/b/5eaffc1a8284f36af7b53291/5");
};

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
    form: document.getElementById("radioInputs"),
    textInput: document.getElementById("textInput"),
    resetButton: document.getElementById("resetButton"),
    resetFilters() {
      this.pageQueryInput.value = null;
      this.radio.forEach(element => {
        element.checked = false;
      });
    },
  };

  const storage = JSON.parse(sessionStorage.getItem(storageLocation));

  if (!Modernizr.sessionstorage || !storage) {
    remoteLoad(remoteLocation, storageLocation, pageNodes);
  } else if (Modernizr.sessionstorage && storage) {
    createMVC(storage, storageLocation, pageNodes);
  }
}

async function remoteLoadWithoutWorker(remote, storage, nodes) {
  try {
    const x = await fetch(remote);
    const resp = await x.json();
    createMVC(resp, storage, nodes);
  } catch (e) {
    showError(e)
  }
}
function remoteLoad(remote, storage, nodes) {
  if (window.Worker) {
  var worker = new Worker("./js/fetchworker.js");
  worker.onmessage = e => {
    const result = e.data;
    if (result.message) {
      showError({ message: "Nie udało się pobrać danych ze źródła", stack: "fetchworker.js" });
    } else {
      createMVC(result, storage, nodes);
    }
  };
  worker.postMessage(remote);
  }
  else{
    remoteLoadWithoutWorker(remote, storage, nodes)
  }
}

function createMVC(data, storage, nodes) {
  if (data && storage && nodes) {
    try {
      model = new Model(data, storage);
      view = new View(nodes, model);
      controller = new Controller(model, view);
    } catch (e) {
      showError(e);
    }
  }
}
