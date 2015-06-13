// Type definitions for Alt 0.16.7
// Project: https://github.com/goatslacker/alt
// Definitions by: Michael Shearer <https://github.com/Shearerbeard>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

/// <reference path="../typings/tsd.d.ts"/>

/**
* TODO: More interfaces may need to be in a public namespace
*
*/
declare module AltJS {
  export interface StoreModel<S> {
    bindActions( ...actions:Array<Object>);
    getState():S;
  }

  export interface AltStore<S> {
    getState():S;
    listen(handler:(state:S) => any):() => void;
    unlisten(handler:(state:S) => any):void;
    emitChange():void;
    getEventEmitter():EventEmitter3.EventEmitter;
  }
}

declare module "alt" {

  import {Dispatcher} from "flux";

  type StateTransform = (store:StoreModel<any>) => AltJS.AltStore<any>;

  interface AltConfig {
    dispatcher?:Dispatcher<any>;
    serialize?:(data:Object) => string;
    deserialize?:(serialized:string) => Object;
    storeTransforms?:Array<StateTransform>;
    batchingFunction?:(callback:( ...data:Array<any>) => any) => void;
  }

  class Alt {
    constructor(config?:AltConfig);
    actions:Actions;
    bootstrap(data:string);
    takeSnapshot( ...storeNames:Array<string>):string;
    flush():Object;
    recycle( ...store:Array<AltJS.AltStore<any>>);
    rollback();
    dispatch(action:Action<any>, data:Object, details:any);
    addActions(actionsName:string, actions:ActionsClass);
    addStore(name:string, store:StoreModel<any>, saveStore?:boolean);
    getStore(name:string):AltJS.AltStore<any>;
    getActions(actionsName:string):Actions;
    createAction<T>(name:string, implementation:ActionsClass):Action<T>;
    createAction<T>(name:string, implementation:ActionsClass, ...args:Array<any>):Action<T>;
    createActions<T>(ActionsClass: ActionsClassConstructor, exportObj?: Object):T;
    createActions<T>(ActionsClass: ActionsClassConstructor, exportObj?: Object, ...constructorArgs:Array<any>):T;
    generateActions<T>( ...action:Array<string>):T;
    createStore<S>(store:StoreModel<S>):AltJS.AltStore<S>;
  }

  type Actions = {[action:string]:Action<any>};

  interface Action<T> {
    (T);
    defer(data:any):void;
  }

  class ActionsClass {
    generateActions( ...action:Array<string>);
    dispatch(action:Action<any>, data:Object, details:any);
    actions:Actions;
  }

  type ActionsClassConstructor = new (alt:Alt) => ActionsClass;

  enum lifeCycleEvents {
    bootstrap,
    snapshot,
    init,
    rollback,
    error
  }

  type ActionHandler = ( ...data:Array<any>) => any;
  type ExportConfig = {[key:string]:( ...args:Array<any>) => any};

  interface StoreModel<S> {
    setState?(currentState:Object, nextState:Object):Object;
    getState?(currentState:Object):any;
    onSerialize?(data:any):void;
    onDeserialize?(data:any):void;
    on?(event:lifeCycleEvents, callback:() => any):void;
    bindActions?(action:Action<any>, method:ActionHandler):void;
    bindListeners?(config:{string: Action<any> | Actions});
    waitFor?(dispatcherSource:any):void;
    exportPublicMethods?(exportConfig:ExportConfig):void;
    getInstance?():AltJS.AltStore<S>;
    emitChange?():void;
    dispatcher?:Dispatcher<any>;
    alt?:Alt;
    displayName?:string;
    otherwise?(data:any, action:Action<any>);
    reduce?(state:any, {action:any, data:any}):Object;
    preventDefault?();
    observe?(alt:Alt):any;
    registerAsync?(datasource:DataSource);
    beforeEach?(payload:Object, state:Object);
    afterEach?(payload:Object, state:Object);
    unlisten?();
  }

  type StoreModelConstructor = (alt:Alt) => StoreModel<any>;

  interface DataSourceMethod {
    local(state:Object, ...args:Array<any>);
    remote(state:Object, ...args:Array<any>);
    shouldFetch(state:Object, ...args:Array<any>);
    loading:Action<any>;
    success:Action<any>;
    error:Action<any>;
    interceptResponse?(response:Object, action:Action<any>, ...args:Array<any>);
  }

  type DataSource = {[key:string]:DataSourceMethod};

  interface AltFactory {
    new(config?:AltConfig):Alt;
  }

  export = Alt;
}
