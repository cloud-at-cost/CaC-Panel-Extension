# C@C Panel Helper Browser Extension

This extension aims to help users with the CloudatCost panel and supplements some of their features as well integrates with other services.

Available via [Chrome Web Store](https://chrome.google.com/webstore/detail/cc-panel-extension/nfbammmblghfpjalpefjjgdiackccmca) and [Firefox Addons](https://addons.mozilla.org/en-US/firefox/addon/c-c-panel-extension)

## Current Features

- Login to the CloudatCost and CloudatCock Panels
  - Saves credentials under "settings" to allow for autologin (_NOTE:_ These are saved in plaintext and only accessible by this extension, there seems to not be a very secure method to store this data given this is all done client side. Your password is ONLY stored on your machine!)
- Insertion of hidden/removed OSes on building pages
- Grabs current transaction from CloudatCost mining and forwards to the C@C Minig panel
  - Assumes the miner is already setup
- Automatic transaction forwarding to the C@C Mining panel

## Planned Features

- Crowdsource available OS list

## Installation

Grab the latest release [here](https://github.com/zack-hable/CaC-Panel-Extension/releases/latest) and download extension.zip. Then extract this somewhere on your machine aand open Chrome (or Chromium browser of choice). Navigate to the "extensions" area and enable "developer mode". Then select "load unpacked" and navigate to the decompressed files from above. If you're installing an update all you should need to do is extract to the same location and click the "reload" icon in the extensions page.

## Development

### Building

First install all project dependencies from NPM with `npm install`.
Then build the project with `npm run build`.
Finally start chrome and navgiate to the extensions page, enable "development mode" and manually add a new extension (a file explorer window should appear). Navigate to this directory/build.
