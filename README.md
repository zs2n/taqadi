# تقاضي الأخوياء — نسخة تطبيق الأندرويد

من إنشاء استوديو قرطاس.

## وش في المجلد

| المجلد | وش فيه |
|---|---|
| `docs/` | اللعبة كاملة كموقع قابل للتثبيت (PWA): الصفحة، صفحة سياسة الخصوصية، الأيقونات، ملف التطبيق، وملف التشغيل بدون نت |
| `worker/` | خادم القاضي على Cloudflare: يحفظ مفتاح Claude بأمان ويكلّمه، ويحدد عدد القضايا اليومي، ويستقبل البلاغات |
| `android/` | قالب ملف `assetlinks.json` اللي يربط التطبيق بالموقع |
| `store/` | أيقونة المتجر ٥١٢، صورة الواجهة ١٠٢٤×٥٠٠، لقطات شاشة، ونص صفحة المتجر |

## كيف يشتغل

```
جوال اللاعب (تطبيق أندرويد = يفتح موقع اللعبة)
        │  نص القضية
        ▼
خادم القاضي (Cloudflare Worker)  ← المفتاح السري هنا بس
        │
        ▼
Claude API  →  التعليق / السؤال / صك الحكم
```

التطبيق نفسه ما فيه أي مفتاح. لو أحد فك التطبيق ما يلقى شي.

---

## الخطوة ١: مفتاح Claude API

1. ادخل [console.anthropic.com](https://console.anthropic.com) وسوّ حساب.
2. من **Billing** اشحن رصيد، وحط **حد شهري للصرف** (مثلًا ٢٠ دولار) عشان ما تتفاجأ.
3. من **API Keys** سوّ مفتاح جديد وانسخه. لا ترسله لأحد ولا تحطه في GitHub.

> الحكم يستخدم `claude-sonnet-5-5` والتعليقات تستخدم `claude-haiku-5-5` لأنه أسرع وأرخص. تقدر تغيّرهم من أعلى ملف `worker/worker.js`.

## الخطوة ٢: خادم القاضي (Cloudflare) — من المتصفح بدون أوامر

1. سوّ حساب مجاني في [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages** ← **Create** ← **Create Worker** ← سمّه `taqadi-judge` ← **Deploy**.
3. اضغط **Edit code**، امسح الكود الموجود، والصق محتوى `worker/worker.js` كامل، ثم **Deploy**.
4. **مخزن الحد اليومي والبلاغات:**
   - من القائمة: **Storage & Databases** ← **KV** ← **Create** ← سمّه `taqadi-rl`.
   - ارجع للـ Worker ← **Settings** ← **Bindings** ← **Add** ← **KV namespace** ← اسم المتغير `RL` واختر `taqadi-rl`.
5. **الأسرار:** في الـ Worker ← **Settings** ← **Variables and Secrets** ← **Add**، واختر النوع **Secret** لكل واحد:
   - `ANTHROPIC_API_KEY` = المفتاح من الخطوة ١
   - `SALT` = أي كلام عشوائي طويل
   - `ADMIN_KEY` = كلمة سر تقرأ فيها البلاغات
6. انسخ رابط الخادم، شكله: `https://taqadi-judge.اسمك.workers.dev`

<details>
<summary>نفس الخطوة بالأوامر (لو تفضّل الطرفية)</summary>

```bash
cd worker
npx wrangler login
npx wrangler kv namespace create RL      # انسخ الـ id في wrangler.toml
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put SALT
npx wrangler secret put ADMIN_KEY
npx wrangler deploy
```
</details>

**إعدادات تقدر تغيّرها في أول `worker.js`:**
- `ALLOWED_ORIGINS`: الموقع المسموح له يكلّم الخادم. مضبوط على `https://zs2n.github.io`.
- `DAILY_LIMIT`: عدد الطلبات لكل جهاز يوميًا (٦٠). القضية الواحدة تاخذ تقريبًا ٣ إلى ٥ طلبات.

## الخطوة ٣: رفع اللعبة على GitHub Pages

1. افتح `docs/index.html` وابحث عن السطر:
   ```js
   const API_URL = "https://taqadi-judge.YOUR-SUBDOMAIN.workers.dev";
   ```
   وحط رابط الخادم حقك (بدون `/` في النهاية).
2. افتح `docs/privacy.html` وغيّر `YOUR_EMAIL@example.com` لإيميل تواصل. قوقل تطلبه.
3. ارفع التعديل على مستودع `taqadi`.
4. **Settings** ← **Pages** ← **Deploy from a branch** ← `main` / `/docs` ← **Save**.
5. بعد دقيقة افتح `https://zs2n.github.io/taqadi/` وجرّب قضية كاملة. من جوالك تقدر تضيفها للشاشة الرئيسية وتشتغل كتطبيق.

## الخطوة ٤: ملف ربط التطبيق بالموقع

عشان التطبيق يفتح بدون شريط عنوان المتصفح، لازم الموقع "يعترف" بالتطبيق:

1. ملف الربط لازم يكون في جذر الدومين: `https://zs2n.github.io/.well-known/assetlinks.json`
2. هذا يعني مستودع اسمه بالضبط `zs2n.github.io`. إذا عندك واحد استخدمه، وإذا لا سوّه.
3. ارفع فيه:
   - ملف فاضي اسمه `.nojekyll` في الجذر (بدونه GitHub يتجاهل المجلدات اللي تبدأ بنقطة)
   - `android/assetlinks.json` داخل مجلد اسمه `.well-known`
4. البصمات (`PASTE_...`) تعبّيها في الخطوة ٥ و٦.

## الخطوة ٥: بناء ملف التطبيق بـ Bubblewrap (على جهازك)

1. ثبّت [Node.js](https://nodejs.org) نسخة LTS.
2. افتح الطرفية:
   ```bash
   npm i -g @bubblewrap/cli
   mkdir taqadi-android && cd taqadi-android
   bubblewrap init --manifest https://zs2n.github.io/taqadi/manifest.webmanifest
   ```
3. أول مرة بيسألك يثبّت JDK و Android SDK، قل نعم.
4. بيسألك أسئلة، أغلبها جاهزة من ملف اللعبة. المهم:
   - **Application ID / Package:** `com.qirtas.taqadi` (لازم نفس اللي في `assetlinks.json`)
   - **Display mode:** standalone · **Orientation:** portrait
   - **Signing key:** خله يسوي مفتاح جديد.
5. ⚠️ **احفظ ملف `android.keystore` وكلمات السر في مكان آمن ومع نسخة احتياطية.** إذا ضاع ما تقدر تحدّث التطبيق أبد.
6. ابنِ التطبيق:
   ```bash
   bubblewrap build
   ```
   يطلع لك:
   - `app-release-bundle.aab` ← هذا اللي ترفعه لقوقل بلاي
   - `app-release-signed.apk` ← تثبّته على جوالك للتجربة
7. خذ بصمة مفتاحك:
   ```bash
   bubblewrap fingerprint list
   ```
   (أو `keytool -list -v -keystore android.keystore` وانسخ سطر SHA256). حطها مكان `PASTE_UPLOAD_KEY_SHA256` في `assetlinks.json` وارفع الملف.

## الخطوة ٦: Google Play Console

1. سجّل في [play.google.com/console](https://play.google.com/console) كحساب **شخصي**، وادفع رسوم التسجيل (مرة وحدة) وأكمل توثيق الهوية.
2. **Create app:** الاسم `تقاضي الأخوياء`، اللغة الافتراضية العربية، **Game**، **Free**.
3. **App integrity ← App signing:** انسخ **SHA-256** حق مفتاح التوقيع حق قوقل وحطه مكان `PASTE_PLAY_APP_SIGNING_SHA256` في `assetlinks.json` وارفعه. (بدون هذي الخطوة التطبيق المنزّل من المتجر يطلع فيه شريط عنوان.)
4. **App content** (المحتوى):
   - **Privacy policy:** `https://zs2n.github.io/taqadi/privacy.html`
   - **Ads:** لا يحتوي إعلانات
   - **App access:** كل الميزات متاحة بدون تسجيل دخول
   - **Target audience:** اختر ١٣ سنة وفوق، ولا تختار فئات الأطفال (سياسات تطبيقات الأطفال أشد بكثير)
   - **Content rating:** عبّ الاستبيان بصدق (فكاهة، محتوى يكتبه المستخدم، ذكاء اصطناعي)
   - **Data safety:**
     - يجمع: **App activity ← Other user-generated content** (نص القضايا)
     - يُشارك مع طرف ثالث: نعم، مع مزوّد الذكاء الاصطناعي، والغرض **App functionality**
     - مشفّر أثناء النقل: نعم
     - المستخدم يقدر يطلب الحذف: نعم، عن طريق الإيميل في سياسة الخصوصية
   - **AI-generated content:** التطبيق فيه زر **«إبلاغ عن محتوى مسيء»** تحت الصك وتحت أسئلة القاضي، وهذا اللي تطلبه سياسة قوقل لتطبيقات الذكاء الاصطناعي.
5. **صفحة المتجر (Main store listing):** النصوص جاهزة في `store/listing-ar.txt`، والأيقونة وصورة الواجهة واللقطات في `store/`.
6. **Testing ← Closed testing:**
   - سوّ مسار، وارفع `app-release-bundle.aab`.
   - أضف **١٢ مختبِر على الأقل** بإيميلاتهم (أو مجموعة Google Group).
   - أرسل لهم رابط الاشتراك، ولازم يظلون مشتركين **١٤ يوم متواصلة**. هذا شرط قوقل للحسابات الشخصية الجديدة.
7. بعد ١٤ يوم: **Dashboard ← Apply for production** وجاوب الأسئلة عن الاختبار، وبعد الموافقة انشره للعامة.

---

## بعد النشر

- **تحديث اللعبة:** أي تعديل في ملفات `docs/` ترفعه على GitHub يوصل للتطبيق تلقائيًا بدون نسخة جديدة في المتجر. بس غيّر `VERSION` في `docs/sw.js` (مثلًا `taqadi-v2`) عشان الجوالات تاخذ النسخة الجديدة.
- **قراءة البلاغات:** افتح `https://taqadi-judge.اسمك.workers.dev/reports?key=ADMIN_KEY`
- **مراقبة التكلفة:** من console.anthropic.com ← Usage. إذا زادت، نزّل `DAILY_LIMIT` أو حوّل الحكم لـ `claude-haiku-5-5`.
- **السجلات:** Cloudflare ← الـ Worker ← **Logs** تشوف فيها الأخطاء والبلاغات لحظيًا.
