export const metadata = {
  title: "About | Cuddy Pro",
  description: "Cuddy Pro loyihasi haqida."
};

export default function AboutPage() {
  const stats = [
    { value: "9+", label: "tayyor funksiya" },
    { value: "3x", label: "har bir tool uchun free limit" },
    { value: "24/7", label: "tezkor foydalanish" }
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[38px] border border-black/10 bg-white/88 shadow-soft backdrop-blur">
        <section className="bg-[radial-gradient(circle_at_18%_20%,rgba(182,255,0,0.42),transparent_30%),linear-gradient(135deg,#ffffff_0%,#f7ffdb_48%,#eef5ff_100%)] p-6 sm:p-10">
          <span className="text-xs font-black uppercase text-ink/45">About Cuddy Pro</span>
          <h1 className="mt-2 max-w-3xl text-3xl font-black leading-tight text-ink sm:text-5xl">
            Dizayner va dasturchilar uchun bitta tartibli toolbox.
          </h1>
          <p className="mt-5 max-w-3xl leading-7 text-ink/72">
            Cuddy Pro kundalik ishda kerak bo'ladigan kod, rasm, data va tekshiruv
            vositalarini bitta joyga jamlaydi. Maqsad: foydalanuvchi bitta paneldan kerakli
            ishini tez va chiroyli yakunlashi.
          </p>
        </section>

        <section className="grid gap-3 border-y border-black/10 bg-ink p-4 sm:grid-cols-3 sm:p-5">
          {stats.map((item) => (
            <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/8 p-5 text-white">
              <strong className="block text-3xl font-black text-mint">{item.value}</strong>
              <span className="mt-2 block text-sm text-white/72">{item.label}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-5 p-6 sm:p-10 lg:grid-cols-2">
          <div className="rounded-[28px] bg-panel p-5">
            <h2 className="text-xl font-black text-ink">Nima uchun kerak?</h2>
            <p className="mt-3 leading-7 text-ink/72">
              Kod skrinshoti, QR generator, JSON formatter, encoder-decoder, hash generator,
              image compressor va aqlli qayta ishlash funksiyalari bir joyda tartiblangan.
            </p>
          </div>
          <div className="rounded-[28px] bg-[#f7ffdb] p-5">
            <h2 className="text-xl font-black text-ink">Qanday ishlaydi?</h2>
            <p className="mt-3 leading-7 text-ink/72">
              Tezkor funksiyalar browser ichida bajariladi, og'irroq qayta ishlashlar esa
              xavfsiz server qatlami orqali boshqariladi. Public UI’da texnik provider tafsilotlari
              chiqarilmaydi.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
