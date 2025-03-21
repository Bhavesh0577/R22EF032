// Mock data for testing when the API is unavailable
const mockUsers = {
    "1": "John Doe",
    "2": "Jane Smith",
    "3": "Bob Johnson",
    "4": "Alice Williams",
    "5": "Charlie Brown"
};

const mockPosts = {
    "1": [
        { id: "101", userid: "1", content: "This is my first post about technology!" },
        { id: "102", userid: "1", content: "Just learned about React hooks, they're amazing!" },
        { id: "103", userid: "1", content: "Working on a new project with Material UI" }
    ],
    "2": [
        { id: "201", userid: "2", content: "Hello world! This is my first post." },
        { id: "202", userid: "2", content: "Beautiful day for coding!" }
    ],
    "3": [
        { id: "301", userid: "3", content: "Just finished a marathon coding session" },
        { id: "302", userid: "3", content: "New features deployed to production!" },
        { id: "303", userid: "3", content: "Learning TypeScript today" },
        { id: "304", userid: "3", content: "Coffee is a programmer's best friend" }
    ],
    "4": [
        { id: "401", userid: "4", content: "Working on my portfolio website" },
        { id: "402", userid: "4", content: "Just solved a difficult algorithm challenge" }
    ],
    "5": [
        { id: "501", userid: "5", content: "Started learning about web accessibility" },
        { id: "502", userid: "5", content: "Responsive design is crucial for modern web apps" },
        { id: "503", userid: "5", content: "Performance optimization techniques I learned today" }
    ]
};

const mockComments = {
    "101": [
        { id: "1001", userId: "2", content: "Great post!", userName: "Jane Smith" },
        { id: "1002", userId: "3", content: "I agree!", userName: "Bob Johnson" },
        { id: "1003", userId: "4", content: "Can you share more details?", userName: "Alice Williams" }
    ],
    "201": [
        { id: "2001", userId: "1", content: "Welcome to the platform!", userName: "John Doe" },
        { id: "2002", userId: "5", content: "Looking forward to more posts!", userName: "Charlie Brown" }
    ],
    "301": [
        { id: "3001", userId: "2", content: "How many hours did you code?", userName: "Jane Smith" },
        { id: "3002", userId: "4", content: "What were you working on?", userName: "Alice Williams" }
    ],
    "302": [
        { id: "3021", userId: "1", content: "Congrats!", userName: "John Doe" }
    ],
    "401": [
        { id: "4001", userId: "3", content: "What technologies are you using?", userName: "Bob Johnson" },
        { id: "4002", userId: "5", content: "Would love to see it when it's done!", userName: "Charlie Brown" }
    ],
    "501": [
        { id: "5001", userId: "2", content: "So important!", userName: "Jane Smith" },
        { id: "5002", userId: "1", content: "Any good resources you can recommend?", userName: "John Doe" }
    ]
};

// Delay function to simulate network latency
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const getUsers = async () => {
    await delay(800); // Simulate network delay
    return mockUsers;
};

export const getUserPosts = async (userId) => {
    await delay(600);
    return mockPosts[userId] || [];
};

export const getPostComments = async (postId) => {
    await delay(500);
    return mockComments[postId] || [];
};

export const getAllPosts = async () => {
    await delay(1000);
    return Object.values(mockPosts).flat();
}; 