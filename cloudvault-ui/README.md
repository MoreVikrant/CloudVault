# CloudVault UI (React + Vite)

## Run order
1. Storage-Service (port 8092)
2. Drive-Service (port 8091)
3. This UI:
   npm install
   npm run dev
   Open http://localhost:5173

The UI talks only to Drive-Service. Vite forwards /api to http://localhost:8091,
so the browser sees one origin and you do not need any CORS code.

## API used (all from your DriveController)
GET    /api/items?parentId=   list a folder (no parentId = root)
POST   /api/folders           { "name": "...", "parentId": null | uuid }
POST   /api/files             multipart: file, parentId (optional)
GET    /api/files/{id}        download
DELETE /api/items/{id}        delete file or folder

## Change the backend port
Edit the target in vite.config.js.

## Later: deploying UI and backend on different origins
Add a CORS config to Drive-Service, then call the full URL from src/api.js.
