import React, { ChangeEvent, Component, MouseEvent } from 'react';
import { isRecord } from './record';
import { parsePoll } from './poll';
//import { Poll} from './poll';

type NewProps = {
    onBackClick: () => void,
  };
  
  type NewState = {
    name: string
    time: string
    options: string
    error: string
  };
  
  
  // Shows the list of all the auctions.
  export class PollsNew extends Component<NewProps, NewState> {
    constructor(props: NewProps) {
      super(props);
      this.state = {name: "", time: "", options: "", error: ""};
    }

    render = (): JSX.Element => {
        return <div>
            <h2>New Poll</h2>
            <div>
                <label htmlFor="name">Question to ask:</label>
                <input id="name" value={this.state.name}
                    onChange={this.doNameChange}></input>
            </div>
            <div>
                <label htmlFor="num">Length of time:</label>
                <input id="num" type="number" min={1} value={this.state.time}
                    onChange={this.doTimeChange}></input>
            </div>
            <div>
                <label htmlFor="textbox">Enter text:</label>
                <br/>
                <textarea id="textbox" rows={3} cols={40} value={this.state.options}
                    onChange={this.doOptionsChange}></textarea>
            </div>
            <button type="button" onClick={this.doBackClick}>Back</button>
            <button type="button" onClick={this.doSubmitClick}>Submit</button>
            {this.renderError()}
        </div>
    }

    renderError = (): JSX.Element => {
        return <p color='red'>{this.state.error}</p>
    }

    doBackClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        this.props.onBackClick()
    }

    doSubmitClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
        //make sure there are enough, make sure they're all unique
        if (this.state.name.trim().length === 0 ||
                this.state.time.trim().length === 0 ||
                this.state.options.trim().length === 0) {
            this.setState({error: "Please fill out all fields."});
            return;
        }

        const length = parseInt(this.state.time)
        if(isNaN(length)||length <= 0){
            this.setState({error: "Not a valid length of time."})
            return
        }

        const optionList : string[] = this.state.options.split("\n")
        if(optionList.length < 2){
            this.setState({error: "Need at least 2 options to vote on."})
            return
        }
        const uniqueCheck = new Map<string, number>()
        for (const option of optionList) {
            if(option.trim().length === 0){
                this.setState({error: "Blank options not allowed."})
                return
            }
            uniqueCheck.set(option, 0)
        }
        if(uniqueCheck.size !== optionList.length){
            this.setState({error: "All options should be unique."})
            return
        }
        //call save route

        const args = { name: this.state.name,
            endTime: length, options: optionList};
        fetch("/api/save", {
            method: "POST", body: JSON.stringify(args),
            headers: {"Content-Type": "application/json"} })
          .then(this.doSaveResp)
          .catch(() => this.doSaveError("failed to connect to server"))
    }

    doSaveResp = (resp: Response): void => {
        if (resp.status === 200) {
          resp.json().then(this.doSaveJson)
              .catch(() => this.doSaveError("200 response is not JSON"));
        } else if (resp.status === 400) {
          resp.text().then(this.doSaveError)
              .catch(() => this.doSaveError("400 response is not text"));
        } else {
          this.doSaveError(`bad status code from /api/save: ${resp.status}`);
        }
      };
    
      doSaveJson = (data: unknown): void => {
        if (!isRecord(data)) {
          console.error("bad data from /api/save: not a record", data);
          return;
        } 
        //console.log("my data = " + data)
        //console.log("name received from save = " + data.name)
        const myPoll = parsePoll(data.poll)
        if(myPoll === undefined){
            console.error("bad data from /api/save: not a poll", data);
            return;
        }
        this.props.onBackClick();  //go back to main menu
      };
    
      doSaveError = (msg: string): void => {
        this.setState({error: msg})
      };

    doTimeChange = (evt: ChangeEvent<HTMLInputElement>) : void =>{
        this.setState({error: "", time: evt.target.value})
    }

    doNameChange = (evt: ChangeEvent<HTMLInputElement>) : void =>{
        this.setState({error: "", name: evt.target.value})
    }
    doOptionsChange = (evt: ChangeEvent<HTMLTextAreaElement>) : void =>{
        this.setState({error: "", options: evt.target.value})
    }
  }