// import React, { useState, useEffect } from 'react';
// import api from '../services/api'; // Assume api.ts is in the same folder or adjust path
//
// interface AuditLog {
//     id: number;
//     username: string;
//     action: string;
//     timestamp: string;
//     ip_address: string;
//     outcome: boolean;
//     details: string | null;
// }
//
// const AuditLogsPage2: React.FC = () => {
//     const [logs, setLogs] = useState<AuditLog[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//
//     useEffect(() => {
//         const fetchLogs = async () => {
//             try {
//                 const response = await api.get('/audit/logs'); // Assume backend endpoint
//                 if (response.data.success) {
//                     setLogs(response.data.data); // Assume response structure
//                 } else {
//                     setError('Failed to load audit logs');
//                 }
//             } catch (err) {
//                 setError('Error fetching audit logs');
//                 console.error(err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchLogs();
//     }, []);
//
//     if (loading) {
//         return <div className="text-center p-6">Loading audit logs...</div>;
//     }
//
//     if (error) {
//         return <div className="text-red-600 text-center p-6">{error}</div>;
//     }
//
//     return (
//         <div className="p-6 bg-white rounded shadow">
//             <h2 className="text-2xl font-bold mb-4">Audit Logs</h2>
//             {logs.length === 0 ? (
//                 <p className="text-gray-600">No audit logs available.</p>
//             ) : (
//                 <table className="min-w-full bg-white border border-gray-200">
//                     <thead>
//                     <tr className="bg-gray-100">
//                         <th className="px-4 py-2 text-left">ID</th>
//                         <th className="px-4 py-2 text-left">Username</th>
//                         <th className="px-4 py-2 text-left">Action</th>
//                         <th className="px-4 py-2 text-left">Timestamp</th>
//                         <th className="px-4 py-2 text-left">IP Address</th>
//                         <th className="px-4 py-2 text-left">Outcome</th>
//                         <th className="px-4 py-2 text-left">Details</th>
//                     </tr>
//                     </thead>
//                     <tbody>
//                     {logs.map((log) => (
//                         <tr key={log.id} className="border-t">
//                             <td className="px-4 py-2">{log.id}</td>
//                             <td className="px-4 py-2">{log.username}</td>
//                             <td className="px-4 py-2">{log.action}</td>
//                             <td className="px-4 py-2">{log.timestamp}</td>
//                             <td className="px-4 py-2">{log.ip_address}</td>
//                             <td className="px-4 py-2">{log.outcome ? 'Success' : 'Failure'}</td>
//                             <td className="px-4 py-2">{log.details || 'N/A'}</td>
//                         </tr>
//                     ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };
//
// export default AuditLogsPage2;