// @ts-ignore
const { src, dest, watch, series, parallel } = require("gulp");
var uglify = require("gulp-uglify-es").default;
var htmlMin = require("gulp-htmlmin");
var multiDest = require("gulp-multi-dest");
var cssnano = require("gulp-clean-css");

var destOptions = {
  mode: 0755,
};

const sources = {
  style: "app/styles/style.css",
  js: "app/js/bundle.js",
  html: "app/index.html",
};

const destination = {
  style: "docs/styles",
  js: "docs/js",
  html: "docs",
};

function htmlTask() {
  return src(sources.html)
    .pipe(htmlMin({ collapseWhitespace: true }))
    .pipe(dest(destination.html));
}

function jsTask() {
  return src(sources.js)
    .pipe(uglify())
    .pipe(dest(destination.js));
}
function styleTask() {
  return src(sources.style).pipe(cssnano()).pipe(dest(destination.style));
}

function watchTask() {
  watch([sources.style, sources.js, sources.html], parallel(styleTask, jsTask, htmlTask));
}

exports.default = series(parallel(styleTask, jsTask), watchTask);
