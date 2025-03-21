import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Paper, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { getUsers, getUserPosts } from '../services/api';
import UserCard from '../components/UserCard';

const TopUsers = () => {
    const [users, setUsers] = useState({});
    const [postCounts, setPostCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async (refresh = false) => {
            setLoading(true);
            try {
                // Fetch all users
                const userData = await getUsers();
                setUsers(userData);

                // Fetch posts for each user to count them
                const counts = {};

                // Create an array of promises to fetch posts for each user
                const promises = Object.keys(userData).map(async (userId) => {
                    const posts = await getUserPosts(userId);
                    counts[userId] = posts ? posts.length : 0;
                });

                // Wait for all promises to resolve
                await Promise.all(promises);
                setPostCounts(counts);
            } catch (err) {
                setError("Failed to fetch user data. Please try again later.");
                console.error("Error fetching user data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Sort users by post count and get top 5
    const getTopUsers = () => {
        return Object.entries(postCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    };

    // Handle manual refresh
    const handleRefresh = () => {
        fetchData(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mt: 4 }}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const topUsers = getTopUsers();

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Top Users
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                The five users with the highest number of posts
            </Typography>

            <Box sx={{ mt: 3 }}>
                {topUsers.length > 0 ? (
                    topUsers.map(([userId, count], index) => (
                        <UserCard
                            key={userId}
                            user={users[userId]}
                            postCount={count}
                            rank={index + 1}
                        />
                    ))
                ) : (
                    <Typography>No user data available</Typography>
                )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                >
                    Refresh
                </Button>
            </Box>
        </Paper>
    );
};

export default TopUsers; 