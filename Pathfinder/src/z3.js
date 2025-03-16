import { init } from "z3-solver";

const { Context } = await init();
const { Solver, Int, And, Or, Distinct } = new Context("main");
const solver = new Solver();

export async function find(values, fence){
    let x = Int.const("x");
    let y = Int.const("y");
    solver.add(And(x.gt(fence.left), x.lt(fence.right), y.gt(fence.top), y.lt(fence.bottom)));
    
    while ((await solver.check()) === "sat") {
        let model = solver.model();
        let xVal = parseInt(model.eval(x).toString());
        let yVal = parseInt(model.eval(y).toString());
        values.push({ xVal, yVal });
        solver.add(Or(x.neq(xVal), y.neq(yVal)));
    }
    
    solver.reset();
    return values;
}