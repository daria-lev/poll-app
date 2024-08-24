import * as assert from 'assert';
import { Poll, countVotes, parsePoll } from './poll';

describe('poll', function() {

    const poll1 : Poll = {name: 'Animal?', endTime: 4, options: ["cat", "dog"], 
            voters: ["Tim", "Sam"], votes: ["cat", "dog"]}
    const poll2 : Poll = {name: "Beast?", endTime: 5, options: ["yes", "no"], 
    voters: ["Tim", "Sam", "Fool"], votes: ["yes", "yes", "no"]}

    it('parsePoll', function() {
        //not a record
        assert.deepStrictEqual(parsePoll(5), undefined)
        assert.deepStrictEqual(parsePoll("cat"), undefined)
        //missing required fields
        assert.deepStrictEqual(parsePoll({endTime: 56}), undefined)
        assert.deepStrictEqual(parsePoll({}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: 56}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: 56, options: ["3", "4"]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: 56, options: ["3", "4"], voters: ["tim"]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["3", "4"], 
            voters: ["tim"]}), undefined)
        //options invalid
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["4"], 
            voters: ["tim"], votes: ["4"]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: [3, 4], 
            voters: ["tim"], votes: ["4"]}), undefined)
        //voters or votes invalid
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["4", "3"], 
            voters: [45, 76], votes: ["4", "3"]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["4", "3"], 
            voters: ["tim", "sam"], votes: [34534, 56]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["4", "3"], 
            voters: ["tim", "sam"], votes: ["3", "4", "4", "4"]}), undefined)
        assert.deepStrictEqual(parsePoll({name: "cat", endTime: "kitty", options: ["4", "3"], 
            voters: ["tim", "sam"], votes: ["5", "3"]}), undefined)
        //valid poll
        assert.deepStrictEqual(parsePoll(poll1), poll1)
        assert.deepStrictEqual(parsePoll(poll2), poll2)
    })

    it('countVotes', function() {
        const map1 = countVotes([]) //empty case
        const output = new Map<string, number>()
        assert.deepStrictEqual(map1, output) //output is empty
        const map2 = countVotes(["a"])
        output.set("a", 1)
        assert.deepStrictEqual(map2, output)
        const map3 = countVotes(["a", "b"])
        output.set("b", 1)
        assert.deepStrictEqual(map3, output)
        const map4 = countVotes(["a", "b", "b"])
        output.set("b", 2)
        assert.deepStrictEqual(map4, output)
        const map5 = countVotes(["a", "b", "b", "a", "c"])
        output.set("a", 2)
        output.set("c", 1)
        assert.deepStrictEqual(map5, output)
    })
})