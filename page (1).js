"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="container">
      <h1>تسجيل الدخول</h1>
      <p>يتم التحقق تلقائياً من عضويتك في سيرفر Dream Town بعد تسجيل الدخول.</p>
      <button className="btn" onClick={() => signIn("discord", { callbackUrl: "/" })}>
        تسجيل الدخول عبر Discord
      </button>
    </div>
  );
}
