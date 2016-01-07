/*
 * The MIT License
 *
 * Copyright (c) 2016 Juan Cruz Viotti. https://github.com/jviotti
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

var m = require('mochainon');
var utils = require('../lib/utils');

describe('Utils:', function() {
  'use strict';

  describe('.getResponseUrl()', function() {

    it('should parse the request url', function() {
      m.chai.expect(utils.getResponseUrl({
        request: {
          uri: {
            protocol: 'https:',
            slashes: true,
            auth: null,
            host: 'api.github.com',
            port: 443,
            hostname: 'api.github.com',
            hash: null,
            search: null,
            query: null,
            pathname: '/repos/foo/bar/issues',
            path: '/repos/foo/bar/issues',
            href: 'https://api.github.com/repos/foo/bar/issues'
          }
        },
        body: {
          hello: 'world'
        }
      })).to.equal('https://api.github.com/repos/foo/bar/issues');
    });

  });

  describe('.getUrlFromRequestOptions()', function() {

    it('should get the url of an options object defining an url property', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        url: 'https://foobar.com'
      })).to.equal('https://foobar.com');
    });

    it('should get the url of an options object defining an uri property', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        uri: 'https://foobar.com'
      })).to.equal('https://foobar.com');
    });

    it('should give precedence to uri over url if both are defined', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        url: 'https://url.com',
        uri: 'https://uri.com'
      })).to.equal('https://uri.com');
    });

    it('should get the url of an options object defining baseUrl and url', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        baseUrl: 'https://foobar.com',
        url: '/hello'
      })).to.equal('https://foobar.com/hello');
    });

    it('should get the url of an options object defining baseUrl and uri', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        baseUrl: 'https://foobar.com',
        uri: '/hello'
      })).to.equal('https://foobar.com/hello');
    });

    it('should get the url of an options object with query strings', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        baseUrl: 'https://foobar.com',
        uri: '/hello',
        qs: {
          foo: 'bar',
          baz: 'qux'
        }
      })).to.equal('https://foobar.com/hello?foo=bar&baz=qux');
    });

    it('should ignore an empty qs object', function() {
      m.chai.expect(utils.getUrlFromRequestOptions({
        baseUrl: 'https://foobar.com',
        uri: '/hello',
        qs: {}
      })).to.equal('https://foobar.com/hello');
    });

  });

});
