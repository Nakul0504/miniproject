import { http, HttpResponse } from "msw";

export const SERVER_URL = 'http://localhost:5070';

let notesId = 1;
// let trashId=1;
let notes = [];
// let trash=[];

export const handlers = [
    http.get(`${SERVER_URL}/notes`, ({ request, params, cookies }) => {
        return HttpResponse.json({ notes });
    }),
    // http.get(`${SERVER_URL}/trash`, ({ request, params, cookies }) => {
    //     return HttpResponse.json({ trash: trash || [] });
    // }),
    http.post(`${SERVER_URL}/notes`, async ({ request, params, cookies }) => {
        const requestBody = await request.json();
        if (!requestBody.title && !requestBody.text) {
            return HttpResponse(null, { status: 400 });
        }
        notes.push({
            id: notesId++,
            title: requestBody.title,
            text: requestBody.text,
            isPinned:requestBody.isPinned,
            isDeleted:requestBody.isDeleted
        });
        console.log(notes);
        return HttpResponse.json({ success: true });
    }),
    // http.post(`${SERVER_URL}/trash`, async ({ request, params, cookies }) => {
    //     const requestBody = await request.json();
    //     if (!requestBody.title && !requestBody.text) {
    //         return HttpResponse(null, { status: 400 });
    //     }
    //     trash.push({
    //         id: trashId++,
    //         title: requestBody.title,
    //         text: requestBody.text,
    //         isPinned:requestBody.isPinned
    //     });
    //     console.log(trash);
    //     return HttpResponse.json({ success: true });
    // }),
    
    http.patch(`${SERVER_URL}/notes/:id`, async ({ request, params, cookies }) => {
        const note = notes.find((n) => n.id === Number(params.id));
        if (!note) {
            return HttpResponse(null, { status: 400 });
        }
        const requestBody = await request.json();
        if (requestBody.title) {
            note.title = requestBody.title;
        }

        if (requestBody.text) {
            note.text = requestBody.text;
        }
        if(requestBody.isPinned != undefined){
            note.isPinned=requestBody.isPinned;
        }
        if(requestBody.isDeleted != undefined){
            note.isDeleted = requestBody.isDeleted;
        }
        
        return HttpResponse.json({ success: true });
    }),
    http.delete(`${SERVER_URL}/notes/:id`, async ({ params }) => {
        console.log("Received DELETE request for ID:", params.id);
    
        const noteId = Number(params.id);
        if (isNaN(noteId)) {
            console.error("Invalid noteId:", params.id);
            return new HttpResponse(null, { status: 400 });
        }
        const noteIndex = notes.findIndex((n) => n.id === noteId);
        if (noteIndex === -1) {
            console.error("Note not found:", noteId);
            return new HttpResponse(null, { status: 404 });
        }
    
        notes.splice(noteIndex, 1);
        return HttpResponse.json({ success: true });
    })
    ,
    // http.delete(`${SERVER_URL}/trash/:id`, async ({ request, params, cookies }) => {
    //     const noteIndex = trash.findIndex((n) => n.id === Number(params.id));
    //     if (noteIndex === -1) {
    //         return new HttpResponse(null, { status: 400 });
    //     }
    //     trash.splice(noteIndex, 1);
    //     return HttpResponse.json({ success: true });
    // }),
    http.post(`${SERVER_URL}/notes/sync`, async ({ request, params, cookies }) => {
        const responseBody = await request.json();
        if (!responseBody.notes || !responseBody.notes.length) {
            return HttpResponse(null, { status: 400 });
        }
        notes = responseBody.notes;
        
        return HttpResponse.json({ success: true });
    }),
    http.get(`${SERVER_URL}/notes/:id`, async ({ params }) => {
        const note = notes.find((n) => n.id === Number(params.id));
        if (!note) {
            return HttpResponse(null, { status: 404 });
        }
        return HttpResponse.json(note);
    })
    
];