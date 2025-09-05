import React, { useState, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import myket from 'iab-myket-reactnative'; 

const Pay = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [product, setProduct] = useState('');
  const [statusPay, setStatusPay] = useState(false);

  useEffect(() => {
    // اتصال به سرویس مایکت
    myket.connect('MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCOiT6hhz5XaGCPMMHdPLf16J+KyoFCvk2MF2Y0MAgneH3iFj5h51tc7WTchipo0Vrjj5QUs5Ovw2jn9bJQMvVM5PMF+ySc/FdhJbEOKbGf+qfqhQg1u4oZwqCU4yYtQ3EqwrVc/rnXkmvJVhnBaqnkI4LsuFoaUpquQXTwDomaWwIDAQAB')
      .then(() => setIsConnected(true))
      .catch(error => {
        console.log('Error connecting to Myket:', error);
        setIsConnected(false);
      });
  }, []);

  const handlePurchase = async () => {
    try {
      const inventory = await myket.queryPurchaseProduct(true, ['test100']);
      setStatusPay(inventory.allPurchases.length > 0);

      if (inventory && inventory.allPurchases.length > 0) {
        setProduct("buyed"); // فقط وضعیت خرید را ذخیره می‌کنیم
        await myket.consumePurchase(inventory.allPurchases[0]);
        Alert.alert('پرداخت با موفقیت انجام شده است.');
      } else {
        const purchaseResult = await myket.purchaseProduct('test100');
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
