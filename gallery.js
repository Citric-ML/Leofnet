// must be split into rows and columns
async function fetch_itms(repo, type, dest, compHTML = null){ // comp stands for component; the extra component which must be added in the form of innerHTML. It is set to null by default.
    // finding number of items from folder metadata 
    const metaData = `${repo}/meta.txt`;
    let lines = []
    try {
        const response = await fetch(metaData);
        if (response.ok) {
            const text = await response.text();
            lines = text.split(/\r?\n/); // description must contain one line as the number of items and the rest naming then
            numitm = parseInt(lines[0], 10); // gotta remember base10 :3
        } else {
            p.textContent = "gallery metadata unavailable.";
        }
    } catch (error) {
        console.error(`Could not load metadata:`, error);
        p.textContent = "Error loading metadata";
    }

    const container = document.createElement('div');
    container.className = "container";
    const row = document.createElement('div');
    row.className = "row";
    // creating a column for each with the photo and the name
    for (i = 0; i =< numitms; i++) {
        let col = document.createElement('div');
        col.className = "column"

        const fullLink = `${repo}/itm${i}`;
        let itm = document.createElement(type);
        itm.src = `${fullLink}`;

        if (type === 'video' || type === 'itm') {
            itm.controls = true;
        }
        let description = document.createElement('p');
        description.textContent = lines[i + 1] || "";
        col.appendChild(itm);
        col.appendChild(description);

        // inject extra component html if given
        if (compHTML) {
            let compWrapper = document.createElement('div');
            compWrapper.innerHTML = compHTML;
            col.appendChild(compWrapper);
        }
        row.appendChild(col);
    }
    dest.appendChild(container);
}

// click handling

document.addEventListener('click', (event) => {
    // Check for class '.videoBtn'
    const btn = event.target.closest('.videoBtn');
    if (!btn) return; // Exit if it wasn't a video button

    // Find parent column containing specific button
    const column = btn.closest('.column');
    const video = column.querySelector('video');

    if (video) {
        if (video.paused) {
            video.play();
            btn.textContent = 'Pause';
        } else {
            video.pause();
            btn.textContent = 'Play';
        }
    }
});


document.addEventListener('click', (event) => {
    const btn = event.target.closest('.audioBtn');
    if (!btn) return;

    const column = btn.closest('.column');
    const audio = column.querySelector('audio');

    if (audio) {
        if (audio.paused) {
            audio.play();
            btn.textContent = 'Pause';
        } else {
            audio.pause();
            btn.textContent = 'Play';
        }
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    const photobox = document.getElementById("photo-desc");
    const videobox = document.getElementById("video-desc");
    const musicbox = document.getElementById("music-desc");
    const designbox = document.getElementById("design-desc");
    const videoComp = '<btn class="videoBtn">pause/unpause</btn>'
    const audioComp = '<btn class="audioBtn">pause/unpause</btn>'
    fetch_itms('./assets/gallery', 'img', photobox);
    fetch_itms('./assets/vidgallery', 'video', videobox, videoComp); 
    fetch_itms('./assets/musicgallery', 'audio', musicbox, audioComp);
    fetch_itms('./assets/designgallery', 'img', designbox); // this one's technically another photo album, but its purpose is different
};


