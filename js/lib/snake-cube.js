/**
 * 
 */
(function (Evolv, Isomer) {
    var alphabet = [
            'l', // left
            'r', // right
            'u', // up
            'd', // down
            'a'  // ahead
        ],
        N = 3,
        L = N * N * N - 1,
        M = 0.01;
    
    var evolv = new Evolv();
    
    /**
     * Draws the best individual.
     */
    evolv.setBeforeGeneration(function (evolv) {
        var individual = evolv.getBestIndividual();
        
        var canvas = document.getElementById("preview");
        var ctx = canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
        
        var iso = new Isomer(canvas);
        
        var red = new Isomer.Color(160, 60, 50);
        var blue = new Isomer.Color(50, 60, 160);
        
        var ls = [];
        
        for (var uid in individual.x) {
            var coords = uid.split('|');
            ls.push({
                x: +coords[0],
                y: +coords[1],
                z: +coords[2]
            });
        }
        
        console.log(individual.fitness);
        
        //FIXME colors need to be based on the actual snake order
        //FIXME blocks need to be added back-to-front
        var color = blue;
        for (var i = 0; i < ls.length; ++i) {
            var l = ls[i];
            color = color === blue ? red : blue;
            iso.add(Isomer.Shape.Prism(Isomer.Point(l.x, l.y, l.z), 0.9, 0.9, 0.9), color);
        }
    });
    
    /**
     * Creates a random individual.
     */
    evolv.setCreateIndividual(function () {
        var solution = [], i;
        while (solution.length < L) {
            i = Math.floor(Math.random() * alphabet.length);
            solution.push(alphabet[i]);
        }
        return {
            solution: solution
        };
    });
    
    /**
     * Mutates an individual.
     */
    evolv.setMutationFunction(function (individual) {
        var i, j;
        for (i = 0; i < individual.solution.length; ++i) {
            if (Math.random() < M) {
                j = Math.floor(Math.random() * alphabet.length);
                individual.solution[i] = alphabet[j];
            }
        }
    });
    
    /**
     * Calculates an individuals fitness.
     */
    evolv.setFitnessFunction(function (individual) {
        var fitness = 0,
            x = {}, // hashmap for taken locations
            l = {x: 0, y: 0, z: 0}, // location
            d = {x: 1, y: 0, z: 0}, // direction
            o = {x: 0, y: 1, z: 0}, // orientation
            t; // temporary variable
            
        for (var i = 0; i < individual.solution.length; ++i) {
            switch (individual.solution[i]) {
            case 'a': // straight ahead
                break;
            case 'l': // turn left, update direction
                d = {
                    x:   o.y * d.z  + -(o.z * d.y),
                    y: -(o.x * d.z) +   o.z * d.x,
                    z:   o.x * d.y  + -(o.y * d.x)
                };
                break;
            case 'r': // turn right, update direction
                d = {
                    x: -(o.y * d.z) +   o.z * d.y,
                    y:   o.x * d.z  + -(o.z * d.x),
                    z: -(o.x * d.y) +   o.y * d.x
                };
                break;
            case 'u': // turn up, update direction and orientation
                t = { // copy of d
                    x: d.x,
                    y: d.y,
                    z: d.z
                };
                d = {
                    x: o.x,
                    y: o.y,
                    z: o.z
                };
                o = {
                    x: -t.x,
                    y: -t.y,
                    z: -t.z
                };
                break;
            case 'd': // turn down, update direction and orientation
                t = { // copy of d
                    x: d.x,
                    y: d.y,
                    z: d.z
                };
                d = {
                    x: -o.x,
                    y: -o.y,
                    z: -o.z
                };
                o = {
                    x: t.x,
                    y: t.y,
                    z: t.z
                };
                break;
            default:
                throw 'unexpected move';
            }
            
            // step in direction, update location
            l.x += d.x;
            l.y += d.y;
            l.z += d.z;
            
            // penalty of 2 for taken position
            var uid = l.x + '|' + l.y + '|' + l.z;
            if (x[uid]) {
                ++fitness;
            } else {
                x[uid] = 0;
            }
            x[uid]++;
            
            // penalty of 1 for being outside of the cube
            if (l.x < 0 || l.x >= N ||
                l.y < 0 || l.y >= N ||
                l.z < 0 || l.z >= N) {
                ++fitness;
            }
        }
        individual.fitness = fitness;
        individual.x = x; //FIXME ugly quick fix for drawing
    });
    
    evolv.start();
    
}) (window.Evolv, window.Isomer);
