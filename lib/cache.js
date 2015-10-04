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
var utils = require('./utils');

/**
 * @summary Cache manager
 * @class
 * @protected
 *
 * @returns {Cache} Cache instance
 */
function Cache() {
  'use strict';

  // TODO: Persisting this should give us conditional request
  // benefits even when restarting the application
  // Maybe https://github.com/simonlast/node-persist?
  this.storage = {};
}

/**
 * @summary Get a cached response
 * @method
 * @public
 *
 * @param {String} url - url
 * @returns {Object|undefined} cached response
 */
Cache.prototype.get = function(url) {
  'use strict';

  return this.storage[url];
};

/**
 * @summary Determine if a response can be retrieved from the cache
 * @method
 * @public
 *
 * @param {Object} response - response
 * @returns {Boolean} whether the response is cached
 */
Cache.prototype.isCached = function(response) {
  'use strict';

  return response.statusCode === 304 && !!this.get(utils.getResponseUrl(response));
};

/**
 * @summary Attempt to cache a response
 * @method
 * @public
 *
 * @description
 * It does nothing if the response can't be cached.
 *
 * @param {Object} response - response
 */
Cache.prototype.save = function(response) {
  'use strict';

  if (!_.any([
    _.has(response.headers, 'etag'),
    _.has(response.headers, 'last-modified')
  ])) {
    return;
  }

  // Only save what's needed. This is arguably overkill,
  // but having huge response objects makes it hard to
  // see the important bits when debugging cache issues.
  this.storage[utils.getResponseUrl(response)] = _.pick(response, [
      'request',
      'uri',
      'headers',
      'body'
  ]);
};

/**
 * @summary Get request cache headers
 * @method
 * @public
 *
 * @param {String} url - url
 * @returns {Object} request headers
 */
Cache.prototype.getHeaders = function(url) {
  'use strict';

  var response = this.get(url);

  if (!response) {
    return {};
  }

  var headers = {};

  if (response.headers.etag) {
    headers['If-None-Match'] = response.headers.etag;
  }

  if (response.headers['last-modified']) {
    headers['If-Modified-Since'] = response.headers['last-modified'];
  }

  return headers;
};

/**
 * @summary Clean cache
 * @method
 * @public
 */
Cache.prototype.clean = function() {
  'use strict';

  this.storage = {};
};

module.exports = Cache;
