// User Data
let currentUser = {
    id: '',
    name: '',
    avatar: ''
};

// PeerJS connection
let peer;
let currentCall;
let connections = {};
let audioStream;
let isMuted = false;
let isSpeakerOn = true;

// DOM Elements
const loadingScreen = document.getElementById('loadingScreen');
const skipLoadingBtn = document.getElementById('skipLoadingBtn');
const loginScreen = document.getElementById('loginScreen');
const googleLoginBtn = document.getElementById('googleLoginBtn');
const profileSetup = document.getElementById('profileSetup');
const usernameInput = document.getElementById('usernameInput');
const continueBtn = document.getElementById('continueBtn');
const profileImage = document.getElementById('profileImage');
const app = document.getElementById('app');
const userAvatar = document.getElementById('userAvatar');
const usernameDisplay = document.getElementById('usernameDisplay');

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
const muteBtn = document.getElementById('muteBtn');
const speakerBtn = document.getElementById('speakerBtn');
const disconnectBtn = document.getElementById('disconnectBtn');

// Mock data
const mockUsers = [
    { id: '2', name: 'GameMaster99', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: true },
    { id: '3', name: 'ProPlayer42', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: true },
    { id: '4', name: 'NoobSlayer', avatar: 'https://i.imgur.com/JgYD2nQ.png', online: false }
];

const mockGroups = [
    { id: 'ABC123', name: 'Epic Gamers', members: 3 },
    { id: 'XYZ789', name: 'Pro Team', members: 5 }
];

// Initialize the app
function init() {
    // Simulate loading
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }, 3000);
    
    // Event listeners
    skipLoadingBtn.addEventListener('click', () => {
        loadingScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    });
    
    // Google login simulation
    googleLoginBtn.addEventListener('click', () => {
        // In a real app, this would use Google OAuth
        currentUser = {
            id: '1',
            name: 'Player' + Math.floor(Math.random() * 1000),
            avatar: 'https://i.imgur.com/JgYD2nQ.png'
        };
        
        profileImage.src = currentUser.avatar;
        profileSetup.classList.remove('hidden');
    });
    
    continueBtn.addEventListener('click', () => {
        if (usernameInput.value.trim()) {
            currentUser.name = usernameInput.value.trim();
            completeLogin();
        }
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
    
    // Friends
    addFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.remove('hidden');
    });
    
    cancelAddFriendBtn.addEventListener('click', () => {
        addFriendModal.classList.add('hidden');
    });
    
    friendSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const results = mockUsers.filter(user => 
            user.name.toLowerCase().includes(query) && user.id !== currentUser.id
        );
        
        displaySearchResults(results);
    });
    
    // Groups
    createGroupBtn.addEventListener('click', () => {
        createGroupModal.classList.remove('hidden');
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
    });
    
    confirmJoinGroupBtn.addEventListener('click', () => {
        if (groupCodeInput.value.trim().length === 6) {
            joinGroupModal.classList.add('hidden');
            startVoiceChat('Joined Group', groupCodeInput.value.trim().toUpperCase());
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
    muteBtn.addEventListener('click', toggleMute);
    speakerBtn.addEventListener('click', toggleSpeaker);
    disconnectBtn.addEventListener('click', endCall);
    
    // Initialize PeerJS when app starts
    initPeerJS();
}

// Complete login process
function completeLogin() {
    loginScreen.classList.add('hidden');
    app.classList.remove('hidden');
    
    userAvatar.src = currentUser.avatar;
    usernameDisplay.textContent = currentUser.name;
    
    // Load friends and groups
    loadFriends();
    loadGroups();
}

// Initialize PeerJS for voice chat
function initPeerJS() {
    // Generate a random peer ID
    const peerId = 'user-' + Math.random().toString(36).substr(2, 9);
    
    // Create peer connection
    peer = new Peer(peerId);
    
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
                stream: remoteStream
            };
            
            // Update UI with new participant
            updateParticipants();
        });
        
        call.on('close', () => {
            delete connections[call.peer];
            updateParticipants();
        });
    });
}

// Start voice chat
async function startVoiceChat(groupName, groupCode) {
    try {
        // Get user's microphone
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Show voice chat screen
        voiceChatScreen.classList.remove('hidden');
        currentGroupName.textContent = groupName;
        currentGroupCode.textContent = `Code: ${groupCode}`;
        
        // In a real app, you would connect to other peers here
        // For demo purposes, we'll just show the current user
        updateParticipants();
        
        // Add mock participants after a delay
        setTimeout(() => {
            addMockParticipants();
        }, 1500);
    } catch (err) {
        console.error('Error accessing microphone:', err);
        alert('Could not access microphone. Please check permissions.');
    }
}

// Update participants list
function updateParticipants() {
    participantsList.innerHTML = '';
    
    // Add current user
    addParticipant(currentUser.id, currentUser.name, currentUser.avatar, !isMuted);
    
    // Add connected peers
    for (const peerId in connections) {
        const connection = connections[peerId];
        addParticipant(peerId, `User-${peerId.substr(5, 3)}`, 'https://i.imgur.com/JgYD2nQ.png', true);
    }
}

// Add a participant to the list
function addParticipant(id, name, avatar, speaking) {
    const participant = document.createElement('div');
    participant.className = 'flex items-center p-3 bg-gray-800 rounded-lg';
    participant.innerHTML = `
        <img src="${avatar}" alt="${name}" class="w-10 h-10 rounded-full mr-3">
        <div class="flex-1">
            <h4 class="font-medium">${name}</h4>
            <p class="text-xs text-gray-400">${speaking ? 'Speaking' : 'Muted'}</p>
        </div>
        <div class="w-3 h-3 rounded-full ${speaking ? 'bg-green-500 pulse' : 'bg-gray-500'}"></div>
    `;
    participantsList.appendChild(participant);
}

// Add mock participants for demo
function addMockParticipants() {
    // In a real app, these would be actual connections
    const mockParticipants = [
        { id: 'mock1', name: 'GameMaster99' },
        { id: 'mock2', name: 'ProPlayer42' }
    ];
    
    mockParticipants.forEach(participant => {
        addParticipant(participant.id, participant.name, 'https://i.imgur.com/JgYD2nQ.png', true);
    });
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
        'w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1';
    
    muteBtn.querySelector('span').textContent = isMuted ? 'Unmute' : 'Mute';
    
    updateParticipants();
}

// Toggle speaker
function toggleSpeaker() {
    isSpeakerOn = !isSpeakerOn;
    
    // In a real app, you would toggle the audio output here
    speakerBtn.querySelector('div').className = isSpeakerOn ? 
        'w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-1' :
        'w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-1';
    
    speakerBtn.querySelector('span').textContent = isSpeakerOn ? 'Speaker Off' : 'Speaker On';
}

// End call
function endCall() {
    // Close all connections
    for (const peerId in connections) {
        connections[peerId].call.close();
    }
    connections = {};
    
    // Stop local audio stream
    if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
        audioStream = null;
    }
    
    // Hide voice chat screen
    voiceChatScreen.classList.add('hidden');
}

// Load friends list
function loadFriends() {
    friendsList.innerHTML = '';
    
    mockUsers.forEach(user => {
        const friend = document.createElement('div');
        friend.className = 'flex items-center p-3 bg-gray-800 rounded-lg';
        friend.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full mr-3">
            <div class="flex-1">
                <h4 class="font-medium">${user.name}</h4>
                <p class="text-xs ${user.online ? 'text-green-500' : 'text-gray-500'}">${user.online ? 'Online' : 'Offline'}</p>
            </div>
            <button class="voice-btn p-2 bg-green-500 rounded-full ${!user.online ? 'opacity-50' : ''}" ${!user.online ? 'disabled' : ''}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
        `;
        
        // Add click event to start voice chat
        if (user.online) {
            friend.querySelector('button').addEventListener('click', () => {
                startVoiceChat(`Private chat with ${user.name}`, 'PVT');
            });
        }
        
        friendsList.appendChild(friend);
    });
}

// Load groups list
function loadGroups() {
    groupsList.innerHTML = '';
    
    mockGroups.forEach(group => {
        const groupItem = document.createElement('div');
        groupItem.className = 'flex items-center p-3 bg-gray-800 rounded-lg';
        groupItem.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            </div>
            <div class="flex-1">
                <h4 class="font-medium">${group.name}</h4>
                <p class="text-xs text-gray-400">${group.members} members</p>
            </div>
            <button class="voice-btn p-2 bg-green-500 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </button>
        `;
        
        // Add click event to join group voice chat
        groupItem.querySelector('button').addEventListener('click', () => {
            startVoiceChat(group.name, group.id);
        });
        
        groupsList.appendChild(groupItem);
    });
}

// Display search results
function displaySearchResults(results) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="text-gray-400 text-center py-4">No users found</p>';
        return;
    }
    
    results.forEach(user => {
        const result = document.createElement('div');
        result.className = 'flex items-center p-3 bg-gray-700 rounded-lg';
        result.innerHTML = `
            <img src="${user.avatar}" alt="${user.name}" class="w-10 h-10 rounded-full mr-3">
            <div class="flex-1">
                <h4 class="font-medium">${user.name}</h4>
                <p class="text-xs ${user.online ? 'text-green-500' : 'text-gray-500'}">${user.online ? 'Online' : 'Offline'}</p>
            </div>
            <button class="p-2 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            </button>
        `;
        
        searchResults.appendChild(result);
    });
}

// Generate random group code
function generateGroupCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
