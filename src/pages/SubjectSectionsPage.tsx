import OrgTree from '@/components/OrgTree';
import { STORAGE_KEYS } from '@/utils/constants';

export default function SubjectSectionsPage() {
    return (
        <OrgTree
            // Asosiy o'zgarish shu yerda: `baseUrl`'ni yangi API manziliga o'zgartiramiz
            baseUrl={`${import.meta.env.VITE_API_URL}/subject-sections`}

            // Qolgan sozlamalar o'zgarishsiz qoladi, chunki ular universal
            getAuth={() => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || ''}
            withCredentials={true}
        />
    );
}