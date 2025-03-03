import { SERVER_URL } from '../../mocks/handlers';
import * as Server from '../model/crud.js';


export default async function syncNotesToServer(){
    let syncQueue = JSON.parse(localStorage.getItem("syncQueue")) || [];

    if (syncQueue.length === 0) return; // Stop recursion when no notes are left
    syncQueue.forEach(request => {
        console.log("syncing to server...")
        let {id,title,text,isPinned} = request;
        console.log(`${request} is syncing now ...`);
        Server.addToServer({'id':id,'title':title,'text':text,'isPinned':isPinned});
    });
    localStorage.setItem("syncQueue", JSON.stringify([]));
}