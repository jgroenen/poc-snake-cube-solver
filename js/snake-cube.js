(function () {
    
    var P = 10, // Parents size
        O = 100; // Offspring size
        
    var E = 15, // Cube edge size
        L = E * E - 1, // Genome length
        G = 2 * E * E; // Grid size
    
    var parents = [], children;
    
    var c = document.getElementById("animation"),
        ctx = c.getContext("2d");
        
    ctx.fillStyle = "#000";
        
    function draw(phenotype) {
        var size = 1;
        ctx.clearRect (0 , 0 , c.width, c.height);
        for (var i = 0; i < G; ++i) {
            for (var j = 0; j < G; ++j) {
                if (phenotype[i][j]) {
                    ctx.fillRect(i * size, j * size, size, size);
                }
            }
        }
    }
    
    // Initialize population
    for (var i = 0; i < P; ++i) {
        parents[i] = {
            genome: [],
            mutation: 0.1
        };
        for (var j = 0; j < L; ++j) {
            parents[i].genome[j] = 0;
        }
    }
    
    // Evaluate fitness
    function evaluate(parents) {
        _.each(parents, function (parent) {
            parent.fitness = 0;
            parent.phenotype = new Array(G);
            for (var i = 0; i < G; ++i) {
                parent.phenotype[i] = new Array(G);
            }
            var d = { // direction
                x: 1,
                y: 0
            };
            var l = { // location
                x: L,
                y: L,
                x_min: L,
                x_max: L,
                y_min: L,
                y_max: L
            };
            parent.phenotype[l.x][l.y] = 1;
            for (var i = 0; i < L; ++i) {
                if (parent.genome[i] === 1) {
                    d = { // 90 degrees rotation of direction
                        x: d.y,
                        y: -d.x
                    };
                }
                l.x += d.x;
                l.y += d.y;
                if (l.x > l.x_max) l.x_max = l.x;
                if (l.x < l.x_min) l.x_min = l.x;
                if (l.y > l.y_max) l.y_max = l.y;
                if (l.y < l.y_min) l.y_min = l.y;
                if (parent.phenotype[l.x][l.y] === 1) {
                    parent.fitness += 10; // Penalty for overlapping
                } else {
                    parent.phenotype[l.x][l.y] = 1;
                }
            }
            parent.fitness += (1 + l.x_max - l.x_min) * (1 + l.y_max - l.y_min);
        });
    }
    
    
    setInterval(function () {
        children = [];
        
        // Randomly pick parents to reproduce.
        for (var i = 0; i < O; ++i) {
            var parent = parents[Math.floor(Math.random() * parents.length)],
                child = {
                    genome: parent.genome.slice(0),
                    mutation: parent.mutation
                };
            if (Math.random() < child.mutation) {
                console.log(child.mutation);
                if (Math.random() < 0.2) {
                    child.mutation /= 2;
                } else {
                    child.mutation *= 2;
                }
            }
            for (var j = 0; j < L; ++j) {
                if (Math.random() < child.mutation) {
                    child.genome[j] = +!child.genome[j];
                }
            }
            children.push(child);
        }
        
        // Evaluate children.
        evaluate(children);
        
        // Order children.
        children.sort(function (a, b) {
            return a.fitness - b.fitness;
        });
        
        // Pick the best.
        parents = children.slice(0, P);
        
        // Draw the best of the best.
        draw(parents[0].phenotype);
    }, 100);

}) ();