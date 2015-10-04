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

var url = require('url');
var querystring = require('querystring');
var _ = require('lodash');

/**
 * @summary Get url from a node-request response
 * @function
 * @protected
 *
 * @param {Object} response - response
 * @returns {String} url
 */
exports.getResponseUrl = function(response) {
  'use strict';

  return url.format(response.request.uri);
};

/**
 * @summary Get url from a node-request options object
 * @function
 * @protected
 *
 * @param {Object} options - request options
 * @returns {String} url
 */
exports.getUrlFromRequestOptions = function(options) {
  'use strict';

  var result = (options.baseUrl || '') + (options.uri || options.url);

  if (!_.isEmpty(options.qs)) {
    result += '?' + querystring.stringify(options.qs);
  }

  return result;
};
