ghrequest
---------

[![npm version](https://badge.fury.io/js/ghrequest.svg)](http://badge.fury.io/js/ghrequest)
[![dependencies](https://david-dm.org/issuetrackapp/ghrequest.png)](https://david-dm.org/issuetrackapp/ghrequest.png)
[![Build Status](https://travis-ci.org/issuetrackapp/ghrequest.svg?branch=master)](https://travis-ci.org/issuetrackapp/ghrequest)
[![Build status](https://ci.appveyor.com/api/projects/status/x55pty4ljly9pok3?svg=true)](https://ci.appveyor.com/project/jviotti/ghrequest)

GitHub API HTTP client with cache support to get the most of your rate limit.

Description
-----------

This module provides a configured instance of the popular [request](https://github.com/request/request) module to work more efficientely with the public [GitHub API](https://developer.github.com/v3/).

Notice that streaming is *not supported* by this module.

The problem
-----------

GitHub allows a maximum of 5000 requests per hour for authenticated requests and 60 requests per hour for non authenticated requests. This default rate limiting might not be enough to meet the needs of an application that intensively communicates with the GitHub API.

See [Rate Limiting](https://developer.github.com/v3/#rate-limiting) for more details.

The solution
------------

If a GitHub API response contains either an `Etag` or `Last-Modified` HTTP header, `ghrequest` will locally cache the response of such request and will send `If-None-Match` or `If-Modified-Since` request headers when the same API resource is called again. If GitHub responds with a `304` code, this means that the content of the response didn't change, so we fetch it from the local cache and your rate limit remains intact.

See [Conditional Requests](https://developer.github.com/v3/#conditional-requests) for more details.

This is handled for you automatically so you don't have to bother messing with HTTP headers yourself.

Installation
------------

Install `ghrequest` by running:

```sh
$ npm install --save ghrequest
```

Defaults
--------

This module includes the following modifications to `request`:

- A `baseUrl` option that defaults to the public GitHub API url. This allows you to pass a relative url instead of having to type the full url every time.

- The `json` option is set to `true`, so JSON is encoded/decoded for you automatically.

- An `Accept` HTTP header that defaults to `application/vnd.github.v3+json`, [as recommended by GitHub](https://developer.github.com/v3/media/#request-specific-version).

- A `per_page` query string that defaults to `100`, which is the maximum supported value by GitHub, with the intention of getting to most of every request in paginated resources.

Make sure you check the [request documentation](https://github.com/request/request) to understand what the mentioned options do in greater detail.

Notice that *all mentioned modifications* are overwritable.

User Agent
----------

You **MUST** include a `User-Agent` HTTP header, otherwise [GitHub will reject your request](https://developer.github.com/v3/#user-agent-required).

For example:

```js
ghrequest({
  url: '/foo',
  headers: {
    'User-Agent': 'My Cool App'
  }
}, function(error, response, body) {
  if (error) throw error;
  console.log(body);
});
```

Documentation
-------------

<a name="ghrequest"></a>
## ghrequest(options, callback)
See [request](https://github.com/request/request) for more details about how to use this function.

**Kind**: global function  
**Summary**: Make an HTTP to the GitHub API  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | request options |
| callback | <code>function</code> | callback (error, response, body) |

**Example**  
```js
// Anonymous Request
ghrequest({
 method: 'GET',
 url: '/repos/angular/angular/issues'
}, function(error, response, body) {
 if (error) throw error;
 console.log(body);
});
```
**Example**  
```js
// Basic Authentication
ghrequest({
 method: 'GET',
 url: '/repos/angular/angular/issues',
 auth: {
   user: 'johndoe',
   pass: 'secret'
 }
}, function(error, response, body) {
 if (error) throw error;
 console.log(body);
});
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/issuetrackapp/ghrequest/issues/new) on GitHub and the IssueTrack team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ gulp test
```

Contribute
----------

- Issue Tracker: [github.com/issuetrackapp/ghrequest/issues](https://github.com/issuetrackapp/ghrequest/issues)
- Source Code: [github.com/issuetrackapp/ghrequest](https://github.com/issuetrackapp/ghrequest)

Before submitting a PR, please make sure that you include tests, and that [jshint](http://jshint.com) runs without any warning:

```sh
$ gulp lint
```

License
-------

The project is licensed under the MIT license.
