import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import {  advanceTimeForTesting, clearForTest, get, list, save, vote } from './routes';


describe('routes', function() {

  // TODO: remove the tests for the dummy route

  const option1 = "kitty"
  const option2 = "dog"
  const goodOptions = [option1, option2]


  it('save', function() {
    const req1 = httpMocks.createRequest(
        {method: 'POST', url: '/api/save', body: {} });
    const res1 = httpMocks.createResponse();
    save(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'missing or invalid "name" parameter undefined');
  
    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty"} });
    const res2 = httpMocks.createResponse();
    save(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'missing or invalid "endTime" parameter undefined');

    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4} });
    const res3 = httpMocks.createResponse();
    save(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'missing or invalid "options" parameter undefined');

    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4, options: [option1, undefined]} });
    const res4 = httpMocks.createResponse();
    save(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'option is not a valid string undefined');

    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4, options: goodOptions} });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    assert.strictEqual(res6._getStatusCode(), 200);
    assert.deepStrictEqual(res6._getData().poll.name, "kitty");
    assert.deepStrictEqual(res6._getData().poll.options, goodOptions);
    assert.deepStrictEqual(res6._getData().poll.voters, []);
    assert.deepStrictEqual(res6._getData().poll.votes, []);
    const endTime = res6._getData().poll.endTime
    assert.ok(Math.abs(endTime - Date.now() - 4 * 60 * 1000) < 50);

    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4, options: goodOptions} });
    const res7 = httpMocks.createResponse();
    save(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 400);
    assert.deepStrictEqual(res7._getData(), 'A poll by this name already exists.');

    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "dog", endTime: 7, options: goodOptions} });
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    assert.strictEqual(res8._getStatusCode(), 200);
    assert.deepStrictEqual(res8._getData().poll.name, "dog");
    assert.deepStrictEqual(res8._getData().poll.options, goodOptions);
    assert.deepStrictEqual(res8._getData().poll.voters, []);
    assert.deepStrictEqual(res8._getData().poll.votes, []);
    const endTime2 = res8._getData().poll.endTime
    assert.ok(Math.abs(endTime2 - Date.now() - 7 * 60 * 1000) < 50);

    const req9 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "dog", endTime: 4, options: goodOptions} });
    const res9 = httpMocks.createResponse();
    save(req9, res9);
    assert.strictEqual(res9._getStatusCode(), 400);
    assert.deepStrictEqual(res9._getData(), 'A poll by this name already exists.');

    clearForTest();
  });

  it('get', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/get', query: {} });
    const res1 = httpMocks.createResponse();
    get(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'missing or invalid "name" parameter');

    const req2 = httpMocks.createRequest(
        {method: 'GET', url: '/api/get', query: {name: "kitty"} });
    const res2 = httpMocks.createResponse();
    get(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'no such poll');

    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4, options: goodOptions} });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    const req3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: "kitty"} });
    const res3 = httpMocks.createResponse();
    get(req3, res3);
    assert.deepStrictEqual(res3._getData().poll.name, "kitty");
    assert.deepStrictEqual(res3._getData().poll.options, goodOptions);
    assert.deepStrictEqual(res3._getData().poll.voters, [])
    assert.deepStrictEqual(res3._getData().poll.votes, [])

    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "dog", endTime: 7, options: goodOptions} });
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    const req4 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: "dog"} });
    const res4 = httpMocks.createResponse();
    get(req4, res4);
    assert.deepStrictEqual(res4._getData().poll.name, "dog");
    assert.deepStrictEqual(res4._getData().poll.options, goodOptions);
    assert.deepStrictEqual(res4._getData().poll.voters, [])
    assert.deepStrictEqual(res4._getData().poll.votes, [])

    clearForTest();
  });

  it('list', function() {
    const req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list'});
    const res1 = httpMocks.createResponse();
    list(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(res1._getData(), {polls: []});

    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "kitty", endTime: 4, options: goodOptions} });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    const req2 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list', query: {} });
    const res2 = httpMocks.createResponse();
    list(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(res2._getData().polls[0].name, "kitty");

    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "dog", endTime: 20, options: goodOptions} });
    const res7 = httpMocks.createResponse();
    save(req7, res7);
    const req3 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list', query: {} });
    const res3 = httpMocks.createResponse();
    list(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 200);
    assert.deepStrictEqual(res3._getData().polls[0].name, "kitty");
    assert.deepStrictEqual(res3._getData().polls[1].name, "dog");

    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "cat", endTime: 1, options: goodOptions} });
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    const req4 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list', query: {} });
    const res4 = httpMocks.createResponse();
    list(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 200);
    assert.deepStrictEqual(res4._getData().polls[0].name, "cat");
    assert.deepStrictEqual(res4._getData().polls[1].name, "kitty");
    assert.deepStrictEqual(res4._getData().polls[2].name, "dog");

    advanceTimeForTesting(1 * 60 * 1000 + 30) //plus 1 min ish

    const req5 = httpMocks.createRequest(
      {method: 'GET', url: '/api/list', query: {} });
    const res5 = httpMocks.createResponse();
    list(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 200);
    assert.deepStrictEqual(res5._getData().polls[0].name, "kitty");
    assert.deepStrictEqual(res5._getData().polls[1].name, "dog");
    assert.deepStrictEqual(res5._getData().polls[2].name, "cat");

    clearForTest();
  })

  it('vote', function() {
    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {} });
    const res1 = httpMocks.createResponse();
    vote(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 400);
    assert.deepStrictEqual(res1._getData(), 'missing or invalid "name" parameter');

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?"} });
    const res2 = httpMocks.createResponse();
    vote(req2, res2);
    assert.strictEqual(res2._getStatusCode(), 400);
    assert.deepStrictEqual(res2._getData(), 'missing or invalid "option" parameter');

    const req3 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "meow"} });
    const res3 = httpMocks.createResponse();
    vote(req3, res3);
    assert.strictEqual(res3._getStatusCode(), 400);
    assert.deepStrictEqual(res3._getData(), 'missing or invalid "voterName" parameter');

    const req4 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "meow", voterName: "cat"} });
    const res4 = httpMocks.createResponse();
    vote(req4, res4);
    assert.strictEqual(res4._getStatusCode(), 400);
    assert.deepStrictEqual(res4._getData(), 'no such poll');

    const req6 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "AnimalTest?", endTime: 4, options: goodOptions} });
    const res6 = httpMocks.createResponse();
    save(req6, res6);
    const req5 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "AnimalTest?", option: "meow", voterName: "cat"} });
    const res5 = httpMocks.createResponse();
    vote(req5, res5);
    assert.strictEqual(res5._getStatusCode(), 400);
    assert.deepStrictEqual(res5._getData(), 'option meow does not exist in this poll - kitty,dog');

    const req8 = httpMocks.createRequest(
      {method: 'POST', url: '/api/save', body: {name: "Animal?", endTime: 4, options: ["meow", "woof"]} });
    const res8 = httpMocks.createResponse();
    save(req8, res8);
    const req7 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "meow", voterName: "cat"} });
    const res7 = httpMocks.createResponse();
    vote(req7, res7);
    assert.strictEqual(res7._getStatusCode(), 200);
    assert.deepStrictEqual(res7._getData().poll.voters, ["cat"]);
    assert.deepStrictEqual(res7._getData().poll.votes, ["meow"]);

    const req9 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "woof", voterName: "dog"} });
    const res9 = httpMocks.createResponse();
    vote(req9, res9);
    assert.strictEqual(res9._getStatusCode(), 200);
    assert.deepStrictEqual(res9._getData().poll.voters, ["cat", "dog"]);
    assert.deepStrictEqual(res9._getData().poll.votes, ["meow", "woof"]);

    const req10 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "meow", voterName: "dog"} });
    const res10 = httpMocks.createResponse();
    vote(req10, res10);
    assert.strictEqual(res10._getStatusCode(), 200);
    assert.deepStrictEqual(res10._getData().poll.voters, ["cat", "dog"]);
    assert.deepStrictEqual(res10._getData().poll.votes, ["meow", "meow"]);

    //testing that it updates correctly
    const req11 = httpMocks.createRequest(
      {method: 'GET', url: '/api/get', query: {name: "Animal?"} });
    const res11 = httpMocks.createResponse();
    get(req11, res11);
    assert.deepStrictEqual(res11._getData().poll.name, "Animal?");
    assert.deepStrictEqual(res11._getData().poll.options, ["meow", "woof"]);
    assert.deepStrictEqual(res11._getData().poll.voters, ["cat", "dog"])
    assert.deepStrictEqual(res11._getData().poll.votes, ["meow", "meow"])

    advanceTimeForTesting(20 * 60 * 1000 + 30) //plus 20 min
    const req12 = httpMocks.createRequest(
      {method: 'POST', url: '/api/vote', body: {name: "Animal?", option: "meow", voterName: "beast"} });
    const res12 = httpMocks.createResponse();
    vote(req12, res12);
    assert.strictEqual(res12._getStatusCode(), 400);
    assert.deepStrictEqual(res12._getData(), "can't vote on expired poll");
    
  })
  
});

  


