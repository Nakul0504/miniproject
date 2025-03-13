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
                noteDiv.setAttribute('id', note.id); // Assign note ID

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

                // Delete Icon
                const deleteIcon = document.createElement('img');
                deleteIcon.setAttribute('class', 'note__icon');
                deleteIcon.setAttribute('src', 'https://th.bing.com/th/id/OIP.9CtMaGywq5uFGv1C6P6k1wHaHa?rs=1&pid=ImgDetMain');
                deleteIcon.setAttribute('alt', 'Delete');

                deleteBtn.appendChild(deleteIcon);

                // Undo Button
                const undoBtn = document.createElement('button');
                undoBtn.setAttribute('data-id', note.id);
                undoBtn.setAttribute('title', 'restore note');
                undoBtn.classList.add('note__btn', 'note__restore-btn');

                // Undo Icon
                const undoIcon = document.createElement('img');
                undoIcon.setAttribute('class', 'note__icon');
                undoIcon.setAttribute('src', 'https://img.icons8.com/?size=100&id=91644&format=png&color=000000');
                undoIcon.setAttribute('alt', 'Restore');

                undoBtn.appendChild(undoIcon);
                undoBtn.onclick = () => callingRestore(note.id, note.title);

                // View Button
                const viewBtn = document.createElement('button');
                viewBtn.classList.add('note__btn');
                viewBtn.setAttribute('data-id', note.id);
                viewBtn.setAttribute('title', 'View note');

                // View Icon
                const viewIcon = document.createElement('img');
                viewIcon.setAttribute('class', 'note__icon');
                viewIcon.setAttribute('src', 'https://icon-library.com/images/full-screen-icon-png/full-screen-icon-png-17.jpg');
                viewIcon.setAttribute('alt', 'View');
                viewBtn.appendChild(viewIcon);
                viewBtn.onclick = () => callingView(note.id);

                optnDiv.classList.add('flex-display');
                optnDiv.appendChild(deleteBtn);
                optnDiv.appendChild(viewBtn);
                optnDiv.appendChild(undoBtn);

                noteDiv.appendChild(optnDiv);
                parent.appendChild(noteDiv);
            }
        });

        parent.addEventListener('click', async (event) => {
            if (event.target.closest('.note__delete-btn')) {
                await deleteNoteButton(event);
            }
        });

    } catch (error) {
        console.error('Error fetching notes:', error);
    }
}

export async function deleteNoteButton(event) {
    const deleteBtn = event.target.closest('.note__delete-btn');
    if (!deleteBtn) return;
    const noteId = deleteBtn.getAttribute('data-id');

    const noteElement = document.getElementById(noteId);
    const title = noteElement.querySelector('.note__title').textContent;
    const text = noteElement.querySelector('.note__text').textContent;
    var retVal = confirm(`Do you want to permenantly delete ${title} ?`);
    if (retVal == true) {
        await deleteFromServer(noteId);
    } else {
        return;
    }
    await renderTrashNotes();
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
    var retVal = confirm(`Do you want to restore ${title} ?`);
    if (retVal == true) {
        notesLayout.appendChild(element);
        patchToServer(noteId, { 'isDeleted': false });
    } else {
        return;
    }
}