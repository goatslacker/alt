---
layout: docs
title: AltContainer
description: A Store Controller component for better composition
permalink: /docs/components/altContainer/
---

# AltContainer

AltContainer is not an idea exclusive to alt. For more information on why you should be using container components check out React.js Conf 2015 talk [Making your app fast with high-performance components](https://youtu.be/KYzlpRvWZ6c?t=22m48s).

The basic idea is that you have a container that wraps your component, the duty of this container component is to handle all the data fetching and communication with the stores, it then renders the corresponding children. The sub-components just render markup and are data agnostic thus making them highly reusable.

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

You can pass in a custom function as the value in order to control what each prop will represent. Say you have multiple getters on a store and only want to pass a subset of the state rather than the whole state.

```js
<AltContainer
  stores={
    {
      post: function (props) {
        return BlogStore.getPostFor(props.blogId);
      },
      comments: function (props) {
        return CommentsStore.getCommentsFor(props.blogId)
      },
      shares: function (props) {
        return ShareStore.getSharesFor(props.blogId)
      }
    }
  }
>
  <BlogPost />
</AltContainer>
```

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

`BlogPost` in this case will receive all the state of `BlogStore` as props. `this.props.id` and `this.props.title` will be passed through to `BlogPost`.

Just like `stores`, you can define your own custom function to use with `store`.

```js

function blogStoreFetcher(props) {
  return BlogStore.getPostFor(props.blogId);
}

<AltContainer store={blogStoreFetcher}>
  <BlogPost />
</AltContainer>
```

Children will get the properties you define.

```js
<AltContainer store={BlogStore}>
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
