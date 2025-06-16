import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  CardContent,
  Button,
  Chip,
  Container,
  makeStyles,
} from '@material-ui/core';
import {
  Content,
  Page,
  Header,
  InfoCard,
  Link,
  ErrorBoundary,
} from '@backstage/core-components';
import {
  HomePageCompanyLogo,
  HomePageStarredEntities,
  HomePageToolkit,
  HomePageRandomJoke,
  WelcomeTitle,
} from '@backstage/plugin-home';
import {
  useStarredEntities,
  catalogApiRef,
} from '@backstage/plugin-catalog-react';
import { useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
// Use direct routing instead of route refs for simplicity

// Material-UI Icons
import {
  Explore as ExploreIcon,
  Create as CreateIcon,
  Description as DocsIcon,
  Storage as CatalogIcon,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) => ({
  searchBar: {
    display: 'flex',
    maxWidth: 540,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(4),
  },
  heroSection: {
    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
    borderRadius: 16,
    padding: theme.spacing(4),
    marginBottom: theme.spacing(4),
    textAlign: 'center',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  quickActionCard: {
    height: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    borderRadius: 12,
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      border: '1px solid rgba(99, 102, 241, 0.5)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
    },
  },
  statCard: {
    height: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(71, 85, 105, 0.2)',
    borderRadius: 12,
    textAlign: 'center',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
      border: '1px solid rgba(16, 185, 129, 0.5)',
      transform: 'translateY(-2px)',
    },
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing(1),
  },
  gradientText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 600,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },
}));

// Custom statistics component using Backstage Catalog API
const PlatformStatistics = () => {
  const catalogApi = useApi(catalogApiRef);
  const classes = useStyles();
  const [entities, setEntities] = useState<Entity[] | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    const loadEntities = async () => {
      try {
        setLoading(true);
        const response = await catalogApi.getEntities();
        setEntities(response.items);
        setError(undefined);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadEntities();
  }, [catalogApi]);

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <InfoCard className={`${classes.statCard} loading-pulse`}>
              <Typography variant="h2" className={classes.statNumber}>
                --
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Loading...
              </Typography>
              <Chip
                size="small"
                label="Loading"
                style={{
                  background: 'rgba(156, 163, 175, 0.2)',
                  color: '#6b7280',
                  marginTop: 8,
                  fontWeight: 600,
                }}
              />
            </InfoCard>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <InfoCard title="Platform Statistics" className="error-state">
        <Typography color="error" variant="body1">
          Unable to load platform statistics. Please try refreshing the page.
        </Typography>
        <Typography variant="body2" style={{ marginTop: 8 }}>
          Error: {error.message || 'Unknown error occurred'}
        </Typography>
      </InfoCard>
    );
  }

  if (!entities) {
    return (
      <InfoCard title="Platform Statistics">
        <Typography variant="body1" color="textSecondary">
          No catalog data available.
        </Typography>
      </InfoCard>
    );
  }

  const stats = {
    apis: entities.filter(e => e.kind === 'API').length,
    components: entities.filter(e => e.kind === 'Component').length,
    systems: entities.filter(e => e.kind === 'System').length,
    resources: entities.filter(e => e.kind === 'Resource').length,
  };

  const platformStats = [
    { label: 'APIs', value: stats.apis.toString(), color: '#6366f1', description: 'Available APIs' },
    { label: 'Components', value: stats.components.toString(), color: '#10b981', description: 'Software components' },
    { label: 'Systems', value: stats.systems.toString(), color: '#06b6d4', description: 'System architectures' },
    { label: 'Resources', value: stats.resources.toString(), color: '#f59e0b', description: 'Available resources' },
  ];

  return (
    <Grid container spacing={3}>
      {platformStats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.label}>
          <InfoCard className={`${classes.statCard} interactive-card`} title={stat.description}>
            <Typography variant="h2" className={classes.statNumber} aria-label={`${stat.value} ${stat.label}`}>
              {stat.value}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {stat.label}
            </Typography>
            <Chip
              size="small"
              label="Active"
              style={{
                background: `${stat.color}20`,
                color: stat.color,
                marginTop: 8,
                fontWeight: 600,
              }}
              aria-label={`${stat.label} are active`}
            />
          </InfoCard>
        </Grid>
      ))}
    </Grid>
  );
};

// Quick actions with proper Backstage routing
const QuickActionsGrid = () => {
  const classes = useStyles();

  const quickActions = [
    {
      title: 'Browse Catalog',
      description: 'Explore APIs, components, and systems',
      icon: CatalogIcon,
      href: '/catalog',
      color: '#6366f1',
    },
    {
      title: 'API Explorer',
      description: 'Discover and test APIs',
      icon: ExploreIcon,
      href: '/api-docs',
      color: '#10b981',
    },
    {
      title: 'Create Component',
      description: 'Scaffold new services and APIs',
      icon: CreateIcon,
      href: '/create',
      color: '#06b6d4',
    },
    {
      title: 'Documentation',
      description: 'Technical documentation hub',
      icon: DocsIcon,
      href: '/docs',
      color: '#f59e0b',
    },
  ];

  return (
    <Grid container spacing={3}>
      {quickActions.map((action) => {
        const IconComponent = action.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <InfoCard 
              className={`${classes.quickActionCard} interactive-card`}
              aria-labelledby={`action-title-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
            >
              <CardContent style={{ textAlign: 'center', padding: 24 }}>
                <Box mb={2} aria-label={`${action.title} icon`}>
                  <IconComponent
                    style={{
                      fontSize: 40,
                      color: action.color,
                    }}
                    aria-hidden="true"
                  />
                </Box>
                <Typography 
                  variant="h6" 
                  style={{ marginBottom: 8, fontWeight: 600 }}
                  id={`action-title-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {action.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="textSecondary" 
                  style={{ marginBottom: 16 }}
                  aria-describedby={`action-title-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {action.description}
                </Typography>
                <Link to={action.href} aria-label={`Navigate to ${action.title}`}>
                  <Button
                    color="primary"
                    variant="outlined"
                    size="small"
                    aria-describedby={`action-title-${action.title.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    Open
                  </Button>
                </Link>
              </CardContent>
            </InfoCard>
          </Grid>
        );
      })}
    </Grid>
  );
};

export const CustomHomePage = () => {
  const classes = useStyles();
  const { starredEntities } = useStarredEntities();
  const starredCount = Array.from(starredEntities).length;

  return (
    <Page themeId="home">
      <Header title="" />
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Content>
        <Container maxWidth="xl">
          {/* Hero Section with Logo */}
          <header className={classes.heroSection} aria-label="Welcome section">
            <Box className={classes.logoContainer}>
              <HomePageCompanyLogo />
            </Box>
            
            <WelcomeTitle />
            
            <Typography 
              variant="h6" 
              color="textSecondary" 
              style={{ marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}
              role="doc-subtitle"
            >
              Your centralized hub for enterprise API lifecycle management, security, and partner collaboration.
            </Typography>
          </header>

          <main id="main-content" role="main">

          <Grid container spacing={4}>
            {/* Platform Statistics */}
            <Grid item xs={12}>
              <Typography variant="h4" className={classes.gradientText} style={{ marginBottom: 24 }}>
                Platform Overview
              </Typography>
              <ErrorBoundary>
                <PlatformStatistics />
              </ErrorBoundary>
            </Grid>

            {/* Quick Actions */}
            <Grid item xs={12}>
              <Typography variant="h4" className={classes.gradientText} style={{ marginBottom: 24 }}>
                Quick Actions
              </Typography>
              <ErrorBoundary>
                <QuickActionsGrid />
              </ErrorBoundary>
            </Grid>

            {/* Starred Entities */}
            {starredCount > 0 && (
              <Grid item xs={12} md={6}>
                <HomePageStarredEntities />
              </Grid>
            )}

            {/* Toolkit */}
            <Grid item xs={12} md={starredCount > 0 ? 6 : 8}>
              <HomePageToolkit
                tools={[
                  {
                    label: 'API Explorer',
                    url: '/api-docs',
                    icon: <ExploreIcon />,
                  },
                  {
                    label: 'Create API',
                    url: '/create?filters[kind]=template&filters[spec.type]=api',
                    icon: <CreateIcon />,
                  },
                  {
                    label: 'Tech Docs',
                    url: '/docs',
                    icon: <DocsIcon />,
                  },
                  {
                    label: 'Catalog',
                    url: '/catalog',
                    icon: <CatalogIcon />,
                  },
                ]}
              />
            </Grid>

            {/* Random Joke for Fun */}
            {starredCount === 0 && (
              <Grid item xs={12} md={4}>
                <HomePageRandomJoke />
              </Grid>
            )}

            {/* Welcome Message */}
            <Grid item xs={12}>
              <InfoCard
                title="🚀 Welcome to Your API Management Platform"
                subheader="Enterprise-grade API lifecycle management with Backstage.io"
                deepLink={{
                  link: '/catalog',
                  title: 'Explore Catalog',
                }}
              >
                <Typography variant="body1" color="textSecondary" style={{ marginBottom: 16 }}>
                  Discover, document, and manage your APIs with our comprehensive platform. 
                  Built on Backstage.io for seamless developer experience and enterprise scalability.
                </Typography>
                
                <Box display="flex" style={{ gap: 16, flexWrap: 'wrap' }}>
                  <Link to="/catalog?filters[kind]=api">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                    >
                      Browse APIs
                    </Button>
                  </Link>
                  <Link to="/create">
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                    >
                      Create New
                    </Button>
                  </Link>
                  <Link to="/docs">
                    <Button
                      variant="outlined"
                      color="secondary"
                      size="small"
                    >
                      Documentation
                    </Button>
                  </Link>
                </Box>
              </InfoCard>
            </Grid>
          </Grid>
          </main>
        </Container>
      </Content>
    </Page>
  );
};
