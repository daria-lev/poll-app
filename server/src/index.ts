import express, { Express } from "express";
import { save, get, list, vote } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.post("/api/save", save);  // TODO: REMOVE
app.get("/api/get", get);
app.get("/api/list", list);
app.post("/api/vote", vote);
app.listen(port, () => console.log(`Server listening on ${port}`));
