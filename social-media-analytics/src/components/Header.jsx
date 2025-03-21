import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Social Media Analytics
                </Typography>
                <Box>
                    <Button color="inherit" component={Link} to="/">
                        Feed
                    </Button>
                    <Button color="inherit" component={Link} to="/top-users">
                        Top Users
                    </Button>
                    <Button color="inherit" component={Link} to="/trending-posts">
                        Trending Posts
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header; 