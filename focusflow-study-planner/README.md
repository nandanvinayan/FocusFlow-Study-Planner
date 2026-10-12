# FocusFlow Study Planner

FocusFlow is a small, responsive study-planning web app. It helps a student organize coursework by subject, due date, priority, and estimated study time, then track progress from a weekly dashboard. It runs directly in a modern browser and saves task data in that browser's local storage.

## Project objective

Build a practical portfolio project that demonstrates front-end development, accessible interface patterns, form validation, filtering, date handling, and browser-based persistence.

## Features

- Add tasks with a subject, due date, priority, and estimated study time.
- Mark a task complete or move it back to the open plan.
- Delete tasks and clear completed tasks.
- Filter the list by all tasks, today, upcoming, or completed.
- Search task names and subjects, and sort by due date.
- View weekly progress, daily task distribution, and open work by subject.
- Keep tasks after closing or refreshing the page using `localStorage`.
- Use the responsive layout on desktop, tablet, and phone screens.
- Start with sample tasks so the dashboard can be explored immediately.

## Technologies

- HTML5 for page structure and form controls.
- CSS3 for responsive layout, visual states, and dashboard components.
- Vanilla JavaScript (ES6+) for task management, rendering, filters, validation, and date calculations.
- Browser `localStorage` for local persistence.

## Run the project

1. Download or clone this repository.
2. Open `index.html` in a current browser.
3. Select **Add a task** to create a task, or use the sample tasks already in the plan.
4. Refresh the page to confirm that changes are saved in the same browser.

No package installation, build step, account, or server is required.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Accessible dashboard layout and task-entry dialog |
| `styles.css` | Visual design and responsive breakpoints |
| `app.js` | Sample data, task logic, rendering, filtering, and persistence |
| `screenshots/` | Screenshots of the working output for the report |

## Screenshots

The `screenshots/` folder is reserved for a dashboard view and an example of the task-entry form. Add genuine captures of the running app before publishing the repository. The first-load sample tasks are demonstration data; each student can replace them with their own coursework.

## Implementation notes

The app keeps state in a `tasks` array and serializes it to `localStorage` after a change. Rendering functions derive summary counts, the selected list view, weekly bars, and subject totals from that state. User-entered text is escaped before being inserted into the task list.

## Limitations and next steps

Tasks are stored only in the browser profile used to open the app. They do not sync between devices and can be cleared if browser storage is removed. A future version could add export/import, account-based sync, recurring tasks, or calendar integration.

## GitHub publishing

Use your existing GitHub profile or create one, then create a public repository named `focusflow-study-planner` and upload the project files. Add a short repository description and pin the repository on your profile if that option is available. Put the resulting repository URL on the report cover page. The source package is ready to publish; the actual repository URL and screenshots of the running app and published GitHub page must be added after capture and publication.
