# Sound Steps

A small, touch-friendly, audio-led phonics app for early sound and letter exploration.

**[Open the live app](https://davtse15-alt.github.io/learningapp/)**

## How it works

The app runs as static HTML, CSS, JavaScript, and bundled audio from the `dist` folder. A tap-to-start screen unlocks the first lesson audio. Levels teach a new sound and revisit familiar sounds; decodable blending begins as soon as enough known sounds are available and grows with the sound set. A sound advances after three correct answers recorded in three different sessions. The grown-up view sets session length from 1 to 5 minutes. Lesson instructions play at activity start; letter taps play the phoneme, picture taps play the word, and retries use a brief cue. Recordings are pre-generated, so the app does not make live voice-service calls or need an API key. Progress stays in the browser on the device.

Each play session begins with one or two familiar sounds for a quick recall turn, then continues with the next sound. Review shows the picture and asks for its first letter without revealing the answer; the spoken model comes after a choice. Sessions end after 2½ minutes with an “All done!” screen. To open the grown-up view, press and hold the flower beside the Sound Steps name. It shows sounds met, sounds to revisit, the next sound, and the learning path. Progress is stored in this browser on this device.

## Publish with GitHub Pages

In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/pages.yml` publishes the contents of `dist` after a push to `main`.

GitHub Pages sites are public, even when their source repository is private. The app does not send a learner profile or progress to a server; progress stays in local browser storage.
