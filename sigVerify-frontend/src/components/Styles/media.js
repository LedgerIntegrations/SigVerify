const breakpoints = {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
};

const media = {
    mobile: `(min-width: ${breakpoints.mobile})`,
    tablet: `(min-width: ${breakpoints.tablet})`,
    desktop: `(min-width: ${breakpoints.desktop})`,
};

export default media;
