# Video Transcoder Frontend

Frontend application for uploading videos and tracking real-time transcoding progress.

Built with React, TypeScript, and Vite. Designed to work on both desktop and mobile browsers.

## Demo

Live demo: https://transcoder.wizznode.xyz

## Overview

This application allows users to:

- Upload a video from the browser
- Track upload progress
- View real-time transcoding status for multiple resolutions
- Restore the active job state after refresh
- Upload another video after completion

The frontend communicates with a separate backend that handles storage and video transcoding.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- WebSocket
- Framer Motion
- Bun (package manager and runtime)

## Backend Expectations

The backend is expected to provide:

- An API to create an upload job and return a pre-signed upload URL
- An API to fetch job status by job ID
- A WebSocket endpoint to stream transcoding progress updates

This repository contains frontend code only.

## Environment Variables

```env
VITE_API_BASE_URL=https://backend.example.com
VITE_WS_URL=wss://backend.example.com/ws
```

## Development

Install dependencies:

```
bun install
```

Start the development server:
```
bun run dev
```

Build for production:
```
bun run build
```

Preview the production build:
```
bun run preview
```

## Notes

- Drag and drop upload is enabled on desktop devices
- On mobile devices, upload is initiated via tap
- Transcoding progress is shown per resolution (360p, 480p, 720p)
- The UI displays a short “preparing” state before transcoding starts

## Deployment

This project is deployed using Vercel.  
Any push to the connected GitHub branch triggers an automatic build and deployment.

## Limitations

The current version of the application has the following limitations:

- Single file upload
  - Only one video can be uploaded at a time.

- Non-resumable uploads
  - If the browser tab is closed, refreshed, or the network drops during upload, the upload must be restarted.

- Large file reliability on mobile
  - Uploads rely on a single PUT request.
  - On mobile devices, long uploads may fail if the browser goes into the background or the screen locks.

- Fixed output resolutions
  - Transcoding is currently limited to predefined resolutions (360p, 480p, 720p).

- No playback or download UI
  - The frontend does not provide video playback or download links for transcoded files.

- Limited error recovery
  - Transcoding failures are not currently retried or surfaced with detailed error messages.

- Backend dependency
  - The application assumes the backend is available and responsive.
  - There is no offline or degraded-mode support.

 ## Notes

These limitations are known and acceptable for the current scope of the project.  
Future iterations may address resumable uploads, improved error handling, and playback support.
