# Research Roadmap — OpenCode Build Pack

This directory is the control plane for building the Research Roadmap web application.

## Goal

Build an interactive research-learning roadmap with:

- an interactive node/graph pathway;
- research workflow nodes from question → protocol → search → screening → extraction → statistics → synthesis → reporting → publication;
- each node containing verified GitHub repositories, R/statistics repositories, standard guidelines, software, tutorials and YouTube videos;
- videos playable inside the application UI when technically embeddable;
- GitHub repositories shown as rich cards/README previews rather than attempting to iframe GitHub;
- web resources shown in an in-app frame only after embedability is verified;
- persistent notes, checkpoints and local progress;
- a polished responsive UI matching the supplied visual direction;
- a private content editor/master interface;
- content stored as validated JSON/Markdown, with no invented resources;
- independent OpenCode sessions that resume from `docs/STATE.md`.

## How to use

1. Put this entire directory in the root of the OpenCode project.
2. Start OpenCode in this directory.
3. Give it `OPENCODE_START.md`.
4. It must execute only the current slice from `docs/STATE.md`.
5. When requirements are missing, it must ask questions and stop before implementation.
6. Start a fresh OpenCode session for the next slice. It reads `docs/STATE.md` and continues without requiring previous chat context.

## Important

The project must not fabricate:
- GitHub repositories
- GitHub Pages URLs
- YouTube IDs
- guideline URLs
- software versions
- package versions
- publication facts
- resource descriptions

Unknown content remains a typed `pending` record until verified.
