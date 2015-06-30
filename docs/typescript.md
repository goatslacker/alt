---
layout: docs
title: TypeScriptSupport
description: Use Alt from Typescript
permalink: /docs/typescript/
---

Defintions are stored in the /typings directory of Alt. To run these you will need to reference the alt.d.ts file from the same directory where you manage your type definitions from [TSD](http://definitelytyped.org/tsd/):
`<reference path="../typings/alt.d.ts" />`

The alt definitions depend on react and es6-promise which should be installed with tsd. Once installed reference the Alt library from the Typescript legacy import statement:
```javascript
import Alt = require("alt");
```
Currently Typescript 1.5 is having some [issues](https://github.com/Microsoft/TypeScript/issues/3218) with exporting a top level default class from a module. You can also import the chromeDebug function or AltContainer in a similar manner:
```javascript
import chromeDebug = "alt/utils/chromeDebug";
import AltContainer = "alt/AltContainer";
```

Using alt from Typescript is nearly the same as vanilla ES6 Javascript other than the need to pass generics through Store and Action Creators and the need to inherit stores and actions from an abstract class because accessing "ghost methods" does not play well with a type system:

example:
```javascript
class SomeCoolActions {
    constructor() {
        this.generateActions(
            "firstAction",
            "secondAction",
            "thirdAction",
            "fourthAction
        );
    }
}

```

The above example would not compile as the method `SomeCoolActions#generateActions` does not yet exist. Generally we would extend
an empty ActionsClass that contains declarations for ghost methods but no implementation:
```javascript

 /**AltJS is a "ghost module" full of non-instantiable interfaces and typedefs to help you write easier code
  * included in our alt.d.ts type definitions
  */

 class AbstractActions implements AltJS.ActionsClass {
     constructor( alt:AltJS.Alt){}
     actions:any;
     dispatch: ( ...payload:Array<any>) => void;
     generateActions:( ...actions:Array<string>) => void;
 }


 //This class will now compile!!
 class SomeCoolActions extends AbstractActions {
     constructor() {
         this.generateActions(
             "firstAction",
             "secondAction",
             "thirdAction",
             "fourthAction
         );
     }
 }
 ```

 Alt from typescript needs a little extra boilerplate to pass actions type definitions down to the generated actions.


```javascript

interface Actions {
  firstAction(name:string):void;
  secondAction(num:number):void;
  thirdAction( ...args:Array<any>):void;
  fourthAction(waves:Array<Wave>):void;
}
class SomeCoolActions extends AbstractActions {
     constructor(config) {
         this.generateActions(
             "firstAction",
             "secondAction",
             "thirdAction",
             "fourthAction
         );
         super(config);
     }
 }

 //passing the interface as a generic enables us to see the methods on the generated class.
 let someCoolActions = alt.createActions<Actions>(SomeCoolActions);

 //This works! Would throw a compile error without the generic
 someCoolActions.firstAction("Mike");
 ```

 Stores are handled in much the same way:
 ```javascript
 // create an interface to model the "state" in this store

 interface State {
    developers:Array<string>;
    isBusy:boolean;
 }

 //abstract class with no implementation - moving to be included in Alt 0.17 release
 class AbstractStoreModel<S> implements AltJS.StoreModel<S> {
   bindActions:( ...actions:Array<Object>) => void;
   bindAction:( ...args:Array<any>) => void;
   bindListeners:(obj:any)=> void;
   exportPublicMethods:(config:{[key:string]:(...args:Array<any>) => any}) => any;
   exportAsync:( source:any) => void;
   waitFor:any;
   exportConfig:any;
   getState:() => S;
 }

 /** class both extends a model using our state interface and implements the interface it's self
  * this way we ensure that state based methods only deal with our declared state model and that
  * we remember to declare our state in the store model its self
  */
 class DeveloperStore extends AbstractStoreModel<State> implements State {
    developers = ["Mike", "Jordan", "Jose"];
    isBusy = false;

    constructor() {
      super();
      /** binding to automatically attach methods to
       * Actions for example the action developerActions#addDeveloper
       * would automatically call and pass its args to the onAddDeveloperMethod
       * when a dispatch is called
       * Alt stores a automatically "emit-change" and inform listening ui components of the update after
       * State is set
       **/
      this.bindActions(developerActions);

      /** different than the above - this takes a single action from an "actions" instance and binds it to whatever method
       * you specify - really useful when a store has an actions class bound but maybe needs one or two actions from another
       * as well
       */
      this.bindAction(repoActions.working, this.setWorking);
    }

    onAddDeveloper(dev:string) {
       ///details
    }

    setWorking() {
        ////do stuff
    }
 }
 ```
