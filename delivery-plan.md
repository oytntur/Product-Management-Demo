# Tamamlama Planı (Son Tarih: 25 Eylül Perşembe, 12:00 GMT+03)

## Mevcut Açıklar

- `src/app/app.routes.ts:1` yalnızca bağımsız bileşenleri tembel yüklemeye devam ediyor; en az iki özellik modülü (ör. Auth + Admin) oluşturma şartı henüz karşılanmadı.
- `OnPush` değişiklik algılama stratejisi bileşenlerin geneline uygulanmadı (ör. `src/app/pages/admin/product-list/product-list.component.ts`, `src/app/pages/auth/login/login.component.ts`).
- Kimlik doğrulama akışı eksik: JWT simülasyonu yok, sinyal tabanlı kullanıcı deposu bulunmuyor, navbar oturum açan kullanıcıyı reaktif göstermiyor (`src/app/helpers/services/auth.service.ts`, `src/app/components/navbar/navbar.component.ts`).
- Yönetim iş akışları tamamlanmadı: kontrol paneli şablon halinde, ürün oluşturma/güncelleme formları siparişleri kalıcı hale getirmiyor, gezinme butonları ilgili sayfalara yönlendirmiyor (`src/app/pages/admin/home/home.component.ts`, `src/app/pages/admin/product-add/product-edit.component.ts`).
- Teknik cilalar eksik: interceptor 500 hatalarını arayüze yansıtmıyor, prod derlemesi doğrulanmadı, GitHub uzaktan deposu yok.

## Çarşamba (24 Eylül)

- **09:00–11:00** – `AuthModule` ve `AdminModule` yapılandırmasını kur, mevcut bağımsız bileşenleri içeri al, sağlayıcı ve yönlendirmeleri düzenle.
- **11:00–14:00** – Her yerde `OnPush` etkinleştir; abonelikleri sinyaller/async pipe ile reaktif tutacak şekilde elden geçir.
- **14:00–16:00** – Kimlik doğrulama simülasyonunu uygula (mock backend veya Northwind), sahte JWT döndür, kalıcı sinyal deposu ekle.
- **16:00–18:00** – Auth deneyimini tamamla: navbar kullanıcı gösterimi, guard/yönlendirmeler, 500 hataları için interceptor üzerinden bildirim, 401 yönlendirme döngüsünü sabitle.
- **18:00–20:00** – Yönetim kontrol panelini KPI’lar ve hızlı bağlantılarla doldur, ürün/sipariş formları için tipli eşleştiriciler hazırla.

## Perşembe (25 Eylül)

- **08:30–10:00** – Ürün oluştur/güncelle ekranını bitir: düzenleyiciyi yeniden kullan, `ProductService` ile create/update bağlantısını kur, sipariş FormArray CRUD işlemlerini tek gönderimle tamamla.
- **10:00–11:00** – Yönetim gezinmesini sıkılaştır: liste/detay butonlarını ekleme/düzenleme rotalarına bağla, iptal/geri akışlarını doğrula, navbar seçim kutusunun düzenleme görünümünde çalıştığını kontrol et.
- **11:00–11:30** – `ng build --configuration production` çalıştır, derleme/lint sorunlarını gider, mümkünse auth servisi için hızlı testler ekle.
- **11:30–12:00** – Son rötuş: `README`yi güncelle, `interview_project_todo.md`yi güncele, GitHub deposunu başlatıp push et, devir notlarını hazırla.

## Riskler ve Önlemler

- Mock auth beklentileri değişebilir; API sözleşmesini erken doğrula ve yedek JSON mock hazır tut.
- `OnPush`e geçiş eski veri bağlarını ortaya çıkarabilir; değişiklik algılama sapmalarını düzeltmek için zaman bırak.
- DevExtreme grid güncellemeleri dönüştürücü mantık gerektirebilir; API şeması farklıysa ek süre ayır.
- Northwind hizmeti kesintili olabilir; engelleri aşmak için örnek verileri yerelde önbellekle.

## Son Kontroller

- `ng test` çalıştır ve push öncesi giriş/ürün akışlarını manuel test et.
- Zaman kalırsa artı değer için opsiyonel bir özellik (ör. duyarlı yan menü) eklemeyi düşün.
