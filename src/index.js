import { SERVER_URL } from '../mocks/handlers';
import { worker } from '../mocks/server.js';
import { createNote, createNoteButton, doRefresh, renderNotes, dragAndDrop } from './controller/crud.js';
import debounceSearch from './controller/searchManager.js';
import syncNotesToServer from './model/syncFunctionality.js';
import { initialize } from './controller/trash.js';

let state = false;
if (window.Worker) {
    const onlineStatusWorker = new Worker(new URL('./onlineStatusWorker.js', import.meta.url));
    onlineStatusWorker.onmessage = function (event) {
        if (event.data === 'online') {
            if (state === false) {
                syncNotesToServer();
                state = true;
            }
        } else {
            state = false;
        }
    };
} else {
    console.error('Web Workers are not supported in this browser.');
}

// DOM element selectors
const notesSection = document.getElementById('notes-section');
const trashSection = document.getElementById('trash-section');
const createNoteButtonElement = document.querySelector('#createNote');
const createNoteBtn = document.querySelector('#createNoteButton');
const topMenuBar = document.getElementById('topmenu__bar');
const refreshButton = document.getElementById('refresh');
const notesCreate = document.querySelector('.notes__create');
const notesTitlePinned = document.querySelector('.notes__title--pinned');
const notesPinned = document.querySelector('.notes__pinned');
const notesTitle = document.querySelector('.notes__title');
const notesLayout = document.querySelector('.notes__layout');
const notesTitleTrash = document.querySelector('.notes__title--trash');
const notesTrash = document.querySelector('.notes__trash');
localStorage.setItem('syncQueue', JSON.stringify([]));

// notesSection.addEventListener('click', () => noteSectionInitialization());
// trashSection.addEventListener('click', () => trashSectionInitialization());
notesSection.onclick = noteSectionInitialization;
trashSection.onclick = trashSectionInitialization;

async function crudInitializer() {
    createNoteButtonElement.addEventListener('click', createNote);
    createNoteBtn.addEventListener('click', createNoteButton);
    topMenuBar.addEventListener('input', (event) => debounceSearch(event.target.value));
    refreshButton.addEventListener('click', doRefresh);
    noteUI();
}

async function noteSectionInitialization() {
    noteUI();
    await renderNotes();
    dragAndDrop();
}

function noteUI() {
    notesCreate.classList.remove('hide');
    notesTitlePinned.classList.add('hide');
    notesPinned.classList.add('hide');
    notesTitle.classList.add('hide');
    notesLayout.classList.remove('hide');
    notesTitleTrash.classList.add('hide');
    notesTrash.classList.add('hide');
}

async function trashSectionInitialization() {
    notesCreate.classList.add('hide');
    notesTitlePinned.classList.add('hide');
    notesPinned.classList.add('hide');
    notesTitle.classList.add('hide');
    notesLayout.classList.add('hide');
    notesTitleTrash.classList.remove('hide');
    notesTrash.classList.remove('hide');
    await initialize();
}

crudInitializer();
enableMocking().then(() => console.log('Mocking enabled!'));

async function enableMocking() {
    return worker.start();
}

export let quillInstance;

quillInstance = new Quill("#notedescription-edit", {
    theme: "snow",
    placeholder: "Enter note here...",
});

export function getNoteContent() {
    if (quillInstance) {
        return quillInstance.root.innerHTML;
    } else {
        console.error("Quill is not initialized yet!");
        return "";
    }
}
