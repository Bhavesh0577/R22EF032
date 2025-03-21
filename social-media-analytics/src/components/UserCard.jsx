import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

const UserCard = ({ user, postCount, rank }) => {
    // Generate a random avatar for the user
    const avatarUrl = `https://i.pravatar.cc/150?img=${rank}`;

    return (
        <Card sx={{ display: 'flex', mb: 2, width: '100%' }}>
            <CardMedia
                component="img"
                sx={{ width: 100, height: 100 }}
                image={avatarUrl}
                alt={user}
            />
            <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        {user}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary" component="div">
                        Rank: #{rank}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" component="div">
                        Total Posts: {postCount}
                    </Typography>
                </CardContent>
            </Box>
        </Card>
    );
};

export default UserCard; 