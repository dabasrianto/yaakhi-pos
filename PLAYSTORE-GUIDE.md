# Panduan Upload ke Google Play Store

PWA ini telah dioptimasi untuk di-upload ke Google Play Store menggunakan **Trusted Web Activity (TWA)**.

## Requirements yang Sudah Dipenuhi

✅ **Manifest.json** - Lengkap dengan semua field yang diperlukan
✅ **Service Worker** - Implementasi offline-first dengan caching strategy
✅ **Icons** - SVG icon yang scalable untuk semua ukuran
✅ **Meta Tags** - SEO dan PWA meta tags lengkap
✅ **HTTPS** - Diperlukan saat hosting (gunakan Firebase Hosting atau Vercel)
✅ **Responsive Design** - Mobile-first design

## Langkah-langkah Upload ke Play Store

### 1. Buat Icon PNG (Wajib untuk Play Store)

Anda perlu mengkonversi `icon.svg` menjadi PNG dengan ukuran:
- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

Tools yang bisa digunakan:
- https://svgtopng.com/
- https://cloudconvert.com/svg-to-png
- Adobe Illustrator / Figma

Simpan semua file PNG di folder `public/` dengan nama:
- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- dst...

### 2. Screenshot untuk Play Store

Buat screenshot aplikasi dengan ukuran:

**Mobile (Wajib - minimal 2 screenshots):**
- Size: 1080x1920 atau 1440x2560 (portrait)
- Format: PNG atau JPG
- Simpan di `public/screenshots/`

**Desktop/Tablet (Opsional):**
- Size: 1920x1080 atau 2560x1440 (landscape)
- Format: PNG atau JPG

Tips untuk screenshot:
1. Jalankan app di browser
2. Buka Developer Tools (F12)
3. Aktifkan Device Mode (Ctrl+Shift+M)
4. Pilih device (contoh: Pixel 5)
5. Screenshot halaman-halaman penting:
   - Dashboard
   - POS/Kasir
   - Inventory
   - Reports
   - Settings

### 3. Host PWA di Server dengan HTTPS

Upload build hasil ke hosting yang support HTTPS:

**Opsi 1: Firebase Hosting (Recommended)**
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

**Opsi 2: Vercel**
```bash
npm install -g vercel
vercel login
vercel --prod
```

**Opsi 3: Netlify**
- Drag and drop folder `dist/` ke https://app.netlify.com/drop

### 4. Update Digital Asset Links

Setelah mendapatkan package name dari Google Play Console:

1. Buka `public/.well-known/assetlinks.json`
2. Ganti `com.poskeren.app` dengan package name Anda
3. Ganti `REPLACE_WITH_YOUR_APP_SHA256_FINGERPRINT` dengan SHA256 fingerprint dari keystore Anda

Cara mendapatkan SHA256:
```bash
keytool -list -v -keystore your-keystore.jks
```

### 5. Buat Android App menggunakan Bubblewrap

Install Bubblewrap:
```bash
npm install -g @bubblewrap/cli
```

Initialize project:
```bash
bubblewrap init --manifest https://your-domain.com/manifest.json
```

Build APK/AAB:
```bash
bubblewrap build
```

### 6. Upload ke Google Play Console

1. Buka https://play.google.com/console
2. Buat aplikasi baru
3. Upload AAB file yang dihasilkan Bubblewrap
4. Lengkapi semua informasi:
   - App name: POS Keren
   - Short description: (maks 80 karakter)
   - Full description: (maks 4000 karakter)
   - Screenshots: Upload yang sudah dibuat
   - Feature graphic: 1024x500 px
   - App icon: 512x512 px
   - Category: Business / Productivity
   - Content rating: Rate aplikasi
   - Privacy policy: URL privacy policy
   - Target audience: 18+ atau sesuai

## Alternatif: Menggunakan PWA Builder

Cara lebih mudah tanpa coding:

1. Buka https://www.pwabuilder.com/
2. Masukkan URL PWA Anda
3. Klik "Build My PWA"
4. Pilih "Android" sebagai target
5. Konfigurasi settings:
   - Package ID: com.poskeren.app
   - App name: POS Keren
   - Display mode: Standalone
   - Orientation: Portrait
6. Download package
7. Upload ke Play Store

## Checklist Sebelum Submit

- [ ] PWA sudah di-host dengan HTTPS
- [ ] Manifest.json valid (test di https://manifest-validator.appspot.com/)
- [ ] Service Worker berjalan dengan baik
- [ ] Icon PNG semua ukuran sudah dibuat
- [ ] Screenshots minimal 2 untuk mobile
- [ ] Feature graphic 1024x500 sudah dibuat
- [ ] Privacy policy URL tersedia
- [ ] Digital Asset Links sudah dikonfigurasi
- [ ] App tested di berbagai device
- [ ] Content rating completed

## Testing PWA

Sebelum upload, test PWA dengan:

**Lighthouse (Chrome DevTools):**
1. Buka app di Chrome
2. F12 → Lighthouse tab
3. Run audit untuk PWA
4. Target score: 90+

**PWA Requirements:**
- ✅ Installable
- ✅ Works offline
- ✅ Fast load time
- ✅ Mobile friendly
- ✅ HTTPS

## Resources

- **Google Play Console**: https://play.google.com/console
- **PWA Builder**: https://www.pwabuilder.com/
- **Bubblewrap**: https://github.com/GoogleChromeLabs/bubblewrap
- **TWA Documentation**: https://developers.google.com/web/android/trusted-web-activity
- **Manifest Generator**: https://app-manifest.firebaseapp.com/
- **Icon Generator**: https://favicon.io/favicon-converter/

## Support

Jika ada pertanyaan atau masalah, silakan buka issue di repository ini.
