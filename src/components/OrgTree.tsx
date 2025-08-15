import React from "react";

export interface OrgNode {
    id: number;
    code: string;
    name: string;
    level: number;
    path: string;
    parentId: number | null;
    sortOrder?: number | null;
    version?: number | null;
    isActive?: boolean;
    slug?: string | null;
    hasChildren?: boolean;
}

export type ApiFn = <T = unknown>(path: string, opts?: RequestInit) => Promise<T>;

// ---------------- API helper ----------------
function makeApi({ baseUrl, getAuth, withCredentials }: {
    baseUrl: string;
    getAuth?: () => string | null;
    withCredentials?: boolean;
}): ApiFn {
    return async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
        const token = (getAuth && getAuth()) || null;
        const r = await fetch(baseUrl + path, {
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: withCredentials ? "include" : "same-origin",
            ...opts,
        });
        if (!r.ok) {
            let msg = r.statusText;
            try {
                const j = await r.json();
                msg = j.error?.message || j.message || msg;
            } catch {
                // Agar javob JSON bo'lmasa, bu xatolikni atayin e'tiborsiz qoldiramiz.
                // Asosiy xatolik xabari `r.statusText`dan olinadi.
            }
            throw new Error(msg);
        }
        return (r.status === 204 ? (null as T) : await r.json()) as T;
    };
}


// --------------- Ikonka komponentlari ---------------
const Caret: React.FC<{ open: boolean }> = ({ open }) => (
    <span className="inline-block w-4 text-center">{open ? "▾" : "▸"}</span>
);
const Spinner: React.FC = () => <span className="opacity-60 animate-pulse">⏳</span>;

// --------------- Tree data hook ---------------
function useOrgTreeData(api: ApiFn) {
    const [rootId, setRootId] = React.useState<number | null>(null);
    const [nodes, setNodes] = React.useState<Map<number, OrgNode>>(new Map());
    const [children, setChildren] = React.useState<Map<number, number[]>>(new Map());
    const [expanded, setExpanded] = React.useState<Set<number>>(new Set());
    const [loading, setLoading] = React.useState<Set<number>>(new Set());

    const setNode = React.useCallback((n: OrgNode) => setNodes((m) => { const nm = new Map(m); nm.set(n.id, n); return nm; }), []);

    const ensureRoot = React.useCallback(async () => {
        if (rootId != null) return nodes.get(rootId)!;
        const root = await api<OrgNode>("/root");
        setNode(root); setRootId(root.id);
        return root;
    }, [rootId, nodes, setNode, api]);

    const loadChildren = React.useCallback(async (parentId: number) => {
        if (children.has(parentId)) return (children.get(parentId) || []).map((id) => nodes.get(id)!).filter(Boolean);
        setLoading((s) => new Set([...s, parentId]));
        try {
            const list = await api<OrgNode[]>(`/${parentId}/children`);
            setNodes((m) => { const nm = new Map(m); list.forEach((n) => nm.set(n.id, n)); return nm; });
            setChildren((cm) => { const ncm = new Map(cm); ncm.set(parentId, list.map((n) => n.id)); return ncm; });
            return list;
        } finally {
            setLoading((s) => { const ns = new Set(s); ns.delete(parentId); return ns; });
        }
    }, [api, children, nodes]);

    const toggle = React.useCallback(async (id: number) => {
        // Birinchi marta ochilayotganda va bolalar hali keshda bo‘lmasa — albatta yukla
        if (!expanded.has(id) && !children.has(id)) {
            await loadChildren(id);
        }

        setExpanded((s) => {
            const ns = new Set(s);
            if (ns.has(id)) {
                ns.delete(id);
            } else {
                ns.add(id);
            }
            return ns;
        });
    }, [expanded, loadChildren, children]);


    const expandPath = React.useCallback(async (ids: number[]) => {
        for (const id of ids) { await loadChildren(id); setExpanded((s) => new Set([...s, id])); }
    }, [loadChildren]);

    const move = React.useCallback(async (nodeId: number, newParentId: number) => {
        const node = nodes.get(nodeId);
        const expectedVersion = node?.version ?? null;
        await api(`/${nodeId}/move`, { method: "PATCH", body: JSON.stringify({ newParentId, expectedVersion }) });
        const oldParentId = nodes.get(nodeId)?.parentId;
        setChildren((cm) => {
            const ncm = new Map(cm);
            if (oldParentId) ncm.delete(oldParentId);
            ncm.delete(newParentId);
            return ncm;
        });
        const fresh = await api<OrgNode>(`/${nodeId}`); setNode(fresh); return fresh;
    }, [api, nodes, setNode]);

    const createChild = React.useCallback(async (parentId: number, payload: Partial<Pick<OrgNode, "code" | "name">> & { sortOrder?: number | null }) => {
        return await api<OrgNode>("", { method: "POST", body: JSON.stringify({ ...payload, parentId }) });
    }, [api]);

    const rename = React.useCallback(async (id: number, payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>) => {
        const node = nodes.get(id);
        const expectedVersion = node?.version ?? null;
        const res = await api<OrgNode>(`/${id}`, { method: "PATCH", body: JSON.stringify({ ...payload, expectedVersion }) });
        setNode(res); return res;
    }, [api, nodes, setNode]);

    const collapseAll = React.useCallback(() => {
        setExpanded(new Set());
    }, []);

    const expandAll = React.useCallback(async () => {
        if (rootId == null) return;
        const allNodeIdsToExpand = new Set<number>();
        const queue: number[] = [rootId];
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const kids = await loadChildren(currentId);
            if (kids && kids.length > 0) {
                allNodeIdsToExpand.add(currentId);
                for (const child of kids) {
                    queue.push(child.id);
                }
            }
        }
        setExpanded(allNodeIdsToExpand);
    }, [rootId, loadChildren]);

    return {
        state: { rootId, nodes, children, expanded, loading },
        actions: { ensureRoot, loadChildren, toggle, expandPath, move, createChild, rename, setNode, setExpanded, expandAll, collapseAll, setChildren }
    };
}


// --------------- Node row ---------------
function TreeNode({ id, depth, tree, selectedId, onSelect, onDropMove, onCreate, onRename }: {
    id: number;
    depth: number;
    tree: ReturnType<typeof useOrgTreeData>;
    selectedId?: number | null;
    onSelect?: (n: OrgNode) => void;
    onDropMove?: (dragId: number, dropId: number) => Promise<void> | void;
    onCreate?: (parentId: number, payload: { code: string; name: string; sortOrder?: number | null }) => Promise<OrgNode> | OrgNode;
    onRename?: (id: number, payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>) => Promise<OrgNode> | OrgNode;
}) {
    const { nodes, children, expanded, loading } = tree.state;
    const { toggle } = tree.actions;
    const node = nodes.get(id);
    const kids = children.get(id) || [];
    const isOpen = expanded.has(id);
    const isLoading = loading.has(id);
    const [adding, setAdding] = React.useState(false);
    const [newCode, setNewCode] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [editing, setEditing] = React.useState(false);
    const [editName, setEditName] = React.useState(node?.name || "");

    if (!node) return null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => { e.dataTransfer.setData("text/plain", String(id)); e.dataTransfer.effectAllowed = "move"; };
    const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); const dragId = Number(e.dataTransfer.getData("text/plain")); if (!dragId || dragId === id) return; await onDropMove?.(dragId, id); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

    const baseInputCn = "w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const btnIconCn = "inline-flex items-center justify-center w-[22px] h-[22px] border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer";
    const tagCn = "text-xs bg-gray-100 px-1.5 py-0.5 rounded-md";

    const isSelected = selectedId === id;
    const hasKids = isLoading || kids.length > 0 || node.hasChildren === true;

    return (
        <div>
            <div
                className={`flex items-center gap-2 p-1.5 my-0.5 rounded-md select-none group hover:bg-gray-100 ${isSelected ? 'bg-blue-50' : ''}`}
                style={{ paddingLeft: `${10 + depth * 14}px` }}
                draggable onDragStart={handleDragStart} onDrop={handleDrop} onDragOver={handleDragOver}
            >
                <button className={btnIconCn} onClick={() => toggle(id)} title={isOpen ? "Yopish" : "Ochish"}>
                    {hasKids ? <Caret open={isOpen} /> : <span className="opacity-25">•</span>}
                </button>
                {!editing ? (
                    <button className="bg-transparent border-none cursor-pointer text-left flex-grow" onClick={() => onSelect?.(node)} title={node.path}>
                        <span className={tagCn}>{node.code}</span> <strong className="font-semibold text-gray-800 ml-1">{node.name}</strong>
                    </button>
                ) : (
                    <form onSubmit={(e) => { e.preventDefault(); onRename?.(id, { name: editName }); setEditing(false); }} className="flex gap-1.5 items-center flex-grow">
                        <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`${baseInputCn} p-1 w-64`} />
                        <button type="submit" className={btnIconCn}>✔</button>
                        <button type="button" className={btnIconCn} onClick={() => { setEditing(false); setEditName(node.name); }}>✖</button>
                    </form>
                )}
                <span className="text-xs text-gray-500">lvl {node.level}</span>
                {isLoading && <Spinner />}
                <div className="ml-auto flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className={btnIconCn} title="Rename" onClick={() => { setEditing(true); setEditName(node.name); }}>✎</button>
                    <button className={btnIconCn} title="Add child" onClick={() => setAdding((v) => !v)}>＋</button>
                </div>
            </div>

            {adding && (
                <div className="flex items-center gap-2 my-0.5 rounded-md bg-slate-50" style={{ paddingLeft: `${10 + (depth + 1) * 14}px`, paddingBlock: '6px', paddingRight: '6px' }}>
                    <form onSubmit={async (e) => { e.preventDefault(); await onCreate?.(id, { code: newCode.trim(), name: newName.trim() }); setNewCode(""); setNewName(""); setAdding(false); }} className="flex gap-1.5 items-center w-full">
                        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Kod" className={`${baseInputCn} p-1 w-28`} required />
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom" className={`${baseInputCn} p-1 flex-grow`} required />
                        <button type="submit" className={btnIconCn} title="Saqlash">✔</button>
                        <button type="button" className={btnIconCn} onClick={() => setAdding(false)} title="Bekor qilish">✖</button>
                    </form>
                </div>
            )}

            {isOpen && kids.map((cid: number) => (
                <TreeNode key={cid} id={cid} depth={depth + 1} tree={tree} selectedId={selectedId} onSelect={onSelect} onDropMove={onDropMove} onCreate={onCreate} onRename={onRename} />
            ))}
        </div>
    );
}

// --------------- Debounce ---------------
function useDebouncedValue<T>(value: T, delay = 350) {
    const [v, setV] = React.useState<T>(value);
    React.useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
    return v;
}

// --------------- Main component ---------------
export default function OrgTree({
                                    baseUrl = "/api/v1/org",
                                    getAuth = () => localStorage.getItem("token"),
                                    withCredentials = false,
                                }: {
    baseUrl?: string;
    getAuth?: () => string | null;
    withCredentials?: boolean;
}) {
    const api = React.useMemo(() => makeApi({ baseUrl, getAuth, withCredentials }), [baseUrl, getAuth, withCredentials]);
    const tree = useOrgTreeData(api);
    const { state, actions } = tree;
    const [selected, setSelected] = React.useState<OrgNode | null>(null);
    const [q, setQ] = React.useState("");
    const dq = useDebouncedValue(q);
    const [hits, setHits] = React.useState<OrgNode[]>([]);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        actions.ensureRoot()
            .then((root) => actions.loadChildren(root.id)) // <-- qo‘shildi
            .catch((e: unknown) => setError((e as Error).message));
    }, [actions]);

    React.useEffect(() => {
        let cancel = false;
        (async () => {
            if (!dq) { setHits([]); return; }
            setBusy(true);
            try { const res = await api<OrgNode[]>(`/search?q=${encodeURIComponent(String(dq))}&limit=20`); if (!cancel) setHits(res); }
            catch (e) { if (!cancel) setError((e as Error).message); }
            finally { if (!cancel) setBusy(false); }
        })();
        return () => { cancel = true; };
    }, [dq, api]);

    const jumpTo = async (id: number) => {
        try {
            setBusy(true);
            const anc = await api<OrgNode[]>(`/${id}/ancestors`);
            await actions.expandPath(anc.map((a) => a.id));
            const node = state.nodes.get(id) || await api<OrgNode>(`/${id}`);
            if (!state.nodes.get(id)) actions.setNode(node);
            setSelected(node);
            setQ("");
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const handleMove = async (dragId: number, dropId: number) => {
        try { setBusy(true); const fresh = await actions.move(dragId, dropId); await actions.loadChildren(dropId); actions.setExpanded((s) => new Set([...s, dropId])); setSelected(fresh); }
        catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const handleCreate = async (
        parentId: number,
        payload: { code: string; name: string; sortOrder?: number | null }
    ): Promise<OrgNode> => {
        try {
            setBusy(true);
            const res = await actions.createChild(parentId, payload);
            actions.setNode(res);
            actions.setChildren((cm) => {
                const ncm = new Map(cm);
                const curr = cm.get(parentId) || [];
                ncm.set(parentId, [...curr, res.id]);
                return ncm;
            });
            const parent = state.nodes.get(parentId);
            if (parent && !parent.hasChildren) actions.setNode({ ...parent, hasChildren: true });
            actions.setExpanded((s) => new Set([...s, parentId]));
            return res; // <-- har doim qaytadi
        } catch (e) {
            setError((e as Error).message);
            throw e; // <-- muhim: undefined bo‘lib qolmasligi uchun
        } finally {
            setBusy(false);
        }
    };

    const handleRename = async (
        id: number,
        payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>
    ): Promise<OrgNode> => {
        try {
            setBusy(true);
            const res = await actions.rename(id, payload);
            setSelected(res);
            return res; // <-- qaytadi
        } catch (e) {
            setError((e as Error).message);
            throw e; // <-- muhim
        } finally {
            setBusy(false);
        }
    };

    const handleExpandAll = async () => {
        setError("");
        try {
            setBusy(true);
            await actions.expandAll();
        } catch (e) {
            setError((e as Error).message);
        } finally {
            setBusy(false);
        }
    };

    const handleCollapseAll = () => {
        actions.collapseAll();
    };

    const root = state.rootId ? state.nodes.get(state.rootId) : null;
    const baseCardCn = "border border-gray-200 rounded-lg bg-white p-3";
    const textBtnCn = "px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="grid grid-cols-[1fr_320px] gap-4 p-4 font-sans">
            <div className="left-pane flex flex-col gap-2">
                <div className={baseCardCn}>
                    <div className="flex items-center gap-2">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidiruv: code yoki nom" className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {busy ? <Spinner /> : null}
                    </div>
                </div>

                {q && (
                    <div className={baseCardCn}>
                        <div className="text-xs text-gray-500 mb-1.5">Natijalar</div>
                        <ul className="max-h-60 overflow-auto -mx-3 -my-1 list-none">
                            {hits.map((h) => (
                                <li key={h.id} className="border-t border-gray-100">
                                    <button onClick={() => jumpTo(h.id)} className="bg-transparent border-none cursor-pointer text-left w-full px-3 py-1.5 hover:bg-gray-50">
                                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-md">{h.code}</span> {h.name}
                                        <div className="text-xs text-gray-500">lvl {h.level}</div>
                                    </button>
                                </li>
                            ))}
                            {hits.length === 0 && <li className="text-xs text-gray-500 px-3 py-1.5">Hech narsa topilmadi</li>}
                        </ul>
                    </div>
                )}

                <div className={baseCardCn}>
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="font-semibold text-gray-800">Organizational Tree</div>
                        <div className="flex gap-1.5">
                            <button onClick={handleExpandAll} className={textBtnCn} disabled={busy}>Barchasini ochish</button>
                            <button onClick={handleCollapseAll} className={textBtnCn} disabled={busy}>Barchasini yopish</button>
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-xs mt-1 text-right">{error}</div>}

                    {!root ? (
                        <div className="text-xs text-gray-500">Root yuklanmoqda...</div>
                    ) : (
                        <TreeNode id={root.id} depth={0} tree={tree} selectedId={selected?.id ?? null} onSelect={setSelected} onDropMove={handleMove} onCreate={handleCreate} onRename={handleRename} />
                    )}
                    <div className="text-xs text-gray-500 mt-2">Drag & drop: tugunni boshqa tugun ustiga tashlab re-parent qiling.</div>
                </div>
            </div>

            <aside className="right-pane flex flex-col gap-2">
                <div className={baseCardCn}>
                    <div className="font-semibold text-gray-800 mb-2">Tanlangan tugun</div>
                    {!selected ? (
                        <div className="text-xs text-gray-500">Hali tanlanmagan</div>
                    ) : (
                        <dl className="text-sm grid grid-cols-[80px_1fr] gap-y-1.5 items-center">
                            <dt className="text-gray-500 font-medium">ID</dt><dd className="text-gray-800">{selected.id}</dd>
                            <dt className="text-gray-500 font-medium">Code</dt><dd className="text-gray-800">{selected.code}</dd>
                            <dt className="text-gray-500 font-medium">Name</dt><dd className="text-gray-800">{selected.name}</dd>
                            <dt className="text-gray-500 font-medium">Level</dt><dd className="text-gray-800">{selected.level}</dd>
                            <dt className="text-gray-500 font-medium text-xs mt-2 col-span-2">Path</dt>
                            <dd className="text-xs text-gray-600 break-all col-span-2">{selected.path}</dd>
                        </dl>
                    )}
                </div>

                <div className={`${baseCardCn} text-xs text-gray-600`}>
                    <div className="font-semibold text-gray-800 mb-1.5 text-sm">Qisqa qo‘llanma</div>
                    <ul className="list-disc space-y-1 pl-4">
                        <li>Strelkaga bosib bo‘limlarni oching/yoping.</li>
                        <li>Qidiruv natijasidan elementni tanlasangiz, daraxt bo‘ylab avtomatik ochiladi.</li>
                        <li>Drag & drop bilan tugunni yangi parent ustiga tashlang (backend <code>/move</code> chaqiriladi).</li>
                        <li>"＋" bilan bolani qo‘shing, ✎ bilan nomini o‘zgartiring.</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}