import { isRecord } from "./record"


// type Option = {
//     option: string
//     votes: number
// }

//Description of an individual poll
//RI: options.length >= 2
export type Poll = {
    name: string
    endTime: number 
    options: string[]
    voters: string[]
    votes: string[]
}

/**
 * Parses unknown data into a Poll. Returns a copy of the Poll if it is valid, otherwise logs
 *    an error and returns undefined.
 * @param val the potential poll being checked
 * @returns Poll if val is a valid poll, undefined otherwise
 */
export const parsePoll = (val: unknown) : Poll|undefined =>{
    if(!isRecord(val)){
        console.error("not a record", val)
        return undefined
    } 
    //console.log("parsePoll, val is - " + val)
    if(typeof val.name !== 'string'){
        console.error("name not a string", val)
        return undefined
    } else if(typeof val.endTime !== 'number'){
        console.error("time not a number", val)
        return undefined
    } else if(!Array.isArray(val.options)){
        console.error("options not an array", val)
        return undefined
    } 
    if(val.options.length < 2){
        console.error("options is too short", val)
        return undefined
    }
    for (const item of val.options) {
        if(typeof item !== 'string'){
            console.error("option not a string", item)
            return undefined
        }
    } if(!Array.isArray(val.voters)){
        console.error("voters not an array", val)
        return undefined
    } for (const item of val.voters) {
        if(typeof item !== 'string'){
            console.error("voter name not a string", item)
            return undefined
        }
    } if(!Array.isArray(val.votes)){
        console.error("votes not an array", val)
        return undefined
    } for (const item of val.votes) {
        if(typeof item !== 'string'){
            console.error("vote option not a string", item)
            return undefined
        }
        if(!val.options.includes(item)){
            console.error("vote option not a valid option", item)
            return undefined
        }
    }
    if(val.voters.length !== val.votes.length){
        console.error("voters and votes do not align")
         return undefined
    }
    const myOptions : string[] = val.options.slice(0, val.options.length) 
    const myVoters : string[] = val.voters.slice(0, val.voters.length) 
    const myVotes : string[] = val.votes.slice(0, val.votes.length) 
    return {name: val.name, endTime: val.endTime, options: myOptions, voters: myVoters, votes: myVotes}
}

/**
 * Counts the number of times each option appeared in the given array and returns a map
 *  of option to number of votes received.
 * @param votes array of options voted for
 * @returns a map of options (string) to the number of times it appeared in votes (number)
 */
export const countVotes = (votes: string[]) : Map<string, number> => {
    const output = new Map<string, number>()
    for (const vote of votes) {
        if(output.get(vote) !== undefined){
            const oldVal = output.get(vote) //not undefined
            if(oldVal === undefined){
                throw new Error("impossible")
            }
            output.set(vote, oldVal+1)
        }else{
            output.set(vote, 1)
            
        }
    }
    return output
}