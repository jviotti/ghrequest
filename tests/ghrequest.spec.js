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
var _ = require('lodash');
var nock = require('nock');
var ghrequest = require('../lib/ghrequest');

describe('Github Request:', function() {
  'use strict';

  describe('given a simple github endpoint that returns json data', function() {

    beforeEach(function() {
      nock('https://api.github.com').get('/foo').query(true).reply(200, { foo: 'bar' });
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should throw an error if passing an absolute url', function(done) {
      ghrequest({
        method: 'GET',
        url: 'https://api.github.com/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.be.an.instanceof(Error);
        m.chai.expect(error.message).to.equal('options.uri must be a path when using options.baseUrl');
        done();
      });
    });

    it('should automatically parse the json response', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(body).to.deep.equal({
          foo: 'bar'
        });

        // Assert that the body gets also parsed within the response object
        m.chai.expect(response.body).to.deep.equal({
          foo: 'bar'
        });

        done();
      });
    });

    it('should send an Accept header by default', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(response.request.headers.Accept).to.equal('application/vnd.github.v3+json');
        done();
      });
    });

    it('should allow overriding the Accept header', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo',
        headers: {
          Accept: 'custom accept'
        }
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(response.request.headers.Accept).to.equal('custom accept');
        done();
      });
    });

    it('should allow passing custom headers', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo',
        headers: {
          'X-Foo': 'bar'
        }
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        var headers = response.request.headers;
        m.chai.expect(headers.Accept).to.equal('application/vnd.github.v3+json');
        m.chai.expect(headers['X-Foo']).to.equal('bar');
        done();
      });
    });

    it('should set per_page query string to 100 by default', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(response.request.path).to.equal('/foo?per_page=100');
        done();
      });
    });

    it('should customising the per_page query string', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo',
        qs: {
          per_page: 50
        }
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(response.request.path).to.equal('/foo?per_page=50');
        done();
      });
    });

    it('should allow passing custom query strings', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo',
        qs: {
          bar: 'baz'
        }
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(response.request.path).to.equal('/foo?bar=baz&per_page=100');
        done();
      });
    });

    it('should allow basic authentication', function(done) {
      ghrequest({
        method: 'GET',
        url: '/foo',
        auth: {
          user: 'johndoe',
          pass: 'secret'
        }
      }, function(error, response, body) {
        var headers = response.request.headers;
        m.chai.expect(headers.authorization).to.equal('Basic am9obmRvZTpzZWNyZXQ=');
        done();
      });
    });
  });

  describe('given a simple github endpoint that returns the HTTP method', function() {

    beforeEach(function() {

      // Investigate if there is an easier way to express this
      nock('https://api.github.com').get('/foo').query(true).reply(200, { method: 'GET' });
      nock('https://api.github.com').post('/foo').query(true).reply(200, { method: 'POST' });
      nock('https://api.github.com').put('/foo').query(true).reply(200, { method: 'PUT' });
      nock('https://api.github.com').patch('/foo').query(true).reply(200, { method: 'PATCH' });
      nock('https://api.github.com').delete('/foo').query(true).reply(200, { method: 'DELETE' });
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should set GET by default', function(done) {
      ghrequest({
        url: '/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(body.method).to.equal('GET');
        done();
      });
    });

  });

  describe('given a custom enterprise github installation', function() {

    beforeEach(function() {
      nock('https://github.company.com').get('/foo').query(true).reply(200, { foo: 'bar' });
    });

    afterEach(function() {
      nock.cleanAll();
    });

    it('should allow calling the custom url via the baseUrl option', function(done) {
      ghrequest({
        method: 'GET',
        baseUrl: 'https://github.company.com',
        url: '/foo'
      }, function(error, response, body) {
        m.chai.expect(error).to.not.exist;
        m.chai.expect(body).to.deep.equal({
          foo: 'bar'
        });
        done();
      });
    });

  });

  describe('given an empty cache', function() {

    beforeEach(function() {
      ghrequest.clean();
    });

    describe('given a simple github endpoint that returns an etag header', function() {

      beforeEach(function() {
        nock('https://api.github.com').defaultReplyHeaders({
          etag: '"cbc1848fe79da708cfb493bedac55c60"'
        }).get('/foo').twice().query(true).reply(function() {
          if (this.req.headers['if-none-match'] === '"cbc1848fe79da708cfb493bedac55c60"') {
            return [ 304, null ];
          } else {
            return [ 200, { foo: 'bar' } ];
          }
        });
      });

      afterEach(function() {
        nock.cleanAll();
      });

      it('should send the same etag header the next time as If-None-Match', function(done) {
        ghrequest({
          method: 'GET',
          url: '/foo'
        }, function(error, response, body) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(response.statusCode).to.equal(200);
          m.chai.expect(response.request.headers['If-None-Match']).to.not.exist;
          m.chai.expect(body).to.deep.equal({ foo: 'bar' });

          ghrequest({
            method: 'GET',
            url: '/foo'
          }, function(error, response, body) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(response.statusCode).to.equal(304);
            m.chai.expect(response.request.headers['If-None-Match']).to.equal('"cbc1848fe79da708cfb493bedac55c60"');
            m.chai.expect(body).to.deep.equal({ foo: 'bar' });
            done();
          });
        });
      });

    });

    describe('given a simple github endpoint that returns a last-modified header', function() {

      beforeEach(function() {
        nock('https://api.github.com').defaultReplyHeaders({
          'last-modified': 'Thu, 05 Jul 2012 15:31:30 GMT'
        }).get('/foo').twice().query(true).reply(function() {
          if (this.req.headers['if-modified-since'] === 'Thu, 05 Jul 2012 15:31:30 GMT') {
            return [ 304, null ];
          } else {
            return [ 200, { foo: 'bar' } ];
          }
        });
      });

      afterEach(function() {
        nock.cleanAll();
      });

      it('should send the same last-modified header the next time as If-Modified-Since', function(done) {
        ghrequest({
          method: 'GET',
          url: '/foo'
        }, function(error, response, body) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(response.statusCode).to.equal(200);
          m.chai.expect(response.request.headers['If-Modified-Since']).to.not.exist;
          m.chai.expect(body).to.deep.equal({ foo: 'bar' });

          ghrequest({
            method: 'GET',
            url: '/foo'
          }, function(error, response, body) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(response.statusCode).to.equal(304);
            m.chai.expect(response.request.headers['If-Modified-Since']).to.equal('Thu, 05 Jul 2012 15:31:30 GMT');
            m.chai.expect(body).to.deep.equal({ foo: 'bar' });

            done();
          });
        });
      });

    });

    describe('given a simple github endpoint that returns a last-modified and etag headers', function() {

      beforeEach(function() {
        nock('https://api.github.com').defaultReplyHeaders({
          'last-modified': 'Thu, 05 Jul 2012 15:31:30 GMT',
          etag: '"cbc1848fe79da708cfb493bedac55c60"'
        }).get('/bar').twice().query(true).reply(function() {
          if (_.any([
            this.req.headers['if-modified-since'] === 'Thu, 05 Jul 2012 15:31:30 GMT',
            this.req.headers['if-none-match'] === '"cbc1848fe79da708cfb493bedac55c60"'
          ])) {
            return [ 304, null ];
          } else {
            return [ 200, { foo: 'bar' } ];
          }
        });
      });

      afterEach(function() {
        nock.cleanAll();
      });

      it('should send both an If-Modified-Since and If-None-Match', function(done) {
        ghrequest({
          method: 'GET',
          url: '/bar'
        }, function(error, response, body) {
          m.chai.expect(error).to.not.exist;
          m.chai.expect(response.statusCode).to.equal(200);
          m.chai.expect(response.request.headers['If-Modified-Since']).to.not.exist;
          m.chai.expect(response.request.headers['If-None-Match']).to.not.exist;
          m.chai.expect(body).to.deep.equal({ foo: 'bar' });

          ghrequest({
            method: 'GET',
            url: '/bar'
          }, function(error, response, body) {
            m.chai.expect(error).to.not.exist;
            m.chai.expect(response.statusCode).to.equal(304);
            m.chai.expect(response.request.headers['If-Modified-Since']).to.equal('Thu, 05 Jul 2012 15:31:30 GMT');
            m.chai.expect(response.request.headers['If-None-Match']).to.equal('"cbc1848fe79da708cfb493bedac55c60"');
            m.chai.expect(body).to.deep.equal({ foo: 'bar' });
            done();
          });
        });
      });

    });

  });

});
