(function () {
    
    var Animation = function () {
        var c = document.getElementById("animation");
        var ctx = c.getContext("2d");
        ctx.fillStyle = "#000";
        
        function draw(phenotype) {
            var size = 2;
            ctx.clearRect (0 , 0 , c.width, c.height);
            for (var i = 0; i < phenotype.length; ++i) {
                var row = phenotype[i];
                for (var j = 0; j < row.length; ++j) {
                    if (row[j]) {
                        ctx.fillRect(i * size, j * size, size, size);
                    }
                }
            }
        }
        
        return {
            draw: draw
        };
    }
    
    var animation = new Animation();
    
    /**
     * 
     */
    var settings = {
        mu: 10,
        lambda: 100,
        genome: {
            alphabet: "01",
            length: Math.pow(10, 2)
        }
    };
    
    /**
     * A single individual (or candidate solution, phenotype).
     * In this case, a solution to the Snake Cube problem.
     */
    var Individual = function (genome) {
        
        /**
         * Initialise the individual.
         */
        if (!genome) {
            genome = "";
            while (genome.length < settings.genome.length) {
                genome += settings.genome.alphabet[
                    Math.floor(
                        Math.random() * settings.genome.alphabet.length
                    )
                ];
            }
        }
        
        var phenotype,
            fitness;
        
        function recalculate() {
            var fold = fitness;
            phenotype = [];
            fitness = 0;
            for (var i = 0; i < 2 * settings.genome.length; ++i) {
                phenotype.push([]);
            }
            var x = 0, y = 0;
            var b = {
                x: {
                    min: 0,
                    max: 0
                },
                y: {
                    min: 0,
                    max: 0
                }
            };
            var d = {
                x: 1,
                y: 0
            };
            for (var i = 0; i < genome.length; ++i) {
                if (genome[i] === "1") {
                    d = {
                        x: d.y,
                        y: -d.x
                    };
                }
                x += d.x;
                y += d.y;
                if (x > b.x.max) {
                    b.x.max = x;
                }
                if (x < b.x.min) {
                    b.x.min = x;
                }
                if (y > b.y.max) {
                    b.y.max = y;
                }
                if (y < b.y.min) {
                    b.y.min = y;
                }
                if (phenotype[x + settings.genome.length][y + settings.genome.length]) {
                    fitness += 100;
                } else {
                    phenotype[x + settings.genome.length][y + settings.genome.length] = true;
                }
            }
            //fitness += (b.x.max - b.x.min + 1) * (b.y.max - b.y.min + 1);
        }
        
        function draw() {
            animation.draw(phenotype);
        }
        
        function mutate() {
            String.prototype.replaceAt=function(index, character) {
                return this.substr(0, index) + character + this.substr(index+character.length);
            }
            
            for (var i = 0; i < genome.length; ++i) {
                if (Math.random() < 0.01) {
                    genome = genome.replaceAt(i, (genome[i] == "0" ? "1" : "0"));
                }
            }
            recalculate();
        }
        
        /**
         * 
         */
        function getFitness() {
            return fitness;
        }
        
        return {
            mutate: mutate,
            fitness: getFitness,
            draw: draw
        };
    };
    
    /**
     * A single generation of individuals.
     */
    var Generation = function (individuals) {
        
        /**
         * 
         */
        if (typeof individuals !== typeof []) {
            individuals = [];
        }
        
        /**
         * Introduces an individual into pool.
         */
        function introduce(individual) {
            individuals.push(individual);
        }
        
        /**
         * Recombines the pool.
         */
        function recombine() {
            var children = individuals;
            // Just some random recombination,
            // Or round robin,
            // Or lottery with fitness,
            // Etc.
            for (var i = 0; i < 100; ++i) {
                children.push(individuals[Math.floor(Math.random() * individuals.length)]);
            }
            individuals = children;
        }
        
        /**
         * Mutates all individuals.
         */
        function mutate() {
            _.each(individuals, function (individual) {
                individual.mutate();
            });
        }
        
        /**
         * 
         */
        function select() {
            // Fitness needs to go here
            // And/or in recombine
            // Otherwise no pressure
            // Random pick with better odds for fit individuals
            // Or something else
            individuals.sort(function (a, b) {
                return a.fitness() - b.fitness();
            });
            individuals = individuals.slice(0, 10);
            individuals[0].draw();
        }
        
        return {
            introduce: introduce,
            recombine: recombine,
            mutate: mutate,
            select: select
        };
    };
    
    /**
     * An evolving population.
     */
    var Population = function (options) {
        var generation = new Generation();
            
        /**
         * Initialise the population.
         */
        for (var i = 0; i < settings.mu; ++i) {
            generation.introduce(new Individual());
        }
        
        /**
         * Evolves the population to the next generation.
         */
        function evolve() {
            generation.recombine();
            generation.mutate();
            generation.select();
        }
            
        return {
            evolve: evolve
        };
    };
    
    /**
     * Create a population of candidate solutions.
     */
    var population = new Population();
    
    setInterval(function () {
        population.evolve();
    }, 300);

}) ();