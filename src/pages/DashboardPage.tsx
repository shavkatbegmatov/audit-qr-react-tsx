import React, { useMemo, type ReactElement, type ComponentType } from "react";
import OnlineUsers from "@/components/OnlineUsers";
import { useWebSocketContext } from "@/context/WebSocketEventContext";
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
    PieChart, Pie, Cell, Sector
} from "recharts";
import type { PieSectorDataItem } from "recharts/types/polar/Pie";
import {
    FaUsers,
    FaShieldAlt,
    FaClipboardList,
    FaSignInAlt,
    FaExclamationTriangle,
    FaUserCheck,
    FaWifi,
} from "react-icons/fa";
import { BsWifiOff } from "react-icons/bs";

/* Types */
type IconType = ComponentType<{ className?: string }>;
interface StatCardData {
    name: string;
    value: number;
    deltaLabel: string;
    isPositive: boolean;
    Icon: IconType;
    colorClass: string;
}
interface WeeklyActivity { day: string; logins: number; audits: number; }
interface RoleSlice { name: string; value: number; color: string; }
interface ActivityItem { id: number; user: string; action: string; time: string; }

/* Static data */
const staticStatsData: Omit<StatCardData, 'value'>[] = [
    { name: "Aktiv Foydalanuvchilar", deltaLabel: "+15.2%", isPositive: true, Icon: FaUsers, colorClass: "bg-blue-500" },
    { name: "Hozir Online", deltaLabel: "live", isPositive: true, Icon: FaUserCheck, colorClass: "bg-green-500" },
    { name: "Audit Obyektlari", deltaLabel: "+5", isPositive: true, Icon: FaClipboardList, colorClass: "bg-indigo-500" },
    { name: "Mavjud Rollar", deltaLabel: "+1", isPositive: true, Icon: FaShieldAlt, colorClass: "bg-purple-500" },
    { name: "Tizimga Kirishlar (24s)", deltaLabel: "+8.7%", isPositive: true, Icon: FaSignInAlt, colorClass: "bg-cyan-500" },
    { name: "Risklar Soni", deltaLabel: "-3.1%", isPositive: false, Icon: FaExclamationTriangle, colorClass: "bg-red-500" },
];

const staticValues = {
    "Aktiv Foydalanuvchilar": 1250,
    "Audit Obyektlari": 320,
    "Mavjud Rollar": 4,
    "Tizimga Kirishlar (24s)": 4812,
    "Risklar Soni": 89,
};

const weeklyActivityData: WeeklyActivity[] = [
    { day: "Dushanba", logins: 400, audits: 24 },
    { day: "Seshanba", logins: 300, audits: 13 },
    { day: "Chorshanba", logins: 500, audits: 38 },
    { day: "Payshanba", logins: 478, audits: 19 },
    { day: "Juma", logins: 689, audits: 48 },
    { day: "Shanba", logins: 890, audits: 38 },
    { day: "Yakshanba", logins: 390, audits: 23 },
];

const userRolesData: RoleSlice[] = [
    { name: "Administratorlar", value: 15, color: "#0088FE" },
    { name: "Auditorlar", value: 75, color: "#00C49F" },
    { name: "Menejerlar", value: 45, color: "#FFBB28" },
    { name: "Kuzatuvchilar", value: 120, color: "#FF8042" },
];

const recentActivities: ActivityItem[] = [
    { id: 1, user: "Ali Valiyev", action: "yangi audit obyekti qo'shdi", time: "5 daqiqa oldin" },
    { id: 2, user: "Zarina Karimova", action: "risk holatini o'zgartirdi", time: "2 soat oldin" },
    { id: 3, user: "John Doe", action: "tizimga kirdi", time: "3 soat oldin" },
    { id: 4, user: "Sardor Komilov", action: "hisobotni eksport qildi", time: "kecha, 18:30" },
];

/* Helper functions */
function renderActiveShape(props: unknown): ReactElement {
    const {
        cx = 0,
        cy = 0,
        innerRadius = 0,
        outerRadius = 0,
        startAngle,
        endAngle,
        fill,
        percent,
        payload,
    } = props as PieSectorDataItem;

    const typedPayload = payload as RoleSlice;

    return (
        <g>
            <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill="#111827" className="font-semibold">
                {typedPayload.name}
            </text>
            <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#6B7280">
                {`${Math.round((percent ?? 0) * 100)}% (${typedPayload.value})`}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
        </g>
    );
}

function StatCard({ data, format, connectionIcon }: {
    data: StatCardData;
    format: (n: number) => string;
    connectionIcon?: ReactElement;
}) {
    const { Icon } = data;
    return (
        <div className="bg-white p-5 rounded-xl shadow-sm ring-1 ring-gray-100 h-full flex items-center gap-5" role="region" aria-label={data.name}>
            <div className={`p-4 rounded-full text-white ${data.colorClass}`} aria-hidden="true">
                <Icon className="h-7 w-7" />
            </div>
            <div>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                    {data.name}
                    {connectionIcon}
                </p>
                <p className="text-2xl font-bold text-gray-900">{format(data.value)}</p>
                <p className={`text-xs font-medium ${data.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {data.deltaLabel}
                </p>
            </div>
        </div>
    );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white p-5 rounded-xl shadow-sm ring-1 ring-gray-100 h-full flex flex-col ${className}`}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
            {children}
        </div>
    );
}

/* Main Dashboard Component */
export default function DashboardPage() {
    const nf = useMemo(() => new Intl.NumberFormat("uz-UZ"), []);
    const formatNumber = (n: number) => nf.format(n);

    // WebSocket context'dan online users ma'lumotlarini olish
    const { onlineCount, isConnected } = useWebSocketContext();

    // Stats data'ni dynamic qilish
    const statsData: StatCardData[] = useMemo(() => {
        return staticStatsData.map(stat => ({
            ...stat,
            value: stat.name === "Hozir Online" ? onlineCount : staticValues[stat.name as keyof typeof staticValues] || 0
        }));
    }, [onlineCount]);

    // Connection status icon
    const getConnectionIcon = (statName: string) => {
        if (statName === "Hozir Online") {
            return isConnected ?
                <FaWifi className="w-3 h-3 text-green-500" title="Connected" /> :
                <BsWifiOff className="w-3 h-3 text-red-500" title="Disconnected" />;
        }
        return undefined;
    };

    return (
        <div className="px-3 sm:px-4 lg:px-6 pb-8">
            {/* Stats cards */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 sm:gap-6 auto-rows-[minmax(0,1fr)] mb-6">
                {statsData.map((stat) => (
                    <div key={stat.name} className="col-span-1">
                        <StatCard
                            data={stat}
                            format={formatNumber}
                            connectionIcon={getConnectionIcon(stat.name)}
                        />
                    </div>
                ))}
            </div>

            {/* Charts & Online users */}
            <div className="grid grid-cols-12 gap-4 sm:gap-6 auto-rows-[minmax(0,1fr)] mb-6">
                <div className="col-span-12 lg:col-span-7">
                    <Card title="Haftalik aktivlik">
                        <div className="flex-1 min-h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={weeklyActivityData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 12 }} />
                                    <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                                    <RechartsTooltip wrapperClassName="rounded-md shadow-lg" cursor={{ fill: "rgba(243,244,246,0.5)" }} />
                                    <Legend />
                                    <Bar dataKey="logins" name="Tizimga kirishlar" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="audits" name="Auditlar" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 lg:col-span-5">
                    <Card title="Hozir onlayn">
                        <div className="flex-1 min-h-[320px] overflow-auto">
                            <OnlineUsers />
                        </div>
                    </Card>
                </div>
            </div>

            {/* Roles pie + recent activities */}
            <div className="grid grid-cols-12 gap-4 sm:gap-6 auto-rows-[minmax(0,1fr)]">
                <div className="col-span-12 xl:col-span-4">
                    <Card title="Foydalanuvchilar rollar bo'yicha">
                        <div className="flex-1 min-h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={userRolesData}
                                        dataKey="value"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        activeShape={renderActiveShape}
                                        isAnimationActive={false}
                                    >
                                        {userRolesData.map((entry, idx) => (
                                            <Cell key={`slice-${idx}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip content={() => null} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                <div className="col-span-12 xl:col-span-8">
                    <Card title="So'nggi harakatlar" className="min-h-[280px]">
                        <ul className="space-y-4 overflow-auto">
                            {recentActivities.map((a) => (
                                <li key={a.id} className="flex items-center gap-4 p-2 rounded-md hover:bg-gray-50" aria-label={`${a.user} – ${a.action}`}>
                                    <div className="p-2 bg-gray-100 rounded-full" aria-hidden="true">
                                        <FaUsers className="text-gray-500" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-800">
                                            <span className="font-semibold">{a.user}</span> {a.action}
                                        </p>
                                    </div>
                                    <p className="text-xs text-gray-400 self-start">{a.time}</p>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}