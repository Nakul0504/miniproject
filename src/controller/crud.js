import { addToServer, getFromServer, fetchNote, patchToServer } from '../model/serverInterface';
import { quillInstance } from '../index'

// DOM element selectors
const popupContainer = document.getElementById('popupContainer');
const popupOverlay = document.getElementById('popupOverlay');
const closeBtn = document.querySelector('.close-btn');
const noteTitle = document.getElementById('notetitle');
const notedescrp = document.getElementById('notedescription');
const editPoppup = document.getElementById('popupContainer-edit');
const notesTitlePinned = document.querySelector('.notes__title--pinned');
const notesTitle = document.querySelector('.notes__title');
const notesLayout = document.querySelector('.notes__layout');
const notesPinned = document.querySelector('.notes__pinned');
const topMenuBar = document.querySelector('.topmenu__bar');
const notesContainer = document.querySelector('.notes');

export function createNote(event) {
    popupContainer.classList.remove('hide');
    popupOverlay.classList.remove('hide');
    closeBtn.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', closePopup);
}
function closePopup() {
    popupContainer.classList.add('hide');
    popupOverlay.classList.add('hide');
    noteTitle.value = '';
    notedescrp.value = '';
    editPoppup.classList.add('hide');
}
export async function createNoteButton(event) {
    try {
        const title = noteTitle.value.trim();
        noteTitle.value = '';
        const description = notedescrp.value.trim();
        notedescrp.value = '';

        if (title === '' && description === '') {
            alert('! At least provide either Title or Description');
            return;
        }
        await addToServer({
            title,
            text: description,
            isPinned: false,
            isDeleted: false
        });
        await renderNotes();
        closePopup();

    } catch (error) {
        console.error('Error in createNoteButton:', error);
        alert('An error occurred while creating the note. Please try again.');
    }
}

export async function doRefresh() {
    if (notesTitlePinned) {
        notesTitlePinned.classList.add('hide');
    }
    if (notesTitle) {
        notesTitle.classList.add('hide');
    }

    notesLayout.innerHTML = '';
    notesPinned.innerHTML = '';
    await renderNotes();
    topMenuBar.value = '';
}
export async function renderNotes() {
    try {
        const allNotes = await getFromServer();
        notesLayout.innerHTML = '';
        notesPinned.innerHTML = '';

        allNotes.forEach(note => {
            // Create Note Container
            if (note.isDeleted === false) {
                const noteDiv = document.createElement('div');
                noteDiv.classList.add('note', 'draggable');
                noteDiv.setAttribute('draggable', 'true');
                noteDiv.setAttribute('id', note.id); // Assign note ID

                // Content Container
                const noteContent = document.createElement('div');
                noteContent.classList.add('note__content');

                // Title
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('note__title');
                titleDiv.textContent = note.title;

                // Pin button
                const pinBtn = document.createElement('button');
                pinBtn.classList.add('note__btn--pin');
                pinBtn.setAttribute('data-id', note.id);
                pinBtn.setAttribute('title', 'Pin note');

                // Pin Icon
                const pinIcon = document.createElement('i');
                pinIcon.classList.add('fa', 'fa-thumb-tack');
                pinIcon.setAttribute('aria-hidden', 'true');
                pinIcon.setAttribute('alt', 'Pin');
                pinBtn.appendChild(pinIcon);
                pinBtn.onclick = () => callingPin(note.id);
                titleDiv.appendChild(pinBtn);
                noteContent.appendChild(titleDiv);

                // Text
                const textDiv = document.createElement('div');
                textDiv.classList.add('note__text');
                textDiv.innerHTML = note.text;
                noteContent.appendChild(textDiv);
                noteDiv.appendChild(noteContent);

                // Options Container
                const optnDiv = document.createElement('div');
                optnDiv.classList.add('note__optn');

                // Delete Button
                const deleteBtn = document.createElement('button');
                deleteBtn.setAttribute('data-id', note.id);
                deleteBtn.setAttribute('title', 'Delete note');
                deleteBtn.classList.add('note__btn', 'note__delete-btn');
                deleteBtn.innerHTML = '<i class="fa fa-trash" aria-hidden="true"></i>';

                const editBtn = document.createElement('button');
                editBtn.classList.add('note__btn');
                editBtn.setAttribute('data-id', note.id);
                editBtn.setAttribute('title', 'Edit note');

                // Edit Icon
                editBtn.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
                editBtn.onclick = () => callingEdit(note.id);

                // View Button
                const viewBtn = document.createElement('button');
                viewBtn.classList.add('note__btn');
                viewBtn.setAttribute('data-id', note.id);
                viewBtn.setAttribute('title', 'View note');

                // View Icon
                viewBtn.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';
                viewBtn.onclick = () => callingView(note.id);

                optnDiv.appendChild(deleteBtn);
                optnDiv.appendChild(editBtn);
                optnDiv.appendChild(viewBtn);

                noteDiv.appendChild(optnDiv);
                if (note.isPinned === false) {
                    notesLayout.appendChild(noteDiv);
                } else {
                    notesPinned.appendChild(noteDiv);
                }
            }
        });

        if ((notesLayout.childElementCount != 0) && (notesPinned.childElementCount != 0)) {
            notesTitlePinned.classList.remove('hide');
            notesTitle.classList.remove('hide');
        }
        if ((notesLayout.childElementCount != 0) && (notesPinned.childElementCount == 0)) {
            notesTitlePinned.classList.add('hide');
            notesTitle.classList.add('hide');
        }
        if ((notesLayout.childElementCount == 0) && (notesPinned.childElementCount != 0)) {
            notesTitlePinned.classList.remove('hide');
            notesTitle.classList.add('hide');
        }
        notesContainer.addEventListener('click', async (event) => {
            if (event.target.closest('.note__delete-btn')) {
                await deleteNoteButton(event);
            }
        });
        dragAndDrop();
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}


export function dragAndDrop() {
    const draggables = document.querySelectorAll('.draggable');
    const layoutContainer = document.querySelector('.notes__layout');
    const pinnedContainer = document.querySelector('.notes__pinned');

    draggables.forEach((draggable) => {
        let originalContainer = null;
        let originalNextSibling = null;

        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
            originalContainer = draggable.parentElement;
            originalNextSibling = draggable.nextSibling;
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');

            if (draggable.parentElement !== originalContainer) {
                if (originalNextSibling) {
                    originalContainer.insertBefore(draggable, originalNextSibling);
                } else {
                    originalContainer.appendChild(draggable);
                }
            }
        });
    });

    [layoutContainer, pinnedContainer].forEach((container) => {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');

            if (draggable && container === draggable.parentElement) {
                const afterElement = getDragAfterElement(container, e.clientX, e.clientY);
                if (afterElement == null) {
                    container.appendChild(draggable);
                } else {
                    container.insertBefore(draggable, afterElement);
                }
            }
        });
    });

    function getDragAfterElement(container, x, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

        return draggableElements.reduce(
            (closest, child, index) => {
                const box = child.getBoundingClientRect();
                const nextBox = draggableElements[index + 1] && draggableElements[index + 1].getBoundingClientRect();
                const inRow = y - box.bottom <= 0 && y - box.top >= 0;
                const offset = x - (box.left + box.width / 2);
                if (inRow) {
                    if (offset < 0 && offset > closest.offset) {
                        return { offset, element: child };
                    } else {
                        if (
                            nextBox &&
                            y - nextBox.top <= 0 &&
                            closest.offset === Number.NEGATIVE_INFINITY
                        ) {
                            return { offset: 0, element: draggableElements[index + 1] };
                        }
                        return closest;
                    }
                } else {
                    return closest;
                }
            },
            { offset: Number.NEGATIVE_INFINITY }
        ).element;
    }
}

async function callingPin(noteId) {
    //fetching here
    const noteDetail = await fetchNote(noteId);
    const noteToBePinned = document.getElementById(noteId);
    const pinnedContainer = document.querySelector('.notes__pinned');
    const layoutContainer = document.querySelector('.notes__layout');

    if (noteDetail.isPinned === false) {
        if (noteToBePinned && pinnedContainer && layoutContainer) {
            if (pinnedContainer.childElementCount == 0) {
                document.querySelector('.notes__title').classList.remove('hide');
                document.querySelector('.notes__title--pinned').classList.remove('hide');
            }
            if (layoutContainer.childElementCount == 1) {
                document.querySelector('.notes__title').classList.add('hide');
                document.querySelector('.notes__title--pinned').classList.remove('hide');
            }
            patchToServer(noteId, { 'isPinned': true });
            document.querySelector('.notes__pinned').classList.remove('hide');
            pinnedContainer.appendChild(noteToBePinned);
        } else {
            alert('Element not found!');
        }
    }
    else {
        if (noteToBePinned && pinnedContainer && layoutContainer) {
            if (layoutContainer.childElementCount == 0) {
                document.querySelector('.notes__title').classList.remove('hide');
            }
            if (pinnedContainer.childElementCount == 1) {
                document.querySelector('.notes__title--pinned').classList.add('hide');
                document.querySelector('.notes__title').classList.add('hide');
            }
            patchToServer(noteId, { 'isPinned': false });
            document.querySelector('.notes__layout').classList.remove('hide');
            layoutContainer.appendChild(noteToBePinned);
        } else {
            alert('Element not found!');
        }
    }

}

export function callingEdit(noteId) {
    const noteElement = document.getElementById(noteId);
    const popupContainer = document.getElementById("popupContainer-edit");
    document.getElementById("notetitle-edit").value = noteElement.querySelector(".note__title").textContent;
    const noteText = noteElement.querySelector(".note__text").innerHTML;
    quillInstance.root.innerHTML = noteText;
    popupContainer.setAttribute("data-id", noteId);
    popupContainer.classList.remove('hide');
    const closeBtn = popupContainer.querySelector(".close-btn");
    closeBtn.onclick = () => {
        popupContainer.classList.add('hide')
    };
    document.getElementById("editNoteButton").onclick = editNoteButton;
}

export async function editNoteButton(event) {
    const title = document.getElementById("notetitle-edit").value.trim();
    const description = quillInstance.root.innerHTML.trim();

    if (title === "" && description === "") {
        alert("At least provide either Title or Description!");
        return;
    }

    const noteId = event.target.closest(".popup").getAttribute("data-id");
    await patchToServer(noteId, { id: noteId, title: title, text: description });
    await renderNotes();
    closePopup();
}

export async function deleteNoteButton(event) {
    event.stopPropagation();
    if (event.target.dataset.processing) return;
    event.target.dataset.processing = true;

    const deleteBtn = event.target.closest('.note__delete-btn');
    if (!deleteBtn) return;

    const noteId = deleteBtn.getAttribute('data-id');

    const noteElement = document.getElementById(noteId);
    if (!noteElement) {
        console.error('Error: Note element not found!');
        return;
    }
    const title = noteElement.querySelector('.note__title').textContent;
    const text = noteElement.querySelector('.note__text').textContent;
    if (!confirm(`Are you sure to delete the Note with Title:${title} ?`)) {
        return;
    }
    try {
        patchToServer(noteId, { 'id': noteId, 'title': title, 'text': text, 'isPinned': false, 'isDeleted': true });
        const resp = await getFromServer();
        await renderNotes();
    } catch (error) {
        console.error('Error in deleteNoteButton:', error);
    } finally {
        delete event.target.dataset.processing;
    }
}
function callingView(noteId) {
    const noteElement = document.getElementById(noteId);
    const popupContainer = editPoppup;
    document.getElementById('notetitle-edit').value = noteElement.querySelector('.note__title').textContent;
    document.getElementById('notedescription-edit').value = noteElement.querySelector('.note__text').textContent;
    document.getElementById('notetitle-edit').setAttribute('readonly', true);
    document.getElementById('notedescription-edit').setAttribute('readonly', true);
    document.getElementById('editNoteButton').classList.add('hide');
    popupContainer.setAttribute('data-id', noteId);
    popupContainer.classList.remove('hide');
    const closeBtn = popupContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.classList.add('hide');
        document.getElementById('notetitle-edit').removeAttribute('readonly');
        document.getElementById('notedescription-edit').removeAttribute('readonly');
        document.getElementById('editNoteButton').classList.remove('hide');
    });
}