self.addEventListener("message", e => {
  let url = e.data;
  fetch(url).then(
    function (promise) {
      promise.json().then(function (response) {
        self.postMessage(response);
      });
    },
    function (error) {
        self.postMessage(error.message);
    }
  );
});
