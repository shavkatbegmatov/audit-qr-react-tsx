// src/components/table/EditModal.tsx
import type { Column } from './useTable';
import ConfirmModal from '@/components/layout/ConfirmModal';
import Button from '@/components/ui/Button';
import { useEditModal } from '@/hooks/useEditModal';
import DynamicForm from './DynamicForm'; // Yangi komponentni import qilish

interface EditModalProps<T extends { id: number }> {
    visible: boolean;
    item: Partial<T> | null;
    onSubmit: (updatedItem: Partial<T>) => Promise<void>;
    onClose: () => void;
    columns: Column<T>[];
    parentApiUrl?: string;
    grandParentApiUrl?: string;
}

export default function EditModal<T extends { id: number; parentId?: number | null }>({
                                                                                          visible, item, onSubmit, onClose, columns, parentApiUrl, grandParentApiUrl
                                                                                      }: EditModalProps<T>) {

    const {
        formData, isSubmitting, errorMessage, showConfirmClose,
        handleChange, handleSubmit, handleClose, confirmClose, cancelClose,
    } = useEditModal({ visible, item, onSubmit, onClose });

    if (!visible || !item) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden border">
                <header className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Elementni Tahrirlash</h2>
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
                            isEditMode={true}
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
                            Saqlash
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
                message="O'zgarishlar saqlanmadi. Oynani yopmoqchimisiz?"
            />
        </div>
    );
}