import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 700,
    fontSize: '1.5rem',
    color: theme.palette.primary.main,
  },
  logoIcon: {
    marginRight: theme.spacing(1),
    fontSize: '2rem',
  },
  logoText: {
    background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontWeight: 700,
  },
}));

export const CustomLogoFull = () => {
  const classes = useStyles();

  return (
    <div className={classes.logoContainer}>
      <span className={classes.logoIcon}>🚀</span>
      <span className={classes.logoText}>API Platform</span>
    </div>
  );
};

export const CustomLogoIcon = () => {
  const classes = useStyles();

  return (
    <span className={classes.logoIcon} style={{ fontSize: '1.8rem' }}>
      🚀
    </span>
  );
};
