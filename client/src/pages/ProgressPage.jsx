import { useEffect, useMemo, useState } from "react";
import { Activity, BookOpen, CheckCircle2, Clock3, Sparkles, Target, TrendingUp } from "lucide-react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../services/api";

const colors = ["#7165df","#e4a35a","#56a881","#5a9bd2","#d8789b","#8774c4"];
const activityIcon = (type) => type==="task"?CheckCircle2:type==="skill"?TrendingUp:BookOpen;
export default function ProgressPage() {
  const [data,setData]=useState(null);
  const [error,setError]=useState("");
  useEffect(()=>{api.get("/progress").then(({data:result})=>setData(result)).catch((e)=>setError(e.response?.data?.message||"Could not load your progress."));},[]);
  const skillNames=useMemo(()=>[...new Set((data?.skillHistory||[]).map((item)=>item.skill))],[data]);
  const history=useMemo(()=>{
    const levels={};
    return (data?.skillHistory||[]).map((item)=>{levels[item.skill]=item.proficiency;return { ...item, ...levels };});
  },[data]);
  if(error)return <div className="notice notice-error">{error}</div>;
  if(!data)return <div className="loading-block"><span className="spinner"/> Gathering your learning progress…</div>;
  const {totals}=data;
  const statusData=[{name:"Completed",value:totals.completed},{name:"In progress",value:totals.inProgress},{name:"Pending",value:totals.pending}].filter((item)=>item.value);
  return <div className="page-stack">
    <section className="progress-welcome"><div className="progress-welcome-icon"><Sparkles size={22}/></div><div><span className="panel-eyebrow">LOOK HOW FAR YOU’VE COME</span><h2>{data.career?.title?`Your ${data.career.title} journey`:"Your progress, your pace"}</h2><p>Learning isn’t always a straight line. Every step forward is worth celebrating.</p></div><div className="progress-total"><strong>{totals.progress}%</strong><span>roadmap complete</span></div></section>
    <section className="progress-stats">
      <article className="progress-stat panel"><span className="progress-stat-icon stat-purple"><Target size={17}/></span><div><strong>{totals.tasks}</strong><span>Learning steps</span></div></article>
      <article className="progress-stat panel"><span className="progress-stat-icon stat-green"><CheckCircle2 size={17}/></span><div><strong>{totals.completed}</strong><span>Completed</span></div></article>
      <article className="progress-stat panel"><span className="progress-stat-icon stat-blue"><Activity size={17}/></span><div><strong>{totals.inProgress}</strong><span>In progress</span></div></article>
      <article className="progress-stat panel"><span className="progress-stat-icon stat-orange"><Clock3 size={17}/></span><div><strong>{totals.pending}</strong><span>Still ahead</span></div></article>
    </section>
    <section className="progress-chart-grid">
      <article className="panel"><div className="panel-heading"><div><span className="panel-eyebrow">A GROWING TOOLKIT</span><h3>Skill improvement over time</h3></div></div>{history.length?<div className="progress-line-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={history} margin={{top:12,right:14,left:-15,bottom:3}}><CartesianGrid stroke="#f0eff7" strokeDasharray="3 4"/><XAxis dataKey="label" tick={{fontSize:9,fill:"#9693a8"}} axisLine={false} tickLine={false}/><YAxis domain={[0,5]} ticks={[1,2,3,4,5]} tick={{fontSize:9,fill:"#9693a8"}} axisLine={false} tickLine={false}/><Tooltip formatter={(value,name)=>[`${value}/5`,name]}/>{skillNames.slice(0,6).map((skill,index)=><Line key={skill} type="monotone" dataKey={skill} name={skill} stroke={colors[index%colors.length]} strokeWidth={2} dot={{r:3}} connectNulls/> )}</LineChart></ResponsiveContainer></div>:<div className="progress-empty"><div className="empty-icon"><TrendingUp size={19}/></div><strong>Your skills will tell their story here</strong><span>Add or update skill levels to start tracking growth over time.</span></div>}</article>
      <article className="panel"><div className="panel-heading"><div><span className="panel-eyebrow">YOUR CURRENT ROADMAP</span><h3>Learning steps at a glance</h3></div></div>{statusData.length?<><div className="status-chart-wrap"><ResponsiveContainer width="100%" height={190}><PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={76} paddingAngle={4} stroke="none">{statusData.map((item,index)=><Cell key={item.name} fill={["#7165df","#e4a35a","#dfdced"][["Completed","In progress","Pending"].indexOf(item.name)]||colors[index]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer><div className="status-chart-center"><strong>{totals.tasks}</strong><span>steps</span></div></div><div className="status-legend">{statusData.map((item,index)=><div key={item.name}><i style={{background:["#7165df","#e4a35a","#dfdced"][["Completed","In progress","Pending"].indexOf(item.name)]||colors[index]}}/><span>{item.name}</span><strong>{item.value}</strong></div>)}</div></>:<div className="progress-empty"><div className="empty-icon"><BookOpen size={19}/></div><strong>No learning steps just yet</strong><span>Choose a career goal to build your first roadmap.</span></div>}</article>
    </section>
    <section className="panel activity-panel"><div className="panel-heading"><div><span className="panel-eyebrow">A RECORD OF SHOWING UP</span><h3>Recent activity</h3></div><span className="activity-count">{data.activities.length} updates</span></div>{data.activities.length?<div className="activity-list">{data.activities.map((item)=>{const Icon=activityIcon(item.type);return <div className="activity-row" key={item.id}><div className={`activity-icon activity-${item.type}`}><Icon size={15}/></div><div className="activity-copy"><strong>{item.title}</strong><span>{item.description}</span></div><time>{new Intl.DateTimeFormat("en",{month:"short",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date(item.createdAt))}</time></div>;})}</div>:<div className="progress-empty activity-empty"><div className="empty-icon"><Activity size={19}/></div><strong>Your learning story starts here</strong><span>Adding skills and working through your roadmap will appear in this activity timeline.</span></div>}</section>
  </div>;
}
