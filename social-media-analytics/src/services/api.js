import axios from 'axios';
import * as mockApi from './mockApi';

// Try different URL endpoints
const API_URLs = [
    'http://20.244.56.144/api',
    'http://20.244.56.144/test',
    'http://20.244.56.144/v1'
];

// Flag to use mock data when API fails
let useMockData = false;

const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQyNTMzNTA5LCJpYXQiOjE3NDI1MzMyMDksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVlZGQ5ZWU3LTgyMjEtNGI1Yy05NDk0LTBiOWYzMGUzMjMzNSIsInN1YiI6InVnY2V0MjIwNjU2QHJldmEuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiUmV2YSBVbml2ZXJzaXR5IiwiY2xpZW50SUQiOiI1ZWRkOWVlNy04MjIxLTRiNWMtOTQ5NC0wYjlmMzBlMzIzMzUiLCJjbGllbnRTZWNyZXQiOiJxU05GTElmdFlRaldhTWtlIiwib3duZXJOYW1lIjoiQmhhdmVzaCIsIm93bmVyRW1haWwiOiJ1Z2NldDIyMDY1NkByZXZhLmVkdS5pbiIsInJvbGxObyI6IlIyMkVGMDMyIn0.tVcw8Wueq9GZLXXRBUoliQSpiBRgZ0P2LZtGLWlX11Q';

// Create axios instance for reuse
const api = axios.create({
    baseURL: API_URLs[0],
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    // Add timeout to avoid hanging requests
    timeout: 10000
});

// Check if any API endpoint works
const checkApiAvailability = async () => {
    for (const url of API_URLs) {
        try {
            const instance = axios.create({
                baseURL: url,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                },
                timeout: 5000
            });

            const response = await instance.get('/users');
            if (response.status === 200) {
                api.defaults.baseURL = url;
                console.log(`API available at ${url}`);
                return true;
            }
        } catch (error) {
            console.error(`API not available at ${url}:`, error.message);
        }
    }

    console.log('No API endpoint is available, using mock data');
    useMockData = true;
    return false;
};

// Check API availability on startup
checkApiAvailability();

// Get all users
export const getUsers = async () => {
    // Use mock data if API is unavailable
    if (useMockData) {
        return mockApi.getUsers();
    }

    try {
        console.log('Fetching users from:', `${api.defaults.baseURL}/users`);
        const response = await api.get('/users');
        console.log('Users API response:', response.data);
        return response.data.users || {};
    } catch (error) {
        console.error('Error fetching users:', error);
        // Fall back to mock data
        useMockData = true;
        return mockApi.getUsers();
    }
};

// Get posts for a specific user
export const getUserPosts = async (userId) => {
    // Use mock data if API is unavailable
    if (useMockData) {
        return mockApi.getUserPosts(userId);
    }

    try {
        console.log('Fetching posts for user:', userId);
        const response = await api.get(`/users/${userId}/posts`);
        console.log(`Posts for user ${userId}:`, response.data);
        return response.data.posts || [];
    } catch (error) {
        console.error(`Error fetching posts for user ${userId}:`, error);
        // Fall back to mock data
        useMockData = true;
        return mockApi.getUserPosts(userId);
    }
};

// Get comments for a specific post
export const getPostComments = async (postId) => {
    // Use mock data if API is unavailable
    if (useMockData) {
        return mockApi.getPostComments(postId);
    }

    try {
        const response = await api.get(`/posts/${postId}/comments`);
        return response.data.comments || [];
    } catch (error) {
        console.error(`Error fetching comments for post ${postId}:`, error);
        // Fall back to mock data
        useMockData = true;
        return mockApi.getPostComments(postId);
    }
};

// Fetch all posts for all users
export const getAllPosts = async () => {
    // Use mock data if API is unavailable
    if (useMockData) {
        return mockApi.getAllPosts();
    }

    try {
        // First get all users
        const users = await getUsers();

        if (Object.keys(users).length === 0) {
            console.error('No users found, cannot fetch posts');
            // Fall back to mock data
            useMockData = true;
            return mockApi.getAllPosts();
        }

        // Then get posts for each user
        const postsPromises = Object.keys(users).map(userId => getUserPosts(userId));
        const postsResults = await Promise.all(postsPromises);

        // Flatten the array of post arrays
        return postsResults.flat();
    } catch (error) {
        console.error('Error fetching all posts:', error);
        // Fall back to mock data
        useMockData = true;
        return mockApi.getAllPosts();
    }
}; 