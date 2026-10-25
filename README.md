# For Nissuuu ✦

A dreamy, cinematic birthday website for Nisarga, built with React + Vite.

## Run locally

1. Install Node.js (LTS recommended).
2. Extract this folder and open a terminal inside it.
3. Run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed in the terminal, usually `http://localhost:5173`.

## Personalize it before sharing

### Add photos
Put your photos in the `public` folder. The starter includes placeholders so the layout works immediately.

Recommended filenames:
- `memory-1.jpg` through `memory-7.jpg`

Then edit `src/main.jsx`:
- Update the `memories` array near the top with your actual dates, titles and captions.
- Replace the placeholder photo blocks in the timeline and scrapbook with `<img src="/memory-1.jpg" alt="..." />` elements. Keep the `object-fit: cover` styling for a neat crop.
- For each scrapbook item, change the photo filename and caption to match the image.

### Add a voice note or video
Your uploaded WhatsApp voice note is already included as `public/voice-note.mp3` and wired into the message modal. Replace that file if you want to use a different recording.

For a different recording, copy your media file into `public/`, for example:
- `voice-note.mp3`, or
- `birthday-video.mp4`

The current media panel is a placeholder. In the `showMedia` modal in `src/main.jsx`, replace the placeholder with either:

```jsx
<audio controls src="/voice-note.mp3">Your browser does not support audio.</audio>
```

or

```jsx
<video controls playsInline poster="/memory-1.jpg" src="/birthday-video.mp4" />
```

Keep the media file reasonably small so the site loads quickly on mobile.

### Make the words yours
Search `src/main.jsx` for:
- `reasons` — replace the seven sample reasons with real ones.
- `gifts` — personalize each hidden gift message.
- `quiz` — replace the sample questions with your inside jokes and memories.
- `For you, always.` — personalize the final letter.
- `Happy birthday, my Nissuuu.` — edit the birthday reveal.

### Optional: use a real birthday date
The hero currently displays `NOVEMBER 02 · YOUR DAY`, which matches 2 November 2026.

## Build for production

```bash
npm run build
npm run preview
```

Vite writes the production site to `dist/`.

## Deploy to Vercel

1. Create a GitHub repository and push this project.
2. Sign in to Vercel and choose **Add New → Project**.
3. Import the repository.
4. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
5. Click **Deploy** and share the generated URL with her.

You can also deploy by running `npx vercel` in the project folder and following the prompts.

## Important
- Test the website on a phone before sharing.
- Do not include private conversations or photos she would not want shared.
- Anyone with the URL can view the site unless you add access control. Avoid putting sensitive information in it.


## Personal story notes
The starter timeline and letter have been personalized around the story provided:
- You knew each other from BCA at REVA University.
- You wished Nisarga on her birthday last year, which started more conversation.
- You began hanging out, grew close, and developed feelings without a precisely remembered dating date.
- The copy intentionally avoids inventing an exact anniversary date.

## Personal photos, video, and gifts

All 25 uploaded photos are included in `public/photos/` and used in the timeline and scrapbook gallery. The video is `public/our-video.mp4`; it autoplays muted, loops continuously, and has no visible player controls. Browsers usually require muted playback for autoplay.

The four gift cards ask Nissuuu to receive each physical gift from you. She can then select **I've received my gift!**. The final surprise message unlocks after all four have been marked received.

## Birthday countdown preview
The birthday gate counts down to **November 2, 2026 at 12:00 AM India Standard Time**. The final ten seconds use the browser's speech synthesis voice where supported. After midnight, the teddy/heart birthday reveal is shown and the entry button opens the existing website.

To preview the countdown and reveal immediately while testing locally, run `npm run dev` and open the local URL with `?birthdayPreview=1` appended (for example `http://localhost:5173/?birthdayPreview=1`). Preview mode runs a short countdown of about 25 seconds. Remove the query parameter to test the real birthday countdown.
