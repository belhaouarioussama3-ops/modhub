const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!ADMIN_PASSWORD || ADMIN_PASSWORD === "CHANGE_THIS_TO_A_LONG_UNIQUE_PASSWORD") {
  console.error("Set ADMIN_PASSWORD in your environment before starting the server."); process.exit(1);
}
if (SESSION_SECRET.length < 32) {
  console.error("Set SESSION_SECRET to a random value of at least 32 characters."); process.exit(1);
}

const DATA_FILE = path.join(__dirname, "data.json");
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { admin: null, games: [] };
  try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); }
  catch { return { admin: null, games: [] }; }
}
function saveData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
let data = loadData();
if (!data.admin || data.admin.username !== ADMIN_USERNAME) {
  data.admin = { id: crypto.randomUUID(), username: ADMIN_USERNAME, password_hash: bcrypt.hashSync(ADMIN_PASSWORD, 12) };
  saveData(data);
}
if (!Array.isArray(data.games) || data.games.length === 0) {
  data.games = [
    {id: crypto.randomUUID(), name:"Sky Racers", category:"games", version:"1.4.2", size:"128 MB", rating:"4.7", icon:"🏎️", description:"Demo game listing. Replace this with content you have permission to distribute.", download_url:""},
    {id: crypto.randomUUID(), name:"Pixel Quest", category:"games", version:"2.1.0", size:"86 MB", rating:"4.6", icon:"🧙", description:"Demo adventure game listing.", download_url:""},
    {id: crypto.randomUUID(), name:"File Tools", category:"apps", version:"1.8.0", size:"22 MB", rating:"4.5", icon:"📁", description:"Demo utility app listing.", download_url:""}
  ];
  saveData(data);
}

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(session({secret:SESSION_SECRET,resave:false,saveUninitialized:false,cookie:{httpOnly:true,sameSite:"lax",secure:false,maxAge:1000*60*60*8}}));
app.use(express.static(path.join(__dirname,"public")));
function auth(req,res,next){ if(req.session.adminId) return next(); return res.status(401).json({error:"Not authenticated"}); }

app.post("/api/login",(req,res)=>{
  const {username,password}=req.body;
  if(username !== data.admin.username || !bcrypt.compareSync(password||"", data.admin.password_hash)) return res.status(401).json({error:"Invalid username or password"});
  req.session.adminId=data.admin.id; req.session.adminUsername=data.admin.username; res.json({ok:true});
});
app.post("/api/logout",(req,res)=>req.session.destroy(()=>res.json({ok:true})));
app.get("/api/session",(req,res)=>res.json({authenticated:!!req.session.adminId,username:req.session.adminUsername||null}));
app.get("/api/games",(req,res)=>res.json([...data.games].reverse()));

app.post("/api/games",auth,(req,res)=>{
  const {name,category,version,size,rating,icon,description,download_url}=req.body;
  if(!name||!category||!version||!size||!rating||!icon||!description) return res.status(400).json({error:"Missing required fields"});
  const item={id:crypto.randomUUID(),name,category,version,size,rating,icon,description,download_url:download_url||""};
  data.games.push(item); saveData(data); res.json(item);
});
app.put("/api/games/:id",auth,(req,res)=>{
  const i=data.games.findIndex(g=>g.id===req.params.id); if(i<0) return res.status(404).json({error:"Not found"});
  const {name,category,version,size,rating,icon,description,download_url}=req.body;
  data.games[i]={...data.games[i],name,category,version,size,rating,icon,description,download_url:download_url||""}; saveData(data); res.json(data.games[i]);
});
app.delete("/api/games/:id",auth,(req,res)=>{data.games=data.games.filter(g=>g.id!==req.params.id); saveData(data); res.json({ok:true});});

app.listen(PORT,()=>console.log(`ModHub running at http://localhost:${PORT}`));
