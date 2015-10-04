/*
 * The MIT License
 *
 * Copyright (c) 2015 IssueTrack. https://issuetrack.io
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var _ = require('lodash');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var Cache = require('./cache');
var utils = require('./utils');

var cache = new Cache();

/**
 * @summary Make an HTTP to the GitHub API
 * @name ghrequest
 * @function
 * @public
 *
 * @description
 * See [request](https://github.com/request/request) for more details about how to use this function.
 *
 * @param {Object} options - request options
 * @param {Function} callback - callback (error, response, body)
 *
 * @example
 * // Anonymous Request
 * ghrequest({
 *  method: 'GET',
 *  url: '/repos/angular/angular/issues'
 * }, function(error, response, body) {
 *  if (error) throw error;
 *  console.log(body);
 * });
 *
 * @example
 * // Basic Authentication
 * ghrequest({
 *  method: 'GET',
 *  url: '/repos/angular/angular/issues',
 *  auth: {
 *    user: 'johndoe',
 *    pass: 'secret'
 *  }
 * }, function(error, response, body) {
 *  if (error) throw error;
 *  console.log(body);
 * });
 */
module.exports = function(options, callback) {
  'use strict';

  _.defaultsDeep(options, {
    method: 'GET',

    // Default to GitHub api url unless otherwise specified
    baseUrl: 'https://api.github.com',

    // Automatically parse JSON from the response
    json: true,

    headers: {

      // Explicitly call API v3
      // See https://developer.github.com/v3/#current-version
      Accept: 'application/vnd.github.v3+json'
    },

    qs: {

      // Set number of items per page to the
      // maximum supported value by default.
      // See https://developer.github.com/v3/#pagination
      per_page: 100
    }
  });

  var fullUrl = utils.getUrlFromRequestOptions(options);

  options.headers = _.merge(options.headers, cache.getHeaders(fullUrl));

  return request(options).spread(function(response) {
    if (cache.isCached(response)) {
      return [ response, cache.get(fullUrl).body ];
    }

    cache.save(response);

    return [ response, response.body ];
  }).nodeify(callback, {
    spread: true
  });
};

/**
 * @summary Clean the cache
 * @name clean
 * @function
 * @static
 * @private
 *
 * @description
 * This function is exposed for testing purposes, but we don't expect clients to call it directly.
 *
 * @example
 * ghrequest.clean()
 */
module.exports.clean = cache.clean;
