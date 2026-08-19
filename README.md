# Animated Portfolio Website

A modern personal portfolio website for Raghav Sharma, built with plain HTML, CSS, and JavaScript. The project includes a dark premium aesthetic, animated background, floating sections, smooth scrolling, and a résumé section with downloadable PDF access.

## Features

- Responsive personal portfolio layout
- Fixed glassmorphism-style navigation bar
- Smooth scrolling between sections
- Animated background canvas effect
- Skills section with interactive floating motion
- Featured projects showcase cards
- Experience and achievements timeline
- Resume section with PDF preview and download links
- Contact form connected through Formspree
- Custom animated cursor effect

## Project Structure

- `index.html` — main portfolio structure and content
- `style.css` — all styling, animations, layout, and responsive design
- `script.js` — interactive animations, canvas background, and cursor logic
- `resume.pdf` — downloadable resume PDF
- `Frame/` — animation image sequence used for the background effect
- `hero_3d.jpg` — hero visual asset

## Clone and Run

### 1) Clone the repository

Open your terminal and run:

```bash
git clone https://github.com/your-username/your-portfolio-repo.git
cd your-portfolio-repo
```

If you are using GitHub or another Git platform, you can also click the "Code" button and copy the HTTPS or SSH URL, then run:

```bash
git clone <your-repository-url>
```

### 2) Open in an IDE

- VS Code: open the folder from File > Open Folder
- GitHub Codespaces: open the repo in a browser-based development environment
- Replit / other cloud IDEs: import the project from GitHub or upload the folder directly

### 3) Run locally

Since this is a static website, you can either:

#### Option A: Open directly

Open `index.html` in your browser.

#### Option B: Start a local server

Run:

```bash
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Customize

### Personal Details
Update the text in `index.html` with your:
- name
- bio
- project links
- social links
- contact email
- resume details

### Resume PDF
Place your resume file in the project folder and keep the name as:

```text
resume.pdf
```

The buttons in the resume section are already linked to this file.

### Theme and Styling
Edit colors, spacing, gradients, and animation settings in `style.css`.

## Notes

- The site uses a fixed navbar, so anchors include smooth scroll offset to avoid overlap.
- The canvas background loads image frames from the `Frame/` folder.
- If you add or remove sections, ensure section IDs remain consistent with the navbar links.

## License

This project is for personal portfolio use. You may adapt it for your own portfolio, but ensure you replace the content with your own work and information.

## Contact

For any project-related questions or support, connect through the contact section on the website or update the social links in `index.html`.
