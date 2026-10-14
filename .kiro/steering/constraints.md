Technical Constraints
TC-1: Technology Stack
- HTML for structure
- CSS for styling
- Vanilla JavaScript (no frameworks like React, Vue, etc.)
- No backend server required

TC-2: Data Storage
- Use browser Local Storage API
- All data stored client-side only

TC-3: Browser Compatibility
- Must work in modern browsers (Chrome, Firefox, Edge, Safari)
- Can be used as standalone web app or browser extension

Non-Functional Requirements
NFR-1: Simplicity
- Clean, minimal interface
- Easy to understand and use
- No complex setup required
- No test setup required

NFR-2: Performance
- Fast load time
- Responsive UI interactions
- No noticeable lag when updating data

NFR-3: Visual Design
- User-friendly aesthetic
- Clear visual hierarchy
- Readable typography

Required Features (MVP)
- Greeting: show current time and date, show a greeting based on the time of day
- Focus Timer: 25-minute timer with start, stop, and reset buttons
- To-Do List: add, edit, mark as done, delete tasks, saved using Local Storage
- Quick Links: buttons that open favorite websites, links saved in Local Storage

Folder Rules
- Only 1 CSS file inside css/
- Only 1 JavaScript file inside js/
- Keep code clean and readable

Challenges (chosen 3): Light/Dark mode, Custom name in greeting, Prevent duplicate tasks