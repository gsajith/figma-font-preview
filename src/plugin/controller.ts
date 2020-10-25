figma.showUI(__html__, { height: 640, width: 350 });

const favorites = [];
let fonts = [];

figma.ui.onmessage = (msg) => {
  if (msg.type === "cancel") {
    figma.closePlugin();
  }

  if (msg.type === "get-fonts") {
    // Load all the fonts
    figma.listAvailableFontsAsync().then((fontList) => {
      fonts = fontList;
      let fontNames = fontList.map((a) => a.fontName);

      // TODO: Add support for various font styles

      // Just get one from each font family
      fontNames = fontNames.filter(
        (fontName, index, self) =>
          index === self.findIndex((t) => t.family === fontName.family),
      );

      figma.ui.postMessage({
        type: "got-fonts",
        fontNames: fontNames,
      });
    });
  }

  if (msg.type === "get-favorite-fonts") {
    // Load favorited fonts from clientStorage
    figma.clientStorage.getAsync("font_preview_favorites_fonts").then((val) => {
      if (Array.isArray(val)) {
        favorites.push(...val);
        figma.ui.postMessage({
          type: "got-favorite-fonts",
          favorites: val,
        });
      }
    });
  }

  if (msg.type === "add-to-favs") {
    var index = favorites.indexOf(msg.fontFamily);
    if (index < 0) {
      favorites.push(msg.fontFamily);
    }
    figma.clientStorage
      .setAsync("font_preview_favorites_fonts", favorites)
      .then(() => {
        figma.notify(msg.fontFamily + ": Added to favorites", {
          timeout: 1500,
        });
      });
  }

  if (msg.type === "remove-from-favs") {
    var index = favorites.indexOf(msg.fontFamily);
    if (index >= 0) {
      favorites.splice(index, 1);
      figma.clientStorage
        .setAsync("font_preview_favorites_fonts", favorites)
        .then(() => {
          figma.notify(msg.fontFamily + ": Removed from favorites", {
            timeout: 1500,
          });
        });
    }
  }

  if (msg.type === "apply-font") {
    for (const node of figma.currentPage.selection) {
      if (node.type === "TEXT") {
        loadFont(msg.family, node);
      }
    }

    if (figma.currentPage.selection.length === 0) {
      figma.notify("Please select a text layer");
    }
  }
};

const loadFont = async (font, node) => {
  // TODO: This could be better
  let fontStyles = [
    "Regular",
    "Book",
    "Plain",
    "Normal",
    "Roman",
    "Mono",
    "Medium",
    "Light",
    "Italic",
    "Bold",
    "Semi Bold",
    "Heavy",
  ];
  let assigned = false;
  for (let index = 0; index < fontStyles.length; index++) {
    console.log("Trying font with " + font + " " + fontStyles[index]);
    figma
      .loadFontAsync({ family: font, style: fontStyles[index] })
      .then(() => {
        node.fontName = { family: font, style: fontStyles[index] };
        index = fontStyles.length;
        console.log("Success!");
        assigned = true;
        return;
      })
      .catch((error) => {
        console.log(error + ". Will try with another font style 🤞");
        if (index == fontStyles.length - 1) {
          for (let fontIndex in fonts) {
            if (fonts[fontIndex].fontName.family === font) {
              if (fontStyles.indexOf(fonts[fontIndex].fontName.style) < 0) {
                fontStyles.push(fonts[fontIndex].fontName.style);
              }
            }
          }
        }
      });
  }
  setTimeout(() => {
    if (!assigned) {
      figma.notify("Unable to set this font. Something may be wrong with it.");
    }
  }, 1000);
};
