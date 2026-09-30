# Sound Steps

A small, touch-friendly, audio-led phonics app for early sound and letter exploration.

**[Open the live app](https://davtse15-alt.github.io/learningapp/)**

## How it works

The app runs as static HTML, CSS, JavaScript, and bundled audio from the `dist` folder. Spoken lesson prompts use pre-generated recordings, so the app does not make live voice-service calls or need an API key. Progress stays in the browser on the device.

Each play session ends after 2½ minutes with an “All done!” screen. To open the grown-up view, press and hold the flower beside the Sound Steps name. It shows sounds met, sounds to revisit, the next sound, and the learning path. Progress is stored in this browser on this device.

## Publish with GitHub Pages

In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/pages.yml` publishes the contents of `dist` after a push to `main`.

GitHub Pages sites are public, even when their source repository is private. The app does not send a learner profile or progress to a server; progress stays in local browser storage.

