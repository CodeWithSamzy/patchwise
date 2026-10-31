export const apiSample = 'import express from "express";\nimport cors from "cors";\nimport { db } from "./database";\n\nconst app = express();\nconst API_KEY = "sk_live_51_demo_secret_key";\n\napp.use(cors());\n\napp.get("/users", async (req, res) => {\n  const result = await db.query(\n    "SELECT * FROM users WHERE email = \'" + req.query.email\n  );\n  res.json(result.rows);\n});\n\napp.get("/continue", (req, res) => {\n  res.redirect(req.query.next);\n});\n\napp.listen(3000);';

export const browserSample =
  'const preview = document.querySelector("#preview");\nconst name = new URLSearchParams(location.search).get("name");\n\npreview.innerHTML = "<strong>Welcome, " + name + "</strong>";';

export const nodeSample =
  'const { exec } = require("node:child_process");\nconst path = require("node:path");\nconst fs = require("node:fs");\n\napp.post("/inspect", (req, res) => {\n  exec("identify " + req.body.filename);\n  const target = path.join("./uploads", req.body.filename);\n  res.send(fs.readFileSync(target, "utf8"));\n});';
