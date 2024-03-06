window.onload = async function() {
    await fetchAndDisplayCatImage();
    addUIElementsPerImage();
    // addNavigationButtons();

};

let currentImageIndex = 0;
let imagesData = [];

async function fetchAndDisplayCatImage() {
    try {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=100', {
            headers: {
                'x-api-key': 'live_7bMcjDKr1S8ucVqcT6HI12SNzBR882GNdluej0AOzBQZdBMWSKQItuQIntXehwQW'
            }
        });
        const allImages = await response.json();
        imagesData = allImages.filter(catData => catData.breeds && catData.breeds.length > 0);
        if(imagesData.length > 0) {
            displayImage(currentImageIndex);
        }
    } catch(error) {
        console.error('Failed to fetch cat images: ', error);
    }
}


    function displayImage(index) {
        const catImageContainer = document.getElementById('catImageContainer');
        catImageContainer.innerHTML = ''; // Clear the container for a new image

        if (imagesData[index]) {
            const catData = imagesData[index];
            const catImage = document.createElement('img');
            catImage.src = catData.url;
            catImage.alt = 'Random Cat';
            catImage.style.width = '200px';
            catImageContainer.appendChild(catImage);

            // Display breed information
            const catInfo = document.createElement('p');
            catInfo.innerHTML = `Breed: ${catData.breeds[0].name}, Temperament: ${catData.breeds[0].temperament},
                                 Weight: ${catData.breeds[0].weight.imperial} lbs`;
            catImageContainer.appendChild(catInfo);

            //comments for this image are displayed
            addUIElementsPerImage(catImageContainer, catData.id);
            displayComments(imageId);
            updateLikesDisplay(catData.id);

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

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.onclick = () => {
        if (currentImageIndex > 0) {
            currentImageIndex -= 1;
            displayImage(currentImageIndex);
        }
    };
    parentElement.appendChild(prevButton);
     // Next button
     const nextButton = document.createElement('button');
     nextButton.textContent = 'Next';
     nextButton.onclick = () => {
         if (currentImageIndex < imagesData.length - 1) {
             currentImageIndex += 1;
             displayImage(currentImageIndex);
         }
     };
     parentElement.appendChild(nextButton);
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
        data[imageId].comments.forEach((comment, index) => {
            const commentDiv = document.createElement('div');
            const commentText = document.createElement('span');
            commentText.textContent = comment;
            commentDiv.appendChild(commentText);

            // delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.id = "delete-btn";
            deleteBtn.onclick = () => deleteComment(imageId, index); // Attach deletion handler
            commentDiv.appendChild(deleteBtn);

            commentsContainer.appendChild(commentDiv);
        });
    }
}
function deleteComment(imageId, commentIndex) {
    let data = loadData();
    if (data[imageId] && data[imageId].comments) {
        // Remove the comment at the specified index
        data[imageId].comments.splice(commentIndex, 1);
        saveData(data); // Save the updated data to localStorage
        displayComments(imageId); // Refresh the comments display
    }
}


function loadData() {
    const data = localStorage.getItem('catData');
    return data ? JSON.parse(data) : {};
}

function saveData(data) {
    localStorage.setItem('catData', JSON.stringify(data));
}
