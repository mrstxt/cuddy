export const metadata = {
  title: "Privacy Policy | Cuddy Pro",
  description: "Fayllar va server so'rovlar bilan ishlash siyosati."
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-lg border-2 border-ink bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-black text-ink">Privacy Policy</h1>
        <div className="mt-5 grid gap-5 text-ink/72">
          <section>
            <h2 className="text-lg font-black text-ink">Frontend-only vositalar</h2>
            <p className="mt-2 leading-7">
              QR, JSON, Base64, hash, kod skrinshoti va rasm qayta ishlash kabi vositalar
              foydalanuvchi brauzerida bajariladi. Bu fayllar doimiy server xotirasiga saqlanmaydi.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Serverda bajariladigan vazifalar</h2>
            <p className="mt-2 leading-7">
              Background Remover, Photo Enhancer va Code Translator kabi og'ir vazifalar xavfsiz
              backend orqali qayta ishlanishi mumkin. Maxfiy kalitlar hech qachon frontendga chiqarilmaydi.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-ink">Fayl limitlari</h2>
            <p className="mt-2 leading-7">
              MVP bosqichida katta fayllar brauzer xotirasi bilan cheklanadi. Production relizda
              maksimal hajm, format tekshiruvi va rate limiting qat'iy qo'shilishi kerak.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
