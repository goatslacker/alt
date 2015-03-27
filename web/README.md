# Website

This is the source of the [alt website](github.io/goatslacker/alt), which is generated using [Github Pages](https://pages.github.com/) and [Jekyll](http://jekyllrb.com/).

The source utilizes the same `docs` folder as the rest of the project, but converts the links from their usable format on github, to work with the website.

## Setup

You must first install the Ruby dependencies specified in the `Gemfile` with [bundler](http://bundler.io/), `bundle install --path .bundle`

## Development

This project uses [Rake](https://github.com/ruby/rake) to run commands to build/deploy the Ruby based Jekyll site.

To view all the Rake commands available in the `Rakefile` run `bundle exec rake -T`.

- Generate the Jekyll website (gets written to `_site/`) with `bundle exec rake build`.
- Watch for changes and serve at `localhost:4000/alt/` with `bundle exec rake watch` or just `bundle exec rake` (because it is the default task).

## Deploying

Changes on the website are made directly to the `master` branch like any other alt changes, but they will not be deployed to the site automatically. The maintainers will use the rake deploy task which will commit the latest site changes to the `gh-pages` branch, where github will handle propagating these so they are viewable online.
