import { SERVER_URL } from '../../mocks/handlers';
import { LOCAL_STORAGE_KEYS } from './constants';

export function getOfflineNotes() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || [];
}

/**
 * Shows the loading spinner
 */
export function showSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) {
        // spinner.style.display = 'flex';
        spinner.classList.add('flex-display');
    }
}

export function hideSpinner() {
    const spinner = document.getElementById('spinner-overlay');
    if (spinner) {
        // spinner.style.display = 'none';
        spinner.classList.remove('flex-display');
    }
}

export async function addToServer(data) {
    if (navigator.onLine) {
        try {
            showSpinner();
            const response = await fetch(`${SERVER_URL}/notes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to add note');
            }

            const reply = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(reply.notes));
            hideSpinner();
        } catch (error) {
            console.error('Error adding note:', error);
        }

    }
    else {
        let storedNotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || [];
        let newId = storedNotes.length > 0 ? Number(storedNotes[storedNotes.length - 1].id) + 1 : 1;
        storedNotes.push({ id: newId, ...data });
        localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(storedNotes));
    }
}

//GET function
export async function getFromServer() {

    if (navigator.onLine) {
        try {
            showSpinner();
            const response = await fetch(`${SERVER_URL}/notes`);
            if (!response.ok) {
                throw new Error('Failed to get note from server');
            }
            const reply = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(reply.notes));
            hideSpinner();
            return reply.notes;
        } catch (error) {
            console.error('Error adding note:', error);
        }

    }
    else {
        return (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || []);
    }
}

//Get- single user
export async function fetchNote(id) {
    if (navigator.onLine) {
        try {
            showSpinner();
            const response = await fetch(`${SERVER_URL}/notes/${id}`);
            if (!response.ok) {
                throw new Error('Failed to get single note');
            }
            hideSpinner();
            return response.json();
        }
        catch (error) {
            console.error('Error Get single note:', error);
        }
    }
    else {
        const storedNotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || [];
        return storedNotes.find(note => Number(note.id) === Number(id));

    }

}
//PATCH
export async function patchToServer(id, data) {
    if (navigator.onLine) {
        try {
            showSpinner();
            const response = await fetch(`${SERVER_URL}/notes/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to patch note');
            }
            const reply = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(reply.notes));
            hideSpinner();
        } catch (error) {
            console.error('Error patching note:', error);
        }
    }
    else {
        let storedNotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || [];
        let noteIndex = storedNotes.findIndex(note => Number(note.id) === Number(id));

        if (noteIndex !== -1) {
            Object.keys(data).forEach(key => {
                if (key in storedNotes[noteIndex]) {
                    storedNotes[noteIndex][key] = data[key];
                }
            });
            localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(storedNotes));
        } else {
            console.warn(`Note with id ${id} not found in local storage.`);
        }
    }
}

//DELETE function
export async function deleteFromServer(id) {
    if (navigator.onLine) {
        try {
            showSpinner();
            const response = await fetch(`${SERVER_URL}/notes/${Number(id)}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete note');
            }
            const reply = await response.json();
            localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(reply.notes));
            hideSpinner();

        } catch (error) {
            console.error('Error deleting note:', error);
        }
    }
    else {
        let storedNotes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE)) || [];
        storedNotes = storedNotes.filter(note => Number(note.id) !== Number(id));
        localStorage.setItem(LOCAL_STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(storedNotes));

    }
}
