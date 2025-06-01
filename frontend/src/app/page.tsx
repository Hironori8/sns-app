import { redirect } from 'next/navigation';

// ルートパスはメインタイムラインにリダイレクト
export default function Home() {
  redirect('/main');
}
