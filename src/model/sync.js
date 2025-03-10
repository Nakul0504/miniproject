import { SERVER_URL } from '../../mocks/handlers';
import * as Server from '../model/crud.js';


export default async function syncNotesToServer() {
    let syncQueue = JSON.parse(localStorage.getItem("syncQueue")) || [];

    if (syncQueue.length === 0) return; // Stop recursion when no notes are left
    // syncQueue.forEach(request => {
    //     console.log("syncing to server...")
    //     let {id,title,text,isPinned} = request;
    //     console.log(`${request} is syncing now ...`);
    //     Server.addToServer({'id':id,'title':title,'text':text,'isPinned':isPinned});
    // });
    console.log('Syncing the data to Server ....')
    try {
        const response = await fetch(`${SERVER_URL}/notes/sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notes: syncQueue }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("After Sync successful Notes are :", data.notes);

            // Update local storage with latest server notes
            localStorage.setItem("syncQueue", JSON.stringify(data.notes));
        } else {
            console.error("Failed to sync notes:", response.status);
        }
    } catch (error) {
        console.error("Error syncing notes:", error);
    }
}