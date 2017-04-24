var args = require("system").args,
username = args[1],
password = args[2],
page = require('webpage').create(),
index = 0,
steps = [
  function() {
    console.log("Opening http://work.tele2.se/Foretag");
    page.open("http://work.tele2.se/Foretag");
  },
  function() {
    console.log("Logging in");
    page.evaluate(function(username, password) {
      var form = document.forms["loginForm"];
      form.elements["username"].value = username;
      form.elements["password"].value = password;
      form.submit();
    }, username, password);
  },
  function() {
    console.log("Opening https://work.tele2.se/MittKonto");
    page.open("https://work.tele2.se/MittKonto");
  },
  function() {
    console.log("Polling for data");
    var start = new Date().getTime();
    setInterval(function() {
      if (new Date().getTime() - start > 30000) {
        console.log("Timeout!");
        phantom.exit();
      }
      var result = page.evaluate(function() {
        var elements = document.querySelectorAll('.chart-description--maininfo.chart-description--maininfo--extradata');
        if (elements && elements.length) {
          return elements[0].innerHTML;
        }
        return null;
      });
      if (result && result != "0,0 av 0,0 GB") {
        console.log(result);
        phantom.exit();
      }
    }, 50);
  }
];

page.onLoadFinished = function(status) {
  if (index < steps.length) {
    steps[++index]();
  }
};

if (args.length != 3) {
  console.log("Usage: phantomjs " + args[0] + " <username> <password>");
  phantom.exit();
}

steps[0]();
