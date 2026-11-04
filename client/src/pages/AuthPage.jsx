import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, BookOpenCheck, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const highlights = ["A clearer picture of your current skills", "Career paths built around what matters", "A learning plan you can actually follow"];
export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", college: "", course: "", year: "" });
  if (user) return <Navigate to="/" replace/>;
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${isRegister ? "register" : "login"}`, form);
      authenticate(data);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to connect. Check that the API server is running.");
    } finally { setBusy(false); }
  };
  return (
    <div className="auth-page">
      <section className="auth-story"><Link to="/login" className="brand auth-brand"><div className="brand-mark">s</div><span className="brand-name">skill<span>path</span></span></Link><div className="story-content"><div className="eyebrow"><Sparkles size={14}/> YOUR NEXT CHAPTER STARTS HERE</div><h1>Make your next move<br/><span>your best one.</span></h1><p className="story-lead">Know where you stand. See where you could go. Build a plan that gets you there.</p><div className="story-checks">{highlights.map((item) => <div key={item}><span><Check size={14}/></span>{item}</div>)}</div><div className="story-art"><div className="art-glow"/><div className="art-card art-card-main"><div className="art-card-head"><span className="art-icon"><BarChart3 size={17}/></span><span className="art-caption">YOUR SKILL SNAPSHOT</span><span className="art-dots">···</span></div><div className="art-score">68<span>%</span><small>career readiness</small></div><div className="art-bars">{["JavaScript","React","Design"].map((item, index) => <div key={item} className="art-bar-row"><span>{item}</span><i><b style={{width: `${[78,58,42][index]}%`}}/></i><small>{[4,3,2][index]}/5</small></div>)}</div><div className="art-foot"><span className="art-foot-check"><Check size={12}/></span> Your learning plan is ready</div></div><div className="art-card art-card-float"><div className="float-icon"><BookOpenCheck size={17}/></div><div><strong>Nice progress!</strong><span>3 skills moving forward</span></div><span className="float-spark">↗</span></div><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/></div></div><div className="story-footer">A little progress adds up. <span>One step at a time.</span></div></section>
      <section className="auth-form-side"><div className="auth-form-wrap"><div className="form-kicker">{isRegister ? "LET'S GET STARTED" : "WELCOME BACK"}</div><h2>{isRegister ? "Create your account" : "Good to see you again"}</h2><p className="auth-subtitle">{isRegister ? "A more intentional career journey begins with one small step." : "Pick up right where you left off."}</p>
        <form className="auth-form" onSubmit={submit}>
          {isRegister && <label>Full name<input name="name" value={form.name} onChange={change} placeholder="e.g. Alex Morgan" autoComplete="name" required maxLength={80}/></label>}
          <label>Email address<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" autoComplete="email" required/></label>
          <label>Password<div className="password-wrap"><input name="password" type={showPassword ? "text" : "password"} value={form.password} onChange={change} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} required/><button type="button" className="password-eye" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div></label>
          {isRegister && <><label>College / university <span className="optional-label">OPTIONAL</span><input name="college" value={form.college} onChange={change} placeholder="Where do you study?"/></label><div className="form-grid"><label>Course <span className="optional-label">OPTIONAL</span><input name="course" value={form.course} onChange={change} placeholder="e.g. B.Tech CSE"/></label><label>Year of study <span className="optional-label">OPTIONAL</span><select name="year" value={form.year} onChange={change}><option value="">Select year</option>{["1st year","2nd year","3rd year","4th year","Graduate"].map((year)=><option key={year}>{year}</option>)}</select></label></div></>}
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary auth-submit" disabled={busy}>{busy ? "One moment…" : <>{isRegister ? "Create my account" : "Sign in to SkillPath"} <ArrowRight size={17}/></>}</button>
        </form>
        <p className="auth-switch">{isRegister ? "Already have an account?" : "New to SkillPath?"} <Link to={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
        <div className="auth-privacy"><span>✦</span> Your learning data is private to you.</div>
      </div></section>
    </div>
  );
}
