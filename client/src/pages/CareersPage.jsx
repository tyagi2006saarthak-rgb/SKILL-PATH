import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Clock3, Compass, Search, Sparkles, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const priorityClass = (priority) => `priority priority-${priority.toLowerCase()}`;
export default function CareersPage() {
  const navigate = useNavigate();
  const [careers, setCareers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [selected, setSelected] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    Promise.all([api.get("/careers"), api.get("/skills")]).then(([careerResponse, skillResponse]) => {
      setCareers(careerResponse.data); setSkills(skillResponse.data);
    }).catch((e)=>setError(e.response?.data?.message || "Could not load career roles."));
  }, []);
  const runAnalysis = async (career) => {
    setSelected(career._id); setAnalysis(null); setError(""); setBusy(true);
    try { const {data} = await api.post(`/analysis/${career._id}`); setAnalysis(data); }
    catch(e) { setError(e.response?.data?.message || "Could not analyze this career."); }
    finally { setBusy(false); }
  };
  const generate = async () => {
    if (!selected) return;
    setBusy(true); setError("");
    try { await api.post("/roadmaps/generate", { careerId: selected }); navigate("/roadmap"); }
    catch(e) { setError(e.response?.data?.message || "Could not generate your roadmap."); setBusy(false); }
  };
  const visible = careers.filter((career)=>`${career.title} ${career.description}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-stack">
    <section className="career-intro"><div className="career-intro-icon"><Compass size={23}/></div><div><h2>Find the work that feels like you.</h2><p>Explore a role, compare it with your current skills, and see an honest picture of what you could learn next.</p></div><div className="career-intro-count"><strong>{careers.length}</strong><span>career paths</span></div></section>
    {error&&<div className="notice notice-error">{error}</div>}
    <div className="career-search-row"><div><span className="eyebrow-muted">EXPLORE THE CATALOGUE</span><h3>Which direction interests you?</h3></div><div className="search-field career-search"><Search size={16}/><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search careers…"/></div></div>
    {careers.length === 0 && !error ? <div className="loading-block"><span className="spinner"/> Loading career paths…</div> : <div className="career-grid">{visible.map((career,index)=>{
      const active = selected === career._id;
      return <article className={`career-card ${active?"career-selected":""}`} key={career._id}><div className="career-card-top"><div className={`career-icon career-icon-${index%5}`}><Target size={19}/></div><span className="career-skill-count">{career.requiredSkills.length} core skills</span></div><h3>{career.title}</h3><p className="career-description">{career.description}</p><div className="career-card-bottom"><div className="career-skill-chips">{career.requiredSkills.slice(0,3).map((skill)=><span key={skill.name}>{skill.name}</span>)}{career.requiredSkills.length>3&&<span>+{career.requiredSkills.length-3}</span>}</div><button className={`btn ${active?"btn-selected":"btn-soft"}`} onClick={()=>runAnalysis(career)} disabled={busy}>{active?(busy?"Checking…":<>Selected <CheckCircle2 size={15}/></>):<>Explore this path <ArrowRight size={15}/></>}</button></div>
        {active&&analysis&&<div className="career-analysis"><div className="analysis-summary"><div><span className="panel-eyebrow">YOUR SKILL SNAPSHOT</span><h4>{analysis.summary.needsWork ? `${analysis.summary.needsWork} ${analysis.summary.needsWork===1?"skill":"skills"} to grow into` : "You meet every listed skill level"}</h4></div><div className="analysis-count"><strong>{analysis.summary.achieved}</strong><span>already there</span></div></div>
          <div className="analysis-gaps">{analysis.gaps.map((gap)=><div className="analysis-gap-row" key={gap.name}><div className="analysis-gap-name"><span className={`gap-status ${gap.gap===0?"is-achieved":""}`}>{gap.gap===0?<CheckCircle2 size={14}/>:<ArrowDown size={14}/>}</span><div><strong>{gap.name}</strong><span>{gap.currentLevel===0?"Not added yet":`Currently ${["","Beginner","Basic","Intermediate","Advanced","Expert"][gap.currentLevel]}`}</span></div></div><div className="analysis-levels"><span>Target: {["","Beginner","Basic","Intermediate","Advanced","Expert"][gap.requiredLevel]}</span>{gap.gap>0&&<span className={priorityClass(gap.priority)}>{gap.priority}</span>}</div><div className="analysis-resource"><a href={gap.resource.url} target="_blank" rel="noreferrer"><BookOpen size={13}/>{gap.resource.name}<ArrowUpRight size={12}/></a></div></div>)}</div>
          {analysis.summary.needsWork>0?<div className="generate-roadmap-row"><div><strong>Turn this into a plan that’s yours.</strong><span>{analysis.summary.needsWork} learning steps · roughly {analysis.gaps.filter(g=>g.gap>0).reduce((total,g)=>total+Math.max(2,g.gap*4),0)} hours</span></div><button className="btn btn-primary" onClick={generate} disabled={busy}>{busy?"Building your plan…":<>Build my roadmap <ArrowRight size={16}/></>}</button></div>:<div className="all-achieved-note"><CheckCircle2 size={17}/>No skill gaps found for your current toolkit. You can still build a roadmap.</div>}
        </div>}
      </article>;
    })}</div>}
    {visible.length===0&&careers.length>0&&<div className="empty-skills"><Search size={20}/><strong>No career paths match</strong><span>Try a different search.</span></div>}
    {skills.length===0&&<div className="starter-strip"><div className="starter-icon"><Sparkles size={18}/></div><div><strong>Want a more personal analysis?</strong><span>Add the skills you already have first, so your comparison reflects your actual starting point.</span></div><button className="text-link" onClick={()=>navigate("/skills")}>Add skills <ArrowRight size={14}/></button></div>}
  </div>;
}
