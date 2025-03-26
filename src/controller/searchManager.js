let throttleTimeout = false;
let lastExecutionTime = 0;
const throttleDelay = 500;

export default async function throttleSearch(query) {
    const pinDiv = document.querySelector('.notes__pinned');
    const noteDiv = document.querySelector('.notes__layout');
    const pinChildDivs = pinDiv.querySelectorAll('div');
    const noteChildDivs = noteDiv.querySelectorAll('div');

    const noteIds = initialWork(pinChildDivs, noteChildDivs);

    const currentTime = Date.now();
    if (throttleTimeout) return;

    if (currentTime - lastExecutionTime >= throttleDelay) {
        executeSearch(query, noteIds);
        lastExecutionTime = currentTime;
    } else {
        throttleTimeout = true;
        setTimeout(() => {
            executeSearch(query, noteIds);
            lastExecutionTime = Date.now();
            throttleTimeout = false;
        }, throttleDelay - (currentTime - lastExecutionTime));
    }
}

function executeSearch(query, noteIds) {
    const results = noteIds.filter(id => filterNote(query, id));
    filterNoteDisplay(results);
}

function filterNote(query, id) {
    const parent = document.getElementById(id);
    if (!parent) return false;

    const title = parent.querySelector('.note__title')?.textContent.trim().toLowerCase() || '';
    const content = parent.querySelector('.note__text')?.textContent.trim().toLowerCase() || '';

    query = query.toLowerCase();

    return title.includes(query) || content.includes(query);
}

function initialWork(pinChildDivs, noteChildDivs) {
    let childIds = [];
    const pinChildIds = Array.from(pinChildDivs).map(child => child.id);
    childIds.push(...pinChildIds);
    const noteChildIds = Array.from(noteChildDivs).map(child => child.id);
    childIds.push(...noteChildIds);
    childIds = childIds.filter(item => item !== '');

    childIds.forEach(id => {
        const note = document.getElementById(id);
        note.classList.add('hide');
    });
    return childIds;
}

function filterNoteDisplay(notesid) {
    notesid.forEach(id => {
        const note = document.getElementById(id);
        note.classList.remove('hide');
    });
}
