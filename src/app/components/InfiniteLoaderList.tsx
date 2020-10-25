import * as React from "react";
import { FixedSizeList as List, areEqual } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import { withStyles } from "@material-ui/core/styles";
import FontPreviewRow from "./FontPreviewRow";
import { FontLoad, ListType } from "../util/types";
import debounceRender from "react-debounce-render";

const styles = (theme) => ({
  list: {
    overflowX: "hidden !important",
  },
});

// Number of rows to render on either side of the window
const windowSize = 10;

// Max number of rows to load fonts for at once
// Magic number based on window size + plugin height
const loadLimit = windowSize * 2 + 25;

type RowProps = {
  index: number;
  style: Object;
  data: any;
};

const InfiniteLoaderList = ({
  classes,
  fontNames,
  itemData,
  loadCallback,
  setFavoriteCallback,
  applyFont,
  listType,
}) => {
  const isItemLoaded = (index) => fontNames[index].status !== FontLoad.Preload;

  const loadRange = React.useRef(null);
  const loadHandler = React.useRef(null);

  const loadRangeUpdated = () => {
    clearTimeout(loadHandler.current);
    loadHandler.current = null;

    // Debounced loads
    loadHandler.current = setTimeout(() => {
      if (loadRange.current) {
        // console.log("Loading " + loadRange.current.start + "-" + loadRange.current.stop);
        loadCallback(loadRange.current.start, loadRange.current.stop, listType);
        loadRange.current = null;
      }
    }, 200);
  };

  const loadMoreItems = (startIndex, stopIndex) => {
    // console.log("Attempt to load: " + startIndex + "-" + stopIndex);

    if (!loadRange.current) {
      // Load range is not set - reset it
      loadRange.current = { start: startIndex, stop: stopIndex };
    } else {
      if (
        Math.abs(startIndex - loadRange.current.start) > loadLimit ||
        Math.abs(stopIndex - loadRange.current.stop) > loadLimit
      ) {
        // Load range is outside our current window - reset it
        loadRange.current = { start: startIndex, stop: stopIndex };
      } else if (Math.abs(startIndex - loadRange.current.stop) > loadLimit) {
        // Adding these indices to start would make load range too big
        loadRange.current = { start: startIndex, stop: startIndex + loadLimit };
      } else if (Math.abs(stopIndex - loadRange.current.start) > loadLimit) {
        // Adding these indices to end would make load range too big
        loadRange.current = { start: stopIndex - loadLimit, stop: stopIndex };
      } else {
        // Append these indices to the load range
        // TODO: Assumes stopIndex - startIndex < loadLimit
        loadRange.current = {
          start: Math.min(startIndex, loadRange.current.start),
          stop: Math.max(stopIndex, loadRange.current.stop),
        };
      }
    }
    loadRangeUpdated();
  };

  const Row = React.memo<RowProps>(({ index, style, data }: RowProps) => {
    const forceReload = (family) => {
      loadCallback(index, index, listType, family, 5000);
    };

    const handleSetFavorite = (family, favorited) => {
      setFavoriteCallback(family, favorited);
    };

    return (
      <FontPreviewRow
        applyFont={applyFont}
        forceReloadCallback={forceReload}
        style={style}
        family={fontNames[index].family}
        previewText={data.previewText}
        status={fontNames[index].status}
        favorited={fontNames[index].favorited}
        setFavorited={handleSetFavorite}
      />
    );
  }, areEqual);

  return (
    <>
      <InfiniteLoader
        isItemLoaded={isItemLoaded}
        itemCount={fontNames.length}
        loadMoreItems={loadMoreItems}
      >
        {({ onItemsRendered, ref }) => (
          <List
            className={classes.list}
            height={listType === ListType.Search ? 440 : 500}
            itemCount={fontNames.length}
            itemSize={90}
            overscanCount={windowSize}
            onItemsRendered={onItemsRendered}
            ref={ref}
            width={318}
            itemData={itemData}
          >
            {Row}
          </List>
        )}
      </InfiniteLoader>
    </>
  );
};

export default debounceRender(withStyles(styles)(InfiniteLoaderList), 100);
