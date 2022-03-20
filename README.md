# kaomojie

![screenshot](assets/screenshots/01.png)

Git repository for the browser extension **kaomojie**.

**Easy and fast access to hundreds of kaomojis, all categorised!**

[![Chrome Web Store](https://i.imgur.com/Jg37GE6.png)](https://chrome.google.com/webstore/detail/kaomojie/lmejjdlbclkidnpmcoknihonapppadid)
[![Firefox Add-ons](https://i.imgur.com/F5FHwjU.png)](https://addons.mozilla.org/en-US/firefox/addon/kaomojie/) [![Microsoft Edge Add-ons](https://i.imgur.com/CYExt3c.png)](https://microsoftedge.microsoft.com/addons/detail/efiejeadkjimlaknanikfjafmcpokhgc)

## Building

We use Gulp to transpile source code and ready the extension for deployment.

1. Install node dependencies: `pnpm install`
2. Build: `pnpm build` (to folder `build`)

`pnpm deploy` also zips up the build for deployment (build/archive.zip).

## License

This software is licensed under AGPL 3.0; a copy can be found under [LICENSE](LICENSE).
