import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
    const token = cookies.get('jwt');
    
    if (!token) {
        return json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    return json({ token });
} 