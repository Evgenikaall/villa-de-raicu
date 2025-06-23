import { Box, Container, Typography } from '@mui/material';
import Navigation from './Navigation';

type LayoutProps = {
    title?: string;
    children: any;
};

const Layout = ({ title, children }: LayoutProps) => (
    <>
        <Navigation />
        <Container maxWidth="xl">
            {title && (
                <Box my={4}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {title}
                    </Typography>
                </Box>
            )}
            <Box>
                {children}
            </Box>
        </Container>
    </>
);

export default Layout;