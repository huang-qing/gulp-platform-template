(function index(Raphael) {
    console.log('load platform index.js');

    // Creates canvas 20 × 20
    var paper = Raphael(document.querySelector('#raphael'), 20, 20);

    // Creates circle at x = 10, y = 10, with radius 10
    var circle = paper.circle(10, 10, 10);
    // Sets the fill attribute of the circle to red (#f00)
    circle.attr('fill', '#f00');

    // Sets the stroke attribute of the circle to white
    circle.attr('stroke', '#fff');
}(Raphael));
