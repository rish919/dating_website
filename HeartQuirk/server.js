const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname))); // serve HTML, CSS, JS

// ==================== IN-MEMORY DATABASE ====================
let users = []; // store users { username, password, age, hobby, quirk, likes: [], likedBy: [] }
let matches = {}; // store matches { username: [matchedUsernames] }
let messages = {}; // store messages { "user1-user2": [{user,msg}] }

// ==================== SIGNUP ====================
app.post('/signup', (req, res) => {
    const { username, password, age, hobby } = req.body;
    if (!username || !password || !age || !hobby) return res.json({ success: false, msg: "All fields required" });
    
    if (users.find(u => u.username === username)) return res.json({ success: false, msg: "Username exists" });
    
    // Assign a quirky quirk
    const quirks = ["Sings in shower", "Loves coding in pajamas", "Eats pizza upside down", "Dances randomly"];
    const quirk = quirks[Math.floor(Math.random() * quirks.length)];

    users.push({ username, password, age, hobby, quirk, likes: [], likedBy: [] });
    matches[username] = [];

    res.json({ success: true, quirk });
});

// ==================== LOGIN ====================
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.json({ success: false, msg: "Invalid credentials" });
    res.json({ success: true });
});

// ==================== DISCOVER ====================
app.get('/discover/:username', (req, res) => {
    const currentUser = req.params.username;
    const discoverUsers = users.filter(u => u.username !== currentUser);
    res.json(discoverUsers);
});

// ==================== LIKE ====================
app.post('/like', (req, res) => {
    const { liker, liked } = req.body;
    const likerUser = users.find(u => u.username === liker);
    const likedUser = users.find(u => u.username === liked);

    if (!likerUser || !likedUser) return res.json({ match: false });

    likerUser.likes.push(liked);
    likedUser.likedBy.push(liker);

    // Check for mutual match
    const isMatch = likedUser.likes.includes(liker);
    if (isMatch) {
        if (!matches[liker].includes(liked)) matches[liker].push(liked);
        if (!matches[liked].includes(liker)) matches[liked].push(liker);
    }

    res.json({ match: isMatch });
});

// ==================== CHAT (IN-MEMORY) ====================
app.get('/chat/:user1/:user2', (req, res) => {
    const key = [req.params.user1, req.params.user2].sort().join("-");
    res.json(messages[key] || []);
});

app.post('/chat/:user1/:user2', (req, res) => {
    const key = [req.params.user1, req.params.user2].sort().join("-");
    if (!messages[key]) messages[key] = [];
    messages[key].push({ user: req.params.user1, msg: req.body.msg });
    res.json({ success: true });
});

// ==================== SERVE HTML PAGES ====================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'signup.html')));
app.get('/discover.html', (req, res) => res.sendFile(path.join(__dirname, 'discover.html')));
app.get('/match.html', (req, res) => res.sendFile(path.join(__dirname, 'match.html')));
app.get('/chat.html', (req, res) => res.sendFile(path.join(__dirname, 'chat.html')));

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HeartQuirk server running on port ${PORT}`));
