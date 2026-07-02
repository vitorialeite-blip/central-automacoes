"use client";
import { useMemo, useState } from "react";
import { LayoutDashboard, CirclePlus, Bot, Laptop, Users, Building2, History, ShieldCheck, Settings, Download, Boxes, Search, Archive, Trash2, Upload, FileCheck, Info } from "lucide-react";
import { initialAgents } from "../data/agents";

const STATUS_MAP = {
  "Ativo":                  ["badge-green",  "Ativo"],
  "Em teste":               ["badge-yellow", "Em teste"],
  "Pausado":                ["badge-yellow", "Pausado"],
  "Com erro":               ["badge-red",    "Com erro"],
  "Descontinuado":          ["badge-gray",   "Descontinuado"],
  "Aguardando instalação":  ["badge-blue",   "Aguardando inst."],
  "Aguardando validação":   ["badge-orange", "Aguardando val."],
};

function emptyForm() {
  return { nome:"",area:"Backoffice",responsavel:"Vitória",usuario:"",email:"",maquina:"",tipo:"Python",status:"Ativo",versao:"v1.0",finalidade:"",caminhoArquivo:"",linkPlanilha:"",observacoes:"",dataEntrega:"",arquivoAutomacao:"" };
}
function countBy(list,key){ return list.reduce((a,i)=>{a[i[key]]=(a[i[key]]||0)+1;return a},{}); }
function getBadge(status){ const [cls,label]=STATUS_MAP[status]||["badge-gray",status]; return <span className={`badge ${cls}`}>{label}</span>; }
function exportJson(agents,history){ const b=new Blob([JSON.stringify({agents,history},null,2)],{type:"application/json"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="central-automacoes.json"; a.click(); URL.revokeObjectURL(u); }

export default function Home() {
  const [page, setPage] = useState("dashboard");
  const [agents, setAgents] = useState(initialAgents);
  const [history, setHistory] = useState([{data:"02/07/2026 — 09:00",acao:"Sistema iniciado",detalhe:"Central criada com dados de exemplo",usuario:"Vitória"}]);
  const [form, setForm] = useState(emptyForm());
  const [filters, setFilters] = useState({q:"",area:"",status:"",usuario:""});

  function log(acao,detalhe){ setHistory(h=>[{data:new Date().toLocaleString("pt-BR"),acao,detalhe,usuario:"Vitória"},...h]); }
  function addAgent(e){ e.preventDefault(); const codigo=`AUT-${String(agents.length+1).padStart(3,"0")}`; const novo={codigo,...form}; setAgents([novo,...agents]); setForm(emptyForm()); log("Automação criada",`${codigo} — ${novo.nome}`); setPage("inventario"); }
  function removeAgent(a){ if(confirm(`Apagar ${a.codigo} — ${a.nome}?\n\nEssa ação não pode ser desfeita.`)){ setAgents(ag=>ag.filter(x=>x.codigo!==a.codigo)); log("Automação apagada",`${a.codigo} — ${a.nome}`); } }
  function discontinue(a){ if(confirm(`Arquivar ${a.codigo} — ${a.nome}?`)){ setAgents(ag=>ag.map(x=>x.codigo===a.codigo?{...x,status:"Descontinuado"}:x)); log("Automação arquivada",`${a.codigo} — ${a.nome}`); } }

  const areas = [...new Set(agents.map(a=>a.area))];
  const usuarios = [...new Set(agents.map(a=>a.usuario))];
  const byStatus = countBy(agents,"status");
  const alertCount = (byStatus["Com erro"]||0)+(byStatus["Pausado"]||0)+(byStatus["Em teste"]||0);

  const filtered = useMemo(()=>agents.filter(a=>{
    const q=filters.q.toLowerCase();
    return (!q||a.codigo.toLowerCase().includes(q)||a.nome.toLowerCase().includes(q)||a.maquina.toLowerCase().includes(q)||a.tipo.toLowerCase().includes(q)||a.usuario.toLowerCase().includes(q))
      &&(!filters.area||a.area===filters.area)&&(!filters.status||a.status===filters.status)&&(!filters.usuario||a.usuario===filters.usuario);
  }),[agents,filters]);

  const nav = [
    {id:"dashboard",label:"Dashboard",Icon:LayoutDashboard,section:"Principal"},
    {id:"criar",label:"Nova automação",Icon:CirclePlus,section:"Gestão"},
    {id:"inventario",label:"Inventário",Icon:Bot,badge:alertCount,section:"Gestão"},
    {id:"maquinas",label:"Máquinas",Icon:Laptop,section:"Gestão"},
    {id:"usuarios",label:"Usuários",Icon:Users,section:"Gestão"},
    {id:"areas",label:"Áreas",Icon:Building2,section:"Gestão"},
    {id:"historico",label:"Histórico",Icon:History,section:"Sistema"},
    {id:"permissoes",label:"Permissões",Icon:ShieldCheck,section:"Sistema"},
    {id:"config",label:"Configurações",Icon:Settings,section:"Sistema"},
  ];
  const sections = ["Principal","Gestão","Sistema"];

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Boxes size={18} color="#fff"/></div>
          <div className="brand-text"><h1>Central de Automações</h1><p>Painel de controle</p></div>
        </div>
        <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
          {sections.map(sec=>(
            <div key={sec}>
              <div className="nav-section">{sec}</div>
              <div className="nav">
                {nav.filter(n=>n.section===sec).map(({id,label,Icon,badge})=>(
                  <button key={id} className={`nav-item${page===id?" active":""}`} onClick={()=>setPage(id)}>
                    <Icon size={16}/>{label}
                    {badge>0&&<span className="nav-badge">{badge}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">V</div>
            <div className="sidebar-user-info"><p>Vitória</p><span>Administrador</span></div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="main">
        {page==="dashboard"&&<Dashboard agents={agents} byStatus={byStatus} alertCount={alertCount} history={history} onExport={()=>exportJson(agents,history)} onNew={()=>setPage("criar")}/>}
        {page==="criar"&&<CriarPage form={form} setForm={setForm} onSubmit={addAgent}/>}
        {page==="inventario"&&<InventarioPage agents={agents} filtered={filtered} filters={filters} setFilters={setFilters} areas={areas} usuarios={usuarios} onRemove={removeAgent} onDiscontinue={discontinue} onExport={()=>exportJson(agents,history)} onNew={()=>setPage("criar")}/>}
        {page==="maquinas"&&<CountPage title="Máquinas" sub="Automações por máquina" data={countBy(agents,"maquina")} icon={<Laptop size={16} color="#0969da"/>}/>}
        {page==="usuarios"&&<CountPage title="Usuários" sub="Automações por usuário" data={countBy(agents,"usuario")} icon={<Users size={16} color="#0969da"/>}/>}
        {page==="areas"&&<CountPage title="Áreas" sub="Automações por área" data={countBy(agents,"area")} icon={<Building2 size={16} color="#0969da"/>}/>}
        {page==="historico"&&<HistoricoPage history={history}/>}
        {page==="permissoes"&&<PermissoesPage/>}
        {page==="config"&&<ConfigPage onExport={()=>exportJson(agents,history)}/>}
      </main>
    </div>
  );
}

/* -------- DASHBOARD -------- */
function Dashboard({agents,byStatus,alertCount,history,onExport,onNew}){
  const atencao=agents.filter(a=>["Com erro","Pausado","Em teste"].includes(a.status));
  const maquinas=[...new Set(agents.map(a=>a.maquina))];
  return <>
    <div className="page-header">
      <div className="page-header-left">
        <div className="eyebrow">Dashboard</div>
        <h2>Visão geral</h2>
        <p>Acompanhe o status das automações em tempo real</p>
      </div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onExport}><Download size={15}/>Exportar JSON</button>
        <button className="btn btn-primary" onClick={onNew}><CirclePlus size={15}/>Nova automação</button>
      </div>
    </div>
    <div className="content">
      <div className="stats-grid">
        <div className="stat-card blue"><div className="stat-label">Total de automações</div><div className="stat-value">{agents.length}</div><div className="stat-sub">cadastradas</div></div>
        <div className="stat-card green"><div className="stat-label">Ativas</div><div className="stat-value">{byStatus.Ativo||0}</div><div className="stat-sub">em produção</div></div>
        <div className="stat-card red"><div className="stat-label">Precisam de atenção</div><div className="stat-value">{alertCount}</div><div className="stat-sub">erro, pausado ou em teste</div></div>
        <div className="stat-card purple"><div className="stat-label">Máquinas</div><div className="stat-value">{maquinas.length}</div><div className="stat-sub">com automações</div></div>
      </div>
      <div className="grid-2">
        <div className="panel">
          <div className="panel-header"><div><h3>Automações que precisam de atenção</h3><p>Com erro, pausadas ou em teste</p></div></div>
          {atencao.length===0
            ? <div className="empty"><p>Nenhuma automação precisa de atenção</p></div>
            : <div className="table-wrap"><table>
                <thead><tr><th>Código</th><th>Nome</th><th>Status</th><th>Máquina</th></tr></thead>
                <tbody>{atencao.map(a=><tr key={a.codigo}>
                  <td><code className="code-pill">{a.codigo}</code></td>
                  <td><div className="td-name">{a.nome}</div><div className="td-sub">{a.area}</div></td>
                  <td>{getBadge(a.status)}</td>
                  <td style={{fontSize:12,color:"var(--muted)"}}>{a.maquina}</td>
                </tr>)}</tbody>
              </table></div>}
        </div>
        <div>
          <div className="panel">
            <div className="panel-header"><h3>Últimas alterações</h3></div>
            <div className="panel-body" style={{padding:"0 18px"}}>
              {history.slice(0,5).map((h,i)=><div key={i} className="history-item">
                <div className="history-dot"/>
                <div><div className="history-action">{h.acao}</div><div className="history-detail">{h.detalhe}</div><div className="history-date">{h.data} · {h.usuario}</div></div>
              </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}

/* -------- CRIAR -------- */
function CriarPage({form,setForm,onSubmit}){
  const f=(k)=>({value:form[k],onChange:e=>setForm({...form,[k]:e.target.value})});
  return <>
    <div className="page-header">
      <div className="page-header-left"><div className="eyebrow">Cadastro</div><h2>Nova automação</h2><p>Registre uma automação já criada no inventário</p></div>
    </div>
    <div className="content">
      <div className="panel">
        <div className="panel-header"><h3>Dados da automação</h3></div>
        <div className="panel-body">
          <form className="form-grid" onSubmit={onSubmit}>
            <div className="form-field"><label className="form-label">Nome da automação *</label><input className="form-input" required placeholder="Ex: Consulta Neoway" {...f("nome")}/></div>
            <div className="form-field"><label className="form-label">Área *</label>
              <select className="form-select" {...f("area")}>{["Backoffice","Cobrança","Risco","Financeiro","Credenciamento","Pricing","Produtos"].map(x=><option key={x}>{x}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Responsável</label><input className="form-input" placeholder="Nome do responsável" {...f("responsavel")}/></div>
            <div className="form-field"><label className="form-label">Usuário (quem usa) *</label><input className="form-input" required placeholder="Ex: Amanda" {...f("usuario")}/></div>
            <div className="form-field"><label className="form-label">E-mail</label><input className="form-input" type="email" placeholder="email@empresa.com" {...f("email")}/></div>
            <div className="form-field"><label className="form-label">Máquina *</label><input className="form-input" required placeholder="Ex: Notebook Amanda" {...f("maquina")}/></div>
            <div className="form-field"><label className="form-label">Tipo</label>
              <select className="form-select" {...f("tipo")}>{["Python","Python + BAT","Extensão","API","API + Painel","AppScript","Painel","Outro"].map(x=><option key={x}>{x}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Status</label>
              <select className="form-select" {...f("status")}>{Object.keys(STATUS_MAP).map(x=><option key={x}>{x}</option>)}</select></div>
            <div className="form-field"><label className="form-label">Versão</label><input className="form-input" placeholder="v1.0" {...f("versao")}/></div>
            <div className="form-field"><label className="form-label">Data de entrega</label><input className="form-input" type="date" {...f("dataEntrega")}/></div>
            <div className="form-field"><label className="form-label">Caminho do arquivo</label><input className="form-input" placeholder="C:/Automacoes/..." {...f("caminhoArquivo")}/></div>
            <div className="form-field"><label className="form-label">Link da planilha</label><input className="form-input" placeholder="https://docs.google.com/..." {...f("linkPlanilha")}/></div>
            <div className="form-field full">
              <label className="form-label">Anexar arquivo da automação</label>
              <div className="upload-area">
                <Upload size={28} color="var(--muted)" style={{margin:"0 auto 8px"}}/>
                <p style={{fontSize:13,color:"var(--muted)"}}>Clique ou arraste o arquivo aqui</p>
                <p style={{fontSize:11,color:"var(--muted)",marginTop:4}}>ZIP, BAT, PY, JS, CRX, JSON</p>
                <input type="file" accept=".zip,.rar,.7z,.crx,.bat,.py,.js,.json,.html,.txt" onChange={e=>{const n=e.target.files?.[0]?.name||"";setForm({...form,arquivoAutomacao:n});}}/>
              </div>
              {form.arquivoAutomacao&&<div className="notice" style={{marginTop:8}}><FileCheck size={16}/><span>Arquivo: <strong>{form.arquivoAutomacao}</strong></span></div>}
            </div>
            <div className="form-field full"><label className="form-label">Finalidade</label><textarea className="form-textarea" placeholder="Descreva o que essa automação faz..." {...f("finalidade")}/></div>
            <div className="form-field full"><label className="form-label">Observações</label><textarea className="form-textarea" placeholder="Notas importantes, restrições..." {...f("observacoes")}/></div>
            <div className="form-field full"><button className="btn btn-primary" type="submit" style={{width:"fit-content"}}><Download size={15}/>Salvar automação</button></div>
          </form>
        </div>
      </div>
    </div>
  </>;
}

/* -------- INVENTÁRIO -------- */
function InventarioPage({agents,filtered,filters,setFilters,areas,usuarios,onRemove,onDiscontinue,onExport,onNew}){
  return <>
    <div className="page-header">
      <div className="page-header-left"><div className="eyebrow">Controle</div><h2>Inventário</h2><p>{agents.length} automações · {filtered.length} exibindo</p></div>
      <div className="header-actions">
        <button className="btn btn-secondary" onClick={onExport}><Download size={15}/>Exportar</button>
        <button className="btn btn-primary" onClick={onNew}><CirclePlus size={15}/>Nova</button>
      </div>
    </div>
    <div className="content" style={{paddingTop:16}}>
      <div className="panel">
        <div className="filters">
          <div className="search-wrap">
            <div className="search-icon"><Search size={14}/></div>
            <input className="search-input" placeholder="Buscar por nome, máquina, tipo..." value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value})}/>
          </div>
          <select className="filter-select" value={filters.area} onChange={e=>setFilters({...filters,area:e.target.value})}>
            <option value="">Todas as áreas</option>{areas.map(x=><option key={x}>{x}</option>)}
          </select>
          <select className="filter-select" value={filters.status} onChange={e=>setFilters({...filters,status:e.target.value})}>
            <option value="">Todos os status</option>{Object.keys(STATUS_MAP).map(x=><option key={x}>{x}</option>)}
          </select>
          <select className="filter-select" value={filters.usuario} onChange={e=>setFilters({...filters,usuario:e.target.value})}>
            <option value="">Todos os usuários</option>{usuarios.map(x=><option key={x}>{x}</option>)}
          </select>
        </div>
        {filtered.length===0
          ? <div className="empty"><p>Nenhuma automação encontrada com esses filtros.</p></div>
          : <div className="table-wrap"><table>
              <thead><tr><th>Código</th><th>Automação</th><th>Área</th><th>Usuário</th><th>Máquina</th><th>Tipo</th><th>Status</th><th>Versão</th><th>Ações</th></tr></thead>
              <tbody>{filtered.map(a=><tr key={a.codigo}>
                <td><code className="code-pill">{a.codigo}</code></td>
                <td><div className="td-name">{a.nome}</div><div className="td-sub">{a.finalidade||"—"}</div>{a.arquivoAutomacao&&<div className="td-sub">📎 {a.arquivoAutomacao}</div>}</td>
                <td><span className="tag">{a.area}</span></td>
                <td><div>{a.usuario}</div><div className="td-sub">{a.email}</div></td>
                <td style={{fontSize:12}}>{a.maquina}</td>
                <td><span className="type-pill">{a.tipo}</span></td>
                <td>{getBadge(a.status)}</td>
                <td style={{fontSize:12,fontWeight:600}}>{a.versao}</td>
                <td><div className="td-actions">
                  <button className="btn btn-secondary btn-sm" onClick={()=>onDiscontinue(a)}><Archive size={12}/>Arquivar</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>onRemove(a)}><Trash2 size={12}/></button>
                </div></td>
              </tr>)}</tbody>
            </table></div>}
      </div>
    </div>
  </>;
}

/* -------- COUNT PAGE -------- */
function CountPage({title,sub,data,icon}){
  const sorted=Object.entries(data).sort((a,b)=>b[1]-a[1]);
  return <>
    <div className="page-header"><div className="page-header-left"><div className="eyebrow">Distribuição</div><h2>{title}</h2><p>{sub}</p></div></div>
    <div className="content">
      <div className="panel">
        {sorted.map(([n,t])=><div key={n} className="list-item">
          <div className="list-item-left"><div className="list-item-icon">{icon}</div>
            <div><div style={{fontSize:13,fontWeight:600}}>{n}</div><div style={{fontSize:11,color:"var(--muted)"}}>{t} automação{t!==1?"s":""}</div></div>
          </div>
          <div className="list-count">{t}</div>
        </div>)}
      </div>
    </div>
  </>;
}

/* -------- HISTÓRICO -------- */
function HistoricoPage({history}){
  return <>
    <div className="page-header"><div className="page-header-left"><div className="eyebrow">Rastreabilidade</div><h2>Histórico</h2><p>Todas as alterações realizadas no sistema</p></div></div>
    <div className="content">
      <div className="panel">
        <div className="table-wrap"><table>
          <thead><tr><th>Data</th><th>Ação</th><th>Detalhe</th><th>Usuário</th></tr></thead>
          <tbody>{history.map((h,i)=><tr key={i}>
            <td style={{fontSize:12,color:"var(--muted)",whiteSpace:"nowrap"}}>{h.data}</td>
            <td style={{fontWeight:600,fontSize:13}}>{h.acao}</td>
            <td style={{fontSize:12,color:"var(--muted)"}}>{h.detalhe}</td>
            <td><div style={{display:"flex",alignItems:"center",gap:6}}><div className="avatar" style={{width:22,height:22,fontSize:9}}>{h.usuario[0]}</div>{h.usuario}</div></td>
          </tr>)}</tbody>
        </table></div>
      </div>
    </div>
  </>;
}

/* -------- PERMISSÕES -------- */
function PermissoesPage(){
  const perfs=[
    {nome:"Admin",desc:"Acesso total ao sistema",perms:["Ver tudo","Criar automações","Editar tudo","Apagar","Configurações"],color:"var(--purple-bg)",ic:"var(--purple)"},
    {nome:"Gestor",desc:"Gerencia sua própria área",perms:["Ver tudo","Criar automações","Editar própria área"],color:"var(--blue-bg)",ic:"var(--blue)"},
    {nome:"Visualizador",desc:"Somente leitura",perms:["Ver inventário","Ver dashboard"],color:"var(--green-bg)",ic:"var(--green)"},
    {nome:"Usuário",desc:"Vê automações vinculadas",perms:["Ver automações vinculadas"],color:"var(--surface2)",ic:"var(--muted)"},
  ];
  return <>
    <div className="page-header"><div className="page-header-left"><div className="eyebrow">Acesso</div><h2>Permissões e perfis</h2><p>Modelo de controle de acesso do sistema</p></div></div>
    <div className="content">
      <div className="notice" style={{marginBottom:16}}><Info size={16}/><span>Para login real, integrar com Supabase Auth e tabela <code>usuarios_permissoes</code>.</span></div>
      <div className="grid-equal">
        {perfs.map(p=><div key={p.nome} className="panel">
          <div className="panel-header">
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:36,height:36,borderRadius:8,background:p.color,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <ShieldCheck size={18} color={p.ic}/>
              </div>
              <div><h3>{p.nome}</h3><p>{p.desc}</p></div>
            </div>
          </div>
          <div className="panel-body" style={{padding:"12px 18px"}}>
            {p.perms.map(pe=><div key={pe} className="perm-row"><span className="perm-check">✓</span>{pe}</div>)}
          </div>
        </div>)}
      </div>
    </div>
  </>;
}

/* -------- CONFIG -------- */
function ConfigPage({onExport}){
  return <>
    <div className="page-header"><div className="page-header-left"><div className="eyebrow">Configuração</div><h2>Configurações do sistema</h2><p>Parâmetros e regras gerais</p></div></div>
    <div className="content">
      <div className="grid-equal">
        <div className="panel">
          <div className="panel-header"><h3>Status disponíveis</h3></div>
          {Object.keys(STATUS_MAP).map(s=><div key={s} className="list-item"><span style={{fontSize:13}}>{s}</span>{getBadge(s)}</div>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div className="panel">
            <div className="panel-header"><h3>Tipos de automação</h3></div>
            {["Python","Python + BAT","Extensão","API","API + Painel","AppScript","Painel","Outro"].map(t=><div key={t} className="list-item"><span className="type-pill">{t}</span></div>)}
          </div>
          <div className="panel">
            <div className="panel-header"><h3>Exportação</h3></div>
            <div className="panel-body">
              <p style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>Exporte todos os dados para integrar com outros sistemas.</p>
              <button className="btn btn-secondary" onClick={onExport}><Download size={15}/>Exportar JSON completo</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}
