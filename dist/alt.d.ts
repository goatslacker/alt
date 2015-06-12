// Type definitions for Alt 0.16.7
// Project: https://github.com/goatslacker/alt
// Definitions by: Michael Shearer <https://github.com/Shearerbeard>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="../typings/tsd.d.ts" />

declare module AltJS {
  export interface StoreModel {
    bindActions( ...actions:Array<Object>);
    getState():Object;
  }
}

declare module "alt" {

  import {Dispatcher} from "flux";

  type StateTransform = (store:StoreModel) => AltStore;

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
    takeSnapshot( ...storeNames:Array<string | AltStore>):string;
    flush():Object;
    recycle( ...store:Array<AltStore>);
    rollback();
    dispatch(action:Action, data:Object, details:any);
    addActions(actionsName:string, actions:ActionsClass);
    addStore(name:string, store:StoreModel, saveStore?:boolean);
    getStore(name:string):AltStore;
    getActions(actionsName:string):Actions;
    createAction(name:string, implementation:Action):Action;
    createAction(name:string, implementation:Action, ...args:Array<any>):Action;
    createActions(ActionsClass: ActionsClassConstructor, exportObj?: Object):Actions;
    createActions(ActionsClass: ActionsClassConstructor, exportObj?: Object, ...constructorArgs:Array<any>):Actions;
    generateActions( ...action:Array<string>):Actions;
    createStore(store:StoreModel):AltStore;
  }

  type Actions = {[action:string]:Action};

  interface Action {
    ( ...data:Array<any>): any;
    defer(data:any):void;
  }

  class ActionsClass {
    generateActions( ...action:Array<string>);
    // dispatch(data:Object):void;
    dispatch(action:Action, data:Object, details:any);
    actions:Actions;
  }

  type ActionsClassConstructor = new (alt:Alt) => ActionsClass;

  interface AltStore {
    getState():Object;
    listen(handler:(state:any) => any):() => void;
    unlisten(handler:(state:any) => any):void;
    emitChange():void;
    getEventEmitter():EventEmitter3.EventEmitter;
  }

  enum lifeCycleEvents {
    bootstrap,
    snapshot,
    init,
    rollback,
    error
  }

  type ActionHandler = ( ...data:Array<any>) => any;
  type ExportConfig = {[key:string]:( ...args:Array<any>) => any};

  interface StoreModel {
    setState?(currentState:Object, nextState:Object):Object;
    getState?(currentState:Object):any;
    onSerialize?(data:any):void;
    onDeserialize?(data:any):void;
    on?(event:lifeCycleEvents, callback:() => any):void;
    bindActions?(action:Action, method:ActionHandler):void;
    bindListeners?(config:{string: Action | Actions});
    waitFor?(dispatcherSource:any):void;
    exportPublicMethods?(exportConfig:ExportConfig):void;
    getInstance?():AltStore;
    emitChange?():void;
    dispatcher?:Dispatcher<any>;
    alt?:Alt;
    displayName?:string;
    otherwise?(data:any, action:Action);
    reduce?(state:any, {action:any, data:any}):Object;
    preventDefault?();
    observe?(alt:Alt):any;
    registerAsync?(datasource:DataSource);
    beforeEach?(payload:Object, state:Object);
    afterEach?(payload:Object, state:Object);
    unlisten?();
  }

  type StoreModelConstructor = (alt:Alt) => StoreModel;

  function createStore(StoreModel:StoreModelConstructor, ident?:string, saveStore?:boolean):AltStore;

  interface DataSourceMethod {
    local(state:Object, ...args:Array<any>);
    remote(state:Object, ...args:Array<any>);
    shouldFetch(state:Object, ...args:Array<any>);
    loading:Action;
    success:Action;
    error:Action;
    interceptResponse?(response:Object, action:Action, ...args:Array<any>);
  }

  type DataSource = {[key:string]:DataSourceMethod};

  interface AltFactory {
    new(config?:AltConfig):Alt;
  }

  export = Alt;
}
