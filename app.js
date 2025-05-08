// Initialize the app
function init() {
    // Simulate loading for 3 seconds
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        usernameScreen.classList.remove('hidden');
        
        // Set focus to username input
        usernameInput.focus();
    }, 3000);
    
    // Profile picture upload
    profileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profilePreview.src = event.target.result;
                currentUser.avatar = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    changePhotoBtn.addEventListener('click', () => {
        profileUpload.click();
    });
    
    // Username validation
    usernameInput.addEventListener('input', (e) => {
        const username = e.target.value.trim();
        const containsBannedWord = bannedWords.some(word => 
            username.toLowerCase().includes(word.toLowerCase())
        );
        
        if (containsBannedWord) {
            usernameError.classList.remove('hidden');
            startBtn.disabled = true;
        } else {
            usernameError.classList.add('hidden');
            startBtn.disabled = username.length < 3;
        }
    });
    
    startBtn.addEventListener('click', () => {
        currentUser.name = usernameInput.value.trim();
        currentUser.id = 'user-' + Math.random().toString(36).substr(2, 8);
        completeLogin();
    });
    
    // ... rest of the initialization code remains the same ...
}

// Complete login process
function completeLogin() {
    usernameScreen.classList.add('hidden');
    app.classList.remove('hidden');
    
    userAvatar.src = currentUser.avatar;
    usernameDisplay.textContent = currentUser.name;
    
    // Load friends and groups
    loadFriends();
    loadGroups();
    
    // Show welcome message from AI after a short delay
    setTimeout(() => {
        aiChat.classList.remove('hidden');
    }, 1000);
}
