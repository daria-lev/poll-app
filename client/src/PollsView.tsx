import React, { ChangeEvent, Component, MouseEvent } from 'react';
import { Poll, countVotes, parsePoll} from './poll';
import { isRecord } from './record';

type ViewProps = {
    onBackClick: () => void,
    name: string
}

type ViewState = {
    poll: Poll|undefined
    now: number
    voterName: string
    error: string
    selected: string|undefined
}

export class PollsView extends Component<ViewProps, ViewState> {
    constructor(props: ViewProps) {
      super(props);
      this.state = {poll: undefined, now: Date.now(), voterName: "", error: "", selected: undefined};
    //   this.state = {poll: {name: "testing", endTime: Date.now()+1*60*1000,
    //             options: ["cat", "fish"], voters: ["dog", "beast"], votes: ["fish", "cat"]}, 
    //         now: Date.now(), voterName: "", error: "", selected: undefined} //TEMP
    }

    componentDidMount = (): void => {
        this.doRefreshClick()
    }

    render = (): JSX.Element => {
        if(this.state.poll === undefined){
            return <p>Loading poll...</p>
        } else if (this.state.now < this.state.poll.endTime){
            return <div>
                <h2>{this.state.poll.name}</h2>
                {this.renderOngoing()}
                {this.renderError()}
            </div>
        } else{
            return <div>
                <h2>{this.state.poll.name}</h2>
                {this.renderCompleted()}
                {this.renderError()}
            </div>
        }
        
    }

    renderError = (): JSX.Element => {
        return <p color='red'>{this.state.error}</p>
    }

    renderOngoing = (): JSX.Element => {
        if(this.state.poll === undefined){
            console.log("impossible")
            return <p>Something went wrong.</p>
        }
        const timeLeft = (this.state.poll.endTime - this.state.now) / 60 / 1000;
        return <div>
            <p>{Math.round(timeLeft*10)/10} minutes remaining...</p>
            <ul>{this.renderRadio()}</ul>
            <div>
                <label htmlFor="voterName">Your Name:</label>
                <input id="voterName" value={this.state.voterName}
                    onChange={this.doNameChange}></input>
            </div>
            <button type="button" onClick={this.doBackClick}>Back</button>
            <button type="button" onClick={this.doRefreshClick}>Refresh</button>
            <button type="button" onClick={this.doVoteClick}>Vote</button>
        </div>
    }

    renderRadio = ():JSX.Element[] => {
        if(this.state.poll === undefined){
            console.log("impossible")
            return [<p>Something went wrong again.</p>]
        }
        const buttons : JSX.Element[] = []
        for (const option of this.state.poll.options) {
            buttons.push(<div key={option}>
                <input type="radio" id={option} name="item" value={option}
                onChange={this.doPollClick} checked={option === this.state.selected}/>
                <label htmlFor={option}>{option}</label>
            </div>)
        }
        return buttons
    }

    renderCompleted = ():JSX.Element => {
        if(this.state.poll === undefined){
            console.log("impossible")
            return <p>Something went wrong.</p>
        }
        const timeLeft = (this.state.now - this.state.poll.endTime) / 60 / 1000;
        return <div>
            <p>Finished {Math.round(timeLeft*10)/10} minutes ago.</p>
            <ul>{this.renderVotes()}</ul>
            <button type="button" onClick={this.doBackClick}>Back</button>
            <button type="button" onClick={this.doRefreshClick}>Refresh</button>
        </div>
    }

    renderVotes = ():JSX.Element[] => {
        if(this.state.poll === undefined){
            console.log("impossible")
            return [<p>Something went wrong again.</p>]
        } 
        const results : JSX.Element[] = []
        const votesCounted = countVotes(this.state.poll.votes)
        const totalVotes = this.state.poll.votes.length
        
        for (const option of this.state.poll.options) {
            const numVotes = votesCounted.get(option)
            if(numVotes === undefined){
                results.push(<li key={option}>
                    <p>{option} - 0%</p> 
                </li>)
            } else{
                const percent = numVotes/totalVotes * 100
                results.push(<li key={option}>
                    <p>{option} - {Math.round(percent*10)/10}%</p> 
                </li>)
            }
        }
        return results
    }

    doNameChange = (evt: ChangeEvent<HTMLInputElement>) : void =>{
        this.setState({error: "", voterName: evt.target.value})
    }

    doPollClick = (evt: ChangeEvent<HTMLInputElement>): void => {
        this.setState({selected: evt.target.value})
    }

    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBackClick()
    }

    doRefreshClick = (): void => {
        const args = this.props.name
        const url = "/api/get?" + "name=" + encodeURIComponent(args)
        fetch(url)
        .then(this.doGetResp)
        .catch(() => this.doGetError("failed to connect to server"));
    };

    doGetResp = (res: Response): void => {
        if (res.status === 200) {
        res.json().then(this.doGetJson)
            .catch(() => this.doGetError("200 res is not JSON"));
        } else if (res.status === 400) {
        res.text().then(this.doGetError)
            .catch(() => this.doGetError("400 response is not text"));
        } else {
        this.doGetError(`bad status code from /api/get: ${res.status}`);
        }
    };

    doGetJson = (data: unknown): void => {
        if (!isRecord(data)) {
            console.error("bad data from /api/get: not a record", data);
            return;
        }
        const myPoll = parsePoll(data.poll)
        if(myPoll === undefined){
            console.error("bad data from /api/get: not a poll", data);
            return;
        }
        this.setState({now: Date.now(), poll: myPoll})
    }

    doGetError = (msg: string): void => {
        console.error(`Error fetching /api/get: ${msg}`);
      };

    doVoteClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        if(this.state.voterName === ""){
            this.setState({now: Date.now(), error: "Please input a name."})
        } else{
            if(this.state.poll === undefined){
                console.log("should be impossible")
                return
            }else{
                const args = {name: this.state.poll.name, option: this.state.selected, 
                    voterName: this.state.voterName}
                fetch("/api/vote", {
                        method: "POST", body: JSON.stringify(args),
                        headers: {"Content-Type": "application/json"} })
                    .then(this.doVoteResp)
                    .catch(() => this.doVoteError("failed to connect to server"))
            }
        }
    }

    doVoteResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doVoteJson)
              .catch(() => this.doVoteError("200 response is not JSON"));
        } else if (resp.status === 400) {
          resp.text().then(this.doVoteError)
              .catch(() => this.doVoteError("400 response is not text"));
        } else {
          this.doVoteError(`bad status code from /api/vote: ${resp.status}`);
        }
      };
    
      doVoteJson = (data: unknown): void => {
        if (!isRecord(data)) {
          console.error("bad data from /api/vote: not a record", data);
          return;
        } 
        const myPoll = parsePoll(data.poll)
        if(myPoll === undefined){
            console.error("bad data from /api/vote: not a poll", data);
            return;
        }
        const youVoted : string = "Recorded vote of '" + this.state.selected + "' from " + this.state.voterName
        this.setState({poll: myPoll, now: Date.now(), selected: undefined, voterName: "", error: youVoted})
      };
    
      doVoteError = (msg: string): void => {
        console.log(msg)
      };
}