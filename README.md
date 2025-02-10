# What is Reverse Proxy?
Reverse Proxy 也是充當 client side 跟 server side 之間的橋樑，負責接收 client side 的 request 並將該 request 轉發給適當的 server side，作為 client 來說並不會知道自己的 request 是被哪一個 server 所接收並處理。

## 題外話
隨著 web 的發展越來越盛行，從過去每秒只會有一個 request 變成現在每秒可能有上萬個(搶演唱會的票可能會突破十萬)個 request，像過去一樣只有一個 server 就無法滿足現在的需求，所以通常都會選則垂值或水平擴充 server。

- 垂直擴充簡單來說就是把原本的 server 變得更好，處理 request 的速度更快
- 水平擴充間單來說就是把原本的一個 server 分成多個小的 server，每個 server 都負責處理某個特殊的 request 或處理部分的 request

雖然兩種方法都能解決 request 過多導致 server 阻塞的問題，但垂直擴充的成本較高，所以現在普遍都偏向使用水平擴充的方式提高處理 request 的效能。

# 使用 Reverse Proxy 的好處
今天有一個銀行扮演是 server side 負責接收 request 並修改用戶遇到的問題，而銀行的客服中心作為 client 跟 server 之間的媒介 reverse proxy。

1. **Load Balancing**
當大量的 request 湧入時，Reverse Proxy 可以把這個大量的 request 用特殊的方法分給不同的 server 進行處理，就不會遇到某一個 server 單獨面對大量的 request 而導致當機。
    
    > 今天突然有大量的使用者在操作銀行的 App 時發生問題，所以一大堆人打電話給銀行想確認發生了什麼事，而客服中心(Reverse Proxy) 將這個大量打進來的電話(request)，分門別類的把問題轉給處理不同問題的部門，比如轉帳出問題了就把問題轉給負責處理轉帳的部門，錢不見了就把問題給負責處理這部分問題的部門，這樣就可以有效的把湧入銀行的大量電話分給適合處理的部門。
    
2. **提供 Cache 提高性能**
    
    如同 Forward Proxy 一樣，當有某一個 request 取得某一個比較大的 response 時，Reverse Proxy 可以把他 Cache 起來，當有其他 request 要求同樣的 response 時，可以直接由 Proxy 端提供減少和 server side 溝通的次數以提高效能。
    
    > 天客服中心接到上百通詢問同一個問題的電話，當客服中心處理過一次這個問題時，他就知道這個問題的解法並在之後有相同問題的客人打電話來時，直接回覆他而不需要再把問題轉給相關部門，減少相關部門的壓力並提高處理問題的效率。
    
    
3. **SSL 加密和解碼**
    
    可以在 Reverse Proxy 中集中管理 SSL/TLS 的加密與解密，讓後續的 server side 負責處理解密過後的 request 即可，降低 server side 的負擔

    > 每個打電話給銀行的客人都需要在客服中心先核對一次身份，這樣才知道是本人的來電，當客服人員確認完來電者身份後才將問題給相關的部門處理，這樣相關部門只需要專心處理問題不需要還要確認來電者的身份，減少相關部門處理問題的負擔。
        
4. **動態調整負載和故障轉移**
    
    當某一個 server 發生問題無法使用時，Reverse Proxy 會將後續收到的需求轉給其他還能正常運作的 server，提高整體系統的可用性。
    
    > 今天銀行的某一個處理問題的部門整個部門一起去聚餐了，當客服中心收到客人的的問題後可以將這個問題轉給其他的部門處理，不會因為有某一個部門無法運作而無法處理客人的問題。
    
5. **隱藏 server side 增加系統安全性**
    
    由於每一個 request 都是先傳給 Reverse Proxy 後才轉給 server side，所以對 client 來說並不會知道是那一個 server 回應了 reqeust，由 Reverse Proxy 作為中介隔離了 client 和 server 隱藏了 server 的功能和系統的架構。
    

    > 所有客人的問題都是需要先經過客服中心，所以客人並不知道是哪個部門處理了問題也不會知道這個銀行有多少個部門，可以很好的保護銀行內部的機密性與安全性。
    
---

# Installation
```bash
cd proxy_server
npm install

cd ..
cd web_server_1
npm install

cd ..
cd web_server_2
npm install
```

# Run
```bash
cd proxy_server
npm start

cd web_server_1
npm start

cd web_server_2
npm start
```

---

# Architecture

![architecture](https://ithelp.ithome.com.tw/upload/images/20250210/20124767ueKrmlTdN8.jpg)

---

# Project Description
這是一個由 nodeJS 開發的簡單 Reverse Proxy Server，實現 Reverse Proxy 的 `Load Balancing` 和 `Cache`功能，並且在其中一個 web server 發生問題時可以自動轉移到其他 server 繼續處理 request。

## Load Balancing
用 `getNextServer` 動態決定要把 request proxy 給哪一個 web server
```javascript
function getNextServer() {
  let initialIndex = currentServerIndex;

  do {
    let server = apiServers[currentServerIndex];
    currentServerIndex = (currentServerIndex + 1) % apiServers.length;
    console.log(server)
    if (server.alive) {
      return server.url;
    }
  } while (currentServerIndex !== initialIndex);

  throw new Error('No available servers');
}
```

## cache
利用 node-cache 實作 Proxy Server 的緩存功能，當某一個 client 第一次透過 proxy server 訪問一個較大的 response 時，Proxy Server 會將這個 response 暫存起來，當有相同的 request 時，可以直接從 Proxy Server 中取得 response，減少 Web server 的負擔。

## 動態調整負載和故障轉移
用 `healthCheck` 每兩秒鐘檢查一次 web server 的狀況，如果某一個 web server 無法正常運作，則將該 web server 的 `alive` 設定為 false，並將其她的 request 轉移到能夠正常運作的 web server 上。

```javascript   
function healthCheck() {
  apiServers.forEach(async (server) => {
    try {
      res = await axios.get(`${server.url}`);
      server.alive = res.status === 200;
    } catch (error) {
      server.alive = false;
      console.log(`[Health Check] Server ${server.url} is down.`);
    }
  });
}

// 每兩秒檢查一次 web server 是否正常運作
setInterval(healthCheck, 2000);
```