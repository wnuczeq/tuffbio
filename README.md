# 🌌 TUFFBIO 
Bio made by me cuz i was bored you can use it for free but dont credit as yours please :3

## ⚙️ Configuration

To make this bio page your own, follow these simple steps:

### 1. Set your Discord ID
Open `script.js` and find the `DISCORD_ID` variable at the top. Replace the number with your own Discord ID.
```javascript
const DISCORD_ID = "YOUR_ID_HERE";
```
*This allows the page to fetch your live status, avatar, and Spotify activity.*

### 2. Customizing & Adding Links
In `index.html`, scroll down to the `social-links` section. 
- To **edit** existing links: Change the `href` attribute and the `<span>` text.
- To **add new** links: Copy one of the `<a>` blocks and change the icon class (from [FontAwesome](https://fontawesome.com/icons)) and the text.
  
Example of adding a new link:
```html
<a href="YOUR_LINK" target="_blank" class="social-item">
    <i class="fab fa-twitter"></i>
    <span>Twitter</span>
</a>
```

### 3. Background & Music
- **Background**: Replace `background.png` or `background.jpg` in the root folder.
- **Music**: Replace `music.mp3` with your favorite track.
- **Cover**: Replace `cover.jpg` to update the music player's album art.
- **Song Info**: In `index.html`, find the `player-text` div and change the track name (`fake ur face`) and artist (`s0rrow`) to match your music.

### 4. Customization
You can modify the colors in `style.css` under the `:root` variables to change the theme of the page.

---

Created by **Axol** (tuffbio)
