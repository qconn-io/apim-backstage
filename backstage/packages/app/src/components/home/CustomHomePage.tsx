import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Container,
  Avatar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Content, Page, Header } from '@backstage/core-components';

const useStyles = makeStyles((theme) => ({
  root: {
    background: 'transparent',
  },
  heroSection: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
    borderRadius: 16,
    padding: theme.spacing(6, 4),
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  heroTitle: {
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  heroSubtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(4),
    maxWidth: 600,
    margin: '0 auto',
  },
  quickActionsCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: 16,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      border: '1px solid rgba(99, 102, 241, 0.5)',
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 32px rgba(99, 102, 241, 0.15)',
    },
  },
  quickActionIcon: {
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    color: '#ffffff',
    width: 48,
    height: 48,
    marginBottom: theme.spacing(2),
    fontSize: '1.5rem',
  },
  statCard: {
    background: 'rgba(30, 41, 59, 0.6)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.3)',
    borderRadius: 16,
    padding: theme.spacing(3),
    textAlign: 'center',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      border: '1px solid rgba(16, 185, 129, 0.5)',
      transform: 'translateY(-2px)',
    },
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
  },
  statLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  statusChip: {
    fontWeight: 600,
    fontSize: '0.75rem',
  },
}));

// Mock data for demonstration
const quickActions = [
  {
    title: 'Browse APIs',
    description: 'Explore and discover available APIs',
    emoji: '🔗',
    color: '#6366f1',
    href: '/catalog?filters[kind]=api',
  },
  {
    title: 'API Security',
    description: 'Review security policies and compliance',
    emoji: '🔒',
    color: '#ef4444',
    href: '/security',
  },
  {
    title: 'Analytics',
    description: 'View API usage and performance metrics',
    emoji: '📊',
    color: '#10b981',
    href: '/analytics',
  },
  {
    title: 'Documentation',
    description: 'Access API documentation and guides',
    emoji: '📚',
    color: '#f59e0b',
    href: '/docs',
  },
  {
    title: 'Gateway Config',
    description: 'Manage API gateway configurations',
    emoji: '⚙️',
    color: '#8b5cf6',
    href: '/gateway-config',
  },
  {
    title: 'Monitoring',
    description: 'System health and observability',
    emoji: '📈',
    color: '#06b6d4',
    href: '/monitoring',
  },
];

const platformStats = [
  { label: 'Active APIs', value: '247', trend: '+12%' },
  { label: 'Monthly Requests', value: '2.8M', trend: '+23%' },
  { label: 'Partners', value: '156', trend: '+8%' },
  { label: 'Uptime', value: '99.9%', trend: '+0.1%' },
];

export const CustomHomePage = () => {
  const classes = useStyles();

  return (
    <Page themeId="home">
      <Header title="" />
      <Content className={classes.root}>
        <Container maxWidth="xl">
          {/* Hero Section */}
          <Box className={classes.heroSection}>
            <Typography variant="h1" className={classes.heroTitle}>
              API Management Platform
            </Typography>
            <Typography variant="h6" className={classes.heroSubtitle}>
              Your centralized hub for enterprise API lifecycle management, 
              security, and partner collaboration.
            </Typography>
            
            {/* Simple Search Section */}
            <Box marginBottom={2}>
              <Typography variant="body1" color="textSecondary">
                🔍 Start exploring APIs and services
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="primary" 
              size="large"
              href="/catalog"
              style={{ marginRight: 16 }}
            >
              Explore APIs
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              href="/create"
            >
              Create New API
            </Button>
          </Box>

          <Grid container spacing={4}>
            {/* Platform Statistics */}
            <Grid item xs={12}>
              <Typography variant="h4" className={classes.sectionTitle}>
                Platform Overview
              </Typography>
              <Grid container spacing={3}>
                {platformStats.map((stat) => (
                  <Grid item xs={12} sm={6} md={3} key={`stat-${stat.label}`}>
                    <Card className={classes.statCard}>
                      <Typography variant="h2" className={classes.statNumber}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" className={classes.statLabel}>
                        {stat.label}
                      </Typography>
                      <Chip
                        label={stat.trend}
                        size="small"
                        className={classes.statusChip}
                        style={{ 
                          background: 'rgba(16, 185, 129, 0.1)',
                          color: '#10b981',
                          marginTop: 8,
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Typography variant="h4" className={classes.sectionTitle}>
                Quick Actions
              </Typography>
              <Grid container spacing={3}>
                {quickActions.map((action) => (
                  <Grid item xs={12} sm={6} md={4} key={`action-${action.title}`}>
                    <Card className={classes.quickActionsCard}>
                      <CardContent style={{ textAlign: 'center', padding: 24 }}>
                        <Avatar className={classes.quickActionIcon}>
                          {action.emoji}
                        </Avatar>
                        <Typography variant="h6" style={{ marginBottom: 8, fontWeight: 600 }}>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                      <CardActions style={{ padding: '0 24px 24px', justifyContent: 'center' }}>
                        <Button 
                          color="primary" 
                          variant="outlined"
                          href={action.href}
                          size="small"
                        >
                          Open
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Welcome Message */}
            <Grid item xs={12}>
              <Card style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                <CardContent style={{ padding: 32, textAlign: 'center' }}>
                  <Typography variant="h4" style={{ marginBottom: 16, fontWeight: 600 }}>
                    Welcome to Your API Platform 🚀
                  </Typography>
                  <Typography variant="body1" color="textSecondary" style={{ marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
                    This is your enterprise-grade API management platform. Built with Backstage.io, 
                    it provides comprehensive API lifecycle management, security, and developer experience tools.
                  </Typography>
                  <Grid container spacing={2} justifyContent="center">
                    <Grid item>
                      <Button variant="contained" color="primary" href="/catalog">
                        Browse Catalog
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button variant="outlined" color="primary" href="/docs">
                        Read Documentation
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button variant="outlined" color="secondary" href="/create">
                        Create Component
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Content>
    </Page>
  );
};
