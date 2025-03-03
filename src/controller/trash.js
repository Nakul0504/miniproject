import * as Server from '../model/crud';
export async function initialize() {

    await renderTrashNotes();
}
async function renderTrashNotes() {
    try {
        console.log("calling rendertrashnotes...")
        const parent = document.querySelector('.notes__trash');
        const allNotes = await Server.getFromServer();
        console.log("Fetched Trash Notes:", allNotes);

        parent.innerHTML = '';

        allNotes.forEach(note => {
            // Create Note Container
            if (note.isDeleted === true) {
                console.log("######");
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
                optnDiv.style.display='flex';
                optnDiv.appendChild(deleteBtn);
                optnDiv.appendChild(viewBtn);

                noteDiv.appendChild(optnDiv);
                parent.appendChild(noteDiv);
            }
        });

        document.querySelector('.notes__trash').addEventListener('click', async (event) => {
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
    console.log(`Going to delete id: ${noteId}`);


    const noteElement = document.getElementById(noteId);
    const title = noteElement.querySelector('.note__title').textContent;
    const text = noteElement.querySelector('.note__text').textContent;
    // ############
    var retVal = confirm(`Do you want to permenantly delete ${title} ?`);
    if (retVal == true) {
        await Server.deleteFromServer(noteId);
    } else {
        return;
    }
    // await Server.addToTrash({ 'title': title, 'text': text, 'isPinned': false });
    // await Server.addToTrash(noteId);

    await renderNotes();
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

