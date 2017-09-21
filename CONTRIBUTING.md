# How to contribute

If you think there's room for improvement or see it broken feel free to submit a patch.
We'll accept a patch through any medium: GitHub pull requests, gists, emails,
gitter.im snippets, etc.

Your patch should adhere to these guidelines:

* The [coding style](#coding-style) is similar.
* All tests should pass `npm test` and coverage should remain at 100% `npm run coverage`.
* No linting errors are present `npm run lint`.
* The commit history is clean (no merge commits).
* We thank you for your patch.

## How to get set up

Fork the project and clone it to your computer. Then you'll need npm to install
the project's dependencies. Just run:

```bash
npm install
```

To make sure everything is ok you should run the tests:

```bash
npm test
```

## Coding Style

We use [EditorConfig](http://editorconfig.org/) for basics and encourage you
to install its plugin on your text editor of choice. This will get you 25% of
the way there.

The only hard-line rule is that the code should look uniform. We loosely follow
the [Airbnb JS style guide](https://github.com/airbnb/javascript) with a few
notable exceptions.

* You shouldn't have to use [semicolons](https://medium.com/@goatslacker/no-you-dont-need-semicolons-148d936b9cf2). The build file adds them in anyway.
* Do not rely on any ES6 shim/sham features (Map, WeakMap, Proxy, etc).
* Use `//` for comments. And comment anything you feel isn't obvious.

## License

All of our code and files are licensed under MIT.
