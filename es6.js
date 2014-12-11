//function x() { var arguments = undefined;
//  console.log(arguments === undefined, this.a === 1);
//}

//var y = x.bind({ a: 1 })

//x(1,2,3)

//y.call({ a: 2 })

function x(cls) {
  new cls()
}

x(class Foo {
  constructor() {
    console.log('first class classes')
  }
})
