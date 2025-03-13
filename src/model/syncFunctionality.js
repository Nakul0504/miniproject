import { SERVER_URL } from '../../mocks/handlers';

export default async function syncNotesToServer() {
    let syncQueue = JSON.parse(localStorage.getItem('syncQueue')) || [];

    if (syncQueue.length === 0) return;
    try {
        const response = await fetch(`${SERVER_URL}/notes/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes: syncQueue }),
        });

        if (response.ok) {
            const data = await response.json();

            // Update local storage with latest server notes
            localStorage.setItem('syncQueue', JSON.stringify(data.notes));
        } else {
            console.error('Failed to sync notes:', response.status);
        }
    } catch (error) {
        console.error('Error syncing notes:', error);
    }
}