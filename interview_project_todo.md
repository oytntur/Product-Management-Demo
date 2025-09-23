# 🚀 Interview Projesi ToDo List

## 🎯 1. Proje Kurulumu ve Altyapı
- [x] Angular 18 proje oluştur (`ng new`).  [completion:: 2025-09-23]
- [x] ZoneJS desteğini koru (zoneless **olmayacak**).  [completion:: 2025-09-23]
- [x] SCSS formatını ayarla.  [completion:: 2025-09-23]
- [x] Bootstrap 5.3 kur.  [completion:: 2025-09-23]
- [x] DevExtreme DataGrid kur.  [completion:: 2025-09-23]
- [x] RxJS ve Signal desteklerini hazırla.  [completion:: 2025-09-23]
- [x] Lazy loading için routing yapılandırması oluştur.  [completion:: 2025-09-23]
- [ ] AppModule dışında **en az iki modül** aç (ör. `auth`, `admin`).
- [x] Injection token için temel örnek hazırla (ör. API URL config).  [completion:: 2025-09-23]
- [ ] GitHub repo aç, projenin skeleton’unu push et.

## 🎯 2. Authentication & Public Alanı
- [x] **Login (Giriş Yap)** sayfası – Reactive Forms.  [completion:: 2025-09-23]
- [x] **Register (Kayıt Ol)** sayfası – Reactive Forms.  [completion:: 2025-09-23]
- [ ] JWT/token bazlı login simülasyonu (istersen Northwind JSON API).
- [ ] Login olduktan sonra kullanıcı bilgisini Signal ile store et.
- [x] 401 döndüğünde login’e redirect.  [completion:: 2025-09-23]
- [x] 500 döndüğünde “Bir hata oluştu” mesajı göster.  [completion:: 2025-09-23]
- [ ] Navbar’da login olan kullanıcının adı/soyadı göster (Reactive update).

## 🎯 3. Layout & Navigation
- [x] Ortak Navbar + Footer componentleri.  [completion:: 2025-09-23]
- [x] Admin panel Navbar’da sayfa başlıklarının dinamik değişmesi.  [completion:: 2025-09-23]
  - Ana Sayfa → “Ana Sayfa”
  - Ürün Detay → “Ürünler / {Ürün Adı}”
- [x] Router geçişlerinde önceki API request’leri cancel etme (RxJS `switchMap` / `takeUntil`).  [completion:: 2025-09-23]

## 🎯 4. Admin Panel Sayfaları
- [ ] **Ana Sayfa** (boş dashboard veya kısa bilgi).
- [x] **Ürün Listesi**:  [completion:: 2025-09-23]
  - DataGrid ile listeleme.
  - Satır üzerinden güncelleme veya detay sayfasına yönlendirme.
  - Kolon bazlı filtreleme.
- [x] **Ürün Detay**:  [completion:: 2025-09-23]
  - Ürüne bağlı siparişlerin listelenmesi.
  - Navbar’da ürün seçimi için **select-box (DevExtreme)**.
  - Ürün değişiminde loading gösterme.
  - Sayfadan çıkıldığında select-box’ın dinamik olarak kaldırılması.
- [ ] **Ürün Kayıt**:
  - Ürün formu.
  - Ürüne bağlı sipariş ekleme / düzenleme / silme (tek ekranda).
  - Tüm değişiklikleri **“Kaydet” butonuyla topluca** gönderme.
- [ ] **Ürün Güncelleme**:
  - Kayıt sayfası ile aynı form + mevcut veriler.
  - Siparişlerde değişiklik desteği.

## 🎯 5. Teknik Gereksinimler
- [ ] Değişiklik Algılama Stratejisi → `OnPush`.
- [x] Standalone componentler ile geliştirme.  [completion:: 2025-09-23]
- [x] ReactiveForms tüm inputlarda kullan.  [completion:: 2025-09-23]
- [ ] API çağrıları için HttpClient + Interceptor (401/500 handling).
- [x] Programmatic component yükleme (Navbar’daki select-box).  [completion:: 2025-09-23]
- [ ] Production build al, hataları düzelt (`ng build --configuration production`).
- [ ] GitHub’a final kodları push et → repo linkini paylaş.

## 🎯 6. Opsiyonel Ekstralar (Artı Puan İçin)
- [ ] Backend’i .NET ile yaz (ya da hazır Northwind API yerine).
- [ ] DevExtreme DataGrid’i server-side çalıştır.
- [ ] Responsive Sidenav ekle.
- [ ] Directive yaz (ör. loading state, error handling).
- [ ] Liste üzerinden ürün silme özelliği.
- [ ] Navbar’daki select-box’ı **dinamik module component loader** ile geliştirme.

## 🎯 7. Hedef Bazlı Timeline (Öneri)
- Gün 1–2 → Kurulum + Kimlik Doğrulama (Giriş/Kayıt)  
- Gün 3–4 → Arayüz + Yönlendirme + Interceptor  
- Gün 5–6 → Ürün Listesi + Ürün Detay  
- Gün 7–8 → Ürün Kayıt + Güncelleme + Sipariş yönetimi  
- Gün 9 → Final testler, production build, GitHub repo düzeni  
