# Frontend (Vite dev server) for the DIFFERENCE POC stacks.
# Build context is the repo root; endpoint config is injected at RUNTIME via
# VITE_* env vars (Vite exposes process.env VITE_* on the dev server), so the
# same image serves either stack — no rebuild needed to change endpoints.
FROM node:22-alpine

WORKDIR /app

# This is an npm project: the committed package-lock.json pins the full tree
# (including MUI's @emotion peer deps that package.json under-declares). Use
# `npm ci` so the container reproduces the known-good local install exactly.
# (pnpm resolves only from package.json and drops the optional @emotion peers,
# which breaks @mui/icons-material at runtime.)
COPY package.json package-lock.json ./
RUN npm ci

# App source (poc-*/, node_modules, dist excluded via .dockerignore)
COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
