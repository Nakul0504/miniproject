
let debounceTimeout;
export default async function debounceSearch(query){
    console.log(`Search query: ${query}`);
    const noteIds = initialWork();
    clearTimeout(debounceTimeout); // Clear previous timeout

    debounceTimeout = setTimeout(() => {
    const results = noteIds.filter(id => filterNote(query,id) );
    // console.log("Search results:", results);
    filterNoteDisplay(results);
  }, 500);
}

function filterNote(query, id) {
    const parent = document.getElementById(id);
    if (!parent) return false;

    const title = parent.querySelector('.note__title')?.textContent.trim().toLowerCase() || "";
    const content = parent.querySelector('.note__text')?.textContent.trim().toLowerCase() || "";

    query = query.toLowerCase();

    if (title.indexOf(query) !== -1 || content.indexOf(query) !== -1) {
        return true;
    }
    return false;
}

function initialWork(){
    const pinDiv = document.querySelector('.notes__pinned');
    const noteDiv = document.querySelector('.notes__layout');
    const pinChildDivs = pinDiv.querySelectorAll("div");
    const noteChildDivs = noteDiv.querySelectorAll("div");
    let childIds=[];
    const pinChildIds = Array.from(pinChildDivs).map(child => child.id);
    childIds.push(...pinChildIds);
    const noteChildIds = Array.from(noteChildDivs).map(child => child.id);
    childIds.push(...noteChildIds);
    childIds = childIds.filter(item => item !== "");
    console.log("Stored Child IDs:", childIds);

    childIds.forEach(id => {
        const note = document.getElementById(id);
        note.classList.add('no-display');
    });

    return childIds;
}
function filterNoteDisplay(notesid){
    notesid.forEach(id => {
        const note = document.getElementById(id);
        note.classList.remove('no-display');
    });
    
}


