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
var Cache = require('../lib/cache');

describe('Cache:', function() {
  'use strict';

  describe('given an empty cache', function() {

    beforeEach(function() {
      this.cache = new Cache();
    });

    it('should be empty', function() {
      m.chai.expect(this.cache.storage).to.deep.equal({});
    });

    describe('#clean()', function() {

      it('should keep the storage empty', function() {
        this.cache.clean();
        m.chai.expect(this.cache.storage).to.deep.equal({});
      });

    });

    describe('#save()', function() {

      it('should keep the storage empty if response can not be saved', function() {
        this.cache.save({
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
          headers: {}
        });
        m.chai.expect(this.cache.storage).to.deep.equal({});
      });

      it('should be able to save a response with an etag header', function() {
        var response = {
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
          headers: {
            etag: '"cbc1848fe79da708cfb493bedac55c60"'
          },
          body: {
            hello: 'world'
          }
        };

        this.cache.save(response);

        m.chai.expect(this.cache.storage).to.deep.equal({
          'https://api.github.com/repos/foo/bar/issues': response
        });
      });

      it('should be able to save a response with a last-modified header', function() {
        var response = {
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
          headers: {
            'last-modified': 'Thu, 05 Jul 2012 15:31:30 GMT'
          },
          body: {
            hello: 'world'
          }
        };

        this.cache.save(response);

        m.chai.expect(this.cache.storage).to.deep.equal({
          'https://api.github.com/repos/foo/bar/issues': response
        });
      });

    });
  });

  describe('given a cache with one saved response with an etag header', function() {

    beforeEach(function() {
      this.cache = new Cache();
      this.response = {
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
        headers: {
          etag: '"cbc1848fe79da708cfb493bedac55c60"'
        },
        body: {
          hello: 'world'
        }
      };

      this.cache.save(this.response);
    });

    describe('#clean()', function() {

      it('should empty the cache storage', function() {
        this.cache.clean();
        m.chai.expect(this.cache.storage).to.deep.equal({});
      });

    });

    describe('#save()', function() {

      it('should be able to update the saved response', function() {
        var response = {
          request: this.response.request,
          headers: {
            etag: '"cbc1848fe79da708cfb493bedac55c99"'
          },
          body: {
            hello: 'world'
          }
        };

        this.cache.save(response);

        m.chai.expect(this.cache.storage).to.deep.equal({
          'https://api.github.com/repos/foo/bar/issues': response
        });
      });

    });

    describe('#isCached()', function() {

      it('should return true if response is in the cache and status code is 304', function() {
        m.chai.expect(this.cache.isCached({
          request: this.response.request,
          statusCode: 304
        })).to.be.true;
      });

      it('should return false if response is not the cache but status code is 304', function() {
        m.chai.expect(this.cache.isCached({
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
              pathname: '/repos/bar/baz/issues',
              path: '/repos/bar/baz/issues',
              href: 'https://api.github.com/repos/bar/baz/issues'
            }
          },
          statusCode: 304
        })).to.be.false;
      });

      it('should return false if response is in the cache but status code is not 304', function() {
        m.chai.expect(this.cache.isCached({
          request: this.response.request,
          statusCode: 200
        })).to.be.false;
      });

      it('should return false if response is not in the cache and status code is not 304', function() {
        m.chai.expect(this.cache.isCached({
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
              pathname: '/repos/bar/baz/issues',
              path: '/repos/bar/baz/issues',
              href: 'https://api.github.com/repos/bar/baz/issues'
            }
          },
          statusCode: 200
        })).to.be.false;
      });

    });

    describe('#getHeaders()', function() {

      it('should return an empty object if response is not in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/foo/bar');
        m.chai.expect(headers).to.deep.equal({});
      });

      it('should return an If-None-Match header if response is in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/repos/foo/bar/issues');
        m.chai.expect(headers).to.deep.equal({
          'If-None-Match': this.response.headers.etag
        });
      });

    });

    describe('#get()', function() {

      it('should return the response if it exists in the cache', function() {
        var response = this.cache.get('https://api.github.com/repos/foo/bar/issues');
        m.chai.expect(response).to.deep.equal(this.response);
      });

      it('should return undefined if it does not exist in the cache', function() {
        var response = this.cache.get('https://api.github.com/repos/bar/baz/issues');
        m.chai.expect(response).to.be.undefined;
      });

    });

  });

  describe('given a cache with one saved response with a Last-Modified header', function() {

    beforeEach(function() {
      this.cache = new Cache();
      this.response = {
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
        headers: {
          'last-modified': 'Thu, 05 Jul 2012 15:31:30 GMT'
        }
      };

      this.cache.save(this.response);
    });

    describe('#getHeaders()', function() {

      it('should return an empty object if response is not in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/foo/bar');
        m.chai.expect(headers).to.deep.equal({});
      });

      it('should return an If-Modified-Since header if response is in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/repos/foo/bar/issues');
        m.chai.expect(headers).to.deep.equal({
          'If-Modified-Since': this.response.headers['last-modified']
        });
      });

    });

  });

  describe('given a cache with one saved response with a Last-Modified and ETag headers', function() {

    beforeEach(function() {
      this.cache = new Cache();
      this.response = {
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
        headers: {
          'last-modified': 'Thu, 05 Jul 2012 15:31:30 GMT',
          etag: '"cbc1848fe79da708cfb493bedac55c99"'
        }
      };

      this.cache.save(this.response);
    });

    describe('#getHeaders()', function() {

      it('should return an empty object if response is not in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/foo/bar');
        m.chai.expect(headers).to.deep.equal({});
      });

      it('should return an If-Modified-Since and an If-None-Match header if response is in the cache', function() {
        var headers = this.cache.getHeaders('https://api.github.com/repos/foo/bar/issues');
        m.chai.expect(headers).to.deep.equal({
          'If-Modified-Since': this.response.headers['last-modified'],
          'If-None-Match': this.response.headers.etag
        });
      });

    });

  });

});
