// src/components/table/CreateModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useCreateModal } from '@/hooks/useCreateModal';
import DynamicForm from './DynamicForm'; // Yangi komponentni import qilish

interface CreateModalProps<T extends { id: number }> {
    visible: boolean;
    onSubmit: (item: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    parentApiUrl?: string;
    grandParentApiUrl?: string;
}

export default function CreateModal<T extends { id: number; parentId?: number | null }>({
                                                                                            visible, onSubmit, onClose, columns, parentApiUrl, grandParentApiUrl
                                                                                        }: CreateModalProps<T>) {

    const {
        formData, errorMessage, isSubmitting, showConfirmClose,
        handleChange, handleSubmit, handleClose, confirmClose, cancelClose,
    } = useCreateModal({ visible, onSubmit, onClose, columns });

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden border">
                <header className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Yangi Element Yaratish</h2>
                </header>

                <main className="flex-grow overflow-y-auto p-6">
                    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                        <DynamicForm
                            columns={columns}
                            formData={formData}
                            handleChange={handleChange}
                            isSubmitting={isSubmitting}
                            parentApiUrl={parentApiUrl}
                            grandParentApiUrl={grandParentApiUrl}
                            isEditMode={false}
                        />
                        {errorMessage && <p className="text-red-500 text-sm mt-4">{errorMessage}</p>}
                    </form>
                </main>

                <footer className="p-6 border-t bg-gray-50">
                    <div className="flex justify-end space-x-4">
                        <Button variant="secondary" onClick={handleClose} type="button" disabled={isSubmitting}>
                            Bekor Qilish
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} type="submit" isLoading={isSubmitting}>
                            {isSubmitting ? 'Yaratilmoqda...' : 'Yaratish'}
                        </Button>
                    </div>
                </footer>
            </div>

            <ConfirmModal
                isOpen={showConfirmClose}
                onConfirm={confirmClose}
                onCancel={cancelClose}
                isLoading={false}
                title="Yopishni Tasdiqlash"
                message="Kiritilgan ma'lumotlar saqlanmaydi. Oynani yopmoqchimisiz?"
            />
        </div>
    );
}