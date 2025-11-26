import React from 'react';
import { ScanStats } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { Activity, Globe, ShieldAlert, Zap } from 'lucide-react';

interface DashboardStatsProps {
  stats: ScanStats;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const severityData = [
    { name: 'Critical', value: stats.criticalCount, color: '#ef4444' },
    { name: 'High', value: stats.highCount, color: '#f97316' },
    { name: 'Medium', value: stats.vulnsFound - stats.criticalCount - stats.highCount, color: '#eab308' },
  ].filter(d => d.value > 0);

  const requestData = [
    { name: 'DNS', count: Math.floor(stats.requests * 0.2) },
    { name: 'HTTP', count: Math.floor(stats.requests * 0.6) },
    { name: 'Fuzz', count: Math.floor(stats.requests * 0.2) },
  ];

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-surface p-5 rounded-xl border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Activity} label="Requests Sent" value={stats.requests.toLocaleString()} color="bg-blue-500" />
        <StatCard icon={Globe} label="Subdomains" value={stats.subdomains} color="bg-purple-500" />
        <StatCard icon={ShieldAlert} label="Vulnerabilities" value={stats.vulnsFound} color="bg-red-500" />
        <StatCard icon={Zap} label="Efficiency" value="98%" color="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-6">Vulnerability Distribution</h3>
          <div className="h-64 w-full">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                No vulnerabilities detected
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-zinc-800">
          <h3 className="text-lg font-semibold text-white mb-6">Request Traffic (Engine Activity)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestData}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#27272a'}}
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;