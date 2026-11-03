# CloudVault UI 

## Run order
1. Storage-Service (port 8092)
2. Drive-Service (port 8091)
3. This UI:
   npm install
   npm run dev
   Open http://localhost:5173

The UI talks only to Drive-Service. Vite forwards /api to http://localhost:8091,
so the browser sees one origin and you do not need any CORS code.


