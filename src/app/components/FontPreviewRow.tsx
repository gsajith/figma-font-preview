import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import { FontLoad } from "../util/types";
import Tooltip from "@material-ui/core/Tooltip";
import HelpOutlineRoundedIcon from "@material-ui/icons/HelpOutlineRounded";
import StarBorderRoundedIcon from "@material-ui/icons/StarBorderRounded";
import StarRoundedIcon from "@material-ui/icons/StarRounded";
import classNames from "classnames";
import styles from "../styles/FontPreviewRowStyle";

const StyledTooltip = withStyles({
  tooltipPlacementTop: {
    margin: "4px 0",
  },
})(Tooltip);

const FontPreviewRow = ({
  classes,
  family,
  previewText,
  favorited,
  setFavorited,
  status,
  style,
  forceReloadCallback,
  applyFont,
}) => {
  // console.log("Render row: " + index);

  let tooltipTitle = "";
  let errorName = "";
  let classNameList = [classes.fontFamily];
  let showHelpIcon = false;

  switch (status) {
    case FontLoad.Preload:
      tooltipTitle = "This font hasn't loaded yet. Tap here to load it.";
      errorName = " - Hasn't loaded";
      showHelpIcon = true;
      classNameList.push(classes.clickable);
      break;
    case FontLoad.Loading:
      tooltipTitle = "This font is loading.";
      errorName = " - Loading...";
      break;
    case FontLoad.Failed:
      tooltipTitle =
        "This font may not be visible in a plugin. Tap to retry loading.";
      errorName = " - Failed";
      showHelpIcon = true;
      classNameList.push(classes.clickable, classes.error);
      break;
    case FontLoad.Loaded:
    default:
      break;
  }

  const handleForceReloadCallback = () => {
    if ([FontLoad.Preload, FontLoad.Failed].includes(status)) {
      forceReloadCallback(family);
    }
  };

  const toggleFavorite = () => {
    setFavorited(family, !favorited);
  };

  const handleApplyFont = () => {
    applyFont(family);
  };

  return (
    <div style={style} className={classes.fontPreviewContainer}>
      <div className={classes.fontFamilyWrapper}>
        <StyledTooltip
          title={favorited ? "Remove from favorites" : "Add to favorites"}
          placement="top"
          tabIndex={0}
        >
          <div
            className={classes.favoriteButtonWrapper}
            onClick={toggleFavorite}
          >
            {favorited && <StarRoundedIcon className={classes.favoriteIcon} />}
            {!favorited && (
              <StarBorderRoundedIcon className={classes.borderFavoriteIcon} />
            )}
          </div>
        </StyledTooltip>
        <StyledTooltip
          title={tooltipTitle}
          placement="top"
          tabIndex={showHelpIcon ? 0 : -1}
        >
          <div
            className={classNames(classNameList)}
            onClick={handleForceReloadCallback}
          >
            {family + errorName}{" "}
            {showHelpIcon && (
              <HelpOutlineRoundedIcon className={classes.helpIcon} />
            )}
          </div>
        </StyledTooltip>
      </div>

      <div
        onClick={handleApplyFont}
        tabIndex={0}
        className={classes.fontPreview}
        style={{ fontFamily: family, lineHeight: "1em" }}
      >
        {previewText.length > 0 ? previewText : family}
      </div>
    </div>
  );
};

export default withStyles(styles as any)(FontPreviewRow);
