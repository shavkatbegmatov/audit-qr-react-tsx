import OrgTree from '@/components/OrgTree';
import { STORAGE_KEYS } from '@/utils/constants';

export default function OrgStructurePage() {
    return (
        <OrgTree
            baseUrl={`${import.meta.env.VITE_API_URL}/org`}
            getAuth={() => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || ''}
            withCredentials={true}
        />
    );
}
