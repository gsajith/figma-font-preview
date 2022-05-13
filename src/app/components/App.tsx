import * as React from "react";
import "../styles/ui.css";
import TextField from "@material-ui/core/TextField";
import { withStyles, useTheme } from "@material-ui/core/styles";
import Detector from "../util/detector";
import WebFont from "webfontloader";
import InfiniteLoaderList from "./InfiniteLoaderList";
import { FontLoad, LoadingState, ListType } from "../util/types";
import RotateLoader from "react-spinners/RotateLoader";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import InputAdornment from "@material-ui/core/InputAdornment";
import SearchRoundedIcon from "@material-ui/icons/SearchRounded";

const detector = new Detector();

const styles = (theme) => ({
  main: {
    padding: theme.spacing(2),
    paddingTop: 0,
    paddingBottom: 0,
    color: "var(--figma-color-text)",
  },
  header: {
    padding: theme.spacing(2),
    paddingBottom: 0,
    boxShadow: "0px 0px 8px 0px rgba(0,0,0,0.48)",
    position: "relative",
    zIndex: 3,
    color: "var(--figma-color-text)",
  },
  previewTextField: {
    marginTop: theme.spacing(1),
  },
  loadingPlaceholder: {
    height: 550,
    width: "auto",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    margin: "0px " + theme.spacing(3),
  },
  tabBar: {},
});

const CssTextField = withStyles({
  root: {
    "& .MuiInputBase-input": {
      color: "var(--figma-color-text)",
    },
    "& .MuiFormLabel-root": {
      color: "var(--figma-color-text-secondary)",
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "var(--figma-color-border)",
      },
      "&:hover fieldset": {
        borderColor: "var(--figma-color-border-strong)",
      },
    },
  },
})(TextField);

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
};

const App = ({ classes }) => {
  const theme = useTheme();
  const [fontNames, setFontNames] = React.useState([]);
  const [searchText, setSearchText] = React.useState("");
  const [previewText, setPreviewText] = React.useState(
    "Sphinx of black quartz, judge my vow.",
  );
  const [loadingState, setLoadingState] = React.useState(LoadingState.Preload);
  const firstSetFontNames = React.useRef(false);
  const [selectedTab, setSelectedTab] = React.useState(0);

  React.useEffect(() => {
    if (!firstSetFontNames.current && fontNames.length > 0) {
      firstSetFontNames.current = true;
      setLoadingState(LoadingState.Loaded);
      parent.postMessage(
        { pluginMessage: { type: "get-favorite-fonts" } },
        "*",
      );
    }
  }, [fontNames]);

  const getOperatingList = (list, listType) => {
    switch (listType) {
      case ListType.Favorites:
        return list ? list.filter((a) => a.favorited) : null;
      case ListType.Search:
        return list
          ? list.filter(
              (a) =>
                searchText.length > 0 &&
                a.family.toLowerCase().includes(searchText.toLowerCase()),
            )
          : null;
      case ListType.Full:
      default:
        return list;
    }
  };

  const triggerWebfontLoad = (
    startIndex,
    endIndex,
    listType,
    family = null,
    timeout = 5000,
  ) => {
    // console.log("trying to load " + startIndex + "-" + endIndex);
    let slicedFontNames = getOperatingList(fontNames, listType).slice(
      startIndex,
      endIndex + 1,
    );
    let filteredFamilyMap = slicedFontNames
      .filter((a) => a.status === FontLoad.Preload)
      .map((a) => a.family);
    let fullFamilyMap = fontNames.map((a) => a.family);

    // TODO: Catch Google 400 errors and handle
    // GET https://fonts.googleapis.com/css?family=CantoraOne net::ERR_ABORTED 400

    WebFont.load({
      google: {
        families: family ? [family] : filteredFamilyMap,
      },
      timeout: family ? timeout : 2000,
      loading: function() {
        // console.log('loading');
        if (!family) {
          setFontNames((fontNames) => {
            let slicedFontNames = getOperatingList(fontNames, listType).slice(
              startIndex,
              endIndex + 1,
            );
            let newFontNames = [...fontNames];
            let fullFamilyMap = newFontNames.map((a) => a.family);
            slicedFontNames.forEach((fontName, index) => {
              if (fontName.status === FontLoad.Preload) {
                slicedFontNames[index] = {
                  ...slicedFontNames[index],
                  status: FontLoad.Loading,
                };
              }
              let i = fullFamilyMap.indexOf(fontName.family);
              if (i >= 0) {
                newFontNames[i] = slicedFontNames[index];
              }
            });
            return newFontNames;
          });
        } else {
          setFontNames((fontNames) => {
            let index = fullFamilyMap.indexOf(family);
            if (index >= 0) {
              let newFontNames = [...fontNames];
              newFontNames[index] = {
                ...newFontNames[index],
                status: FontLoad.Loading,
              };
              return newFontNames;
            } else {
              return fontNames;
            }
          });
        }
      },
      active: function() {
        // console.log('active');
      },
      inactive: function() {
        // console.log('inactive');
      },
      fontloading: function(_: any, __: any) {
        // console.log('fontLoading ' + familyName + ' ' + fvd);
      },
      fontinactive: function(familyName, __: any) {
        // console.log("Couldn't load: " + familyName + " " + fvd);
        // TODO: Debounce this?
        setFontNames((fontNames) => {
          let index = fullFamilyMap.indexOf(familyName);
          if (index >= 0) {
            let newFontNames = [...fontNames];
            newFontNames[index] = {
              ...newFontNames[index],
              status: FontLoad.Failed,
            };
            return newFontNames;
          } else {
            return fontNames;
          }
        });
      },
      fontactive: function(familyName, _: any) {
        // console.log('Loaded ' + familyName + " " + fvd);
        // TODO: Debounce this?
        setFontNames((fontNames) => {
          let index = fullFamilyMap.indexOf(familyName);
          if (index >= 0) {
            let newFontNames = [...fontNames];
            newFontNames[index] = {
              ...newFontNames[index],
              status: FontLoad.Loaded,
            };
            return newFontNames;
          } else {
            return fontNames;
          }
        });
      },
    });
  };

  React.useEffect(() => {
    // Run on first render
    setLoadingState(LoadingState.Loading);
    parent.postMessage({ pluginMessage: { type: "get-fonts" } }, "*");

    // This is how we read messages sent from the plugin controller
    window.onmessage = (event) => {
      const { type } = event.data.pluginMessage;
      if (type === "got-fonts") {
        let fontNames = event.data.pluginMessage.fontNames;
        var parsedFontNames = [];

        fontNames.forEach((fontName) => {
          if (detector.detect(fontName.family)) {
            parsedFontNames.push({
              family: fontName.family,
              status: FontLoad.Loaded,
              favorited: false,
            });
          } else {
            parsedFontNames.push({
              family: fontName.family,
              status: FontLoad.Preload,
              favorited: false,
            });
          }
        });

        let fontsThatDontStartWithAlphabet = parsedFontNames.filter(
          (fontName) => {
            return !/^[a-z]/i.test(fontName.family);
          },
        );

        if (fontsThatDontStartWithAlphabet.length > 0) {
          parsedFontNames.splice(0, fontsThatDontStartWithAlphabet.length);
          parsedFontNames = parsedFontNames.concat(
            fontsThatDontStartWithAlphabet,
          );
        }
        setFontNames(parsedFontNames);
      } else if (type === "got-favorite-fonts") {
        setFontNames((fontNames) => {
          const favoritesIndices = [];
          const familyMap = fontNames.map((a) => a.family);
          event.data.pluginMessage.favorites.forEach((favorite) => {
            if (familyMap.indexOf(favorite) >= 0) {
              favoritesIndices.push(familyMap.indexOf(favorite));
            }
          });
          let newFontNames = [...fontNames];
          favoritesIndices.forEach((index) => {
            newFontNames[index] = { ...newFontNames[index], favorited: true };
          });
          return newFontNames;
        });
      }
    };
  }, []);

  const handleSetPreviewText = React.useCallback((event) => {
    setPreviewText(event.target.value);
  }, []);

  const handleSetSearchText = React.useCallback((event) => {
    setSearchText(event.target.value);
  }, []);

  const handleSetFavorite = (family, favorited) => {
    setFontNames((fontNames) => {
      let newFontNames = [...fontNames];
      let familyMap = newFontNames.map((a) => a.family);
      let index = familyMap.indexOf(family);
      if (index >= 0) {
        parent.postMessage(
          {
            pluginMessage: {
              type: favorited ? "add-to-favs" : "remove-from-favs",
              fontFamily: newFontNames[index].family,
            },
          },
          "*",
        );
        newFontNames[index] = { ...newFontNames[index], favorited: favorited };
      }
      return newFontNames;
    });
  };

  const applyFont = (family) => {
    parent.postMessage(
      { pluginMessage: { type: "apply-font", family: family } },
      "*",
    );
  };

  function a11yProps(index) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChangeTab = (_: any, newValue: React.SetStateAction<number>) => {
    setSelectedTab(newValue);
  };

  let favoritedFonts = getOperatingList(fontNames, ListType.Favorites);
  let searchResultFonts = getOperatingList(fontNames, ListType.Search);

  return (
    <>
      <div className={classes.header}>
        <CssTextField
          className={classes.previewTextField}
          id="standard-basic"
          label="Preview text"
          variant="outlined"
          placeholder="Type something to preview it"
          fullWidth={true}
          value={previewText}
          onChange={handleSetPreviewText}
        />
        <Tabs
          className={classes.tabBar}
          value={selectedTab}
          onChange={handleChangeTab}
          aria-label="simple tabs example"
          variant="fullWidth"
        >
          <Tab label="All fonts" {...a11yProps(0)} />
          <Tab label="Favorites" {...a11yProps(1)} />
          <Tab label="Search" {...a11yProps(2)} />
        </Tabs>
      </div>
      <div className={classes.main}>
        <TabPanel value={selectedTab} index={0}>
          {[LoadingState.Loading, LoadingState.Preload].includes(
            loadingState,
          ) && (
            <div className={classes.loadingPlaceholder}>
              <RotateLoader
                size={15}
                color={theme.palette.primary.main}
                loading={true}
              />
              <div style={{ opacity: 0.5, marginTop: 50, marginBottom: 80 }}>
                Initializing plugin...
              </div>
            </div>
          )}
          {fontNames && fontNames.length > 0 && (
            <InfiniteLoaderList
              itemData={{ previewText: previewText }}
              fontNames={fontNames}
              loadCallback={triggerWebfontLoad}
              setFavoriteCallback={handleSetFavorite}
              listType={ListType.Full}
              applyFont={applyFont}
            />
          )}
          {(!fontNames || fontNames.length == 0) &&
            loadingState === LoadingState.Loaded && (
              <div className={classes.loadingPlaceholder}>
                <div style={{ opacity: 0.5, marginBottom: 30 }}>
                  No fonts loaded :(
                </div>
              </div>
            )}
        </TabPanel>

        <TabPanel value={selectedTab} index={1}>
          {[LoadingState.Loading, LoadingState.Preload].includes(
            loadingState,
          ) && (
            <div className={classes.loadingPlaceholder}>
              <RotateLoader
                size={15}
                color={theme.palette.primary.main}
                loading={true}
              />
              <div style={{ opacity: 0.5, marginTop: 50, marginBottom: 80 }}>
                Initializing plugin...
              </div>
            </div>
          )}
          {favoritedFonts && favoritedFonts.length > 0 && (
            <InfiniteLoaderList
              itemData={{ previewText: previewText }}
              fontNames={favoritedFonts}
              loadCallback={triggerWebfontLoad}
              setFavoriteCallback={handleSetFavorite}
              listType={ListType.Favorites}
              applyFont={applyFont}
            />
          )}
          {(!favoritedFonts || favoritedFonts.length == 0) &&
            loadingState === LoadingState.Loaded && (
              <div className={classes.loadingPlaceholder}>
                <div style={{ opacity: 0.5, marginBottom: 30 }}>
                  No favorites :( Star a font in the big list to add it to
                  favorites.
                </div>
              </div>
            )}
        </TabPanel>

        <TabPanel value={selectedTab} index={2}>
          {[LoadingState.Loading, LoadingState.Preload].includes(
            loadingState,
          ) && (
            <div className={classes.loadingPlaceholder}>
              <RotateLoader
                size={15}
                color={theme.palette.primary.main}
                loading={true}
              />
              <div style={{ opacity: 0.5, marginTop: 50, marginBottom: 80 }}>
                Initializing plugin...
              </div>
            </div>
          )}

          <CssTextField
            className={classes.previewTextField}
            style={{ marginTop: theme.spacing(3) }}
            id="standard-basic"
            label="Search font"
            variant="outlined"
            placeholder="Search a font name"
            fullWidth={true}
            value={searchText}
            onChange={handleSetSearchText}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon
                    style={{ opacity: 0.5, color: "var(--figma-color-text)" }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {searchResultFonts && searchResultFonts.length > 0 && (
            <InfiniteLoaderList
              itemData={{ previewText: previewText }}
              fontNames={searchResultFonts}
              loadCallback={triggerWebfontLoad}
              setFavoriteCallback={handleSetFavorite}
              listType={ListType.Search}
              applyFont={applyFont}
            />
          )}
          {(!searchResultFonts || searchResultFonts.length == 0) &&
            loadingState === LoadingState.Loaded && (
              <div
                className={classes.loadingPlaceholder}
                style={{ height: 400 }}
              >
                <div style={{ opacity: 0.5, marginBottom: 60 }}>
                  {searchText.length === 0
                    ? "Type a search term above to search for a font."
                    : "Didn't find any matches for '" + searchText + "'"}
                </div>
              </div>
            )}
        </TabPanel>
      </div>
    </>
  );
};

export default withStyles(styles as any)(App);
