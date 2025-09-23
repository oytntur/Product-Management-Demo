# SabahyildiziInterview1

Bu proje [Angular CLI](https://github.com/angular/angular-cli) 20.3.2 sürümü kullanılarak oluşturuldu.

## Geliştirme sunucusu

Yerel geliştirme sunucusunu başlatmak için aşağıdaki komutu çalıştırın:

```bash
ng serve
```

Sunucu ayağa kalktıktan sonra tarayıcınızda `http://localhost:4200/` adresine gidin. Kaynak dosyalarda yaptığınız değişiklikler uygulamaya otomatik olarak yansıyacaktır.

## Kod iskeleti oluşturma

Angular CLI, bileşen (component) oluşturma gibi güçlü iskelet çıkarma araçlarına sahiptir. Yeni bir bileşen oluşturmak için şu komutu kullanın:

```bash
ng generate component component-name
```

Kullanılabilir tüm şemaları (örneğin `components`, `directives` veya `pipes`) görmek için:

```bash
ng generate --help
```

## Derleme

Projeyi derlemek için:

```bash
ng build
```

Bu komut projenizi derler ve çıktı dosyalarını `dist/` klasörüne yerleştirir. Varsayılan olarak üretim derlemesi performans ve hız için optimize edilir.

## Birim testlerini çalıştırma

[BKarma](https://karma-runner.github.io) test koşucusu ile birim testlerini çalıştırmak için aşağıdaki komutu kullanın:

```bash
ng test
```

## Uçtan uca testler

Uçtan uca (e2e) testler için:

```bash
ng e2e
```

Angular CLI varsayılan olarak bir e2e test çatısı ile gelmez. İhtiyaçlarınıza uygun bir çatı seçebilirsiniz.

## Ek kaynaklar

Angular CLI kullanımı ve komut referansları hakkında daha fazla bilgi için [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) sayfasını ziyaret edin.
