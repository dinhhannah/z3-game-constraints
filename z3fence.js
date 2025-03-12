import { init } from 'z3-solver';

(async () => {
    const { Context } = await init();
    const { Solver, Int, And, Or, Distinct } = new Context("main");

    const solver = new Solver();

    // Define integer variables for x and y
    const x = Int.const("x");
    const y = Int.const("y");

    // Fence boundaries
    const left = 5, right = 10, top = 15, bottom = 25;

    // Constraint: Inside the fence
    solver.add(And(x.gt(left), x.lt(right), y.gt(top), y.lt(bottom)));

    if (await solver.check() === "sat") {
        let model = solver.model();
        console.log("Inside fence:");
        console.log(`x: ${model.eval(x).toString()}, y: ${model.eval(y).toString()}`);
    }

    // Reset solver
    solver.reset();

    // New variables for decoration placement
    const x_dec = Int.const("x_dec");
    const y_dec = Int.const("y_dec");

    // Constraint: On the fence (top or left side)
    solver.add(Or(And(x_dec.eq(left), y_dec.ge(top), y_dec.le(bottom)), And(y_dec.eq(top), x_dec.ge(left), x_dec.le(right))));

    if (await solver.check() === "sat") {
        let model = solver.model();
        console.log("On the fence:");
        console.log(`x: ${model.eval(x_dec).toString()}, y: ${model.eval(y_dec).toString()}`);
    }

    // Reset solver again
    solver.reset();
    
    // New variables for tree placement
    const x_tree = Int.const("x_tree");
    const y_tree = Int.const("y_tree");

    // Constraint: Outside the fence and x >= 8, y >= 20
    solver.add(And(Or(x_tree.lt(left), x_tree.gt(right), y_tree.lt(top), y_tree.gt(bottom)), x_tree.ge(8), y_tree.ge(20)));

    if (await solver.check() === "sat") {
        let model = solver.model();
        console.log("Outside fence:");
        console.log(`x: ${model.eval(x_tree).toString()}, y: ${model.eval(y_tree).toString()}`);
    }
})();
