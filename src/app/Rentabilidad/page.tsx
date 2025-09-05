"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Home, Activity, Users, BarChart3, LayoutGrid, Calendar, Filter,
  Building2, TrendingUp, Layers, Settings2, UserPlus, UserMinus
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, LineChart, Line,
} from "recharts";

/** Paleta y constantes */
const NODOS = ["BUENOS AIRES", "CORDOBA", "ROSARIO", "PATAGONIA", "LITORAL", "CUYO"] as const;
const COORDS = ["Agostina","Ceci","Eva","Lucila","Mariela","Paula","Soledad"] as const;
const ESPECIALIDADES = ["Enfermería", "Kinesiología", "Fonoaudiología", "Cuidadores"] as const;
const PRACTICAS = ["Control", "Rehab", "Seguimiento", "Curaciones"] as const;

const THEME = {
  primary: "#008666",
  secondary: "#EBE8E3",
  nodes:   ["#008666","#0ea5e9","#f59e0b","#6366f1","#ef4444","#14b8a6"],
  series:  { a:"#0ea5e9", b:"#ef4444", c:"#22c55e", d:"#6366f1" }
} as const;

const meses = [
  { m:"2024-09", label:"Sep-24" }, { m:"2024-10", label:"Oct-24" }, { m:"2024-11", label:"Nov-24" },
  { m:"2024-12", label:"Dic-24" }, { m:"2025-01", label:"Ene-25" }, { m:"2025-02", label:"Feb-25" },
  { m:"2025-03", label:"Mar-25" }, { m:"2025-04", label:"Abr-25" }, { m:"2025-05", label:"May-25" },
  { m:"2025-06", label:"Jun-25" }, { m:"2025-07", label:"Jul-25" },
];

/** Helpers de datos simulados */
function seedRand(seed: number) { return function() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; } }
function genSerie(base: number, vol: number, seed: number, len: number) {
  const rnd = seedRand(seed);
  return Array.from({ length: len }, (_, i) => {
    const saz = 1 + 0.05 * Math.sin((i/12) * Math.PI * 2);
    const val = base * saz * (0.92 + 0.16 * rnd());
    return Math.round(val * (1 + vol * (rnd() - 0.5)));
  });
}
const fmtNumber = (n:number) => new Intl.NumberFormat('es-AR').format(n);

/** Series simuladas */
const horasCoord = genSerie(90000, 0.12, 10, meses.length);
const horasReales = horasCoord.map((x,i)=> Math.round(x * (0.88 + 0.1*Math.sin(i/2))));
const presentismoPct = horasCoord.map((x,i)=> Math.round(100 * horasReales[i] / Math.max(1,x)));

const prestActivos = genSerie(1200, 0.10, 21, meses.length);
const altasPrest = meses.map((_,i)=> 40 + (i%5)*5 + (i%3)*3);
const bajasPrest = meses.map((_,i)=> 28 + (i%4)*4 + (i%2)*2);

const pacActivos = genSerie(1900, 0.11, 31, meses.length);
const altasPac = meses.map((_,i)=> 55 + (i%5)*6 + (i%3)*2);
const bajasPac = meses.map((_,i)=> 48 + (i%4)*5 + (i%2)*2);

const hsPromPorPractica = PRACTICAS.map((p,i)=> ({ Practica: p, HorasProm: 3.2 + (i%3)*0.6 + (i%2)*0.3 }));

const prestPorEspCoord = COORDS.map((c,idx)=> {
  const base = 40 + (idx%3)*7;
  const row:any = { Coordinador: c };
  ESPECIALIDADES.forEach((e,j)=> row[e] = base + (j%3)*6 + ((idx+j)%4)*3 );
  return row;
});

const viaticosCoordNodo = COORDS.map((c,idx)=> {
  const row:any = { Coordinador: c };
  NODOS.forEach((n,j)=> row[n] = 800000 + idx*60000 + j*35000 + ((idx+j)%3)*20000 );
  return row;
});

/** UI pequeñas utilidades */
function Toolbar({ right }:{ right?: React.ReactNode }){
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4"/>Filtros</Button>
      <Button variant="outline" size="sm" className="gap-2"><Building2 className="w-4 h-4"/>Nodo</Button>
      <Button variant="outline" size="sm" className="gap-2">Especialidad</Button>
      <Button variant="outline" size="sm" className="gap-2">Práctica</Button>
      <Button variant="outline" size="sm" className="gap-2"><Calendar className="w-4 h-4"/>Período</Button>
      <Button variant="outline" size="sm" className="gap-2"><Users className="w-4 h-4"/>Cliente</Button>
      <Button variant="outline" size="sm" className="gap-2"><Activity className="w-4 h-4"/>Prestador</Button>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary">Demo • Datos simulados</Badge>
        <Input placeholder="Buscar…" className="h-8 w-[180px]"/>
        {right}
      </div>
    </div>
  );
}

function KpiCard({ title, value, subtitle, icon: Icon }:{ title:string; value:any; subtitle?:string; icon?:any }){
  const text = typeof value === 'string' ? value : String(value);
  const size = text.length > 13 ? 'text-xl' : text.length > 9 ? 'text-2xl' : 'text-3xl';
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className={`${size} font-bold tracking-tight leading-tight`}>{text}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

/** Hojas */
function Hoja0_Resumen(){
  const last = meses.length-1;
  const kpis = [
    { t:"Presentismo", v: presentismoPct[last].toFixed(0)+"%", i: TrendingUp },
    { t:"Horas coord.", v: fmtNumber(horasCoord[last]), i: Layers },
    { t:"Horas reales", v: fmtNumber(horasReales[last]), i: Activity },
    { t:"Prestadores activos", v: fmtNumber(prestActivos[last]), i: Users },
    { t:"Altas prest.", v: fmtNumber(altasPrest[last]), i: UserPlus },
    { t:"Bajas prest.", v: fmtNumber(bajasPrest[last]), i: UserMinus },
    { t:"Pacientes activos", v: fmtNumber(pacActivos[last]), i: Home },
  ];

  return (
    <div className="space-y-4">
      <Toolbar />
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {kpis.map((k)=> <KpiCard key={k.t} title={k.t} value={k.v} icon={k.i} />)}
      </div>
    </div>
  );
}

function Hoja1_Presentismo(){
  const dataLinea = meses.map((m,i)=> ({ mes:m.label, "Horas coordinadas": horasCoord[i], "Horas reales": horasReales[i], "Presentismo%": presentismoPct[i] }));
  const dataAltasBajasPrest = meses.map((m,i)=> ({ mes:m.label, Altas: altasPrest[i], Bajas: bajasPrest[i] }));

  useEffect(()=>{ const s:any = dataLinea[0]; console.assert("Horas coordinadas" in s && "Horas reales" in s, "Faltan series"); },[]);

  return (
    <div className="space-y-4">
      <Toolbar />
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Presentismo por Prestadores (Horas coordinadas vs reales)</CardTitle></CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataLinea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[70,110]} tickFormatter={(v)=> `${v}%`} />
              <Tooltip formatter={(value:any, name:string)=> name.includes("%") ? [`${value}%`, name] : [fmtNumber(value as number), name]} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Horas coordinadas" stroke={THEME.series.a} />
              <Line yAxisId="left" type="monotone" dataKey="Horas reales" stroke={THEME.series.b} />
              <Line yAxisId="right" type="monotone" dataKey="Presentismo%" stroke={THEME.series.d} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Prestadores Activos</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meses.map((m,i)=> ({ mes:m.label, Activos: prestActivos[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Activos" stroke={THEME.series.c} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Altas y Bajas de Prestadores</CardTitle></CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataAltasBajasPrest}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Altas" fill={THEME.series.c} />
                <Bar dataKey="Bajas" fill={THEME.series.b} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Hoja2_HorasProm(){
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Nodo</Badge><Badge variant="outline">Coordinador</Badge><Badge variant="outline">Cliente</Badge></div>} />
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Horas promedio por Servicio/Práctica</CardTitle></CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hsPromPorPractica}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Practica" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="HorasProm" name="Horas promedio" fill={THEME.series.a} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function Hoja3_Pacientes(){
  const dataAltasBajasPac = meses.map((m,i)=> ({ mes:m.label, Altas: altasPac[i], Bajas: bajasPac[i] }));
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Nodo</Badge><Badge variant="outline">Especialidad</Badge><Badge variant="outline">Cliente</Badge></div>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Pacientes Activos</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={meses.map((m,i)=> ({ mes:m.label, Activos: pacActivos[i] }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Activos" stroke={THEME.series.a} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Altas y Bajas de Pacientes</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataAltasBajasPac}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Altas" fill={THEME.series.c} />
                <Bar dataKey="Bajas" fill={THEME.series.b} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Hoja4_DotacionViaticos(){
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Nodo</Badge><Badge variant="outline">Período</Badge><Badge variant="outline">Coordinador</Badge></div>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Prestadores por Especialidad y Coordinador</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={prestPorEspCoord}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Coordinador" />
                <YAxis />
                <Tooltip />
                <Legend />
                {ESPECIALIDADES.map((e,i)=>(
                  <Bar key={e} dataKey={e} stackId="a" fill={THEME.nodes[i % THEME.nodes.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Viáticos por Coordinador (stack por Nodo)</CardTitle></CardHeader>
          <CardContent className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={viaticosCoordNodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Coordinador" />
                <YAxis />
                <Tooltip />
                <Legend />
                {NODOS.map((n,i)=>(
                  <Bar key={n} dataKey={n} stackId="viat" fill={THEME.nodes[i % THEME.nodes.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/** Sidebar */
function Sidebar({active, onChange}:{active:string; onChange:(v:string)=>void}){
  const items = [
    { id: "h0", label: "Resumen", icon: Home },
    { id: "h1", label: "Presentismo", icon: Activity },
    { id: "h2", label: "Horas Prom.", icon: BarChart3 },
    { id: "h3", label: "Pacientes", icon: Users },
    { id: "h4", label: "Dotación & Viáticos", icon: Settings2 },
  ];
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r bg-white/60 backdrop-blur">
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg border" style={{ backgroundColor: THEME.secondary, borderColor: THEME.primary }} />
        <LayoutGrid className="w-5 h-5"/>
        <div className="font-semibold tracking-tight">Gestión + Rentab.</div>
      </div>
      <Separator />
      <nav className="p-3 space-y-1">
        {items.map(({id,label,icon:Icon})=> (
          <button key={id} onClick={()=>onChange(id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition ${active===id? 'bg-primary text-primary-foreground':'hover:bg-muted'}`}>
            <Icon className="w-4 h-4"/>{label}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4 text-xs text-muted-foreground">
        <div>Versión mock • UI de referencia</div>
        <div>© Tu Consultora</div>
      </div>
    </aside>
  );
}

/** Página principal */
export default function Page(){
  const [active, setActive] = useState("h0");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Header con links cruzados */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: THEME.secondary, borderColor: THEME.primary }} />
          <div className="text-lg font-semibold tracking-tight">EnCasa – Gestión + Rentabilidad (Mock)</div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="inline-flex h-9 items-center rounded-2xl border border-gray-300 bg-white px-3 text-sm hover:bg-muted">Operativo</Link>
            <Link href="/rentabilidad" className="inline-flex h-9 items-center rounded-2xl bg-primary px-3 text-sm text-primary-foreground hover:opacity-90">Gestión + Rentabilidad</Link>
            <Badge variant="outline" className="rounded-full hidden sm:inline-flex">Mock</Badge>
            <Badge variant="secondary" className="rounded-full hidden sm:inline-flex">Solo estética</Badge>
          </div>
        </div>
      </div>

      <div className="flex">
        <Sidebar active={active} onChange={setActive} />
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 py-6">
            <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.25}}>
              {active === 'h0' && <Hoja0_Resumen />}
              {active === 'h1' && <Hoja1_Presentismo />}
              {active === 'h2' && <Hoja2_HorasProm />}
              {active === 'h3' && <Hoja3_Pacientes />}
              {active === 'h4' && <Hoja4_DotacionViaticos />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
