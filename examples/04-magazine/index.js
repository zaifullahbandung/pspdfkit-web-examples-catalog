import PSPDFKit from "pspdfkit";

export function load(defaultConfiguration) {
  // Disable continuous scroll and default to double page mode.
  const initialViewState = new PSPDFKit.ViewState({
    scrollMode: PSPDFKit.ScrollMode.PER_SPREAD,
    layoutMode: PSPDFKit.LayoutMode.DOUBLE,
    keepFirstSpreadAsSinglePage: true
  });

  // A custom toolbar item to toggle full screen mode.
  const fullScreenToolbarItem = {
    type: "custom",
    title: "Toggle full screen mode",
    onPress: event => {
      const document = event.target.ownerDocument;
      // You can implement the fullscreen mode on your own. Either see our
      // functions below how to activate it or look at our guides:
      // https://pspdfkit.com/guides/web/current/features/fullscreen-mode/
      if (isFullscreenEnabled(document)) {
        exitFullscreen(document);
      } else {
        requestFullScreen(document.documentElement);
      }
    }
  };

  // Customize the toolbar.
  let toolbarItems = [
    { type: "sidebar-bookmarks", dropdownGroup: null },
    { type: "sidebar-thumbnails", dropdownGroup: null },
    { type: "highlighter" },
    { type: "zoom-in" },
    { type: "zoom-out" },
    { type: "spacer" },
    { type: "search" }
  ];

  // Only add the fullscreenToolbarItem if the browser supports fullscreen mode
  if (isFullScreenSupported()) {
    toolbarItems.push(fullScreenToolbarItem);
  }

  return PSPDFKit.load({
    ...defaultConfiguration,
    initialViewState,
    toolbarItems
  }).then(instance => {
    console.log("PSPDFKit for Web successfully loaded!!", instance);
    return instance;
  });
}

function isFullscreenEnabled(element) {
  return (
    element.fullscreenElement ||
    element.mozFullScreenElement ||
    element.webkitFullscreenElement ||
    element.msFullscreenElement
  );
}

function requestFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function isFullScreenSupported() {
  return (
    document.fullscreenEnabled ||
    document.mozFullScreenEnabled ||
    document.msFullScreenEnabled ||
    document.webkitFullscreenEnabled
  );
}

function exitFullscreen(element) {
  if (element.webkitExitFullscreen) {
    element.webkitExitFullscreen();
  } else if (element.mozCancelFullScreen) {
    element.mozCancelFullScreen();
  } else if (element.msExitFullscreen) {
    element.msExitFullscreen();
  } else if (element.exitFullscreen) {
    element.exitFullscreen();
  }
}
