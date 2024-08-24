import React, { Component, MouseEvent } from 'react';
//import { Poll} from './poll';
import { isRecord } from './record';

type PollInfo = {
  name: string
  endTime: number
}

type ListProps = {
  onNewClick: () => void,
  onPollClick: (name: string) => void
};

//RI: polls is sorted in the following manner:
//    the ongoing polls, sorted from least to most time remaining
//    the completed polls, sorted from most to least recently completed 
type ListState = {
  now: number,  // current time when rendering
  polls: PollInfo[] | undefined,
};


// Shows the list of all the auctions.
export class PollsList extends Component<ListProps, ListState> {
  constructor(props: ListProps) {
    super(props);
    this.state = {now: Date.now(), polls: undefined};
    //this.state = {now: Date.now(), polls: [{name: "testing", endTime: Date.now()+1*60*1000}]}; //TEMP
  }

  componentDidMount = (): void => {
      this.doRefreshClick()
  }

  render = (): JSX.Element => {
      return <div>
        <h2>Current Polls</h2>
        {this.renderPolls()}
        <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        <button type="button" onClick={this.doNewClick}>New</button>
      </div>
  }

  renderPolls = (): JSX.Element => {
    if(this.state.polls === undefined){
        return <p>Loading Polls....</p>
    } else{
        const pollsOngoing : JSX.Element[] = []
        const pollsDone : JSX.Element[] = []
        for (const poll of this.state.polls) {
            if(poll.endTime <= this.state.now){
                //push to Done
                const min = (this.state.now - poll.endTime) / 60 / 1000; //we know state.now is more
                const time = <span> Completed {Math.round(min*10)/10} minutes ago</span>;
                pollsDone.push(
                    <li key={poll.name}>
                        <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
                        {time}</li>
                )
            } else{
                //push to Ongoing
                const min = (poll.endTime - this.state.now) / 60 / 1000; //we know endTime is more
                const time = <span> {Math.round(min*10)/10} minutes remaining</span>;
                pollsOngoing.push(
                    <li key={poll.name}>
                        <a href="#" onClick={(evt) => this.doPollClick(evt, poll.name)}>{poll.name}</a>
                        {time}</li>
                )
            }
        }
        return <div>
            <h3>Ongoing Polls</h3>
            <ul>{pollsOngoing}</ul>
            <h3>Completed Polls</h3>
            <ul>{pollsDone}</ul>
        </div>
        
    }
  }

  doPollClick = (evt: MouseEvent<HTMLAnchorElement>, name: string) : void => {
    evt.preventDefault()
    this.props.onPollClick(name)
  }

  doNewClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
    this.props.onNewClick()
  }

  doRefreshClick = (): void => {
    fetch("/api/list").then(this.doListResp)
        .catch(() => this.doListError("failed to connect to server"));
  }

  doListResp = (resp: Response): void => {
    if (resp.status === 200) {
      resp.json().then(this.doListJson)
          .catch(() => this.doListError("200 response is not JSON"));
    } else if (resp.status === 400) {
      resp.text().then(this.doListError)
          .catch(() => this.doListError("400 response is not text"));
    } else {
      this.doListError(`bad status code from /api/list: ${resp.status}`);
    }
  };

  doListJson = (data: unknown): void => {
    if (!isRecord(data)) {
      console.error("bad data from /api/list: not a record", data);
      return;
    }
    if (!Array.isArray(data.polls)) {
      console.error("bad data from /api/list: polls is not an array", data);
      return;
    }
    const polls: PollInfo[] = [];
    for (const val of data.polls) {
      if(typeof val.name !== 'string' || typeof val.endTime !== 'number'){
        console.error("bad data from /api/list: not a valid entry", val);
        return;
      }
      const poll : PollInfo = {name: val.name, endTime: val.endTime}
      polls.push(poll)
    }
    this.setState({polls: polls, now: Date.now()});
  }

  doListError = (msg: string): void => {
    console.error(`Error fetching /api/list: ${msg}`);
  };
}