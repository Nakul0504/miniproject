import { SERVER_URL } from '../../mocks/handlers';

// let syncQueue=[];

//Offline functions
// function saveToLocalStorage(key, note) {
//     let storedNotes = JSON.parse(localStorage.getItem(key)) || [];
//     storedNotes.push(note);
//     console.log(storedNotes);
//     localStorage.setItem(key, JSON.stringify(storedNotes));
// }

export function getOfflineNotes(){
    return JSON.parse(localStorage.getItem("syncQueue")) || [];
}

//POST function
export async function addToServer(data) {
    if(navigator.onLine){
        try {
            // console.log(navigator.onLine);
            
            const response = await fetch(`${SERVER_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Failed to add note');
            }
    
            const reply = await response.json();
            console.log('Note added:', reply);
    
            // Fetch updated notes list
            // const updatedNotesResponse = await fetch(`${SERVER_URL}/notes`);
            // const updatedNotesData = await updatedNotesResponse.json();
            // console.log('Updated Notes:', updatedNotesData.notes);
            // return updatedNotesData.notes; // Return only the notes array
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }
    else{
        console.log('calling offline server');
        let storedNotes = JSON.parse(localStorage.getItem("syncQueue")) || [];
        storedNotes.push(data);
        console.log(storedNotes);
        localStorage.setItem("syncQueue", JSON.stringify(storedNotes));
    }
}


//TRASH POST function
// export async function addToTrash(data) {
//     try {
//         const response = await fetch(`${SERVER_URL}/trash`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(data)
//         });

//         if (!response.ok) {
//             throw new Error('Failed to add note');
//         }
//         const reply = await response.json();
//         console.log('Trash added:', reply);
//     } catch (error) {
//         console.error('Error adding note:', error);
//     }
// }

//GET function
export async function getFromServer() {
    
    if(navigator.onLine){
        try {
            const response = await fetch(`${SERVER_URL}/notes`);
            if (!response.ok) {
                throw new Error('Failed to get note from server');
            }
            const updatedNotesData = await response.json();
            return updatedNotesData.notes;
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }
    else{
        console.log('offline notes are here...');
        console.log(JSON.parse(localStorage.getItem('syncQueue')) || []);
        return(JSON.parse(localStorage.getItem('syncQueue')) || []);
    }
}

//trash get
// export async function getFromTrash() {
//     try {
//         const response = await fetch(`${SERVER_URL}/trash`);
//         if (!response.ok) {
//             throw new Error('Failed to get note from trash');
//         }
//         const updatedNotesData = await response.json();
//         return updatedNotesData.notes;    // returing the notes directly !
//     } catch (error) {
//         console.error('Error adding note:', error);
//     }
// }

//Get- single user
export async function fetchNote(id){
    try{
        const response = await fetch(`${SERVER_URL}/notes/${id}`);
        if(!response.ok){
            throw new Error('Failed to get single note');
        }
        return response.json();
    }
    catch(error){
        console.error('Error Get single note:', error);
    }
}
//PATCH
export async function patchToServer(id,data) {
    if(navigator.onLine)
    {
        try {
            const response = await fetch(`${SERVER_URL}/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Failed to patch note');
            }
    
            const reply = await response.json();
            console.log('Note patched:', reply);
        } catch (error) {
            console.error('Error patching note:', error);
        }
    }
    else{
        let storedNotes = JSON.parse(localStorage.getItem('syncQueue')) || [];
        // storedNotes.push(note);
        // console.log(storedNotes);
        storedNotes[id]=({'id':id,'title':data.title,'text':data.text,'isPinned':data.isPinned});
        localStorage.setItem('syncQueue', JSON.stringify(storedNotes));
    }
}

//DELETE function
export async function deleteFromServer(id) {
    console.log(`Deleting from server: ${id}`);
    if(navigator.onLine)
    {
        try {
            const response = await fetch(`${SERVER_URL}/notes/${Number(id)}`, {
                method: 'DELETE',
                // headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            const reply = await response.json();
            console.log('Note deleted:', reply);
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
    else{
        let storedNotes = JSON.parse(localStorage.getItem('syncQueue')) || [];
        storedNotes.splice(id,1);
        localStorage.setItem('syncQueue', JSON.stringify(storedNotes));
    }
}

//DELETE function trash
export async function deleteFromTrash(id) {
    try {
        const response = await fetch(`${SERVER_URL}/trash/${Number(id)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
            throw new Error('Failed to delete note');
        }
        const reply = await response.json();
        console.log('Note deleted:', reply);
    } catch (error) {
        console.error('Error deleting note:', error);
    }
}