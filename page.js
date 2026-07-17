import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="container">
      <h1>Dream Town RP</h1>

      {!session && (
        <>
          <p>سجّل دخولك بحساب Discord للتحقق من عضويتك في السيرفر.</p>
          <Link href="/login" className="btn">تسجيل الدخول</Link>
        </>
      )}

      {session && !session.user.verified && (
        <p style={{ color: "#e8710a" }}>
          حسابك مسجل دخول لكنك لست عضواً في سيرفر Dream Town. انضم للسيرفر أولاً ثم أعد تسجيل الدخول.
        </p>
      )}

      {session && session.user.verified && (
        <>
          <p>مرحباً {session.user.username} — تم التحقق من عضويتك ✅</p>
          <Link href="/dashboard" className="btn">عرض ترتيب العصابات</Link>
        </>
      )}
    </div>
  );
}
