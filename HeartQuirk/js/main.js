// ==================== SIGNUP ====================
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        const data = Object.fromEntries(formData.entries());

        const res = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        document.getElementById('msg').innerText = result.success
            ? `Signed up! Your quirk: ${result.quirk}. Go to login.`
            : result.msg;
    });
}

// ==================== DISCOVER / SWIPE ====================
const unameElem = document.getElementById('uname');
const uquirkElem = document.getElementById('uquirk');
const likeBtn = document.getElementById('likeBtn');
const nextBtn = document.getElementById('nextBtn');
const matchMsg = document.getElementById('matchMsg');

let currentUser = localStorage.getItem('username') || 'Alice'; // Default for demo
let discoverUsers = [];
let index = 0;

// Load users for discovery
async function loadDiscover() {
    if (!unameElem) return; // If not on discover page, skip
    const res = await fetch(`/discover/${currentUser}`);
    discoverUsers = await res.json();
    showUser();
}

// Show the current user card
function showUser() {
    if (discoverUsers.length === 0) {
        unameElem.innerText = 'No users yet!';
        uquirkElem.innerText = '';
        return;
    }
    const user = discoverUsers[index];
    unameElem.innerText = user.username;
    uquirkElem.innerText = `Quirk: ${user.quirk} | Hobby: ${user.hobby}`;
}

// Handle Like button
if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
        const likedUser = discoverUsers[index].username;
        const res = await fetch('/like', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ liker: currentUser, liked: likedUser })
        });
        const result = await res.json();

        if (result.match) {
            matchMsg.innerText = `🎉 It's a match with ${likedUser}! 🎉`;
            // Save match to localStorage for match.html
            let storedMatches = JSON.parse(localStorage.getItem('matches') || '[]');
            storedMatches.push({
                username: likedUser,
                quirk: discoverUsers[index].quirk
            });
            localStorage.setItem('matches', JSON.stringify(storedMatches));
        } else {
            matchMsg.innerText = `You liked ${likedUser}!`;
        }
    });
}

// Handle Next button
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (discoverUsers.length === 0) return;
        index = (index + 1) % discoverUsers.length;
        matchMsg.innerText = '';
        showUser();
    });
}

// Load discover users on page load
loadDiscover();
