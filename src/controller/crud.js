import * as Server from '../model/crud';

export function createNote(event) {
    const popupContainer = document.getElementById("popupContainer");
    const popupOverlay = document.getElementById("popupOverlay");
    const closeBtn = document.querySelector(".close-btn");
    popupContainer.style.display = "block";
    popupOverlay.style.display = "block";
    closeBtn.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", closePopup);
}
function closePopup() {
    popupContainer.style.display = "none";
    popupOverlay.style.display = "none";
}
export async function createNoteButton(event) {
    console.log("Create Button clicked");
    const title = document.getElementById('notetitle').value.trim();
    document.getElementById('notetitle').value = '';
    const description = document.getElementById('notedescription').value.trim();
    document.getElementById('notedescription').value = '';
    console.log(`response got ....${title}...${description}`);
    if (title == '' && description == '') {
        alert('! Alteast give either Title and Description');
        return;
    }
    console.log('calling server');
    await Server.addToServer({ 'title': title, 'text': description, 'isPinned': false, 'isDeleted': false });
    console.log('calling render notes');
    await renderNotes();
    closePopup();
}
export async function doRefresh() {
    if (document.querySelector('.notes__title--pinned')) {
        document.querySelector('.notes__title--pinned').classList.add('no-display');
    }
    if (document.querySelector('notes__title')) {
        document.querySelector('notes__title').classList.add('no-display');
    }

    document.querySelector('.notes__layout').innerHTML = '';
    document.querySelector('.notes__pinned').innerHTML = '';
    await renderNotes()
    document.querySelector('.topmenu_bar').value = '';
}
export async function renderNotes() {
    console.log('notes from server');
    try {
        const parentLayout = document.querySelector('.notes__layout');
        const parentPin = document.querySelector('.notes__pinned');
        const allNotes = await Server.getFromServer();
        console.log("Fetched Notes from server:", allNotes);

        parentLayout.innerHTML = '';
        parentPin.innerHTML = '';

        allNotes.forEach(note => {
            // Create Note Container
            if (note.isDeleted === false) {
                const noteDiv = document.createElement('div');
                noteDiv.classList.add('note');
                noteDiv.classList.add('draggable');
                noteDiv.setAttribute('draggable', 'true');
                noteDiv.setAttribute('id', note.id); // Assign note ID

                // Content Container
                const noteContent = document.createElement('div');
                noteContent.classList.add('note__content');

                // Title
                const titleDiv = document.createElement('div');
                titleDiv.classList.add('note__title');
                titleDiv.textContent = note.title;
                //pin button
                const pinBtn = document.createElement('button');
                pinBtn.classList.add('note__btn--pin');
                pinBtn.setAttribute('data-id', note.id);
                pinBtn.setAttribute('title', 'Pin note');

                // pin Icon
                const pinIcon = document.createElement('img');
                pinIcon.setAttribute('class', 'note__icon--pin');
                pinIcon.setAttribute('src', 'https://cdn2.iconfinder.com/data/icons/stationery-101/64/pin_mark_point_tack_office-512.png');
                pinIcon.setAttribute('alt', 'Pin');
                pinBtn.appendChild(pinIcon);
                pinBtn.onclick = () => callingPin(note.id);
                titleDiv.appendChild(pinBtn)
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
                // deleteBtn.classList.add('note__btn');
                deleteBtn.setAttribute('data-id', note.id);
                deleteBtn.setAttribute('title', 'Delete note');
                deleteBtn.classList.add('note__btn', 'note__delete-btn');


                // Delete Icon
                const deleteIcon = document.createElement('img');
                deleteIcon.setAttribute('class', 'note__icon');
                deleteIcon.setAttribute('src', 'https://th.bing.com/th/id/OIP.9CtMaGywq5uFGv1C6P6k1wHaHa?rs=1&pid=ImgDetMain');
                deleteIcon.setAttribute('alt', 'Delete');

                deleteBtn.appendChild(deleteIcon);

                // Edit Button
                const editBtn = document.createElement('button');
                editBtn.classList.add('note__btn');
                editBtn.setAttribute('data-id', note.id);
                editBtn.setAttribute('title', 'Edit note');

                // Edit Icon
                const editIcon = document.createElement('img');
                editIcon.setAttribute('class', 'note__icon');
                editIcon.setAttribute('src', 'https://th.bing.com/th/id/OIP.LEK7h-h95VZW5qrFh04JMgHaHa?rs=1&pid=ImgDetMain');
                editIcon.setAttribute('alt', 'Edit');
                editBtn.appendChild(editIcon);
                editBtn.onclick = () => callingEdit(note.id);

                //view Button
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

                optnDiv.appendChild(deleteBtn);
                optnDiv.appendChild(editBtn);
                optnDiv.appendChild(viewBtn);

                noteDiv.appendChild(optnDiv);
                if (note.isPinned === false) {
                    parentLayout.appendChild(noteDiv);
                }
                else {
                    parentPin.appendChild(noteDiv);
                }
            }


        });


        if ((parentLayout.childElementCount != 0) && (parentPin.childElementCount != 0)) {
            document.querySelector('.notes__title--pinned').classList.remove('no-display');
            document.querySelector('.notes__title').classList.remove('no-display');
        }
        if ((parentLayout.childElementCount != 0) && (parentPin.childElementCount == 0)) {
            document.querySelector('.notes__title--pinned').classList.add('no-display');
            document.querySelector('.notes__title').classList.add('no-display');
        }
        if ((parentLayout.childElementCount == 0) && (parentPin.childElementCount != 0)) {
            document.querySelector('.notes__title--pinned').classList.remove('no-display');
            document.querySelector('.notes__title').classList.add('no-display');
        }
        document.querySelector('.notes__layout').addEventListener('click', async (event) => {
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
    const draggables = document.querySelectorAll(".draggable");
    const layoutContainer = document.querySelector(".notes__layout");
    const pinnedContainer = document.querySelector(".notes__pinned");

    draggables.forEach((draggable) => {
        let originalContainer = null;
        let originalNextSibling = null;

        draggable.addEventListener("dragstart", () => {
            draggable.classList.add("dragging");
            originalContainer = draggable.parentElement;
            originalNextSibling = draggable.nextSibling;
        });

        draggable.addEventListener("dragend", () => {
            draggable.classList.remove("dragging");

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
        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggable = document.querySelector(".dragging");

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
        const draggableElements = [...container.querySelectorAll(".draggable:not(.dragging)")];

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
    const noteDetail = await Server.fetchNote(noteId);
    console.log(noteDetail);
    const noteToBePinned = document.getElementById(noteId);
    const pinnedContainer = document.querySelector('.notes__pinned');
    const layoutContainer = document.querySelector('.notes__layout');

    if (noteDetail.isPinned === false) {
        if (noteToBePinned && pinnedContainer && layoutContainer) {
            if (pinnedContainer.childElementCount == 0) {
                document.querySelector('.notes__title').classList.remove('no-display');
                document.querySelector('.notes__title--pinned').classList.remove('no-display');
            }
            if (layoutContainer.childElementCount == 1) {
                document.querySelector('.notes__title').classList.add('no-display');
                document.querySelector('.notes__title--pinned').classList.remove('no-display');
            }
            Server.patchToServer(noteId, { 'isPinned': true });
            document.querySelector('.notes__pinned').classList.remove('no-display');
            pinnedContainer.appendChild(noteToBePinned);
        } else {
            alert("Element not found!");
        }
    }
    else {
        if (noteToBePinned && pinnedContainer && layoutContainer) {
            if (layoutContainer.childElementCount == 0) {
                document.querySelector('.notes__title').classList.remove('no-display');
            }
            if (pinnedContainer.childElementCount == 1) {
                document.querySelector('.notes__title--pinned').classList.add('no-display');
                document.querySelector('.notes__title').classList.add('no-display');
            }
            Server.patchToServer(noteId, { 'isPinned': false });
            document.querySelector('.notes__layout').classList.remove('no-display');
            layoutContainer.appendChild(noteToBePinned);
        } else {
            alert("Element not found!");
        }
    }

}

function callingEdit(noteId) {
    const noteElement = document.getElementById(noteId);
    const popupContainer = document.getElementById("popupContainer-edit");
    document.getElementById('notetitle-edit').value = noteElement.querySelector('.note__title').textContent;
    document.getElementById('notedescription-edit').value = noteElement.querySelector('.note__text').textContent;
    popupContainer.setAttribute("data-id", noteId);
    popupContainer.style.display = "block";
    const closeBtn = popupContainer.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => {
        popupContainer.style.display = "none";
    });
    document.getElementById('editNoteButton').addEventListener('click', editNoteButton);
}

export async function editNoteButton(event) {
    console.log("Edit Button clicked");
    const title = document.getElementById('notetitle-edit').value.trim();
    const description = document.getElementById('notedescription-edit').value.trim();

    if (title === '' && description === '') {
        alert('At least provide either Title or Description!');
        return;
    }
    const noteId = event.target.closest('.popup').getAttribute('data-id');
    await Server.patchToServer(noteId, { 'id': noteId, 'title': title, 'text': description });
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
        console.error("Error: Note element not found!");
        return;
    }

    const title = noteElement.querySelector('.note__title').textContent;
    const text = noteElement.querySelector('.note__text').textContent;
    if (!confirm(`Are you sure to delete the Note with Title:${title} ?`)) {
        return;
    }
    console.log(`Going to delete id: ${noteId}`);
    try {
        Server.patchToServer(noteId, { 'id': noteId, 'title': title, 'text': text, 'isPinned': false, 'isDeleted': true });
        const resp = await Server.getFromServer();
        console.log("trash notes after click from notes layout:")
        console.log(resp);
        await renderNotes();
    } catch (error) {
        console.error("Error in deleteNoteButton:", error);
    } finally {
        delete event.target.dataset.processing;
    }
}
function callingView(noteId) {      //function name
    const noteElement = document.getElementById(noteId);
    const popupContainer = document.getElementById("popupContainer-edit");

    // Set text field values
    document.getElementById('notetitle-edit').value = noteElement.querySelector('.note__title').textContent;
    document.getElementById('notedescription-edit').value = noteElement.querySelector('.note__text').textContent;

    // Temporarily disable editing
    document.getElementById('notetitle-edit').setAttribute("readonly", true);
    document.getElementById('notedescription-edit').setAttribute("readonly", true);

    // Hide the edit button
    document.getElementById('editNoteButton').style.display = "none";

    // Display the popup
    popupContainer.setAttribute("data-id", noteId);
    popupContainer.style.display = "block";

    // Close button functionality
    const closeBtn = popupContainer.querySelector(".close-btn");
    closeBtn.addEventListener("click", () => {
        popupContainer.style.display = "none";
        document.getElementById('notetitle-edit').removeAttribute("readonly");
        document.getElementById('notedescription-edit').removeAttribute("readonly");
        document.getElementById('editNoteButton').style.display = "block";
    });
}