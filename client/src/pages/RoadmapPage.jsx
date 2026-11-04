import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, Circle, Clock3, ExternalLink, ListChecks, RotateCw, Sparkles, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/api";

const statusClass = (status) => `task-status status-${status.toLowerCase().replace(" ","-")}`;
export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [careers, setCareers] = useState([]);
  const [selected, setSelected] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progressDraft, setProgressDraft] = useState({});
  const load = useCallback(async () => {
    try {
      const [{data: roadmapData},{data: careerData}] = await Promise.all([api.get("/roadmaps"),api.get("/careers")]);
      setRoadmaps(roadmapData); setCareers(careerData);
      setSelected((current)=>roadmapData.some((r)=>r._id===current)?current:(roadmapData.find((r)=>r.active)?._id||roadmapData[0]?._id||""));
    } catch(e) { setError(e.response?.data?.message || "Could not load your learning plan."); }
  }, []);
  useEffect(()=>{load();},[load]);
  const roadmap = roadmaps.find((item)=>item._id===selected);
  const tasks = roadmap?.tasks||[];
  const completed = tasks.filter((task)=>task.status==="Completed").length;
  const progress = tasks.length?Math.round(completed/tasks.length*100):0;
  const updateStatus = async (task, status, progress) => {
    setError("");
    try {
      await api.put(`/roadmaps/${roadmap._id}/tasks/${task._id}/status`,{status,progress});
      setProgressDraft((current)=>{const next={...current};delete next[task._id];return next;});
      await load();
    }
    catch(e) { setError(e.response?.data?.message || "Could not update this task."); }
  };
  const removeTask = async (task) => {
    if(!window.confirm(`Remove the ${task.skillName} task from this roadmap?`))return;
    try { await api.delete(`/roadmaps/${roadmap._id}/tasks/${task._id}`); await load(); }
    catch(e) { setError(e.response?.data?.message || "Could not remove this task."); }
  };
  const regenerate = async () => {
    if(!roadmap?.career?._id)return;
    if(!window.confirm("Create a fresh roadmap? Your current roadmap will be kept in your history."))return;
    setBusy(true); setError("");
    try { const {data}=await api.post("/roadmaps/generate",{careerId:roadmap.career._id}); await load(); setSelected(data._id); }
    catch(e) { setError(e.response?.data?.message || "Could not rebuild your roadmap."); }
    finally { setBusy(false); }
  };
  const filteredTasks=tasks.filter((task)=>filter==="All tasks"||task.status===filter);
  const grouped = ["In Progress","Pending","Completed"].map((status)=>({status,tasks:filteredTasks.filter((task)=>task.status===status)})).filter((group)=>group.tasks.length);
  const createForRole=async (careerId)=>{setBusy(true);setError("");try{const {data}=await api.post("/roadmaps/generate",{careerId});await load();setSelected(data._id);}catch(e){setError(e.response?.data?.message||"Could not create your roadmap.");}finally{setBusy(false);}};
  return <div className="page-stack">
    {error&&<div className="notice notice-error">{error}</div>}
    {!roadmaps.length?<section className="roadmap-empty-hero"><div className="roadmap-empty-illustration"><div className="roadmap-empty-circle"><ListChecks size={37}/></div><span className="roadmap-empty-spark spark-left">✦</span><span className="roadmap-empty-spark spark-right">✳</span></div><span className="eyebrow-muted">YOUR LEARNING, MADE CLEAR</span><h2>Your next steps, all in one place.</h2><p>Pick a career path and we’ll turn the skills it takes into a practical, priority-ordered learning plan, just for you.</p>{careers.length?<div className="roadmap-start-select"><select id="starter-career"><option value="">Choose a career goal</option>{careers.map((career)=><option value={career._id} key={career._id}>{career.title}</option>)}</select><button className="btn btn-primary" disabled={busy} onClick={()=>{const careerId=document.getElementById("starter-career").value;if(careerId)createForRole(careerId);else setError("Choose a career goal to get started.");}}>{busy?"Creating…":<>Build my roadmap <ArrowRight size={16}/></>}</button></div>:<Link className="btn btn-primary" to="/careers">Explore career paths <ArrowRight size={16}/></Link>}</section>:<div className="roadmap-content">
      <section className="roadmap-overview panel"><div className="roadmap-overview-top"><div><span className="panel-eyebrow">YOUR LEARNING PLAN</span><h2>{roadmap?.career?.title||"Your roadmap"}</h2><p>One skill at a time. Every step forward counts.</p></div><div className="roadmap-actions"><select value={selected} onChange={(e)=>setSelected(e.target.value)} aria-label="Choose a roadmap">{roadmaps.map((item)=><option value={item._id} key={item._id}>{item.career?.title||"Career plan"} · {new Date(item.createdAt).toLocaleDateString()}</option>)}</select><button className="btn btn-ghost" onClick={regenerate} disabled={busy} title="Regenerate roadmap"><RotateCw size={15}/> Refresh plan</button></div></div><div className="roadmap-progress-row"><div className="progress-circle-small"><strong>{progress}%</strong></div><div className="roadmap-progress-copy"><strong>{completed===tasks.length&&tasks.length?"You’ve completed this plan!":"You’re making real progress."}</strong><span>{completed} of {tasks.length} learning steps completed</span><div className="roadmap-progress-track"><i style={{width:`${progress}%`}}/></div></div><div className="roadmap-hours"><Clock3 size={15}/><span><strong>{tasks.filter(t=>t.status!=="Completed").reduce((n,t)=>n+t.durationHours,0)}h</strong> left to learn</span></div></div></section>
      <div className="roadmap-list-toolbar"><div><span className="eyebrow-muted">YOUR LEARNING STEPS</span><h3>Make progress at your pace</h3></div><label className="filter-select-wrap"><span>Show</span><select value={filter} onChange={(e)=>setFilter(e.target.value)}><option>All tasks</option><option>In Progress</option><option>Pending</option><option>Completed</option></select><ChevronDown size={14}/></label></div>
      {tasks.length===0?<div className="empty-skills"><CheckCircle2 size={22}/><strong>You’re all caught up on this roadmap</strong><span>There are no open learning tasks for this plan.</span></div>:grouped.map((group)=><section className="task-group" key={group.status}><h4 className="task-group-title">{group.status}<span>{group.tasks.length}</span></h4>{group.tasks.map((task,index)=><article className={`task-card ${task.status==="Completed"?"task-completed":""}`} key={task._id}><div className="task-number">{task.status==="Completed"?<Check size={15}/>:String(index+1).padStart(2,"0")}</div><div className="task-main"><div className="task-title-row"><h3>{task.skillName}</h3><span className={statusClass(task.status)}><i/>{task.status}</span></div><p>{task.description}</p><div className="task-meta"><span className={`priority priority-${task.priority.toLowerCase()}`}>{task.priority} priority</span><span><Clock3 size={13}/>{task.durationHours} hours</span>{task.prerequisite&&<span><ListChecks size={13}/>After {task.prerequisite}</span>}</div>{task.status==="In Progress"&&<label className="task-progress-edit">Task progress <input type="range" aria-label={`${task.skillName} progress`} min="1" max="99" value={progressDraft[task._id]??(task.progress||25)} onChange={(e)=>setProgressDraft((current)=>({...current,[task._id]:Number(e.target.value)}))} onPointerUp={(e)=>updateStatus(task,"In Progress",Number(e.currentTarget.value))} onKeyUp={(e)=>{if(["ArrowLeft","ArrowRight","Home","End","PageUp","PageDown"].includes(e.key))updateStatus(task,"In Progress",Number(e.currentTarget.value));}}/><span>{progressDraft[task._id]??(task.progress||25)}%</span></label>}<a className="task-resource" href={task.resource.url} target="_blank" rel="noreferrer"><BookOpen size={14}/><span>{task.resource.name}</span><ExternalLink size={12}/></a></div><div className="task-controls"><select aria-label={`Update ${task.skillName} status`} value={task.status} onChange={(e)=>updateStatus(task,e.target.value)}><option>Pending</option><option>In Progress</option><option>Completed</option></select><button className="icon-btn danger-icon" onClick={()=>removeTask(task)} title={`Remove ${task.skillName}`} aria-label={`Remove ${task.skillName}`}><Trash2 size={15}/></button></div></article>)}</section>)}
      <div className="soft-note"><Sparkles size={15}/><span>Your learning plan is based on your current skills and transparent, rule-based role requirements. Update your skills to keep your next plan relevant.</span></div>
    </div>}
    {roadmaps.length>1&&<section className="panel history-panel"><div className="panel-heading"><div><span className="panel-eyebrow">PAST PLANS, PROGRESS MADE</span><h3>Your roadmap history</h3></div></div><div className="history-list">{roadmaps.map((item)=>{const done=item.tasks.filter(task=>task.status==="Completed").length;return <button className={`history-item ${selected===item._id?"history-active":""}`} key={item._id} onClick={()=>setSelected(item._id)}><div className="history-icon"><BookOpen size={17}/></div><div className="history-copy"><strong>{item.career?.title||"Career path"}</strong><span>Started {new Date(item.createdAt).toLocaleDateString()} · {done}/{item.tasks.length} steps complete</span></div><ArrowRight size={15}/></button>;})}</div></section>}
  </div>;
}
