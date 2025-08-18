import React from "react";

// =================================================================================
// Interfeyslar va Yordamchi Funksiyalar
// =================================================================================

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
    deleted?: boolean;
}

export type ApiFn = <T = unknown>(path: string, opts?: RequestInit) => Promise<T>;

type HeadersLike = HeadersInit | undefined;

const isRecord = (v: unknown): v is Record<string, unknown> =>
    typeof v === "object" && v !== null;

const pickErrorMessage = (b: Record<string, unknown>): string | undefined => {
    // keng tarqalgan variantlar: {message}, {error:{message}}, {error:"..."}, RFC7807 {detail}
    if (typeof b.message === "string") return b.message;
    const e = b.error;
    if (typeof e === "string") return e;
    if (isRecord(e) && typeof e.message === "string") return e.message;
    if (typeof b.detail === "string") return b.detail;
    return undefined;
};

function makeApi(
    { baseUrl, getAuth, withCredentials = false }: { baseUrl: string; getAuth?: () => string | null; withCredentials?: boolean; }
): ApiFn {
    return async function api<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
        const token = getAuth?.() ?? null;

        const r = await fetch(baseUrl + path, {
            ...opts,
            credentials: withCredentials ? 'include' : 'same-origin',
            headers: {
                "Content-Type": "application/json",
                ...(opts.headers as HeadersLike),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        const ct = r.headers.get("content-type") ?? "";

        if (!r.ok) {
            let msg = r.statusText;

            if (ct.includes("application/json")) {
                const parsed: unknown = await r.json().catch<unknown>(() => null);
                if (isRecord(parsed)) {
                    msg = pickErrorMessage(parsed) ?? msg;
                }
            } else {
                const txt = await r.text().catch(() => "");
                if (txt) msg = txt;
            }
            throw new Error(msg);
        }

        if (r.status === 204) {
            return null as unknown as T;
        }

        if (ct.includes("application/json")) {
            return (await r.json()) as T;
        }
        // Kerak bo‘lsa, bu yerda Blob/FormData qo‘llab-quvvatlashingiz mumkin
        return (await r.text()) as unknown as T;
    };
}

// =================================================================================
// Ikonka Komponentlari
// =================================================================================

const Caret: React.FC<{ open: boolean }> = ({ open }) => (
    <span className="inline-block w-4 text-center">{open ? "▾" : "▸"}</span>
);

const Spinner: React.FC = () => <span className="opacity-60 animate-pulse">⏳</span>;

// =================================================================================
// Daraxt Ma'lumotlari Uchun Hook (useOrgTreeData)
// =================================================================================

function useOrgTreeData(api: ApiFn, showDeleted: boolean) {
    const [rootId, setRootId] = React.useState<number | null>(null);
    const [nodes, setNodes] = React.useState<Map<number, OrgNode>>(new Map());
    const [children, setChildren] = React.useState<Map<number, number[]>>(new Map());
    const [expanded, setExpanded] = React.useState<Set<number>>(new Set());
    const [loading, setLoading] = React.useState<Set<number>>(new Set());

    const rootIdRef = React.useRef(rootId);
    rootIdRef.current = rootId;
    const nodesRef = React.useRef(nodes);
    nodesRef.current = nodes;

    const setNode = React.useCallback((n: OrgNode) => {
        setNodes((m) => {
            const nm = new Map(m);
            nm.set(n.id, n);
            return nm;
        });
    }, []);

    const loadChildren = React.useCallback(async (parentId: number) => {
        const url = `/${parentId}/children?showDeleted=${showDeleted}`;
        setLoading((s) => new Set(s).add(parentId));
        try {
            const list = await api<OrgNode[]>(url);
            setNodes((m) => {
                const nm = new Map(m);
                list.forEach((n) => nm.set(n.id, n));
                return nm;
            });
            setChildren((cm) => {
                const ncm = new Map(cm);
                ncm.set(parentId, list.map((n) => n.id));
                return ncm;
            });
            return list;
        } finally {
            setLoading((s) => {
                const ns = new Set(s);
                ns.delete(parentId);
                return ns;
            });
        }
    }, [api, showDeleted, setChildren, setNodes]);

    const ensureRoot = React.useCallback(async () => {
        if (rootIdRef.current != null) {
            return nodesRef.current.get(rootIdRef.current)!;
        }
        const root = await api<OrgNode>(`/root?showDeleted=${showDeleted}`);
        setNode(root);
        setRootId(root.id);
        return root;
    }, [api, showDeleted, setNode, setRootId]);

    const toggle = React.useCallback(async (id: number) => {
        if (!expanded.has(id) && !children.has(id)) {
            await loadChildren(id);
        }
        setExpanded((s) => {
            const ns = new Set(s);
            if (ns.has(id)) ns.delete(id); else ns.add(id);
            return ns;
        });
    }, [expanded, children, loadChildren]);

    const expandPath = React.useCallback(async (ids: number[]) => {
        for (const id of ids) {
            await loadChildren(id);
            setExpanded((s) => new Set(s).add(id));
        }
    }, [loadChildren]);

    const move = React.useCallback(async (nodeId: number, newParentId: number) => {
        const node = nodes.get(nodeId);
        const expectedVersion = node?.version ?? null;
        await api(`/${nodeId}/move`, { method: "PATCH", body: JSON.stringify({ newParentId, expectedVersion }) });
        const oldParentId = node?.parentId;
        setChildren((cm) => {
            const ncm = new Map(cm);
            if (oldParentId) ncm.delete(oldParentId);
            ncm.delete(newParentId);
            return ncm;
        });
        const fresh = await api<OrgNode>(`/${nodeId}`);
        setNode(fresh);
        return fresh;
    }, [api, nodes, setNode]);

    const createChild = React.useCallback(async (parentId: number, payload: Partial<Pick<OrgNode, "code" | "name" | "isActive">> & { sortOrder?: number | null }) => {
        return await api<OrgNode>("", { method: "POST", body: JSON.stringify({ ...payload, parentId }) });
    }, [api]);

    const rename = React.useCallback(async (id: number, payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>) => {
        const node = nodes.get(id);
        const expectedVersion = node?.version ?? null;
        const res = await api<OrgNode>(`/${id}`, { method: "PATCH", body: JSON.stringify({ ...payload, expectedVersion }) });
        if (res.hasChildren === undefined && node?.hasChildren !== undefined) {
            res.hasChildren = node.hasChildren;
        }
        setNode(res);
        return res;
    }, [api, nodes, setNode]);

    const softDelete = React.useCallback(async (id: number) => {
        await api(`/${id}`, { method: "DELETE" });
        setNodes(m => {
            const nm = new Map(m);
            const node = nm.get(id);
            if (node) nm.set(id, { ...node, deleted: true });
            return nm;
        });
    }, [api]);

    const permanentDelete = React.useCallback(async (id: number) => {
        const node = nodes.get(id);
        const parentId = node?.parentId;
        await api(`/${id}/permanent`, { method: "DELETE" });
        setNodes(m => {
            const nm = new Map(m);
            nm.delete(id);
            return nm;
        });
        if (parentId) {
            await loadChildren(parentId);
        }
    }, [api, nodes, loadChildren]);

    const collapseAll = React.useCallback(() => setExpanded(new Set()), []);

    const expandAll = React.useCallback(async () => {
        if (rootId == null) return;
        const allNodeIdsToExpand = new Set<number>();
        const queue: number[] = [rootId];
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const kids = await loadChildren(currentId);
            if (kids && kids.length > 0) {
                allNodeIdsToExpand.add(currentId);
                kids.forEach(child => queue.push(child.id));
            }
        }
        setExpanded(allNodeIdsToExpand);
    }, [rootId, loadChildren]);

    const actions = React.useMemo(() => ({
        ensureRoot, loadChildren, toggle, expandPath, move, createChild, rename,
        setNode, expandAll, collapseAll, softDelete, permanentDelete, setExpanded, setChildren
    }), [
        ensureRoot, loadChildren, toggle, expandPath, move, createChild, rename,
        setNode, expandAll, collapseAll, softDelete, permanentDelete, setExpanded, setChildren
    ]);

    return {
        state: { rootId, nodes, children, expanded, loading },
        actions
    };
}

// =================================================================================
// Daraxt Tuguni Komponenti (TreeNode)
// =================================================================================

type TreeNodeProps = {
    id: number;
    depth: number;
    tree: ReturnType<typeof useOrgTreeData>;
    selectedId?: number | null;
    showInactive: boolean;
    showDeleted: boolean;
    onSelect?: (n: OrgNode) => void;
    onDropMove?: (dragId: number, dropId: number) => void;
    onCreate?: (parentId: number, payload: { code: string; name: string; isActive: boolean; sortOrder?: number | null }) => Promise<OrgNode>;
    onRename?: (id: number, payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>) => Promise<OrgNode>;
    onSoftDelete?: (id: number) => void;
    onPermanentDelete?: (id: number) => void;
};

function TreeNode({ id, depth, tree, selectedId, showInactive, showDeleted, onSelect, onDropMove, onCreate, onRename, onSoftDelete, onPermanentDelete }: TreeNodeProps) {
    const { nodes, children, expanded, loading } = tree.state;
    const { toggle } = tree.actions;
    const node = nodes.get(id);
    const kids = children.get(id) || [];

    const [adding, setAdding] = React.useState(false);
    const [newCode, setNewCode] = React.useState("");
    const [newName, setNewName] = React.useState("");
    const [newIsActive, setNewIsActive] = React.useState(true);
    const [editing, setEditing] = React.useState(false);
    const [editName, setEditName] = React.useState(node?.name || "");
    const [confirmingDelete, setConfirmingDelete] = React.useState(false);

    if (!node) return null;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => { e.dataTransfer.setData("text/plain", String(id)); e.dataTransfer.effectAllowed = "move"; };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); const dragId = Number(e.dataTransfer.getData("text/plain")); if (!dragId || dragId === id) return; onDropMove?.(dragId, id); };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };

    const baseInputCn = "w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
    const btnIconCn = "inline-flex items-center justify-center w-[22px] h-[22px] border border-gray-200 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
    const tagCn = "text-xs bg-gray-100 px-1.5 py-0.5 rounded-md";

    const isOpen = expanded.has(id);
    const isLoading = loading.has(id);
    const isSelected = selectedId === id;
    const hasKids = isLoading || kids.length > 0 || node.hasChildren === true;

    const inactiveCn = !node.isActive ? "text-gray-400 line-through" : "text-gray-800";

    const deletedTextCn = node.deleted ? "!text-red-600 !line-through opacity-70" : "";
    const deletedBgCn = node.deleted ? 'bg-red-50 hover:bg-red-100' : '';

    const rowBgCn = deletedBgCn || (isSelected ? 'bg-blue-50' : 'hover:bg-gray-100');

    const visibleKids = kids.filter(cid => {
        const childNode = nodes.get(cid);
        if (!childNode) return false;
        if (!showInactive && childNode.isActive === false) return false;
        if (!showDeleted && childNode.deleted === true) return false;
        return true;
    });

    return (
        <div>
            <div
                className={`flex items-center gap-2 p-1.5 my-0.5 rounded-md select-none group ${rowBgCn}`}
                style={{ paddingLeft: `${10 + depth * 14}px` }}
                draggable={!node.deleted} onDragStart={handleDragStart} onDrop={handleDrop} onDragOver={handleDragOver}
            >
                <button className={btnIconCn} onClick={() => toggle(id)} title={isOpen ? "Yopish" : "Ochish"} disabled={!!node.deleted}>
                    {hasKids ? <Caret open={isOpen} /> : <span className="opacity-25">•</span>}
                </button>
                {!editing ? (
                    <button className="bg-transparent border-none cursor-pointer text-left flex-grow" onClick={() => onSelect?.(node)} title={node.path} disabled={!!node.deleted}>
                        <span className={`${tagCn} ${inactiveCn} ${deletedTextCn}`}>{node.code}</span>
                        <strong className={`font-semibold ml-1 ${inactiveCn} ${deletedTextCn}`}>{node.name}</strong>
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
                    <button className={`${btnIconCn} hover:bg-red-100`} title="O'chirish" onClick={() => setConfirmingDelete(v => !v)}>🗑️</button>
                    <button className={btnIconCn} title={node.isActive ? "Deaktivatsiya qilish" : "Aktivlashtirish"} onClick={() => onRename?.(id, { isActive: !node.isActive })} disabled={!!node.deleted}>👁️</button>
                    <button className={btnIconCn} title="Nomini o'zgartirish" onClick={() => { setEditing(true); setEditName(node.name); }} disabled={!!node.deleted}>✎</button>
                    <button className={btnIconCn} title="Yangi qo'shish" onClick={() => setAdding((v) => !v)} disabled={!!node.deleted}>＋</button>
                </div>
            </div>

            {adding && (
                <div className="flex items-center gap-2 my-0.5 rounded-md bg-slate-50" style={{ paddingLeft: `${10 + (depth + 1) * 14}px`, paddingBlock: '6px', paddingRight: '6px' }}>
                    <form onSubmit={async (e) => { e.preventDefault(); await onCreate?.(id, { code: newCode.trim(), name: newName.trim(), isActive: newIsActive }); setNewCode(""); setNewName(""); setAdding(false); setNewIsActive(true); }} className="flex gap-1.5 items-center w-full">
                        <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="Kod" className={`${baseInputCn} p-1 w-28`} required />
                        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom" className={`${baseInputCn} p-1 flex-grow`} required />
                        <label className="flex items-center gap-1.5 text-sm cursor-pointer"><input type="checkbox" checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} className="rounded" />Aktiv</label>
                        <button type="submit" className={btnIconCn} title="Saqlash">✔</button>
                        <button type="button" className={btnIconCn} onClick={() => setAdding(false)} title="Bekor qilish">✖</button>
                    </form>
                </div>
            )}

            {confirmingDelete && (
                <div className="flex items-center justify-end gap-2 my-0.5 rounded-md bg-red-50 border border-red-200 text-xs p-2" style={{ marginLeft: `${10 + (depth + 1) * 14}px` }}>
                    <span className="mr-auto font-medium">Haqiqatan ham o'chirilsinmi?</span>
                    <button onClick={() => { onSoftDelete?.(id); setConfirmingDelete(false); }} className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500">Vaqtincha</button>
                    <button onClick={() => { onPermanentDelete?.(id); setConfirmingDelete(false); }} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Butunlay</button>
                    <button onClick={() => setConfirmingDelete(false)} className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300">Bekor qilish</button>
                </div>
            )}

            {isOpen && visibleKids.map((cid) => (
                <TreeNode key={cid} id={cid} depth={depth + 1} tree={tree} selectedId={selectedId} showInactive={showInactive} showDeleted={showDeleted} onSelect={onSelect} onDropMove={onDropMove} onCreate={onCreate} onRename={onRename} onSoftDelete={onSoftDelete} onPermanentDelete={onPermanentDelete} />
            ))}
        </div>
    );
}

// =================================================================================
// Debounce Hook
// =================================================================================

function useDebouncedValue<T>(value: T, delay = 350) {
    const [v, setV] = React.useState<T>(value);
    React.useEffect(() => {
        const t = setTimeout(() => setV(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return v;
}

// =================================================================================
// Asosiy Komponent (OrgTree)
// =================================================================================

type OrgTreeProps = {
    baseUrl?: string;
    getAuth?: () => string | null;
    withCredentials?: boolean;
};

export default function OrgTree({ baseUrl = "/api/v1/org", getAuth = () => localStorage.getItem("token"), withCredentials = false }: OrgTreeProps) {
    const [showInactive, setShowInactive] = React.useState(true);
    const [showDeleted, setShowDeleted] = React.useState(false);

    const api = React.useMemo(() => makeApi({ baseUrl, getAuth, withCredentials }), [baseUrl, getAuth, withCredentials]);
    const tree = useOrgTreeData(api, showDeleted);
    const { state, actions } = tree;
    const { ensureRoot, loadChildren } = actions;
    const { setChildren } = actions;

    // Stable refs for effect usage to avoid deps loops
    const ensureRootRef = React.useRef(ensureRoot);
    const loadChildrenRef = React.useRef(loadChildren);
    React.useEffect(() => { ensureRootRef.current = ensureRoot; }, [ensureRoot]);
    React.useEffect(() => { loadChildrenRef.current = loadChildren; }, [loadChildren]);

    const [selected, setSelected] = React.useState<OrgNode | null>(null);
    const [q, setQ] = React.useState("");
    const dq = useDebouncedValue(q);
    const [hits, setHits] = React.useState<OrgNode[]>([]);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");

    React.useEffect(() => {
        ensureRootRef.current()
            .then((root) => loadChildrenRef.current(root.id))
            .catch((e: unknown) => setError((e as Error).message));
    }, []);

    const isInitialMount = React.useRef(true);
    React.useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            setChildren(new Map());
            ensureRootRef.current().then(root => loadChildrenRef.current(root.id));
        }
    }, [showDeleted]);

    React.useEffect(() => {
        let cancel = false;
        (async () => {
            if (!dq) { setHits([]); return; }
            setBusy(true);
            try {
                const res = await api<OrgNode[]>(`/search?q=${encodeURIComponent(String(dq))}&limit=20`);
                if (!cancel) setHits(res);
            } catch (e) {
                if (!cancel) setError((e as Error).message);
            } finally {
                if (!cancel) setBusy(false);
            }
        })();
        return () => { cancel = true; };
    }, [dq, api]);

    const jumpTo = async (id: number) => {
        try {
            setBusy(true);
            const anc = await api<OrgNode[]>(`/${id}/ancestors`);
            await actions.expandPath(anc.map((a) => a.id));
            const node = state.nodes.get(id) || await api<OrgNode>(`/${id}`);
            if (!state.nodes.has(id)) actions.setNode(node);
            setSelected(node);
            setQ("");
        } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
    };

    const handleAction = async <T,>(action: () => Promise<T>): Promise<T> => {
        setError("");
        try {
            setBusy(true);
            return await action();
        } catch (e) {
            setError((e as Error).message);
            throw e;
        } finally {
            setBusy(false);
        }
    };

    const handleMove = (dragId: number, dropId: number) => handleAction(async () => {
        const fresh = await actions.move(dragId, dropId);
        await actions.loadChildren(dropId);
        actions.setExpanded((s: Set<number>) => new Set(s).add(dropId));
        setSelected(fresh);
    });

    const handleCreate = (parentId: number, payload: { code: string; name: string; isActive: boolean; sortOrder?: number | null }) => handleAction(async () => {
        const res = await actions.createChild(parentId, payload);
        actions.setNode(res);
        actions.setChildren((cm: Map<number, number[]>) => {
            const ncm = new Map(cm);
            ncm.set(parentId, [...(cm.get(parentId) || []), res.id]);
            return ncm;
        });
        const parent = state.nodes.get(parentId);
        if (parent && !parent.hasChildren) actions.setNode({ ...parent, hasChildren: true });
        actions.setExpanded((s: Set<number>) => new Set(s).add(parentId));
        return res;
    });

    const handleRename = (id: number, payload: Partial<Pick<OrgNode, "name" | "code" | "sortOrder" | "isActive">>) => handleAction(async () => {
        const res = await actions.rename(id, payload);
        setSelected(res);
        return res;
    });

    const handleSoftDelete = (id: number) => handleAction(async () => {
        await actions.softDelete(id);

        // YECHIM: Agar tanlangan tugun o'chirilgan bo'lsa, uni `selected` state'da ham yangilaymiz
        if (selected?.id === id) {
            setSelected(node => node ? { ...node, deleted: true } : null);
        }
    });

    const handlePermanentDelete = (id: number) => {
        if (!window.confirm("DIQQAT! Bu tugun va uning BARCHA bolalari butunlay o'chib ketadi. Davom etasizmi?")) return;
        handleAction(() => actions.permanentDelete(id));
    };

    const root = state.rootId ? state.nodes.get(state.rootId) : null;
    const baseCardCn = "border border-gray-200 rounded-lg bg-white p-3";
    const tagPillCn = "text-xs bg-gray-100 px-1.5 py-0.5 rounded-md";
    const textBtnCn = "px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs cursor-pointer hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div className="grid grid-cols-[1fr_320px] gap-4 p-4 font-sans">
            <div className="left-pane flex flex-col gap-2">
                <div className={baseCardCn}>
                    <div className="flex items-center gap-2">
                        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Qidiruv: code yoki nom" className="w-full border border-gray-200 rounded-md px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {busy && <Spinner />}
                    </div>
                </div>

                {q && (
                    <div className={baseCardCn}>
                        <div className="text-xs text-gray-500 mb-1.5">Natijalar</div>
                        <ul className="max-h-60 overflow-auto -mx-3 -my-1 list-none">
                            {hits.map((h) => (
                                <li key={h.id} className="border-t border-gray-100">
                                    <button onClick={() => jumpTo(h.id)} className="bg-transparent border-none cursor-pointer text-left w-full px-3 py-1.5 hover:bg-gray-50">
                                        <span className={tagPillCn}>{h.code}</span> {h.name}
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
                            <button onClick={() => setShowDeleted(v => !v)} className={textBtnCn} disabled={busy}>{showDeleted ? "O'chirilganlarni yashirish" : "O'chirilganlarni ko'rsatish"}</button>
                            <button onClick={() => setShowInactive(v => !v)} className={textBtnCn} disabled={busy}>{showInactive ? 'Noaktivlarni yashirish' : 'Noaktivlarni ko\'rsatish'}</button>
                            <button onClick={() => handleAction(actions.expandAll)} className={textBtnCn} disabled={busy}>Barchasini ochish</button>
                            <button onClick={actions.collapseAll} className={textBtnCn} disabled={busy}>Barchasini yopish</button>
                        </div>
                    </div>
                    {error && <div className="text-red-600 text-xs mt-1 text-right">{error}</div>}

                    {!root ? <div className="text-xs text-gray-500">Root yuklanmoqda...</div> : (
                        <TreeNode
                            id={root.id}
                            depth={0}
                            tree={tree}
                            selectedId={selected?.id ?? null}
                            showInactive={showInactive}
                            showDeleted={showDeleted}
                            onSelect={setSelected}
                            onDropMove={handleMove}
                            onCreate={handleCreate}
                            onRename={handleRename}
                            onSoftDelete={handleSoftDelete}
                            onPermanentDelete={handlePermanentDelete}
                        />
                    )}
                    <div className="text-xs text-gray-500 mt-2">Drag & drop: tugunni boshqa tugun ustiga tashlab re-parent qiling.</div>
                </div>
            </div>

            <aside className="right-pane flex flex-col gap-2">
                <div className={baseCardCn}>
                    <div className="font-semibold text-gray-800 mb-2">Tanlangan tugun</div>
                    {!selected ? <div className="text-xs text-gray-500">Hali tanlanmagan</div> : (
                        <dl className="text-sm grid grid-cols-[80px_1fr] gap-y-1.5 items-center">
                            <dt className="text-gray-500 font-medium">ID</dt><dd className="text-gray-800">{selected.id}</dd>
                            <dt className="text-gray-500 font-medium">Code</dt><dd className="text-gray-800">{selected.code}</dd>
                            <dt className="text-gray-500 font-medium">Name</dt><dd className="text-gray-800">{selected.name}</dd>
                            <dt className="text-gray-500 font-medium">Level</dt><dd className="text-gray-800">{selected.level}</dd>
                            <dt className="text-gray-500 font-medium">Status</dt><dd className="text-gray-800">{selected.isActive ? 'Aktiv' : 'Noaktiv'}</dd>
                            <dt className="text-gray-500 font-medium">O'chirilgan</dt><dd className="text-gray-800">{selected.deleted ? 'Ha' : 'Yo\'q'}</dd>
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
                        <li>Drag & drop bilan tugunni yangi parent ustiga tashlang.</li>
                        <li>Tugmalar: 🗑️ (O'chirish), 👁️ (Aktiv/Noaktiv), ✎ (Tahrirlash), ＋ (Yangi qo'shish).</li>
                    </ul>
                </div>
            </aside>
        </div>
    );
}