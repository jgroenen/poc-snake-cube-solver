/**
 * 
 */
(function () {
    
    /**
     * 
     */
    window.Evolv = function (options) {
        var intervalId,
            parents = [],
            beforeStart,
            afterFinish,
            beforeGeneration,
            afterGeneration,
            createIndividual,
            mutationFunction,
            fitnessFunction,
            evolv;
        
        // overwrite Evolv defaults with passed options
        options = options || {};
        var settings = {
            interval: options.interval ? options.interval : 1000,
            parents: options.parents ? options.parents : 5,
            children: options.children ? options.children : 25
        };
        
        // return the public interface
        return evolv = {
            setBeforeStart: setBeforeStart,
            setAfterFinish: setAfterFinish,
            setBeforeGeneration: setBeforeGeneration,
            setAfterGeneration: setAfterGeneration,
            setCreateIndividual: setCreateIndividual,
            setMutationFunction: setMutationFunction,
            setFitnessFunction: setFitnessFunction,
            getBestIndividual: getBestIndividual,
            start: start,
            stop: stop
        };
        
        /**
         * Sets the function to be executed before start.
         */
        function setBeforeStart(fn) {
            beforeStart = fn;
        }
        
        /**
         * Sets the function to be executes after finish.
         */
        function setAfterFinish(fn) {
            afterFinish = fn;
        }
        
        /**
         * Sets the function to be executed before every generation.
         */
        function setBeforeGeneration(fn) {
            beforeGeneration = fn;
        }
        
        /**
         * Sets the function to be executed after every generation.
         */
        function setAfterGeneration(fn) {
            afterGeneration = fn;
        }
        
        /**
         * Sets the function to create an individual.
         */
        function setCreateIndividual(fn) {
            createIndividual = fn;
        }
        
        /**
         * Sets the function to mutate an individual.
         */
        function setMutationFunction(fn) {
            mutationFunction = fn;
        }
        
        /**
         * Sets the function to calculate the individuals fitness.
         */
        function setFitnessFunction(fn) {
            fitnessFunction = fn;
        }
        
        /**
         * Gets the best individual within the current generation.
         */
        function getBestIndividual() {
            return parents[0];
        }
        
        /**
         * Creates the next generation.
         */
        function createNextGeneration() {
            beforeGeneration && beforeGeneration(evolv);
            
            var children = [];
            
            for (var i = 0; i < settings.children; ++i) {
                // random selection
                //FIXME use parents fitness?
                //FIXME use crossover?
                var individual = {
                    solution: parents[Math.floor(Math.random() * parents.length)].solution
                };
                mutationFunction && mutationFunction(individual);
                fitnessFunction && fitnessFunction(individual);
                children.push(individual);
            }
            
            // comma versus plus strategy (include best parent)
            //FIXME make this a parameter
            children.push(getBestIndividual());
            
            // select best children into next generation of parents
            children.sort(function (a, b) {
                return a.fitness - b.fitness;
            });
            parents = children.slice(0, settings.parents);
            
            afterGeneration && afterGeneration(evolv);
            
            // Stopcondition
            //FIXME needs to be set from the outside
            //FIXME do we want a perfect solution?
            if (parents[0].fitness === 0) {
                evolv.stop();
                evolv.afterFinish && evolv.afterFinish(evolv);
            }
        }
        
        /**
         * Starts the evolutionary process.
         */
        function start() {
            evolv.beforeStart && evolv.beforeStart(evolv);
            
            // initialise the parent population
            parents = [];
            for (var i = 0; i < settings.parents; ++i) {
                var individual = createIndividual();
                fitnessFunction && fitnessFunction(individual);
                parents.push(individual);
            }
            
            intervalId = setInterval(createNextGeneration, settings.interval);
        }
        
        /**
         * Stops the evolutionary process.
         */
        function stop() {
            intervalId && clearInterval(intervalId);
        }
    };
    
}) ();
