"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  Home, Activity, Users, BarChart3, LayoutGrid, Calendar, Filter, Building2, CircleDollarSign, TrendingUp, Clock, Layers, Settings2
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

const NODOS = ["BUENOS AIRES", "CORDOBA", "ROSARIO", "PATAGONIA", "LITORAL", "CUYO"] as const;
type NodeMetric = 'Ingresos' | 'Costos' | 'Rentab$' | 'Rentab%';
const THEME = {
  primary: "#008666",
  secondary: "#EBE8E3",
  success: "#22c55e",
  warning: "#f59e0b",
  danger:  "#ef4444",
  neutral: "#334155",
  nodes:   ["#008666","#0ea5e9","#f59e0b","#6366f1","#ef4444","#14b8a6"],
  series:  { ingresos: "#0ea5e9", costos: "#ef4444", rentab$: "#22c55e", rentabPct:"#6366f1" }
} as const;

const meses = [
  { m: "2024-09", label: "Sep-24" },{ m: "2024-10", label: "Oct-24" },{ m: "2024-11", label: "Nov-24" },
  { m: "2024-12", label: "Dic-24" },{ m: "2025-01", label: "Ene-25" },{ m: "2025-02", label: "Feb-25" },
  { m: "2025-03", label: "Mar-25" },{ m: "2025-04", label: "Abr-25" },{ m: "2025-05", label: "May-25" },
  { m: "2025-06", label: "Jun-25" },{ m: "2025-07", label: "Jul-25" },
];
function seedRand(seed: number) { return function() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; } }
function genSerie(base: number, vol: number, seed: number, len: number) {
  const rnd = seedRand(seed);
  return Array.from({ length: len }, (_, i) => {
    const saz = 1 + 0.05 * Math.sin((i/12) * Math.PI * 2);
    const val = base * saz * (0.92 + 0.16 * rnd());
    return Math.round(val * (1 + vol * (rnd() - 0.5)));
  });
}
const fmtCurrency = (n:number, compact=true) => new Intl.NumberFormat('es-AR', { style:'currency', currency:'ARS', notation: compact? 'compact':'standard', maximumFractionDigits: 0 }).format(n);
const fmtNumber = (n:number) => new Intl.NumberFormat('es-AR').format(n);

const serieIngresos = genSerie(12000000, 0.15, 42, meses.length);
const serieCostos   = serieIngresos.map((x,i)=> Math.round(x * (0.64 + 0.06*Math.sin(i))));
const serieContrib  = serieIngresos.map((x,i)=> x - serieCostos[i]);
const serieRentabP  = serieContrib;
const serieRentabPc = serieIngresos.map((x,i)=> Math.round(100 * (serieContrib[i] / Math.max(1,x))));
const seriePacientes   = genSerie(1800, 0.12, 11, meses.length);
const seriePrestadores = genSerie(1100, 0.12, 17, meses.length);
const serieHorasTot    = genSerie(90000,0.18, 29, meses.length);

const seriesNodo = NODOS.map((n, idx) => ({
  nodo: n, horas: genSerie(12000 + idx*1500, 0.2, 60+idx, meses.length),
  pacientes: genSerie(250 + idx*40, 0.18, 80+idx, meses.length),
  prestadores: genSerie(140 + idx*25, 0.16, 100+idx, meses.length)
}));
const ingresosNodo: Record<string, number[]> = {};
const costosNodo: Record<string, number[]> = {};
NODOS.forEach(n=>{ ingresosNodo[n]=[]; costosNodo[n]=[]; });
const baseW = NODOS.map((_,i)=> 1 + 0.3*Math.sin(i));
for (let t=0; t<meses.length; t++){
  const adj = NODOS.map((_,i)=> baseW[i] * (0.95 + 0.1*Math.sin(t+i)));
  const sum = adj.reduce((a,b)=>a+b,0);
  const w = adj.map(x=> x/sum);
  NODOS.forEach((n,i)=>{
    const ing = Math.round(serieIngresos[t] * w[i]);
    const ratio = 0.62 + 0.06*Math.sin((i+t)/3);
    const cos = Math.round(ing * ratio);
    ingresosNodo[n].push(ing);
    costosNodo[n].push(cos);
  });
}
const vpm = meses.map((m,i)=> ({ mes: m.label, Total: Math.round( (i%6 - 2) * 3 + (i%3) ), Volumen: Math.round( (i%5 - 2) * 4 ), Precio: Math.round( (i%7 - 3) * 2 ), Mix: Math.round( (i%4 - 2) * 3 ) }));
const costoVsCct = NODOS.map((n,i)=> ({ Nodo:n, CostoPrest: 32 + (i%5)*4, CostoCCT: 34 + (i%4)*3 }));
const costoPrestB = NODOS.map((n,i)=> ({ Nodo:n, CostoPrestB: 28 + (i%5)*3 }));
const clientes = Array.from({length: 18}).map((_,i)=> `Cliente_${(i+1).toString().padStart(3,'0')}`);
const dataClientes = clientes.map((c,i)=> ({ Cliente: c, Facturacion: 800000 + (i%6)*240000 + (i*i)%150000, Rentab: 18 + (i%11)*3 + ((i%5)-2), DiasCobro: 45 + (i%7)*4, Pacientes: 30 + (i%9)*6, Segmento: ["A","B","C","D"][i%4] }));
const coords = ["Agostina","Ceci","Eva","Lucila","Mariela","Paula","Soledad"]; 
const viaticosNodo = NODOS.map((n,idx)=> ({ nodo:n, serie: genSerie(300000 + idx*40000, 0.22, 150+idx, meses.length) }));
const viaticosCoord = coords.map((c,idx)=> ({ coord:c, serie: genSerie(80000 + idx*12000, 0.25, 200+idx, meses.length) }));
const factVsLiq = meses.map((m,i)=> ({ mes:m.label, Facturas: 520 + (i%5)*40 + (i%3)*15, Liquidaciones: 500 + (i%5)*36 + (i%4)*10 }));

function KpiCard({ title, value, subtitle, icon: Icon, tone }:{ title:string; value:any; subtitle?:string; icon?: any; tone?: 'ok'|'warn'|'bad' }){
  const text = typeof value === 'string' ? value : String(value);
  const size = text.length > 13 ? 'text-xl' : text.length > 9 ? 'text-2xl' : 'text-3xl';
  const toneCls = tone==='bad' ? 'border-red-200 bg-red-50' : tone==='warn' ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white';
  return (
    <Card className={`rounded-2xl shadow-sm border ${toneCls}`}>
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
function Toolbar({ right }:{ right?: React.ReactNode }){
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4"/>Filtros</Button>
      <Button variant="outline" size="sm" className="gap-2"><Building2 className="w-4 h-4"/>Nodo</Button>
      <Button variant="outline" size="sm" className="gap-2">Práctica</Button>
      <Button variant="outline" size="sm" className="gap-2">Especialidad</Button>
      <Button variant="outline" size="sm" className="gap-2"><Calendar className="w-4 h-4"/>Período</Button>
      <Button variant="outline" size="sm" className="gap-2"><Users className="w-4 h-4"/>Cliente</Button>
      <Button variant="outline" size="sm" className="gap-2"><Activity className="w-4 h-4"/>Coordinador</Button>
      <div className="ml-auto flex items-center gap-2">
        <Badge variant="secondary">Demo • Datos simulados</Badge>
        <Input placeholder="Buscar…" className="h-8 w-[180px]"/>
        {right}
      </div>
    </div>
  );
}
function Hoja0_Resumen(){
  const last = meses.length-1;
  const kpis = [
    { t:"Pacientes", v: fmtNumber(seriePacientes[last]), i: Users },
    { t:"Prestadores", v: fmtNumber(seriePrestadores[last]), i: Activity },
    { t:"Horas totales", v: fmtNumber(serieHorasTot[last]), i: Layers },
    { t:"Ingresos", v: fmtCurrency(serieIngresos[last], true), i: CircleDollarSign },
    { t:"Costos", v: fmtCurrency(serieCostos[last], true), i: Settings2 },
    { t:"Rentab $", v: fmtCurrency(serieRentabP[last], true), i: TrendingUp },
    { t:"Rentab %", v: (serieRentabPc[last]).toFixed(1)+"%", i: BarChart3 },
  ];
  const dataLinea = meses.map((m,i)=> ({ mes:m.label, Rentab: serieRentabPc[i] }));
  return (
    <div className="space-y-4">
      <Toolbar />
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {kpis.map((k)=> <KpiCard key={k.t} title={k.t} value={k.v} icon={k.i} />)}
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Evolución Rentabilidad %</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dataLinea}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`} />
              <Tooltip formatter={(v)=> `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="Rentab" stroke={THEME.series.rentabPct} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
function buildNodoDataset(metric: NodeMetric){
  const rows = meses.map((m, t)=>{
    const o: any = { mes: m.label };
    (NODOS as readonly string[]).forEach((n)=>{
      let val:number;
      if(metric==='Ingresos') val = ingresosNodo[n][t];
      else if(metric==='Costos') val = costosNodo[n][t];
      else if(metric==='Rentab$') val = ingresosNodo[n][t] - costosNodo[n][t];
      else val = Math.round(100 * (ingresosNodo[n][t] - costosNodo[n][t]) / Math.max(1, ingresosNodo[n][t]));
      o[n] = val;
    });
    return o;
  });
  return rows;
}
function Hoja1_Detalle(){
  const [view, setView] = useState<'global'|'nodo'>('global');
  const [metricNodo, setMetricNodo] = useState<NodeMetric>('Ingresos');
  const dataGlobal = useMemo(()=> meses.map((m,i)=> ({
    mes:m.label, "Rentab$": serieRentabP[i], "Rentab%": serieRentabPc[i], Ingresos: serieIngresos[i], Costos: serieCostos[i]
  })), []);
  const dataNodo = useMemo(()=> buildNodoDataset(metricNodo), [metricNodo]);
  useEffect(()=>{
    const s:any = dataGlobal[0];
    console.assert('Rentab$' in s && 'Rentab%' in s, 'Hoja1: keys Rentab$ y Rentab% deben existir');
    const dn:any = dataNodo[0];
    (NODOS as readonly string[]).forEach(n=> console.assert(n in dn, `Hoja1 nodo: falta key ${n}`));
  },[dataGlobal, dataNodo]);
  return (
    <div className="space-y-4">
      <Toolbar right={
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vista:</span>
          <Button size="sm" variant={view==='global'? 'default':'outline'} onClick={()=>setView('global')}>Global</Button>
          <Button size="sm" variant={view==='nodo'? 'default':'outline'} onClick={()=>setView('nodo')}>Por nodo</Button>
          {view==='nodo' && (<>
            <span className="text-sm text-muted-foreground ml-2">Métrica:</span>
            {(['Ingresos','Costos','Rentab$','Rentab%'] as NodeMetric[]).map(m=> (
              <Button key={m} size="sm" variant={metricNodo===m? 'default':'outline'} onClick={()=>setMetricNodo(m)}>{m}</Button>
            ))}
          </>)}
        </div>
      } />
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>{view==='global' ? 'Series operativas (global)' : `Series por nodo – ${metricNodo}`}</CardTitle></CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            {view==='global' ? (
              <LineChart data={dataGlobal}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis yAxisId="left" tickFormatter={(v)=> fmtCurrency(v as number, true)} />
                <YAxis yAxisId="right" orientation="right" domain={[0,100]} tickFormatter={(v)=> `${v}%`} />
                <Tooltip formatter={(value:any, name:string)=> {
                  if(name==='Rentab%') return [`${value}%`, name];
                  return [fmtCurrency(value as number, true), name];
                }} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="Ingresos" stroke={THEME.series.ingresos} />
                <Line yAxisId="left" type="monotone" dataKey="Costos" stroke={THEME.series.costos} />
                <Line yAxisId="left" type="monotone" dataKey="Rentab$" stroke={THEME.series.rentab$} />
                <Line yAxisId="right" type="monotone" dataKey="Rentab%" stroke={THEME.series.rentabPct} />
              </LineChart>
            ) : (
              <LineChart data={dataNodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                {metricNodo==='Rentab%' ? (
                  <YAxis domain={[0,100]} tickFormatter={(v)=>`${v}%`} />
                ) : (
                  <YAxis tickFormatter={(v)=> fmtCurrency(v as number, true)} />
                )}
                <Tooltip formatter={(value:any)=> metricNodo==='Rentab%' ? `${value}%` : fmtCurrency(value as number, true)} />
                <Legend />
                {(NODOS as readonly string[]).map((n,i)=> <Line key={n} type="monotone" dataKey={n} stroke={THEME.nodes[i % THEME.nodes.length]} />)}
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
function Hoja2_Cantidades(){
  const [indicador, setIndicador] = useState<'Horas'|'Pacientes'|'Prestadores'>('Horas');
  const data = meses.map((m,idx)=> {
    const o:any = { mes:m.label };
    seriesNodo.forEach((sn)=> {
      const key = sn.nodo;
      const serie = indicador==='Horas' ? sn.horas : indicador==='Pacientes' ? sn.pacientes : sn.prestadores;
      o[key] = serie[idx];
    });
    return o;
  });
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Especialidad</Badge><Badge variant="outline">Práctica</Badge></div>} />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Indicador:</span>
        {["Horas","Pacientes","Prestadores"].map((opt)=> (
          <Button key={opt} size="sm" variant={indicador===opt? 'default':'outline'} onClick={()=>setIndicador(opt as any)}>{opt}</Button>
        ))}
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>{`Cantidades por Nodo – ${indicador}`}</CardTitle></CardHeader>
        <CardContent className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(NODOS as readonly string[]).map((n,i)=> <Line key={n} type="monotone" dataKey={n} stroke={THEME.nodes[i % THEME.nodes.length]} />)}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
function Hoja3_VPM(){
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Nodo</Badge><Badge variant="outline">Práctica</Badge></div>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Variación Total del Período</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vpm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Total" stroke={THEME.primary} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Explicada por Horas Facturadas (Volumen)</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vpm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Volumen" stroke={THEME.series.ingresos} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Explicada por Precio Unitario</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vpm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Precio" stroke={THEME.series.rentab$} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Explicada por Mix de Producto</CardTitle></CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vpm}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Mix" stroke={THEME.series.rentabPct} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Hoja4_Costos(){
  return (
    <div className="space-y-4">
      <Toolbar right={<Badge variant="outline">Nodo & Práctica</Badge>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Costo de Prestadores vs CCT (por Nodo)</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costoVsCct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Nodo" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="CostoPrest" fill={THEME.series.costos} />
                <Bar dataKey="CostoCCT" fill={THEME.series.rentabPct} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Costo de Prestadores B</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costoPrestB}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Nodo" tick={{ fontSize: 11 }} />
                <YAxis unit="%" />
                <Tooltip />
                <Legend />
                <Bar dataKey="CostoPrestB" fill={THEME.series.costos} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function Hoja5_Comercial(){
  const counts = ["A","B","C","D"].map(seg=> ({ seg, cant: dataClientes.filter(x=>x.Segmento===seg).length }));
  return (
    <div className="space-y-4">
      <Toolbar right={<Badge variant="outline">Cliente</Badge>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {counts.map(x=> (
          <Card key={x.seg} className="rounded-2xl">
            <CardHeader><CardTitle>Segmento {x.seg}</CardTitle></CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{x.cant}</div>
              <p className="text-xs text-muted-foreground">Clientes clasificados</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Resumen por Cliente</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Facturación</th>
                  <th className="py-2 pr-3">Rentab %</th>
                  <th className="py-2 pr-3">Días de cobro</th>
                  <th className="py-2 pr-3">Pacientes</th>
                  <th className="py-2 pr-3">Segmento</th>
                </tr>
              </thead>
              <tbody>
                {dataClientes.map((r)=> (
                  <tr key={r.Cliente} className="border-b hover:bg-muted/50">
                    <td className="py-2 pr-3">{r.Cliente}</td>
                    <td className="py-2 pr-3">{fmtCurrency(r.Facturacion, true)}</td>
                    <td className="py-2 pr-3">{r.Rentab.toFixed(1)}%</td>
                    <td className="py-2 pr-3">{r.DiasCobro}</td>
                    <td className="py-2 pr-3">{r.Pacientes}</td>
                    <td className="py-2 pr-3">{r.Segmento}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
function Hoja6_ViaticosProceso(){
  const dataViatNodo = meses.map((m,idx)=> {
    const o:any = { mes:m.label };
    viaticosNodo.forEach((vn)=> o[vn.nodo] = vn.serie[idx]);
    return o;
  });
  const dataViatCoord = meses.map((m,idx)=> {
    const o:any = { mes:m.label };
    viaticosCoord.forEach((vc)=> o[vc.coord] = vc.serie[idx]);
    return o;
  });
  return (
    <div className="space-y-4">
      <Toolbar right={<div className="flex items-center gap-2"><Badge variant="outline">Nodo</Badge><Badge variant="outline">Coordinador</Badge></div>} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Gasto de Viáticos por Nodo</CardTitle></CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataViatNodo}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v)=> fmtCurrency(v as number, true)} />
                <Tooltip formatter={(v)=> fmtCurrency(v as number, true)} />
                <Legend />
                {(NODOS as readonly string[]).map((n,i)=> <Line key={n} type="monotone" dataKey={n} stroke={THEME.nodes[i % THEME.nodes.length]} />)}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="rounded-2xl">
          <CardHeader><CardTitle>Gasto de Viáticos por Coordinador</CardTitle></CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataViatCoord}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(v)=> fmtCurrency(v as number, true)} />
                <Tooltip formatter={(v)=> fmtCurrency(v as number, true)} />
                <Legend />
                {coords.map((c,i)=> <Line key={c} type="monotone" dataKey={c} stroke={THEME.nodes[i % THEME.nodes.length]} />)}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="rounded-2xl">
        <CardHeader><CardTitle>Cantidad de Facturas vs Liquidaciones</CardTitle></CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={factVsLiq}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Facturas" stroke={THEME.primary} />
              <Line type="monotone" dataKey="Liquidaciones" stroke={THEME.series.ingresos} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
function SidebarOps({active, onChange}:{active:string; onChange:(v:string)=>void}){
  const items = [
    { id: "h0", label: "Resumen", icon: Home },
    { id: "h1", label: "Detalle series", icon: Activity },
    { id: "h2", label: "Cantidades", icon: Users },
    { id: "h3", label: "Cant–Precio–Mix", icon: BarChart3 },
    { id: "h4", label: "Costos & CCT", icon: Settings2 },
    { id: "h5", label: "Comercial ABCD", icon: Layers },
    { id: "h6", label: "Viáticos & Proceso", icon: Clock },
  ];
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r bg-white/60 backdrop-blur">
      <div className="px-4 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg border" style={{ backgroundColor: THEME.secondary, borderColor: THEME.primary }} />
        <LayoutGrid className="w-5 h-5"/>
        <div className="font-semibold tracking-tight">Operativo</div>
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
export default function Page(){
  const [active, setActive] = useState("h0");
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg border" style={{ backgroundColor: THEME.secondary, borderColor: THEME.primary }} />
          <div className="text-lg font-semibold tracking-tight">EnCasa – Mock UI Operativo</div>
          <div className="ml-auto flex items-center gap-2">
  <Link href="/" className="inline-flex h-9 items-center rounded-2xl bg-primary px-3 text-sm text-primary-foreground hover:opacity-90">
    Operativo
  </Link>
  <Link href="/rentabilidad" className="inline-flex h-9 items-center rounded-2xl border border-gray-300 bg-white px-3 text-sm hover:bg-muted">
    Gestión + Rentabilidad
  </Link>
  <div className="hidden sm:flex items-center gap-2">
    <div className="inline-flex items-center rounded-full border border-gray-300 px-2 py-1 text-xs">Mock</div>
    <div className="inline-flex items-center rounded-full bg-[#EBE8E3] px-2 py-1 text-xs text-gray-700">Solo estética</div>
  </div>
</div>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="rounded-full">Mock</Badge>
            <Badge variant="secondary" className="rounded-full">Solo estética</Badge>
          </div>
        </div>
      </div>
      <div className="flex">
        <SidebarOps active={active} onChange={setActive} />
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 py-6">
            <motion.div initial={{opacity:0, y:6}} animate={{opacity:1, y:0}} transition={{duration:0.25}}>
              {active === 'h0' && <Hoja0_Resumen />}
              {active === 'h1' && <Hoja1_Detalle />}
              {active === 'h2' && <Hoja2_Cantidades />}
              {active === 'h3' && <Hoja3_VPM />}
              {active === 'h4' && <Hoja4_Costos />}
              {active === 'h5' && <Hoja5_Comercial />}
              {active === 'h6' && <Hoja6_ViaticosProceso />}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
