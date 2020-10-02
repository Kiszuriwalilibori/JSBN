module.exports = {
  showError: function showError(err) {
    document.getElementById("error_description").textContent = err.message;
    document.getElementById("error_location").innerHTML = err.stack;
    const errorModal = document.getElementById("errorModal");
    document.getElementById("closeErrorScreen").addEventListener("click", e => closeError(errorModal));
    errorModal.style.display = "flex";
    function closeError(target) {

      if (target) target.style.display = "none";
    }
  },
};
