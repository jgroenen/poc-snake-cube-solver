(function () {
    
    var alphabet = [
            'l', // left
            'r', // right
            'u', // up
            'd', // down
            'a'  // ahead
        ],
        N = 3,
        L = N * N * N - 1,
        P = 5, // number of parents
        O = 10, // number of offspring
        M = 0.1, // mutation chance
        G = 200; // interval time per generation
    
    /**
     * Creates a random candidate solution.
     */
    function createRandomCandidateSolution() {
        var candidateSolution = [], i;
        while (candidateSolution.length < L) {
            i = Math.floor(Math.random() * alphabet.length);
            candidateSolution.push(alphabet[i]);
        }
        return candidateSolution;
    }
    
    /**
     * Mutates the given candidate solution.
     */
    function mutate(candidateSolution) {
        var i, j;
        for (i = 0; i < L; ++i) {
            if (Math.random() < M) {
                j = Math.floor(Math.random() * alphabet.length);
                candidateSolution[i] = alphabet[j];
            }
        }
        return candidateSolution;
    }
    
    /**
     * Calculates the fitness of a candidate solution.
     */
    function calculateFitness(individual) {
        var fitness = 0,
            x = {}, // hashmap for taken locations
            l = {x: 0, y: 0, z: 0}, // location
            d = {x: 1, y: 0, z: 0}, // direction
            o = {x: 0, y: 1, z: 0}, // orientation
            t; // temporary variable
            
        _.each(individual.solution, function (move) {
            switch (move) {
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
                fitness += 5;
            }
        });
        individual.fitness = fitness;
        individual.x = x; //FIXME ugly quick fix for drawing
    }
    
    // initialise parents with random candidate solutions
    var parents = [];
    for (var p = 0; p < P; ++p) {
        parents.push({
            solution: createRandomCandidateSolution(),
            fitness: 0
        });
    }
    
    // calculate fitness for parents
    //FIXME this is not used right now
    _.each(parents, function (parent) {
        calculateFitness(parent); 
    });
    
    // iterative evolution
    var evolution = setInterval(function () {
        var children = [];
        
        // best result until now
        //FIXME draw 3d with canvas or something
        //console.log(parents[0]);
        draw(parents[0]);
        
        //FIXME experiment random mutation chance
        M = Math.random();
    
        // produce offspring
        _.each(parents, function (parent) {
            //FIXME use parents fitness?
            for (var o = 0; o < Math.floor(O / P); ++o) {
                children.push({
                    solution: parent.solution,
                    fitness: 0
                });
            }
        });
        
        // mut(ul)ate offspring
        _.each(children, function (child) {
            //FIXME fixed, variable or enherited mutation rate?
            //FIXME fixed, variable or enherited crossover points?
            child.solution = mutate(child.solution);
            calculateFitness(child);
        });
        
        // add the best parent to keep the best solution in the pool
        // for a "+"-strategy, instead of ","-strategy
        //FIXME make this a parameter
        children.push(parents[0]);
        
        // select P best children into next generation of parents
        children.sort(function (a, b) {
            return a.fitness - b.fitness;
        });
        
        parents = children.slice(0, P);
        
        if (parents[0].fitness === 0) { //FIXME do we want a perfect solution?
            clearInterval(evolution); // stop evolution
            console.log(parents[0]); 
        }
    }, G);
    
    /**
     * Draws an individual using the Isomer library.
     */
    function draw(individual) {
        var Point  = Isomer.Point;
        var Path   = Isomer.Path;
        var Shape  = Isomer.Shape;
        var Vector = Isomer.Vector;
        var Color  = Isomer.Color;
        
        var canvas = document.getElementById("preview");
        var ctx = canvas.getContext("2d");
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
        
        var iso = new Isomer(canvas);
        
        var red = new Color(160, 60, 50);
        var blue = new Color(50, 60, 160);
        
        var ls = [];
        
        _.each(individual.x, function (count, uid) {
            var coords = uid.split('|');
            ls.push({
                x: +coords[0],
                y: +coords[1],
                z: +coords[2]
            });
        });
        
        console.log(individual.fitness);
        
        //FIXME colors need to be based on the actual snake order
        //FIXME blocks need to be added back-to-front
        var color = blue;
        _.each(ls, function (l) {
            color = color === blue ? red : blue;
            iso.add(Shape.Prism(Point(l.x, l.y, l.z), 0.9, 0.9, 0.9), color);
        });
    }
    
}) ();
