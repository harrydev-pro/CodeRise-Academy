import { Link, Outlet } from "react-router-dom";
import { GraduationCap, ArrowLeft, Code2, Sparkles } from "lucide-react";

export default function AuthLayout() {
  return (
    <main className="auth-layout">
      <aside className="auth-aside">
        <Link to="/" className="auth-brand"><GraduationCap size={19}/> CodeRise Academy</Link>
        <div className="auth-aside-copy"><span className="auth-aside-kicker"><Sparkles size={15}/> YOUR FUTURE STARTS HERE</span><h1>Grow your skills.<br/><span>Shape your future.</span></h1><p>Learn from practical lessons, build real projects, and take the next step in your technology journey.</p></div>
        <div className="auth-art"><div className="auth-art-window"><div><i/><i/><i/></div><Code2 size={74}/><span>build( your_future )</span></div><div className="auth-art-orb">✦</div></div>
        <p className="auth-aside-foot">Learn. Build. Grow.</p>
      </aside>
      <section className="auth-main"><div className="auth-main-top"><Link to="/" className="auth-mobile-brand"><GraduationCap size={20}/> CodeRise Academy</Link><Link to="/" className="auth-back"><ArrowLeft size={15}/> Back home</Link></div><div className="auth-main-content"><Outlet /></div></section>
    </main>
  );
}
