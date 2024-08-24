import React, { Component} from "react";
import { PollsList } from "./PollsList";
import {PollsNew} from "./PollsNew";
import { PollsView } from "./PollsView";
//import { isRecord } from './record';


// TODO: When you're ready to get started, you can remove all the code below and
// start with this blank application:
//

type Page = "list"|"new"|{kind:"poll", name:string}

type PollsAppState = {
  page: Page
}

const DEBUG : boolean = true

/** Displays the UI of the Polls application. */
export class PollsApp extends Component<{}, PollsAppState> {

  constructor(props: {}) {
    super(props);
    this.state = {page: "list"};
  }
  
  render = (): JSX.Element => {
    if(this.state.page === "list"){
      if(DEBUG) console.log("rendering list")
      return <PollsList onNewClick={this.doNewClick} onPollClick={this.doPollClick}></PollsList>
    } else if(this.state.page === "new"){
      if(DEBUG) console.log("rendering new")
      return <PollsNew onBackClick={this.doBackClick}/>
    }else{
      if(DEBUG) console.log("rendering poll")
      return <PollsView onBackClick={this.doBackClick} name={this.state.page.name}></PollsView>
    }

  };

  doNewClick = ():void => {
    this.setState({page: "new"})
  }

  doBackClick = ():void => {
    this.setState({page: "list"})
  }

  doPollClick = (name: string):void => {
    this.setState({page: {kind: "poll", name: name}})
  }
}


// type PollsAppState = {
//   name: string;  // mirror state of name input box
//   msg: string;   // essage sent from server
// }


// /** Displays the UI of the Polls application. */
// export class PollsApp extends Component<{}, PollsAppState> {

//   constructor(props: {}) {
//     super(props);

//     this.state = {name: "", msg: ""};
//   }
  
//   render = (): JSX.Element => {
//     return (<div>
//         <div>
//           <label htmlFor="name">Name:</label>
//           <input type="text" id="name" value={this.state.name}
//                  onChange={this.doNameChange}></input>
//           <button onClick={this.doDummyClick}>Dummy</button>
//         </div>
//         {this.renderMessage()}
//       </div>);
//   };

//   renderMessage = (): JSX.Element => {
//     if (this.state.msg === "") {
//       return <div></div>;
//     } else {
//       return <p>Server says: {this.state.msg}</p>;
//     }
//   };

//   doNameChange = (evt: ChangeEvent<HTMLInputElement>): void => {
//     this.setState({name: evt.target.value, msg: ""});
//   };

//   doDummyClick = (_evt: MouseEvent<HTMLButtonElement>): void => {
//     const name = this.state.name.trim();
//     if (name.length > 0) {
//       const url = "/api/dummy?name=" + encodeURIComponent(name);
//       fetch(url).then(this.doDummyResp)
//           .catch(() => this.doDummyError("failed to connect to server"));
//     }
//   };

//   doDummyResp = (res: Response): void => {
//     if (res.status === 200) {
//       res.json().then(this.doDummyJson)
//           .catch(() => this.doDummyError("200 response is not JSON"));
//     } else if (res.status === 400) {
//       res.text().then(this.doDummyError)
//           .catch(() => this.doDummyError("400 response is not text"));
//     } else {
//       this.doDummyError(`bad stauts code ${res.status}`);
//     }
//   };

//   doDummyJson = (data: unknown): void => {
//     if (!isRecord(data)) {
//       console.error("200 response is not a record", data);
//       return;
//     }

//     if (typeof data.msg !== "string") {
//       console.error("'msg' field of 200 response is not a string", data.msg);
//       return;
//     }

//     this.setState({msg: data.msg});
//   }

//   doDummyError = (msg: string): void => {
//     console.error(`Error fetching /api/dummy: ${msg}`);
//   };

