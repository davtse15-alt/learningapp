# Sound Steps

A small, touch-friendly, audio-led phonics app for early sound and letter exploration.

**[Open the live app](https://davtse15-alt.github.io/learningapp/)**

## How it works

The app runs as static HTML, CSS, JavaScript, and bundled audio from the `dist` folder. A tap-to-start screen unlocks the first lesson audio. Levels teach a new sound and revisit familiar sounds; decodable blending begins as soon as enough known sounds are available and grows with the sound set. A sound advances after three correct answer turns, including turns within one session. The grown-up view sets session length from 1 to 5 minutes. Lesson instructions play at activity start; letter taps play the phoneme, picture taps play the word, and retries use a brief cue. Correct answers rotate among sixteen short praise recordings without repeating the same one twice in a row. Recordings are pre-generated, so the app does not make live voice-service calls or need an API key. Progress stays in the browser on the device.

Each play session practices the current sound, revisits up to two familiar sounds, and blends decodable words when enough sounds are known. Early levels repeat short sound turns until the selected session time is up; they do not stop just because a blend is not available yet. Review shows the picture and asks for its first letter without revealing the answer; the spoken model comes after a choice. Sessions end at the grown-up selected time with an “All done!” screen. To open the grown-up view, press and hold the flower beside the Sound Steps name. It shows sounds met, sounds to revisit, the next sound, and the learning path. Progress is stored in this browser on this device.

In the grown-up view, use **Save backup** to download a JSON progress file. Move it with Files, AirDrop, or another method, then choose **Restore backup** on the other device. Restore merges answer progress and session length with the current browser and reloads the app. No progress is sent to a server.

## Publish with GitHub Pages

In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source. The workflow in `.github/workflows/pages.yml` publishes the contents of `dist` after a push to `main`.

GitHub Pages sites are public, even when their source repository is private. The app does not send a learner profile or progress to a server; progress stays in local browser storage.
