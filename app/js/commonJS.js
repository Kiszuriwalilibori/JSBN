
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
}


