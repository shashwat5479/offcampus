ROYALTY-FREE STORY MUSIC — HOW TO FILL THE LIBRARY
===================================================

The story music picker loads tracks from tracks.json in this folder.
The picker automatically HIDES any track whose .mp3 file is missing, so you
can add songs a few at a time — only the ones you've added will appear.

STEP 1 — Download royalty-free .mp3 files (100% free, legal, no login):
   • https://pixabay.com/music/       (best — search by mood: "chill", "energy", "romantic")
   • https://www.chosic.com/free-music/
   • https://uppbeat.io/               (free tier, needs a free account)

STEP 2 — Rename each file to match a slot in tracks.json and drop it here.
   The catalog currently expects these filenames (add any subset you want):

   Trending:  trend1.mp3  trend2.mp3  trend3.mp3  trend4.mp3
   Chill:     chill1.mp3  chill2.mp3  chill3.mp3  chill4.mp3
   Hype:      hype1.mp3   hype2.mp3   hype3.mp3   hype4.mp3
   Romantic:  rom1.mp3    rom2.mp3    rom3.mp3
   Party:     party1.mp3  party2.mp3  party3.mp3
   Emotional: emo1.mp3    emo2.mp3    emo3.mp3

STEP 3 — Edit tracks.json so each title/artist matches the real song you added.
   (Only the "url" filename must match the file on disk; title/artist/mood are
   just labels shown in the picker — change them freely.)

STEP 4 — Add MORE songs anytime: drop another .mp3 here and add a row to
   tracks.json with a matching "url". No code change, no redeploy of logic —
   just commit the new files.

STEP 5 — Commit & push:
   git add -A
   git commit -m "Add story music tracks"
   git push

TIP: keep each track short (15–30s) — stories are brief, and smaller files
load faster for your users.
