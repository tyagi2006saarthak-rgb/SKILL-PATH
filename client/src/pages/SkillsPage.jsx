import { useCallback, useEffect, useState } from "react";
import { Activity, Check, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import api from "../services/api";

const categories = ["Programming Languages","Web Development","Database Management","Data Science","Artificial Intelligence","Machine Learning","Cloud Computing","Cybersecurity","Soft Skills","Other"];
const levels = ["","Beginner","Basic","Intermediate","Advanced","Expert"];
const blank = { name: "", category: "Programming Languages", proficiency: "1" };
export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(() => api.get("/skills").then(({data})=>setSkills(data)).catch((e)=>setError(e.response?.data?.message || "Could not load skills.")), []);
  useEffect(() => { load(); }, [load]);
  const save = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setBusy(true);
    try {
      if (editing) await api.put(`/skills/${editing}`, form);
      else await api.post("/skills", form);
      setForm(blank); setEditing(null); setSuccess(editing ? "Skill updated." : "Skill added to your toolkit."); await load();
    } catch (e) { setError(e.response?.data?.message || "Could not save this skill."); }
    finally { setBusy(false); }
  };
  const edit = (skill) => { setEditing(skill._id); setForm({ name: skill.name, category: skill.category, proficiency: String(skill.proficiency) }); setError(""); setSuccess(""); };
  const remove = async (skill) => {
    if (!window.confirm(`Remove ${skill.name} from your skills?`)) return;
    try { await api.delete(`/skills/${skill._id}`); setSuccess(`${skill.name} removed.`); setSkills((items)=>items.filter((item)=>item._id!==skill._id)); }
    catch(e) { setError(e.response?.data?.message || "Could not remove this skill."); }
  };
  const filtered = skills.filter((skill)=>skill.name.toLowerCase().includes(search.toLowerCase()) && (category === "All categories" || skill.category === category));
  return <div className="page-stack">
    <div className="section-intro-row"><div><span className="eyebrow-muted">YOUR STARTING POINT</span><p className="section-intro">This is your toolkit, not a test. Add what you know today, and you can update it as you grow.</p></div><div className="skill-count"><strong>{skills.length}</strong><span>skill{skills.length===1?"":"s"} added</span></div></div>
    {(error || success) && <div className={`notice ${error?"notice-error":"notice-success"}`}>{error || success}<button className="notice-dismiss" onClick={()=>{setError("");setSuccess("");}} aria-label="Dismiss"><X size={15}/></button></div>}
    <div className="skills-layout">
      <section className="panel skill-form-panel"><div className="panel-heading"><div><span className="panel-eyebrow">{editing ? "MAKE A CHANGE" : "ADD TO YOUR TOOLKIT"}</span><h3>{editing ? "Edit this skill" : "Add a skill"}</h3></div><span className="panel-heading-icon"><Plus size={17}/></span></div>
        <form className="stack-form" onSubmit={save}><label>Skill name<input required maxLength={60} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="e.g. JavaScript"/></label><label>Category<select value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})}>{categories.map((item)=><option key={item}>{item}</option>)}</select></label><label>How comfortable do you feel?<select value={form.proficiency} onChange={(e)=>setForm({...form,proficiency:e.target.value})}>{levels.slice(1).map((level,index)=><option key={level} value={index+1}>{index+1} · {level}</option>)}</select></label><div className="level-hint"><span className="hint-dot"/><span>Go with your honest starting point. You can always adjust this later.</span></div><div className="form-actions"><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : <><Check size={16}/>{editing?"Save changes":"Add skill"}</>}</button>{editing&&<button type="button" className="btn btn-ghost" onClick={()=>{setEditing(null);setForm(blank);}}>Cancel</button>}</div></form>
      </section>
      <section className="panel skill-list-panel"><div className="panel-heading"><div><span className="panel-eyebrow">YOUR CURRENT TOOLKIT</span><h3>Skills you’ve added</h3></div><div className="list-count">{filtered.length} shown</div></div><div className="filter-row"><div className="search-field"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Find a skill…"/></div><select className="filter-select" value={category} onChange={(e)=>setCategory(e.target.value)}><option>All categories</option>{categories.map((item)=><option key={item}>{item}</option>)}</select></div>
        {filtered.length ? <div className="skill-table">{filtered.map((skill)=><div className="skill-item" key={skill._id}><div className="skill-item-icon">{skill.name.slice(0,1).toUpperCase()}</div><div className="skill-item-copy"><strong>{skill.name}</strong><span>{skill.category}</span></div><div className="skill-level"><div className="level-bars">{[1,2,3,4,5].map((n)=><i key={n} className={n<=skill.proficiency?"filled":""}/>)}</div><span>{levels[skill.proficiency]}</span></div><div className="skill-actions"><button className="icon-btn" onClick={()=>edit(skill)} title={`Edit ${skill.name}`} aria-label={`Edit ${skill.name}`}><Pencil size={15}/></button><button className="icon-btn danger-icon" onClick={()=>remove(skill)} title={`Delete ${skill.name}`} aria-label={`Delete ${skill.name}`}><Trash2 size={15}/></button></div></div>)}</div> : <div className="empty-skills"><div className="empty-icon"><Activity size={21}/></div><strong>{skills.length?"No matching skills":"Your toolkit starts here"}</strong><span>{skills.length?"Try another search or category.":"Add skills on the left to get a clearer picture of your starting point."}</span></div>}
      </section>
    </div>
    <div className="soft-note"><span>✦</span><span>Your self-reported skill levels are private and are only used to personalize your learning roadmap.</span></div>
  </div>;
}
