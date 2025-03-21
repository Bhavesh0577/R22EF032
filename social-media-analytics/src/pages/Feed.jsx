import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Paper, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getUsers, getAllPosts } from '../services/api';
import PostCard from '../components/PostCard';

const Feed = () => {
    const [users, setUsers] = useState({});
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // Function to fetch all data
    const fetchData = async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // Fetch all users
            const userData = await getUsers();
            setUsers(userData);

            // Fetch all posts
            const postsData = await getAllPosts();

            // Sort by newest first (assuming newer posts have higher IDs)
            const sortedPosts = [...postsData].sort((a, b) => b.id - a.id);
            setPosts(sortedPosts);

            // Clear any previous errors if fetch is successful
            setError(null);
        } catch (err) {
            setError("Failed to fetch data. Please try again later.");
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchData(true);
    };

    // Initial data fetch
    useEffect(() => {
        fetchData();

        // Set up polling for real-time updates
        const intervalId = setInterval(() => {
            fetchData(true);
        }, 30000); // Poll every 30 seconds

        // Clean up interval on component unmount
        return () => clearInterval(intervalId);
    }, []);

    if (loading && posts.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <div>
                    <Typography variant="h4" gutterBottom>
                        Feed
                    </Typography>
                    <Typography variant="subtitle1">
                        Real-time posts from users (newest first)
                    </Typography>
                </div>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    Refresh
                </Button>
            </Box>

            {error && (
                <Box sx={{ p: 2, mb: 3, bgcolor: '#ffebee', borderRadius: 1 }}>
                    <Typography color="error">{error}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                        Check your network connection and the API endpoint configuration. The server might be unavailable.
                    </Typography>
                </Box>
            )}

            {refreshing && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Updating feed...
                    </Typography>
                </Box>
            )}

            <Box sx={{ mt: 3 }}>
                {posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            userName={users[post.userid]}
                            showComments={false}
                        />
                    ))
                ) : (
                    <Box sx={{ p: 3, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body1">No posts available</Typography>
                        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                            There might be an issue connecting to the API or no posts exist yet.
                        </Typography>
                        <Button
                            variant="contained"
                            sx={{ mt: 2 }}
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            Try Again
                        </Button>
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default Feed; 