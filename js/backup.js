
    // Uses Isomer to draw the solutions.
    
    var Point  = Isomer.Point,
        Path   = Isomer.Path,
        Shape  = Isomer.Shape,
        Vector = Isomer.Vector,
        Color  = Isomer.Color;
    
    var iso = new Isomer(document.getElementById("animation"));
    
    var red = new Color(160, 60, 50),
        blue = new Color(50, 60, 160);
    
    iso.add(Shape.Prism(Point.ORIGIN, 0.1, 0.1, 0.1));
    
    var Snake = function (N) {
        var genome = "";
        
        function randomLetter() {
            var alphabet = "01234";
            return alphabet[Math.floor(Math.random() * alphabet.size())]; 
        }
        
        function init() {
            while (genome.size() < N * N * N) {
                genome += randomLetter();
            }
            alert(genome);
        }
        
        init();
        
        return {
        };
    };
    
    