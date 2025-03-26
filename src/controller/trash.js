import { getFromServer, deleteFromServer, patchToServer } from '../model/serverInterface';

export async function initialize() {
    await renderTrashNotes();
}
async function renderTrashNotes() {
    try {
        const parent = document.querySelector('.notes__trash');

        const allNotes = await getFromServer();
        parent.innerHTML = '';

        allNotes.forEach(note => {
            if (note.isDeleted === true) {
                const noteDiv = document.createElement('div');
                noteDiv.classList.add('note');
                noteDiv.setAttribute('id', note.id);

                // Content Container
                const noteContent = document.createElement('div');
                noteContent.classList.add('note__content');

                // Title
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('note__title');
                titleDiv.textContent = note.title;
                noteContent.appendChild(titleDiv);

                // Text
                const textDiv = document.createElement('div');
                textDiv.classList.add('note__text');
                textDiv.textContent = note.text;
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
                deleteBtn.onclick = () => deleteTrashNoteButton(note.id, note.title);

                // Undo Button
                const undoBtn = document.createElement('button');
                undoBtn.setAttribute('data-id', note.id);
                undoBtn.setAttribute('title', 'restore note');
                undoBtn.classList.add('note__btn', 'note__restore-btn');
                undoBtn.innerHTML = '<i class="fa fa-undo" aria-hidden="true"></i>';
                undoBtn.onclick = () => callingRestore(note.id, note.title);

                // View Button
                const viewBtn = document.createElement('button');
                viewBtn.classList.add('note__btn');
                viewBtn.setAttribute('data-id', note.id);
                viewBtn.setAttribute('title', 'View note');
                viewBtn.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i>';

                viewBtn.onclick = () => callingView(note.id);

                optnDiv.classList.add('flex-display');
                optnDiv.appendChild(deleteBtn);
                optnDiv.appendChild(viewBtn);
                optnDiv.appendChild(undoBtn);

                noteDiv.appendChild(optnDiv);
                parent.appendChild(noteDiv);
            }
        });

    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}
export async function deleteTrashNoteButton(noteId, title) {
    const noteElement = document.getElementById(noteId);
    const retVal = confirm(`Do you want to permanently delete ${title}?`);
    if (retVal === true) {
        try {
            await deleteFromServer(noteId);
            await renderTrashNotes();
            showToast(`Note "${title}" permanently deleted!`, 'success');
        } catch (error) {
            console.error('Error deleting note:', error);
            showToast('An error occurred while deleting the note. Please try again.', 'error');
        }
    } else {
        showToast(`Deletion of note "${title}" canceled.`, 'info');
        return;
    }
}

function callingView(noteId) {
    const noteElement = document.getElementById(noteId);
    const popupContainer = document.getElementById('popupContainer-edit');
    const noteTitleEdit = document.getElementById('notetitle-edit');
    const noteDescriptionEdit = document.getElementById('notedescription-edit');
    const editNoteButton = document.getElementById('editNoteButton');
    const closeBtn = popupContainer.querySelector('.close-btn');

    noteTitleEdit.value = noteElement.querySelector('.note__title').textContent;
    noteDescriptionEdit.value = noteElement.querySelector('.note__text').textContent;
    noteTitleEdit.setAttribute('readonly', true);
    noteDescriptionEdit.setAttribute('readonly', true);
    editNoteButton.classList.add('hide');
    popupContainer.setAttribute('data-id', noteId);
    popupContainer.classList.remove('hide');

    closeBtn.addEventListener('click', () => {
        popupContainer.classList.add('hide');
        noteTitleEdit.removeAttribute('readonly');
        noteDescriptionEdit.removeAttribute('readonly');
        editNoteButton.classList.remove('hide');
    });
}

function callingRestore(noteId, title) {
    const element = document.getElementById(noteId);
    const notesLayout = document.querySelector('.notes__layout');
    const retVal = confirm(`Do you want to restore "${title}"?`);
    if (retVal === true) {
        try {
            notesLayout.appendChild(element);
            patchToServer(noteId, { isDeleted: false });
            showToast(`Note "${title}" restored successfully!`, 'success');
        } catch (error) {
            console.error('Error restoring note:', error);
            showToast('An error occurred while restoring the note. Please try again.', 'error');
        }
    } else {
        showToast(`Restoration of note "${title}" canceled.`, 'info');
        return;
    }
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