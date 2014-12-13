(function () {
    
    var alphabet = [
            'l', // left
            'r', // right
            'u', // up
            'd', // down
            'a'  // ahead
        ],
        N = 4,
        L = N * N * N - 1,
        P = 20,  // number of parents
        O = 200, // number of offspring
        M = 0.01, // mutation chance
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
    function calculateFitness(candidateSolution) {
        var fitness = 0,
            x = {}, // hashmap for taken locations
            l = {x: 0, y: 0, z: 0}, // location
            d = {x: 1, y: 0, z: 0}, // direction
            o = {x: 0, y: 1, z: 0}, // orientation
            t; // temporary variable
            
        _.each(candidateSolution, function (move) {
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
            if (x[l.x + '-' + l.y + '-' + l.z]) {
                fitness += 2;
            } else {
                x[l.x + '-' + l.y + '-' + l.z] = true;
            }
            
            // penalty of 1 for being outside of the cube
            if (l.x < 0 || l.x >= N ||
                l.y < 0 || l.y >= N ||
                l.z < 0 || l.z >= N) {
                ++fitness;
            }
        });
        return fitness;
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
        parent.fitness = calculateFitness(parent.solution); 
    });
    
    // iterative evolution
    var evolution = setInterval(function () {
        var children = [];
        
        // best result until now
        //FIXME draw 3d with canvas or something
        console.log(parents[0]);
        
        //FIXME experiment random mutation chance
        //M = Math.random();
    
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
            child.fitness = calculateFitness(child.solution);
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
    
}) ();
