document.getElementById("myinput").oninput = function() {
  var value = (this.value-this.min)/(this.max-this.min)*100
  this.style.background = 'linear-gradient(to right, #D5CEA3 0%, #D5CEA3 ' + value + '%, #3C2A21 ' + value + '%, #3C2A21 100%)'
};