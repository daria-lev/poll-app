import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
//import { isRecord } from "./record";


// Require type checking of request body.
type SafeRequest = Request<ParamsDictionary, {}, Record<string, unknown>>;
type SafeResponse = Response;  // only writing, so no need to check


// TODO: remove the dummy route

//Description of an individual poll
//RI: options.length >= 2
//    voters.length = votes.length
export type Poll = {
  name: string
  endTime: number 
  //options: Option[] //keeps track of votes for each option. do I want this?
  options: string[]
  voters: string[] 
  votes: string[]
}

// type PollInfo = {
//   name: string
//   endTime: number
// }


//maps poll name to the corresponding poll
const polls : Map<string, Poll> = new Map<string, Poll>() 

/** Clears the server, used only for testing. */
export const clearForTest = (): void => {
  polls.clear()
}

/** Testing function to move all end times forward the given amount (of ms). */
export const advanceTimeForTesting = (ms: number): void => {
  for (const poll of polls.values()) {
    poll.endTime -= ms;
  }
};

/**
 * Saves a new poll to the stored map. Sends back the poll.
 * @param req The request object
 * @param res The response object
 */
export const save = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name; 
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).send(`missing or invalid "name" parameter ${name}`);
    return;
  }
  const length = req.body.endTime; //in minutes
  if (typeof length !== 'number' || length <= 0) {
    res.status(400).send(`missing or invalid "endTime" parameter ${length}`);
    return;
  }
  const options = req.body.options //array of strings
  if (!Array.isArray(options) || options.length < 2) {
    res.status(400).send(`missing or invalid "options" parameter ${options}`);
    return;
  }
  for (const option of options) {
      if(typeof option !== 'string'){
        res.status(400).send(`option is not a valid string ${option}`);
        return;
      }
  }
  if(polls.has(name)){
    res.status(400).send("A poll by this name already exists.");
    return;
  }
  const myOptions = options.slice(0, options.length)
  const myEndTime = Date.now() + length * 60 * 1000
  const myPoll : Poll = {name: name, endTime: myEndTime, options: myOptions, 
        voters: [], votes: []} //no voters or votes yet
  polls.set(name, myPoll) //add to storage
  res.send({poll: myPoll}); 
};

/**
 * Sends a poll by a specific name. 
 * @param req The request object
 * @param res The response object
 */
export const get = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.query.name;
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  } if(!polls.has(name)){
    res.status(400).send('no such poll')
    return
  }
  const myPoll = polls.get(name)
  res.send({poll: myPoll});
};

/**
 * Sends the names and endtimes of all polls as a list of records, in the following order:
 *    the ongoing polls, sorted from least to most time remaining
 *    the completed polls, sorted from most to least recently completed 
 * @param req The request object
 * @param res The response object
 */
export const list = (_req: SafeRequest, res: SafeResponse): void => {
  //NEED TO UPDATE - RETURN ARRAY OF RECORD OF NAME TO ENDTIME
  //for item in map, add to one of two arrays, then sort each and reverse ongoing, concat and send
  const allPolls : Poll[] = Array.from(polls.values())
  allPolls.sort(sortHelper)
  // const time = Date.now()
  // const ongoing : PollInfo[] = []
  // const complete : PollInfo[] = []
  // for (const poll of allPolls) {
  //   if(poll.endTime <= time){
  //     complete.push({name: poll.name, endTime: poll.endTime})
  //   } else{
  //     ongoing.push({name: poll.name, endTime: poll.endTime})
  //   }
  // }
  // const ongoingSorted = ongoing.sort((a,b) => a.endTime-b.endTime).slice(0, ongoing.length)
  // const completeSorted = complete.sort((a,b) => b.endTime-a.endTime).slice(0, complete.length)
  // const sortedAll = ongoingSorted.concat(completeSorted)
  res.send({polls: allPolls})
}

// returns 0 if the polls end at the same time, a negative number if a should go before b in the above format, 
//    a positive otherwise
const sortHelper = (a: Poll, b: Poll): number => {
  const time = Date.now()
  if(a.endTime === b.endTime){
    return 0
  } 
  const aIsClosed = (a.endTime-time)<0
  const bIsClosed = (b.endTime-time)<0
  if(aIsClosed){
    if(bIsClosed){
      return b.endTime - a.endTime
    }else{
      return 1
    }
  }else{ //a is open
    if(bIsClosed){
      return -1
    }else{
      return a.endTime - b.endTime
    }
  }
}

/**
 * Adds one vote to the requested option of a requested poll. Sends back the updated poll.
 * @param req The request object
 * @param res The response object
 */
export const vote = (req: SafeRequest, res: SafeResponse): void => {
  const name = req.body.name
  if (typeof name !== 'string' || name.length === 0) {
    res.status(400).send('missing or invalid "name" parameter');
    return;
  } 
  const myOption = req.body.option
  if (typeof myOption !== 'string') {
    res.status(400).send('missing or invalid "option" parameter');
    return;
  }
  const voterName = req.body.voterName
  if (typeof voterName !== 'string') {
    res.status(400).send('missing or invalid "voterName" parameter');
    return;
  }
  const myPoll = polls.get(name) 
  if(myPoll === undefined){
    res.status(400).send('no such poll')
    return
  }
  if(!myPoll.options.includes(myOption)){
    res.status(400).send(`option ${myOption} does not exist in this poll - ${myPoll.options}`)
    return
  }
  if(myPoll.endTime < Date.now()){
    res.status(400).send("can't vote on expired poll")
    return
  }
  //know all options are unique because mandated in poll creation
  const voterInd = myPoll.voters.indexOf(voterName)
  if(voterInd === -1){ //voter has not voted yet
    //adds one to the desired option, others unchanged
    myPoll.voters.push(voterName)
    myPoll.votes.push(myOption)
    
  } else{ //there is already a vote by this voter, need to replace
    myPoll.votes[voterInd] = myOption
  }
  polls.set(name, myPoll) //updates storage
  res.send({poll: myPoll}) //MAYBE KEEPS TRACK OF VOTERS

}

/*
if(!isRecord(option)){
      res.status(400).send(`option is not a record ${options}`);
      return;
    } if(typeof option.option !== 'string'){
      res.status(400).send(`option is not a string ${option.option}`);
      return;
    } if(typeof option.votes !== 'number' || option.votes < 0){
      res.status(400).send(`votes is not a valid number ${option.votes}`);
      return;

  for (const opt of myPoll.options) { //unsure if I want to do it like this
      if(opt.option === myOption){
        myOptions.push({option: opt.option, votes: opt.votes+1})
      } else{
        myOptions.push({option: opt.option, votes: opt.votes})
      }
    }

  const oldVote : string = myPoll.votes[voterInd]
    myPoll.votes[voterInd] = myOption
    for (const opt of myPoll.options) { //unsure if I want to do it like this
      if(opt.option === myOption){
        myOptions.push({option: opt.option, votes: opt.votes+1})
      } else if(opt.option === oldVote){
        myOptions.push({option: opt.option, votes: opt.votes-1})
      }
      else{
        myOptions.push({option: opt.option, votes: opt.votes})
      }
    }
*/


