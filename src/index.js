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


document.addEventListener("DOMContentLoaded", () => {
    const notesLayout = document.querySelector(".notes__layout");

    // Initialize Sortable.js for drag-and-drop reordering
    new Sortable(notesLayout, {
        animation: 500,  // Smooth animation
        ghostClass: "dragging", // Class applied when dragging
        onEnd: function (evt) {
            console.log("Item moved from index", evt.oldIndex, "to", evt.newIndex);
            saveNewOrder();
        }
    });

    function saveNewOrder() {
        const notes = [...notesLayout.children].map(note => note.dataset.id); // Assuming each note has a `data-id`
        localStorage.setItem("noteOrder", JSON.stringify(notes)); // Save order to localStorage
    }

    function restoreOrder() {
        const savedOrder = JSON.parse(localStorage.getItem("noteOrder"));
        if (savedOrder) {
            const fragment = document.createDocumentFragment();
            savedOrder.forEach(id => {
                const note = notesLayout.querySelector(`[data-id='${id}']`);
                if (note) fragment.appendChild(note);
            });
            notesLayout.appendChild(fragment);
        }
    }

    restoreOrder(); // Restore order on page load
});

document.getElementById('notes-section').addEventListener('click', () => noteSectionInitialization());

document.getElementById('trash-section').addEventListener('click', () => trashSectionInitialization());

async function crudInitializer() {
    document.querySelector("#createNote").addEventListener("click", crud.createNote);
    document.querySelector("#createNoteButton").addEventListener("click", crud.createNoteButton);
    document.getElementById("topmenu_bar").addEventListener("input", (event) => debounceSearch(event.target.value));
    document.getElementById("refresh").addEventListener("click", crud.doRefresh);
    noteUI();
    // await noteSectionInitialization();
}
async function noteSectionInitialization() {
    noteUI();
    // crudInitializer();
    await crud.renderNotes();
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
