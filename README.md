# راهنمای پیاده‌سازی پرداخت درون‌برنامه‌ای مایکت در React Native (Expo و CLI)

این راهنما نحوه ادغام سرویس پرداخت درون‌برنامه‌ای مایکت در یک پروژه React Native با استفاده از Expo یا CLI را توضیح می‌دهد. کد نمونه ارائه‌شده، پیاده‌سازی یک کامپوننت تابعی برای مدیریت پرداخت‌ها با سرویس مایکت را نشان می‌دهد.

> **مهم**: این پیاده‌سازی با اپلیکیشن **Expo Go** کار نمی‌کند(دلیل مشکل بسیاری از توسعه دهندگان). برای عملکرد صحیح پلاگین پرداخت مایکت، باید اپلیکیشن را مستقیماً روی دستگاه یا شبیه‌ساز بیلد و نصب کنید(آموزش در ادامه داده میشود).

## پیش‌نیازها

1. **حساب توسعه‌دهنده مایکت**: نام پکیج اپلیکیشن خود را در پنل توسعه‌دهندگان مایکت ثبت کرده و کلید عمومی RSA را دریافت کنید. برای دریافت تست نیز میتوانید وارد پنل مایکت شوید و روی افزودن اپلیکیشن بزنید و بدون اپلود اپلیکیشن یک شناسه ایجاد کنید و سپس از قسمت محصولات درون برنامه ای شناسه ای ایحاد نمایید، در همان قسمت هم کلید عمومی RSA وجود دارد هم شناسه محصول.
2. **محیط React Native**: اطمینان حاصل کنید که یک پروژه React Native با Expo یا CLI راه‌اندازی شده است.
3. **اندروید استودیو**: برای بیلد و دیباگ کدهای نیتیو اندروید توصیه می‌شود.
4. **اپلیکیشن مایکت**: اپلیکیشن مایکت باید روی دستگاه یا شبیه‌ساز هدف نصب شده باشد.

## نصب

### مرحله ۱: نصب ماژول پرداخت مایکت

ماژول `iab-myket-reactnative` را در پروژه خود نصب کنید:

```bash
npm install iab-myket-reactnative
```

یا اگر از Yarn استفاده می‌کنید:

```bash
yarn add iab-myket-reactnative
```

پس از نصب، بررسی کنید که وابستگی به فایل `package.json` اضافه شده باشد:

```json
"dependencies": {
  "iab-myket-reactnative": "^1.0.14"
}
```

### مرحله ۲: پیکربندی تنظیمات بیلد اندروید

اگر پروژه شما پوشه `android` ندارد (معمول در پروژه‌های مدیریت‌شده توسط Expo)، آن را با دستور زیر ایجاد کنید:

```bash
npx expo eject
```

> **توجه**: اطمینان حاصل کنید که نام پکیج در فایل `android/app/src/main/AndroidManifest.xml` با نام پکیج ثبت‌شده در پنل توسعه‌دهندگان مایکت مطابقت دارد.

فایل `android/app/build.gradle` را ویرایش کرده و کد زیر را در بخش `android.defaultConfig` اضافه کنید:

```gradle
android {
    defaultConfig {
        def marketApplicationId = "ir.mservices.market"
        def marketBindAddress = "ir.mservices.market.InAppBillingService.BIND"
        manifestPlaceholders = [
            marketApplicationId: "${marketApplicationId}",
            marketBindAddress: "${marketBindAddress}",
            marketPermission: "${marketApplicationId}.BILLING"
        ]
    }
}
```

### مرحله ۳: بیلد پروژه

توصیه می‌شود که تغییرات و بیلد کدهای نیتیو را با استفاده از **Android Studio** و ابزار **Gradle** انجام دهید. پوشه `android` پروژه را در Android Studio باز کنید و بیلد نهایی را انجام دهید. این کار به شما کمک می‌کند تا در صورت بروز خطا در فرآیند بیلد، راحت‌تر آن را برطرف کنید.

> **نکته**: اگر از سایر سرویس‌های پرداخت درون‌برنامه‌ای (مانند گوگل پلی) در کنار مایکت استفاده می‌کنید، ممکن است به دلیل تداخل فایل‌های مشترک، با خطای dependency resolution مواجه شوید. برای رفع این مشکل، می‌توانید با تعریف **variant**ها در فایل `react-native.config.js`، برای هر بیلد نهایی از یک کتابخانه پرداخت استفاده کنید.

## پیاده‌سازی

### نمونه کد

کد زیر یک کامپوننت تابعی برای مدیریت پرداخت درون‌برنامه‌ای مایکت ارائه می‌دهد:

```jsx
import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import myket from 'iab-myket-reactnative';

const Pay = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [product, setProduct] = useState('');
  const [statusPay, setStatusPay] = useState(false);

  useEffect(() => {
    // اتصال به سرویس مایکت
    myket.connect('YOUR_RSA_PUBLIC_KEY')
      .then(() => setIsConnected(true))
      .catch(error => {
        console.log('Error connecting to Myket:', error);
        setIsConnected(false);
      });
  }, []);

  const handlePurchase = async () => {
    try {
      const inventory = await myket.queryPurchaseProduct(true, ['PRODUCT_ID']);
      setStatusPay(inventory.allPurchases.length > 0);

      if (inventory && inventory.allPurchases.length > 0) {
        setProduct("buyed");
        await myket.consumePurchase(inventory.allPurchases[0]);
        Alert.alert('پرداخت با موفقیت انجام شده است.');
      } else {
        const purchaseResult = await myket.purchaseProduct('PRODUCT_ID');
        if (purchaseResult.purchaseState === 0) {
          Alert.alert('خرید با موفقیت انجام شده است');
          setProduct(purchaseResult.purchase);
        }
      }
    } catch (error) {
      console.log('Error making purchase:', error);
      Alert.alert('خطا در انجام خرید', 'لطفاً مجدداً تلاش کنید');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!isConnected ? (
        <Text style={{ fontFamily: "Vazir" }}>در حال بررسی نصب بودن مایکت...</Text>
      ) : (
        <>
          {product === undefined ? (
            <Text
              style={{
                color: "white",
                textAlign: "center",
                padding: 5,
                margin: 5,
                width: "100%",
                fontFamily: "Vazir",
                fontSize: 20,
                backgroundColor: "#447"
              }}
              onPress={handlePurchase}
            >
              جهت تایید خرید اینجا را لمس کنید
            </Text>
          ) : product === "buyed" ? (
            <Text>پرداخت انجام شده است</Text>
          ) : (
            <Text
              style={{
                color: "white",
                textAlign: "center",
                padding: 5,
                margin: 5,
                width: "100%",
                fontFamily: "Vazir",
                fontSize: 20,
                backgroundColor: "#447"
              }}
              onPress={handlePurchase}
            >
              پرداخت مبلغ
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default Pay;
```

> **توجه**: در کد بالا، عبارت `YOUR_RSA_PUBLIC_KEY` را با کلید عمومی RSA که از پنل توسعه‌دهندگان مایکت دریافت کرده‌اید جایگزین کنید و عبارت `PRODUCT_ID` را با شناسه محصولی که در قسمت محصول درون برنامه ای ایجاد کردید جایگزین کنید.

### توضیحات توابع اصلی

1. **`connect(RSAPublicKey: String)`**  
   این تابع برای مقداردهی اولیه سرویس پرداخت مایکت ضروری است. کلید عمومی RSA را از پنل توسعه‌دهندگان مایکت دریافت کنید. این تابع یک Promise برمی‌گرداند که در صورت عدم نصب اپلیکیشن مایکت روی دستگاه، reject می‌شود.

   ```javascript
   myket.connect('YOUR_RSA_PUBLIC_KEY')
     .then(() => console.log('Connected to Myket'))
     .catch(error => console.log('Connection error:', error));
   ```

2. **`disconnect()`**  
   اتصال به سرویس مایکت را قطع کرده و منابع اشغال‌شده را آزاد می‌کند.

   ```javascript
   myket.disconnect().catch(error => console.log('Disconnect error:', error));
   ```

3. **`queryPurchaseProduct(querySkuDetails: Boolean, moreSku: String[])`**  
   این تابع اطلاعات خریدهای قبلی و محصولات موجود را برمی‌گرداند. اگر `querySkuDetails` را `true` تنظیم کنید، لیست محصولات قابل‌ارائه نیز دریافت می‌شود.

   ```javascript
   const inventory = await myket.queryPurchaseProduct(true, ['test100']);
   console.log(inventory.allPurchases); // خریدهای مصرف‌نشده
   console.log(inventory.allProducts); // لیست محصولات
   ```

4. **`consumePurchase(purchase)`**  
   برای محصولات مصرف‌شدنی (consumable)، این تابع خرید انجام‌شده را مصرف می‌کند تا کاربر بتواند دوباره خرید کند.

   ```javascript
   await myket.consumePurchase(purchase);
   ```

5. **`enableDebugging(isEnable: Boolean)`**  
   لاگ‌های دیباگ را با تگ `IabHelper` در LogCat فعال یا غیرفعال می‌کند.

   ```javascript
   myket.enableDebugging(true);
   ```

### استفاده از Callback (اختیاری)

اگر نمی‌خواهید از Promise استفاده کنید، می‌توانید از `MyketBillingModule` به‌صورت زیر استفاده کنید:

```javascript
import { NativeModules } from 'react-native';
const { MyketBillingModule } = NativeModules;

MyketBillingModule.connect('YOUR_RSA_PUBLIC_KEY', (error, result) => {
  if (error) {
    console.log('Connection error:', error);
  } else {
    console.log('Connected:', result);
  }
});
```

## نکات مهم

- **عدم استفاده از Expo Go**: همان‌طور که ذکر شد، این پلاگین با Expo Go کار نمی‌کند. اپلیکیشن باید مستقیماً روی دستگاه یا شبیه‌ساز نصب شود.
- **مدیریت خطاها**: همیشه خطاهای Promise‌ها را با `catch` مدیریت کنید تا تجربه کاربری بهتری ارائه دهید.
- **تست**: قبل از انتشار، اپلیکیشن را روی دستگاه یا شبیه‌ساز با اپلیکیشن مایکت نصب‌شده تست کنید.

## نمونه پروژه
این آموزش به درخواست عده ای از کاربران [یونیکد](https://unicodewebdesign.com) ارائه گردید.
