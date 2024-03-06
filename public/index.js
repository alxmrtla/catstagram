window.onload = async function() {
    await fetchAndDisplayCatImage();
    // Removed addUIElements since UI elements are now added dynamically per image
};

async function fetchAndDisplayCatImage() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=10000', {
            headers: {
                'x-api-key': 'live_7bMcjDKr1S8ucVqcT6HI12SNzBR882GNdluej0AOzBQZdBMWSKQItuQIntXehwQW'
            }
        });
        const data = await response.json();
        const catImageContainer = document.getElementById('catImageContainer');
        catImageContainer.innerHTML = ''; // Clear the container for new images

        data.forEach((catData) => {
            // Only proceed if breed information is available
            if (catData.breeds && catData.breeds.length > 0) {
                const breed = catData.breeds[0];

                // Validate the presence of required information
                if (breed.name && breed.temperament && breed.origin && breed.weight && breed.weight.imperial) {
                    const catImageDiv = document.createElement('div');
                    catImageDiv.className = 'cat-image-div';

                    const catImage = document.createElement('img');
                    catImage.src = catData.url;
                    catImage.alt = 'Random Cat';
                    catImage.dataset.id = catData.id;
                    catImage.style.width = '200px';
                    catImageDiv.appendChild(catImage);

                    const catInfoDiv = document.createElement('div');
                    catInfoDiv.className = 'cat-info';

                    // Displaying additional information
                    const nameBreed = document.createElement('p');
                    nameBreed.textContent = `Name/Breed: ${breed.name}`;
                    const temperament = document.createElement('p');
                    temperament.textContent = `Temperament: ${breed.temperament}`;
                    const origin = document.createElement('p');
                    origin.textContent = `Origin: ${breed.origin}`;
                    const weight = document.createElement('p');
                    weight.textContent = `Weight: ${breed.weight.imperial} lbs`;

                    [nameBreed, temperament, origin, weight].forEach(element => catInfoDiv.appendChild(element));

                    catImageDiv.appendChild(catInfoDiv);
                    catImageContainer.appendChild(catImageDiv);

                    // Call function to add UI elements for each image
                    addUIElementsPerImage(catImageDiv, catData.id);
                }
            }
        });
    } catch (error) {
        console.error('Failed to fetch cat image:', error);
    }
}



function addUIElementsPerImage(parentElement, imageId) {
    // Likes display
    const likesDisplay = document.createElement('div');
    likesDisplay.id = 'likesDisplay-' + imageId; // Unique ID for likes display
    parentElement.appendChild(likesDisplay);

    // Like button
    const likeButton = document.createElement('button');
    likeButton.textContent = 'Like';
    likeButton.addEventListener('click', () => handleVote(true, imageId));
    parentElement.appendChild(likeButton);

    // Dislike button
    const dislikeButton = document.createElement('button');
    dislikeButton.textContent = 'Dislike';
    dislikeButton.addEventListener('click', () => handleVote(false, imageId));
    parentElement.appendChild(dislikeButton);

    // Comment form
    const commentForm = document.createElement('form');
    commentForm.innerHTML = `<input type="text" placeholder="Add a comment"><button type="submit">Comment</button>`;
    commentForm.onsubmit = (event) => handleCommentSubmit(event, imageId);
    parentElement.appendChild(commentForm);

    // Comments container
    const commentsContainer = document.createElement('div');
    commentsContainer.id = 'commentsContainer-' + imageId; // Unique ID for comments container
    parentElement.appendChild(commentsContainer);
}

function handleCommentSubmit(event, imageId) {
    event.preventDefault();
    const input = event.target.querySelector('input');
    const commentText = input.value.trim();
    if (commentText) {
        let data = loadData();
        if (!data[imageId]) data[imageId] = { likes: 0, comments: [] };
        data[imageId].comments.push(commentText);
        saveData(data);
        displayComments(imageId); // Refresh comments display
        input.value = ''; // Clear input field
    }
}

function handleVote(isLike, imageId) {
    let data = loadData();
    if (!data[imageId]) data[imageId] = { likes: 0, comments: [] };
    data[imageId].likes += isLike ? 1 : -1;
    if (data[imageId].likes < 0) data[imageId].likes = 0; // Prevent negative likes
    saveData(data);
    updateLikesDisplay(imageId); // Refresh likes display
}

function updateLikesDisplay(imageId) {
    const data = loadData();
    const likesDisplay = document.getElementById('likesDisplay-' + imageId);
    likesDisplay.textContent = `Likes: ${data[imageId] ? data[imageId].likes : 0}`;
}

function displayComments(imageId) {
    const data = loadData();
    const commentsContainer = document.getElementById('commentsContainer-' + imageId);
    commentsContainer.innerHTML = ''; // Clear existing comments
    if (data[imageId] && data[imageId].comments) {
        data[imageId].comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.textContent = comment;
            commentsContainer.appendChild(commentElement);
        });
    }
}

function loadData() {
    const data = localStorage.getItem('catData');
    return data ? JSON.parse(data) : {};
}

function saveData(data) {
    localStorage.setItem('catData', JSON.stringify(data));
}
