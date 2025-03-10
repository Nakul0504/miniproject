import { SERVER_URL } from '../mocks/handlers';
import { worker } from '../mocks/server.js';
import * as crud from './controller/crud.js';
import debounceSearch from './controller/searchManager.js';
import syncNotesToServer from './model/sync.js';
import * as trashController from './controller/trash.js';

let state = false;
if (window.Worker) {
    const onlineStatusWorker = new Worker(new URL('./onlineStatusWorker.js', import.meta.url));
    onlineStatusWorker.onmessage = function (event) {
        if (event.data === "online") {
            if (state === false) {
                console.log("Now online - Syncing notes...");
                syncNotesToServer();
                state = true;
            }
        } else {
            console.log("Now offline");
            state = false;
        }
    };
} else {
    console.error("Web Workers are not supported in this browser.");
}
document.addEventListener('DOMContentLoaded', () => {
    localStorage.setItem('syncQueue', JSON.stringify([]));
})
document.getElementById('notes-section').addEventListener('click', () => noteSectionInitialization());

document.getElementById('trash-section').addEventListener('click', () => trashSectionInitialization());

async function crudInitializer() {
    document.querySelector("#createNote").addEventListener("click", crud.createNote);
    document.querySelector("#createNoteButton").addEventListener("click", crud.createNoteButton);
    document.getElementById("topmenu_bar").addEventListener("input", (event) => debounceSearch(event.target.value));
    document.getElementById("refresh").addEventListener("click", crud.doRefresh);
    noteUI();
}
async function noteSectionInitialization() {
    noteUI();
    await crud.renderNotes();
    crud.dragAndDrop();
}
function noteUI() {
    document.querySelector('.notes__create').classList.remove('no-display');
    document.querySelector('.notes__title--pinned').classList.add('no-display');
    document.querySelector('.notes__pinned').classList.add('no-display');
    document.querySelector('.notes__title').classList.add('no-display');
    document.querySelector('.notes__layout').classList.remove('no-display');
    document.querySelector('.notes__title--trash').classList.add('no-display');
    document.querySelector('.notes__trash').classList.add('no-display');
}

async function trashSectionInitialization() {
    document.querySelector('.notes__create').classList.add('no-display');
    document.querySelector('.notes__title--pinned').classList.add('no-display');
    document.querySelector('.notes__pinned').classList.add('no-display');
    document.querySelector('.notes__title').classList.add('no-display');
    document.querySelector('.notes__layout').classList.add('no-display');
    document.querySelector('.notes__title--trash').classList.remove('no-display');
    document.querySelector('.notes__trash').classList.remove('no-display');
    await trashController.initialize();
}
crudInitializer();
enableMocking().then(() => console.log("Mocking enabled!"));

async function enableMocking() {
    return worker.start();
}
