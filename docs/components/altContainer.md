---
layout: docs
title: AltContainer
description: A Store Controller component for better composition
permalink: /docs/components/altContainer/
---

# AltContainer

AltContainer is not an idea exclusive to alt. For more information on why you should be using container components check out React.js Conf 2015 talk [Making your app fast with high-performance components](https://youtu.be/KYzlpRvWZ6c?t=22m48s).

The basic idea is that you have a container that wraps your component, the duty of this container component is to handle all the data fetching and communication with the stores, it then renders the corresponding children. The sub-components just render markup and are data agnostic thus making them highly reusable.

AltContainer doesn't just wrap your dumb components into a high-performance store listener but it also serves as a jack-of-all-trades component where you can directly inject any dependencies into your components such as stores, actions, or the flux context.

## Importing

To import `AltContainer`, you may do it like the following:

```js
import AltContainer from 'alt-container';
```

**For CommonJS**:

```js
var AltContainer = require('alt-container');
```

## `stores`

You can pass in an object to `stores` where the keys correspond to the prop that the children will receive and their value the store we should retrieve the state from.

For example:

```js
<AltContainer
  stores={
    {
      BlogPosts: BlogStore,
      Comments: CommentsStore,
      Shares: ShareStore
    }
  }
>
  <div />
</AltContainer>
```

Will pass the state from `BlogStore` (`BlogStore.getState()`) into the `<div />` as `this.props.BlogPosts`. `CommentsStore` will be available in `this.props.Comments`, etc.

You can pass in a custom function as the value in order to control what each prop will represent. Say you have multiple getters on a store and only want to pass a subset of the state rather than the whole state. These functions must return a special object in order to let AltContainer know which store they'll listen to.

```js
<AltContainer blogId='100'
  stores={
    {
      post: function (props) { // props is the property of AltContainer
        return {
          store: BlogStore,
          value: BlogStore.getPostFor(props.blogId)
        };
      },
      comments: function (props) {
        return {
          store: CommentsStore,
          value: CommentsStore.getCommentsFor(props.blogId)
        };
      },
      shares: function (props) {
        return {
          store: ShareStore,
          value: ShareStore.getSharesFor(props.blogId)
        };
      }
    }
  }
>
  <BlogPost />
</AltContainer>
```

If you pass an Array to `stores` the stores described will only be listened to.

```js
<AltContainer stores={[BlogStore]}>
  <BlogPost />
</AltContainer>
```

The example above will only listen to BlogStore and re-render BlogPost when state changes in BlogStore. You can combine this with `inject` for full control of what gets added and listened to.

## `inject`

This allows you to inject anything into your children. Functions defined inside inject are evaluated and their results passed down via props.

```js
<AltContainer
  stores={[BlogStore]}
  inject={ {
    className: 'blog-post',
    blogId: function (props) {
      return BlogStore.getState().id
    }
  } }>
  <BlogPost />
</AltContainer>
```

The above example will pass the `className` of blog-post to BlogPost component. BlogPost wil also receive `blogId` as a prop which will be evaluated whenever BlogStore changes.

## `store`

If you only have a single store you can use `store` to bind it. The state will then be passed as props straight through.

```js
var PostStore = alt.createStore({
  displayName: 'PostStore',
  state: {
    id: 1,
    title: 'Hello, World!'
  }
});

<AltContainer store={PostStore}>
  <BlogPost />
</AltContainer>
```

`BlogPost` in this case will receive all the state of `PostStore` as props. `this.props.id` and `this.props.title` will be passed through to `BlogPost`.

Just like `stores`, you can define your own custom function to use with `store`.

```js

function blogStoreFetcher(props) { // props is the property of AltContainer
  return {
    store: BlogStore,
    value: BlogStore.getPostFor(props.blogId)
  };
}

<AltContainer blogId='100' store={blogStoreFetcher}>
  <BlogPost />
</AltContainer>
```

Children will get the properties you define.

```js
<AltContainer store={BlogStore}>
  <BlogPost className="my-awesome-post" />
</AltContainer>
```

## `actions`

You can directly inject any actions you wish to make available to your child components which will then be available via their props.

For example, say you have a pretty standard `BlogActions`.

```js
var BlogActions = alt.generateActions('makePost');
```

You can inject these actions into BlogPost like so:

```js
<AltContainer
  store={BlogStore}
  actions={ { MyActions: BlogActions } }
>
  <BlogPost className="my-awesome-post" />
</AltContainer>
```

The actions found in `BlogActions` will now be available in an object you defined `MyActions`. So you may call `this.props.MyActions.makePost()` and the `BlogActions.makePost` action will be fired.

You can inject these actions directly on the props themselves:

```js
<AltContainer
  store={BlogStore}
  actions={BlogActions}
>
  <BlogPost className="my-awesome-post" />
</AltContainer>
```

`BlogPost` here will receive all of the state of `BlogStore` as props, and all of the actions of `BlogActions`. So you may call `this.props.makePost()` and the `BlogActions.makePost` action will be fired.

Similar to stores and store the actions prop also accepts a function where you can customize the behavior of the actions:

```js
<AltContainer
  store={BlogStore}
  actions={function (props) {
    return {
      makePost: function (postText) {
        // trim the post first
        postText.trim()

        // then call the action
        return BlogActions.makePost(postText)
      }
    }
  }}>
  <BlogPost className="my-awesome-post" />
</AltContainer>
```

## `render`

But you can also specify a special `render` function which will render whatever your heart desires.

```js
<AltContainer
  store={BlogStore}
  render={function (props) {
    return <BlogPost className="my-awesome-post" id={props.id} title="Overriding the title" />
  }}
/>
```

## `flux`

`AltContainer` also works with Alt instances. If you're passing the alt instance around as a `flux` prop, it'll bind it to all its children.

```js
const flux = new Flux();

<AltContainer flux={flux}>
  <Header />
  <Body />
  <Footer />
</AltContainer>
```

Header, Body, and Footer will have the `flux` context passed down.

## `transform`

If you don't like the way `AltContainer` passing the props, you can give it a `transform` function.

```js
<AltContainer
  stores={
    { BlogStore }
  }
  actions={
    { BlogActions }
  }
  transform={({ BlogStore, BlogActions }) => {
    var posts = BlogStore.posts.slice(0, 42);
    var makePost =
      text => BlogActions.makePost(`${text} So long, and thanks for all the fish.`);
    return { posts, makePost };
  }}>
  <Foobar />
</AltContainer>
```

## `shouldComponentUpdate`

`shouldComponentUpdate` prop allows you to fine-tune your performance needs for AltContainer only rendering when absolutely necessary.

This is a function that gets called with the props that your children will receive. You return a boolean depending on if you wish to re-render or not.

```js
<AltContainer shouldComponentUpdate={(nextProps) => false}>
  <Header />
  <Body />
  <Footer />
</AltContainer>
```

In this example, Header, Body, and Footer will not re-render because we're returning false.

## `component`

With this prop you can define which component you want to render within your AltContainer. If you have a single component and you're using required propTypes then this is a legitimate way of rendering the components without getting a warning about invalid propTypes from React due to cloneWithProps.

```js
<AltContainer component={Body} />
```

This example renders Body inside of the AltContainer.
