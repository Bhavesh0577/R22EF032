import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardMedia, Typography, Avatar, IconButton, Box, Chip } from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';
import { getPostComments } from '../services/api';
import { getRandomImageUrl } from '../utils/helpers';

const PostCard = ({ post, userName, commentCount = null, showComments = false }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // Generate a random image for the post
    const postImageUrl = getRandomImageUrl(post.id);

    // Function to fetch comments
    const fetchComments = async () => {
        if (showComments && expanded) {
            setLoading(true);
            try {
                const commentsData = await getPostComments(post.id);
                setComments(commentsData || []);
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        }
    };

    // Toggle comments visibility
    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    // Fetch comments when expanded changes
    useEffect(() => {
        fetchComments();
    }, [expanded, post.id]);

    return (
        <Card sx={{ mb: 3, maxWidth: "100%" }}>
            <CardHeader
                avatar={
                    <Avatar aria-label="user" src={`https://i.pravatar.cc/40?u=${post.userid}`}>
                        {userName ? userName.charAt(0) : 'U'}
                    </Avatar>
                }
                title={userName || `User ${post.userid}`}
                subheader={`Post ID: ${post.id}`}
            />
            <CardMedia
                component="img"
                height="194"
                image={postImageUrl}
                alt="Post image"
            />
            <CardContent>
                <Typography variant="body1">
                    {post.content}
                </Typography>

                {commentCount !== null && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Chip
                            icon={<CommentIcon />}
                            label={`${commentCount} comments`}
                            variant="outlined"
                        />
                    </Box>
                )}

                {showComments && (
                    <Box sx={{ mt: 2 }}>
                        <IconButton
                            onClick={handleExpandClick}
                            aria-expanded={expanded}
                            aria-label="show comments"
                        >
                            <CommentIcon />
                            <Typography variant="body2" sx={{ ml: 1 }}>
                                {expanded ? "Hide Comments" : "Show Comments"}
                            </Typography>
                        </IconButton>

                        {expanded && (
                            <Box sx={{ mt: 2 }}>
                                {loading ? (
                                    <Typography variant="body2">Loading comments...</Typography>
                                ) : comments.length > 0 ? (
                                    comments.map((comment) => (
                                        <Box key={comment.id} sx={{ mb: 2, p: 1, bgcolor: 'background.paper' }}>
                                            <Typography variant="subtitle2">
                                                {comment.userName || `User ${comment.userId}`}
                                            </Typography>
                                            <Typography variant="body2">{comment.content}</Typography>
                                        </Box>
                                    ))
                                ) : (
                                    <Typography variant="body2">No comments yet</Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

export default PostCard; 