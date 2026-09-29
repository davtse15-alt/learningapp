# Sound Steps

A small, touch-friendly, audio-led phonics app for early sound and letter exploration.

## How it works

The app runs as static HTML, CSS, and JavaScript from the `dist` folder. It uses the browser's built-in speech synthesis and saves progress in the browser on the device.

## Publish with GitHub Pages

In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/pages.yml` publishes the contents of `dist` after a push to `main`.

GitHub Pages sites are public, even when their source repository is private. The app does not send a learner profile or progress to a server; progress stays in local browser storage.

