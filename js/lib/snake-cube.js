/**
 * 
 */
(function (Evolv, Isomer) {
    "use strict";
    
    var alphabet = [
            'l', // left
            'r', // right
            'u', // up
            'd', // down
            'a'  // ahead
        ],
        N = 3,
        L = N * N * N - 1,
        M = 0.01,
        evolv = new Evolv();
    
    /**
     * Draws the best individual.
     */
    evolv.setBeforeGeneration(function (evolv) {
        var individual = evolv.getBestIndividual(),
            canvas = document.getElementById("preview"),
            ctx = canvas.getContext("2d"),
            iso = new Isomer(canvas),
            colors = [
                new Isomer.Color(160, 60, 50),
                new Isomer.Color(50, 60, 160)
            ],
            color = 0,
            l = {x: 0, y: 0, z: 0}, // location
            d = {x: 1, y: 0, z: 0}, // direction
            o = {x: 0, y: 1, z: 0}, // orientation
            t, i;
            
        ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
            
        for (i = 0; i < individual.length; ++i) {
            switch (individual[i]) {
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
            
            // draw the block
            //FIXME blocks need to be added back-to-front
            iso.add(Isomer.Shape.Prism(Isomer.Point(l.x, l.y, l.z), 0.9, 0.9, 0.9), colors[++color % 2]);
        }
    });
    
    /**
     * Creates a random individual.
     */
    evolv.setCreateIndividual(function () {
        var individual = [], i;
        while (individual.length < L) {
            i = Math.floor(Math.random() * alphabet.length);
            individual.push(alphabet[i]);
        }
        return individual;
    });
    
    /**
     * Mutates an individual.
     */
    evolv.setMutationFunction(function (original) {
        var mutation = [], i;
        for (i = 0; i < original.length; ++i) {
            mutation[i] = Math.random() < M ?
                alphabet[Math.floor(Math.random() * alphabet.length)] :
                original[i];
        }
        return mutation;
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
            t, i, uid;
            
        for (i = 0; i < individual.length; ++i) {
            switch (individual[i]) {
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
            uid = l.x + '|' + l.y + '|' + l.z;
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
        return fitness;
    });
    
    evolv.start();
    
}) (window.Evolv, window.Isomer);
