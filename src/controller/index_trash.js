// import { SERVER_URL } from '../../mocks/handlers.js';
import { worker } from '../../mocks/server.js';
import * as crud from '../controller/crud.js';
import * as trash from '../controller/trash.js'

function Initializer(){
    trash.renderTrashNotes();
}

async function enableMocking() {
   console.log("calling mock");
    console.log(worker);
    return worker.start();
}

Initializer();

enableMocking().then(() => {
    console.log('Mocking enabled!');
});
