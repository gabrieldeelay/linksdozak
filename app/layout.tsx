import type { Metadata } from 'next';
export const metadata:Metadata={title:'Giovani Brandi — Links',description:'Todos os canais em um lugar só. Análises, lives e comunidade.',icons:{icon:'/assets/favicon-32.png'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>;}
