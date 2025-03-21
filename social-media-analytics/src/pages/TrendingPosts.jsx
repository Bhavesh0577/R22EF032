import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress, Paper } from '@mui/material';
import { getUsers, getAllPosts, getPostComments } from '../services/api';
import PostCard from '../components/PostCard';

const TrendingPosts = () => {
    const [users, setUsers] = useState({});
    const [posts, setPosts] = useState([]);
    const [commentCounts, setCommentCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch all users
                const userData = await getUsers();
                setUsers(userData);

                // Fetch all posts
                const postsData = await getAllPosts();
                setPosts(postsData);

                // Get comment counts for each post
                const counts = {};
                const promises = postsData.map(async (post) => {
                    try {
                        const comments = await getPostComments(post.id);
                        counts[post.id] = comments ? comments.length : 0;
                    } catch (err) {
                        console.error(`Error fetching comments for post ${post.id}:`, err);
                        counts[post.id] = 0;
                    }
                });

                await Promise.all(promises);
                setCommentCounts(counts);
            } catch (err) {
                setError("Failed to fetch data. Please try again later.");
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Find the top 5 posts with most comments
    const getTrendingPosts = () => {
        return [...posts]
            .filter(post => post.id in commentCounts)
            .sort((a, b) => commentCounts[b.id] - commentCounts[a.id])
            .slice(0, 5);
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

    const trendingPosts = getTrendingPosts();

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Trending Posts
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Posts with the highest number of comments
            </Typography>

            <Box sx={{ mt: 3 }}>
                {trendingPosts.length > 0 ? (
                    trendingPosts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            userName={users[post.userid]}
                            commentCount={commentCounts[post.id]}
                            showComments={true}
                        />
                    ))
                ) : (
                    <Typography>No trending posts available</Typography>
                )}
            </Box>
        </Paper>
    );
};

export default TrendingPosts; 