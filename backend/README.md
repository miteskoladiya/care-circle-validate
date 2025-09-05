# CareCircle Backend

Minimal TypeScript + Express + Mongoose backend scaffold.

Quick start:

1. copy `.env.example` to `.env` and edit values
2. cd backend
3. npm install
4. npm run dev

API base: http://localhost:5000/api

Optional: Cloudinary

To store uploaded doctor documents in Cloudinary instead of the local uploads folder, set the following env vars in your `.env` (copy from `.env.example`):

- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

When provided, uploaded files during registration are sent to Cloudinary and `user.doctorDocument` will contain the Cloudinary secure URL. If Cloudinary is not configured the server will continue to save files under `uploads/` and serve them at `/uploads`.
