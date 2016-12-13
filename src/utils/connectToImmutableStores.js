import connectToStores from './connectToStores';
/* eslint-disable */
/**
 * A Decorator for immutable stores that wraps `alt/utils/connectToStores`.  
 * Adds the necessary static methods `getStores()` and `getPropsFromStores()`.   
 * Makes declared fields of the store available to the component via its `props` object.  
 *
 * @param {Array<{store: AltStore, props: Array<string>}>} definitions A list of objects that each define a store and a list of property names.
 *
 * @example
 * import connectToStores from 'alt/utils/connectToImmutableStores';
 * // we are interested in the 'myProp' value from MyStore
 * const propsFromStores = [{
 *      store: MyStore,
 *      props: ['myProp']
 * }];
 * @connectToStores(propsFromStores)
 * export default class MyContent extends React.Component {
 *      render() {
 *          const image = this.props.myProp;
 *          ...
 *      }
 * }
 * @see https://github.com/goatslacker/alt/blob/master/docs/utils/immutable.md
 * @see https://github.com/goatslacker/alt/blob/master/src/utils/connectToStores.js
 */
/* eslint-enable */
function connectToImmutableStores(definitions) {
    definitions = definitions || [];
    return function(target) {
        target.getStores = function() {
            return definitions.map((obj) => obj.store);
        };
        target.getPropsFromStores = function() {
            const result = {};
            definitions.map((obj) => {
                const data = obj.store.getState();
                obj.props.map((propName) => {
                    result[propName] = data.get(propName);
                });
            });
            return result;
        };
        return connectToStores(target);
    };
}


export default connectToImmutableStores;
