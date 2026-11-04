import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Mail, Save } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const empty = { name: "", college: "", course: "", year: "", targetCareer: "" };
export default function ProfilePage() {
  const { updateUser, user }=useAuth();
  const [form,setForm]=useState(empty);
  const [careers,setCareers]=useState([]);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    Promise.all([api.get("/profile"),api.get("/careers")]).then(([profile,careerList])=>{
      const user=profile.data.user;
      setForm({name:user.name||"",college:user.college||"",course:user.course||"",year:user.year||"",targetCareer:user.targetCareer?._id||""});
      setCareers(careerList.data);
    }).catch((e)=>setError(e.response?.data?.message||"Could not load your profile."));
  },[]);
  const submit=async(e)=>{
    e.preventDefault();setError("");setSuccess("");setBusy(true);
    try {const {data}=await api.put("/profile",form);updateUser(data.user);setForm((value)=>({...value,targetCareer:data.user.targetCareer?._id||""}));setSuccess("Your profile has been updated.");}
    catch(e){setError(e.response?.data?.message||"Could not save your profile.");}
    finally{setBusy(false);}
  };
  return <div className="page-stack profile-page">
    <section className="profile-hero"><div className="profile-large-avatar">{form.name.slice(0,1).toUpperCase()||"S"}</div><div><span className="panel-eyebrow">YOUR SPACE, YOUR PACE</span><h2>{form.name||"Your profile"}</h2><p><Mail size={14}/>{user?.email}</p></div><div className="profile-hero-note"><Mail size={16}/>Your information is private to your account.</div></section>
    {(error||success)&&<div className={`notice ${error?"notice-error":"notice-success"}`}>{error||success}</div>}
    <form className="panel profile-form" onSubmit={submit}><div className="panel-heading"><div><span className="panel-eyebrow">THE BASICS</span><h3>A little about you</h3></div><div className="profile-email"><Mail size={14}/><span>Account email</span></div></div><label className="profile-label">Full name<input required maxLength={80} value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/></label>
      <label className="profile-label">Email address<input value={user?.email||""} disabled/><span className="field-note">Your sign-in email can’t be changed here.</span></label>
      <div className="form-grid"><label className="profile-label">College / university<input maxLength={120} value={form.college} onChange={(e)=>setForm({...form,college:e.target.value})} placeholder="Where do you study?"/></label><label className="profile-label">Course<input maxLength={100} value={form.course} onChange={(e)=>setForm({...form,course:e.target.value})} placeholder="e.g. B.Tech Computer Science"/></label></div>
      <div className="form-grid"><label className="profile-label">Year of study<select value={form.year} onChange={(e)=>setForm({...form,year:e.target.value})}><option value="">Select year</option>{["1st year","2nd year","3rd year","4th year","Graduate"].map((item)=><option key={item}>{item}</option>)}</select></label><label className="profile-label">Career goal<select value={form.targetCareer} onChange={(e)=>setForm({...form,targetCareer:e.target.value})}><option value="">Choose a career goal</option>{careers.map((career)=><option value={career._id} key={career._id}>{career.title}</option>)}</select><span className="field-note">You can explore more paths from Career paths.</span></label></div>
      <div className="profile-form-footer"><span>Changes are saved to your private profile.</span><button className="btn btn-primary" disabled={busy}>{busy?"Saving…":<><Save size={15}/> Save changes</>}</button></div>
    </form>
    <div className="starter-strip"><div className="starter-icon"><BriefcaseBusiness size={18}/></div><div><strong>Ready to take the next step?</strong><span>Compare your skills against your chosen career and build a learning plan that fits you.</span></div><a className="text-link" href="/careers">Explore career paths <ArrowRight size={14}/></a></div>
  </div>;
}
