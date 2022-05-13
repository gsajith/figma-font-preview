const styles = (theme) => ({
  fontPreviewContainer: {
    fontSize: "2em",
    whiteSpace: "nowrap",
    height: 90,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
  },
  fontPreview: {
    padding: 14,
    borderRadius: 8,
    cursor: "pointer",
    outline: "none",
    border: "1px solid var(--figma-color-text-tertiary)",
    "&:hover": {
      border: "1px solid " + theme.palette.action.disabled,
    },
    "&:focus": {
      border: "1px solid " + theme.palette.action.disabled,
    },
  },
  fontFamilyWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  favoriteButtonWrapper: {
    cursor: "pointer",
    borderRadius: "50%",
    outline: "none",
    "&:hover": {
      background: theme.palette.action.hover,
    },
    "&:focus": {
      background: theme.palette.action.hover,
    },
  },
  borderFavoriteIcon: {
    opacity: 0.3,
    marginTop: -2,
    width: ".8em",
    height: ".8em",
    "&:hover": {
      opacity: 0.8,
    },
    "&:focus": {
      opacity: 0.8,
    },
  },
  favoriteIcon: {
    opacity: 1,
    marginTop: -2,
    width: ".8em",
    height: ".8em",
    color: theme.palette.primary.main,
    "&:hover": {
      opacity: 0.8,
      color: theme.palette.text.secondary,
    },
    "&:focus": {
      opacity: 0.8,
      color: theme.palette.text.secondary,
    },
  },
  fontFamily: {
    opacity: 0.7,
    textTransform: "uppercase",
    fontSize: ".5em",
    display: "inline-block",
  },
  clickable: {
    cursor: "pointer",
    "&:hover": {
      textDecoration: "underline dotted",
      opacity: 1,
    },
  },
  error: {
    color: "var(--figma-color-icon-danger)",
  },
  helpIcon: {
    width: ".5em",
    height: ".5em",
    marginBottom: "-1px",
  },
});

export default styles;
