import React from 'react';
import {Bell,Search,Menu} from 'lucide-react';
export default function Header({title,onMenu}){return <header className="topbar"><div className="top-title"><button className="menu-btn" onClick={onMenu}><Menu size={20}/></button><div><span className="eyebrow">WORKSPACE</span><h1>{title}</h1></div></div><div className="top-actions"><div className="global-search"><Search size={17}/><input placeholder="Search anything..."/></div><button className="icon-btn"><Bell size={18}/><i/></button><div className="top-avatar">AD</div></div></header>}
