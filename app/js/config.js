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
