import { SERVER_URL } from '../../mocks/handlers';

export function getOfflineNotes() {
    return JSON.parse(localStorage.getItem("syncQueue")) || [];
}

export async function addToServer(data) {
    if (navigator.onLine) {
        try {
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
            localStorage.setItem('syncQueue', JSON.stringify(reply.notes));

        } catch (error) {
            console.error('Error adding note:', error);
        }
    }
    else {
        console.log('calling offline server');
        let storedNotes = JSON.parse(localStorage.getItem("syncQueue")) || [];
        let newId = storedNotes.length > 0 ? Number(storedNotes[storedNotes.length - 1].id) + 1 : 1;
        storedNotes.push({ id: newId, ...data });
        console.log(storedNotes);
        localStorage.setItem("syncQueue", JSON.stringify(storedNotes));
    }
}

//GET function
export async function getFromServer() {

    if (navigator.onLine) {
        try {
            const response = await fetch(`${SERVER_URL}/notes`);
            if (!response.ok) {
                throw new Error('Failed to get note from server');
            }
            const reply = await response.json();
            localStorage.setItem('syncQueue', JSON.stringify(reply.notes));
            return reply.notes;
        } catch (error) {
            console.error('Error adding note:', error);
        }
    }
    else {
        console.log('offline notes are returned here...');
        console.log(JSON.parse(localStorage.getItem('syncQueue')) || []);
        return (JSON.parse(localStorage.getItem('syncQueue')) || []);
    }
}

//Get- single user
export async function fetchNote(id) {
    if (navigator.onLine) {
        try { 
            const response = await fetch(`${SERVER_URL}/notes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to get single note');
            }
            return response.json();
        }
        catch (error) {
            console.error('Error Get single note:', error);
        }
    }
    else {
        const storedNotes = JSON.parse(localStorage.getItem('syncQueue')) || [];
        return storedNotes.find(note => Number(note.id) === Number(id));

    }

}
//PATCH
export async function patchToServer(id, data) {
    if (navigator.onLine) {
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
            localStorage.setItem('syncQueue', JSON.stringify(reply.notes));
            console.log('Note patched:', reply.success);

        } catch (error) {
            console.error('Error patching note:', error);
        }
    }
    else {
        let storedNotes = JSON.parse(localStorage.getItem('syncQueue')) || [];
        let noteIndex = storedNotes.findIndex(note => Number(note.id) === Number(id));
    
        if (noteIndex !== -1) {
            Object.keys(data).forEach(key => {
                if (key in storedNotes[noteIndex]) {
                    storedNotes[noteIndex][key] = data[key];
                }
            });
            localStorage.setItem('syncQueue', JSON.stringify(storedNotes));
        } else {
            console.warn(`Note with id ${id} not found in local storage.`);
        }
    }
}

//DELETE function
export async function deleteFromServer(id) {
    console.log(`Deleting from server: ${id}`);
    if (navigator.onLine) {
        try {
            const response = await fetch(`${SERVER_URL}/notes/${Number(id)}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            const reply = await response.json();
            localStorage.setItem('syncQueue', JSON.stringify(reply.notes));
            console.log('Note deleted:', reply.success);

        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
    else {
        let storedNotes = JSON.parse(localStorage.getItem('syncQueue')) || [];
        storedNotes = storedNotes.filter(note => Number(note.id) !== Number(id));
        localStorage.setItem('syncQueue', JSON.stringify(storedNotes));

    }
}
