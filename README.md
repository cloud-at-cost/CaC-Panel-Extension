# C@C Panel Helper Google Chrome Extension

This extension aims to help users with the CloudatCost panel and supplements some of their features as well integrates with other services.

## Current Features

- Login to the CloudatCost and CloudatCock Panels
- Grabs current transaction from CloudatCost mining and forwards to the C@C Minig panel
  - Assumes the miner is already setup

## Planned Features

- Insertion of hidden/removed OSes on building pages
- Automatic transaction forwarding to the C@C Mining panel
- Build to Google Chrome extension store (or at least an easier way of distribution)
- Build to other browsers

## Development

### Building

First install all project dependencies from NPM with `npm install`.
Then build the project with `npm run build`.
Finally start chrome and navgiate to the extensions page, enable "development mode" and manually add a new extension (a file explorer window should appear). Navigate to this directory/build.
