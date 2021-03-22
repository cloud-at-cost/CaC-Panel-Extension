# C@C Panel Helper Google Chrome Extension

This extension aims to help users with the CloudatCost panel and supplements some of their features as well integrates with other services.

## Current Features

- Login to the CloudatCost and CloudatCock Panels
  - Saves credentials under "settings" to allow for autologin (_NOTE:_ These are saved in plaintext and only accessible by this extension, there seems to not be a very secure method to store this data given this is all done client side. Your password is ONLY stored on your machine!)
- Insertion of hidden/removed OSes on building pages
- Grabs current transaction from CloudatCost mining and forwards to the C@C Minig panel
  - Assumes the miner is already setup

## Planned Features

- Automatic transaction forwarding to the C@C Mining panel
- Build to Google Chrome extension store (or at least an easier way of distribution)
- Build to other browsers

## Development

### Building

First install all project dependencies from NPM with `npm install`.
Then build the project with `npm run build`.
Finally start chrome and navgiate to the extensions page, enable "development mode" and manually add a new extension (a file explorer window should appear). Navigate to this directory/build.
