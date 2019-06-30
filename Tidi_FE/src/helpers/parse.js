import Parse from "parse";
import { environment } from "../config/constants";

Parse.initialize(environment.PARSE_APP_ID, environment.PARSE_JS_KEY);
Parse.serverURL = environment.serverURL;
Parse.liveQueryServerURL = environment.liveQueryServerURL;

const client = new Parse.LiveQueryClient({
    applicationId: environment.PARSE_APP_ID,
    serverURL: environment.liveQueryServerURL, // Example: 'wss://livequerytutorial.back4app.io'
    javascriptKey: environment.PARSE_JS_KEY,
    masterKey: environment.masterKey
});
client.open();

export { client, Parse };
