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
const notesTitle = document.querySelector('.notes__title--notes');
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
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
export async function createNoteButton(event) {
    try {
        const title = noteTitle.value.trim();
        noteTitle.value = '';
        const description = notedescrp.value.trim();
        notedescrp.value = '';

        if (title === '' && description === '') {
            showToast('Please provide either a title or description!', 'error');
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
        showToast('Note created successfully!', 'success');
    } catch (error) {
        console.error('Error in createNoteButton:', error);
        showToast('An error occurred while creating the note. Please try again.', 'error');
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
                editBtn.classList.add('note__btn', 'note__edit-btn');
                editBtn.setAttribute('data-id', note.id);
                editBtn.setAttribute('title', 'Edit note');
                editBtn.innerHTML = '<i class="fa fa-pencil" aria-hidden="true"></i>';
                editBtn.onclick = () => callingEdit(note.id);

                // View Button
                const viewBtn = document.createElement('button');
                viewBtn.classList.add('note__btn', 'note__view-btn');
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
            const deleteBtn = event.target.closest('.note__delete-btn');
            if (!deleteBtn) return;
            const isInTrash = deleteBtn.closest('.notes__trash');
            if (isInTrash) return;

            await deleteNoteButton(event);
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
                notesTitle.classList.remove('hide');
                notesTitlePinned.classList.remove('hide');
            }
            if (layoutContainer.childElementCount == 1) {
                notesTitle.classList.add('hide');
                notesTitlePinned.classList.remove('hide');
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
                notesTitle.classList.remove('hide');
            }
            if (pinnedContainer.childElementCount == 1) {
                notesTitlePinned.classList.add('hide');
                notesTitle.classList.add('hide');
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
    popupOverlay.classList.remove('hide');
    const noteElement = document.getElementById(noteId);
    const popupContainer = document.getElementById("popupContainer-edit");
    document.getElementById("notetitle-edit").value = noteElement.querySelector(".note__title").textContent;
    const noteText = noteElement.querySelector(".note__text").innerHTML;
    quillInstance.root.innerHTML = noteText;
    popupContainer.setAttribute("data-id", noteId);
    popupContainer.classList.remove('hide');
    const closeBtn = popupContainer.querySelector(".close-btn");
    closeBtn.onclick = () => {
        popupContainer.classList.add('hide');
        popupOverlay.classList.add('hide');
    };
    document.getElementById("editNoteButton").onclick = editNoteButton;
}

export async function editNoteButton(event) {
    const title = document.getElementById("notetitle-edit").value.trim();
    const description = quillInstance.root.innerHTML.trim();

    if (title === "" && description === "") {
        showToast("Please provide either a title or description!", "error");
        return;
    }

    const noteId = event.target.closest(".popup").getAttribute("data-id");
    try {
        await patchToServer(noteId, { id: noteId, title: title, text: description });
        await renderNotes();
        closePopup();
        showToast("Note updated successfully!", "success");
    } catch (error) {
        console.error("Error in editNoteButton:", error);
        showToast("An error occurred while updating the note. Please try again.", "error");
    }
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

    if (!confirm(`Are you sure to delete the Note with Title: ${title}?`)) {
        return;
    }
    try {
        await patchToServer(noteId, { id: noteId, title: title, text: text, isPinned: false, isDeleted: true });
        await renderNotes();
        showToast('Note deleted successfully!', 'success');
    } catch (error) {
        console.error('Error in deleteNoteButton:', error);
        showToast('An error occurred while deleting the note. Please try again.', 'error');
    } finally {
        delete event.target.dataset.processing;
    }
}
function callingView(noteId) {
    popupOverlay.classList.remove('hide');
    const noteElement = document.getElementById(noteId);
    const title = document.getElementById('notetitle-edit');
    const descrp = document.getElementById('notedescription-edit');
    const popupContainer = editPoppup;
    title.value = noteElement.querySelector('.note__title').textContent;
    descrp.value = noteElement.querySelector('.note__text').textContent;
    title.setAttribute('readonly', true);
    descrp.setAttribute('readonly', true);
    document.getElementById('editNoteButton').classList.add('hide');
    popupContainer.setAttribute('data-id', noteId);
    popupContainer.classList.remove('hide');
    const closeBtn = popupContainer.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        popupContainer.classList.add('hide');
        title.removeAttribute('readonly');
        descrp.removeAttribute('readonly');
        document.getElementById('editNoteButton').classList.remove('hide');
        popupOverlay.classList.add('hide');
    });
}