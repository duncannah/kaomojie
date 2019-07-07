# kaomojie

![screenshot](assets/screenshots/01.png)

Git repository for the browser extension **kaomojie**.

**Easy and fast access to hundreds of kaomojis, all categorised!**

[![Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/kaomojie/lmejjdlbclkidnpmcoknihonapppadid)
[![Firefox Add-ons](https://addons.cdn.mozilla.net/static/img/addons-buttons/AMO-button_1.png)](https://addons.mozilla.org/en-US/firefox/addon/kaomojie/)

## Building

We use Gulp to transpile source code and ready the extension for deployment.

1. Install node dependencies: `npm install` or `yarn install`
2. Install gulp: `npm install -G gulp-cli` or `yarn global add gulp-cli`
3. Build: `gulp` (to folder `build`)

`gulp deploy` also zips up the build for deployment (build/archive.zip).

## License

This software is licensed under AGPL 3.0; a copy can be found under [LICENSE](LICENSE).
