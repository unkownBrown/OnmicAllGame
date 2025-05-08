// User Data
let currentUser = {
    id: '',
    name: '',
    avatar: 'https://i.imgur.com/JgYD2nQ.png'
};

// PeerJS connection
let peer;
let connections = {};
let audioStream;
let isMuted = false;
let isHearingMyself = false;
let audioContext;
let mediaStreamSource;
let localAudioBuffer;
let selfAudioElement;

// Banned words list
const bannedWords = ['asu', 'dick', 'fuck', 'shit', 'bitch', 'asshole', 'kontol', 'memek', 'ngentot', 'bangsat'];

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const usernameScreen = document.getElementById('usernameScreen');
const profilePreview = document.getElementById('profilePreview');
const profileUpload = document.getElementById('profileUpload');
const changePhotoBtn = document.getElementById('changePhotoBtn');
const usernameInput = document.getElementById('usernameInput');
const usernameError = document.getElementById('usernameError');
const startBtn = document.getElementById('startBtn');
const app = document.getElementById('app');
const userAvatar = document.getElementById('userAvatar');
const usernameDisplay = document.getElementById('usernameDisplay');
const aiHelpBtn = document.getElementById('aiHelpBtn');
const aiChat = document.getElementById('aiChat');
const closeAiBtn = document.getElementById('closeAiBtn');
const aiMessages = document.getElementById('aiMessages');
const aiInput = document.getElementById('aiInput');

// Tab elements
const friendsTab = document.getElementById('friendsTab');
const groupsTab = document.getElementById('groupsTab');
const friendsContent = document.getElementById('friendsContent');
const groupsContent = document.getElementById('groupsContent');

// Friend elements
const addFriendBtn = document.getElementById('addFriendBtn');
const friendsList = document.getElementById('friendsList');
const addFriendModal = document.getElementById('addFriendModal');
const friendSearch = document.getElementById('friendSearch');
const searchResults = document.getElementById('searchResults');
const cancelAddFriendBtn = document.getElementById('cancelAddFriendBtn');
const confirmAddFriendBtn = document.getElementById('confirmAddFriendBtn');

// Group elements
const createGroupBtn = document.getElementById('createGroupBtn');
const joinGroupBtn = document.getElementById('joinGroupBtn');
const groupsList = document.getElementById('groupsList');
const createGroupModal = document.getElementById('createGroupModal');
const groupNameInput = document.getElementById('groupNameInput');
const confirmCreateGroupBtn = document.getElementById('confirmCreateGroupBtn');
const groupCreatedModal = document.getElementById('groupCreatedModal');
const groupCode = document.getElementById('groupCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const startChattingBtn = document.getElementById('startChattingBtn');
const joinGroupModal = document.getElementById('joinGroupModal');
const groupCodeInput = document.getElementById('groupCodeInput');
const confirmJoinGroupBtn = document.getElementById('confirmJoinGroupBtn');

// Voice chat elements
const voiceChatScreen = document.getElementById('voiceChatScreen');
const currentGroupName = document.getElementById('currentGroupName');
const currentGroupCode = document.getElementById('currentGroupCode');
const participantsList = document.getElementById('participantsList');
const hearMyselfBtn = document.getElementById('hearMyselfBtn');
const muteBtn = document.getElementById('muteBtn');
const disconnectBtn = document.getElementById('disconnectBtn');

// Mock data
const mockUsers = [
    { id: '2', name: 'GameMaster99', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: true },
    { id: '3', name: 'ProPlayer42', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: true },
    { id: '4', name: 'NoobSlayer', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: false }
];

const mockGroups = [
    { id: 'ABC123', name: 'Epic Gamers', members: ['GameMaster99', 'ProPlayer42'] },
    { id: 'XYZ789', name: 'Pro Team', members: ['ProPlayer42'] }
];

// Initialize the app
function init() {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        usernameScreen.classList.remove('hidden');
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
    
    // Tab switching
    friendsTab.addEventListener('click', () => {
        friendsTab.classList.add('tab-active');
        groupsTab.classList.remove('tab-active');
        friendsContent.classList.remove('hidden');
        groupsContent.classList.add('hidden');
    });
    
    groupsTab.addEventListener('click', () => {
        groupsTab.classList.add('tab-active');
        friendsTab.classList.remove('tab-active');
        groupsContent.classList.remove('hidden');
        friendsContent.classList.add('hidden');
    });
    
    // AI Helper
    aiHelpBtn.addEventListener('click', () => {
        aiChat.classList.toggle('hidden');
    });
    
    closeAiBtn.addEventListener('click', () => {
        aiChat.classList.add('hidden');
    });
    
    document.querySelectorAll('.ai-question-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const question = e.target.textContent.trim();
            aiInput.value = question;
            sendAiMessage(question);
        });
    });
    
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && aiInput.value.trim()) {
            sendAiMessage(aiInput.value.trim());
            aiInput.value = '';
        }
    });
    
    // Friends
    addFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
        searchResults.innerHTML = '<div class="text-center py-4 text-gray-400">Search for a friend by exact username</div>';
    });
    
    cancelAddFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.add('hidden');
        friendSearch.value = '';
    });
    
    friendSearch.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        confirmAddFriendBtn.disabled = true;
        
        if (query.length < 3) {
            searchResults.innerHTML = '<div class="text-center py-4 text-gray-400">Enter at least 3 characters</div>';
            return;
        }
        
        // Simulate API call delay
        setTimeout(() => {
            const results = mockUsers.filter(user => 
                user.name.toLowerCase() === query.toLowerCase() && 
                user.id !== currentUser.id
            );
            
            if (results.length === 0) {
                searchResults.innerHTML = `
                    <div class="text-center py-4">
                        <p class="text-gray-400">User not found</p>
                        <p class="text-xs text-gray-500 mt-1">Make sure you entered the exact username</p>
                    </div>
                `;
            } else {
                displaySearchResults(results);
                confirmAddFriendBtn.disabled = false;
            }
        }, 500);
    });
    
    confirmAddFriendBtn.addEventListener('click', () => {
        const username = friendSearch.value.trim();
        alert(`Friend request sent to ${username}`);
        addFriendModal.classList.add('hidden');
        friendSearch.value = '';
        loadFriends();
    });
    
    // Groups
    createGroupBtn.addEventListener('click', () => {
        createGroupModal.classList.remove('hidden');
        groupNameInput.value = '';
    });
    
    confirmCreateGroupBtn.addEventListener('click', () => {
        if (groupNameInput.value.trim()) {
            const groupId = generateGroupCode();
            createGroupModal.classList.add('hidden');
            groupCode.textContent = groupId;
            groupCreatedModal.classList.remove('hidden');
        }
    });
    
    joinGroupBtn.addEventListener('click', () => {
        joinGroupModal.classList.remove('hidden');
        groupCodeInput.value = '';
    });
    
    confirmJoinGroupBtn.addEventListener('click', () => {
        const code = groupCodeInput.value.trim().toUpperCase();
        if (code.length === 6) {
            const group = mockGroups.find(g => g.id === code);
            if (group) {
                joinGroupModal.classList.add('hidden');
                startVoiceChat(group.name, group.id);
            } else {
                alert('Group not found. Please check the code and try again.');
            }
        }
    });
    
    copyCodeBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(groupCode.textContent);
        alert('Group code copied to clipboard!');
    });
    
    startChattingBtn.addEventListener('click', () => {
        groupCreatedModal.classList.add('hidden');
        startVoiceChat(groupNameInput.value.trim(), groupCode.textContent);
    });
    
    // Voice chat controls
    hearMyselfBtn.addEventListener('click', toggleHearMyself);
    muteBtn.addEventListener('click', toggleMute);
    disconnectBtn.addEventListener('click', endCall);
    
    // Initialize PeerJS when app starts
    initPeerJS();
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
    
    // Show welcome message from AI
    setTimeout(() => {
        aiChat.classList.remove('hidden');
    }, 1000);
}

// Initialize PeerJS for voice chat
function initPeerJS() {
    // Create peer connection
    peer = new Peer(currentUser.id);
    
    peer.on('open', (id) => {
        console.log('PeerJS connected with ID:', id);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
    });
    
    // Handle incoming calls
    peer.on('call', (call) => {
        // Answer the call with our audio stream
        call.answer(audioStream);
        
        call.on('stream', (remoteStream) => {
            // Add the remote stream to our connections
            connections[call.peer] = {
                call: call,
                stream: remoteStream,
                audioElement: new Audio()
            };
            
            // Set up audio element for remote stream
            connections[call.peer].audioElement.srcObject = remoteStream;
            connections[call.peer].audioElement.play();
            
            // Update UI with new participant
            updateParticipants();
        });
        
        call.on('close', () => {
            if (connections[call.peer]) {
                connections[call.peer].audioElement.pause();
                delete connections[call.peer];
                updateParticipants();
            }
        });
    });
}

// Start voice chat
async function startVoiceChat(groupName, groupCode) {
    try {
        // Get user's microphone
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Set up audio context for hearing self
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        mediaStreamSource = audioContext.createMediaStreamSource(audioStream);
        localAudioBuffer = audioContext.createGain();
        mediaStreamSource.connect(localAudioBuffer);
        localAudioBuffer.gain.value = 0; // Start with self audio muted
        
        // Show voice chat screen
        voiceChatScreen.classList.remove('hidden');
        currentGroupName.textContent = groupName;
        currentGroupCode.textContent = `Code: ${groupCode}`;
        
        // Update participants list
        updateParticipants();
        
        // Connect to other group members (simulated)
        simulateGroupConnections(groupCode);
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
    }
}

// Simulate connecting to group members
function simulateGroupConnections(groupCode) {
    const group = mockGroups.find(g => g.id === groupCode);
    if (!group) return;
    
    // Simulate connecting to each member after a delay
    group.members.forEach((member, index) => {
        setTimeout(() => {
            // In a real app, this would be an actual PeerJS connection
            // For demo, we just add them to the participants list
            addParticipant(
                `mock-${index}`,
                member,
                'https://i.imgur.com/JgYD2nQ.png',
                true
            );
        }, 1000 * (index + 1));
    });
}

// Update participants list
function updateParticipants() {
    participantsList.innerHTML = '';
    
    // Add current user
    addParticipant(
        currentUser.id,
        currentUser.name,
        currentUser.avatar,
        !isMuted,
        true // isCurrentUser
    );
    
    // Add connected peers
    for (const peerId in connections) {
        addParticipant(
            peerId,
            `User-${peerId.substr(5, 3)}`,
            'https://i.imgur.com/JgYD2nQ.png',
            true
        );
    }
}

// Add a participant to the list
function addParticipant(id, name, avatar, speaking, isCurrentUser = false) {
    const participant = document.createElement('div');
    participant.className = 'flex items-center p-3 bg-gray-800 rounded-lg';
    participant.innerHTML = `
        <img src="${avatar}" alt="${name}" class="w-10 h-10 rounded-full mr-3">
        <div class="flex-1">
            <h4 class="font-medium">${name} ${isCurrentUser ? '(You)' : ''}</h4>
            <p class="text-xs text-gray-400">${speaking ? 'Speaking' : 'Muted'}</p>
        </div>
        <div class="w-3 h-3 rounded-full ${speaking ? 'bg-green-500 pulse' : 'bg-gray-500'}"></div>
    `;
    participantsList.appendChild(participant);
}

// Toggle hearing yourself
function toggleHearMyself() {
    isHearingMyself = !isHearingMyself;
    
    if (isHearingMyself) {
        // Connect local audio to destination (hear yourself)
        localAudioBuffer.connect(audioContext.destination);
        localAudioBuffer.gain.value = 1;
        hearMyselfBtn.classList.add('hear-myself-active');
    } else {
        // Disconnect local audio
        localAudioBuffer.disconnect();
        hearMyselfBtn.classList.remove('hear-myself-active');
    }
}

// Toggle mute
function toggleMute() {
    isMuted = !isMuted;
    
    if (audioStream) {
        audioStream.getAudioTracks().forEach(track => {
            track.enabled = !isMuted;
        });
    }
    
    muteBtn.querySelector('div').className = isMuted ? 
        'w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1' :
        'w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1 pulse';
    
    muteBtn.querySelector('span').textContent = isMuted ? 'Unmute' : 'Mute';
    
    updateParticipants();
}

// End call
function endCall() {
    // Close all connections
    for (const peerId in connections) {
        connections[peerId].call
