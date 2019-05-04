import Parse from "parse";
import { environment } from "../config/constants";
// Parse.initialize("1V73PQUeskvatsPQazkKEEQdbVsQ5lsKb77UHoQI", "iDKJ337CYJ80XjUOy8SIp2WTtPq0q56154kadxaO"); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
// Parse.serverURL = "https://parseapi.back4app.com/";

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
