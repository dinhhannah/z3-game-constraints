import { init } from 'z3-solver';

(async () => {
    const { Context } = await init();
    const { Solver, Int, And, Or, Distinct } = new Context("main");

    const solver = new Solver();

    // Define children and pet values
    const Children = {
        Bob: Int.const("Bob"),
        Mary: Int.const("Mary"),
        Cathy: Int.const("Cathy"),
        Sue: Int.const("Sue")
    };

    const Pets = {
        Cat: 1,
        Dog: 2,
        Bird: 3,
        Fish: 4
    };

    // Each child gets exactly 1 pet
    solver.add(Or(Children.Bob.eq(Pets.Cat), Children.Bob.eq(Pets.Dog), Children.Bob.eq(Pets.Bird), Children.Bob.eq(Pets.Fish)));
    solver.add(Or(Children.Mary.eq(Pets.Cat), Children.Mary.eq(Pets.Dog), Children.Mary.eq(Pets.Bird), Children.Mary.eq(Pets.Fish)));
    solver.add(Or(Children.Cathy.eq(Pets.Cat), Children.Cathy.eq(Pets.Dog), Children.Cathy.eq(Pets.Bird), Children.Cathy.eq(Pets.Fish)));
    solver.add(Or(Children.Sue.eq(Pets.Cat), Children.Sue.eq(Pets.Dog), Children.Sue.eq(Pets.Bird), Children.Sue.eq(Pets.Fish)));

    // Each child has a different pet
    solver.add(Distinct(Children.Bob, Children.Mary, Children.Cathy, Children.Sue));

    // Constraints
    solver.add(Children.Bob.eq(Pets.Dog)); // Bob has a dog
    solver.add(Children.Sue.eq(Pets.Bird)); // Sue has a bird
    solver.add(Children.Mary.neq(Pets.Fish)); // Mary does not have a fish

    // Solve
    if (await solver.check() === "sat") {
        let model = solver.model();
        console.log("SAT");
        console.log(`Bob has pet: ${model.eval(Children.Bob).toString()}`);
        console.log(`Mary has pet: ${model.eval(Children.Mary).toString()}`);
        console.log(`Cathy has pet: ${model.eval(Children.Cathy).toString()}`);
        console.log(`Sue has pet: ${model.eval(Children.Sue).toString()}`);
    } else {
        console.log("UNSAT");
    }
})();
