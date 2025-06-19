# 🌤️ My Weather Chrome Extension

내 위치 기반 **기상청 초단기 실황 + 예보 + 단기예보**를 이용해  
실시간 하늘 상태와 3시간 후 강수확률까지 정확하게 보여주는 **크롬 확장 프로그램**입니다.

---

## 📌 기능

✅ 실황 + 초단기예보 + 단기예보 통합  
✅ 자정 넘어가도 안전한 발표시각 & 예보시각 처리  
✅ 현재 시각 + 3시간 후 예상 강수확률 표시  
✅ 강수확률 예보 시각 표시  
✅ Chrome 팝업에서 바로 확인

---

## 🗝️ 기상청 OpenAPI 신청 방법

1️⃣ [공공데이터포털](https://www.data.go.kr/) 가입  
2️⃣ 아래 3개를 각각 신청  
   [기상청_단기예보 ((구)_동네예보) 조회서비스](https://www.data.go.kr/data/15084084/openapi.do) 여기서

   - 초단기 실황조회 서비스 (UltraSrtNcst)
   - 초단기 예보조회 서비스 (UltraSrtFcst)
   - 단기 예보조회 서비스 (VilageFcst)  
3️⃣ 신청 후 **Encoding Key** 복사  
   - 반드시 `Encoding` 키 사용! (`Decoding` 키는 URL에서 깨짐)

---

## ⚙️ 개발 및 빌드 방법

```bash
# 1) 의존성 설치
npm install

# 2) 빌드
npm run build
```

## 확장 프로그램 로드
1.chrome://extensions/ 접속

2.개발자 모드 ON

3. 압축해제된 확장 프로그램 로드클릭

4. /dist 선택

5. 확장 아이콘 클릭 → 팝업에서 실시간 날씨 확인!

#API Key 설정
src/Popup.jsx 파일 에서 serviveKey 에 기상청에서 받은 Encoding Key 입력하시면 됨다.

const serviceKey = "여기에 Encoding Key";


## 자주 발생하는 문제

| 에러                                  | 원인                             | 해결                                    |
| ----------------------------------- | ---------------------------------- | ------------------------------------- |
| `SyntaxError: Unexpected token '<'` | 키가 잘못됐거나 `dataType=JSON` 빠짐 | 키 확인 & URL 파라미터 점검                    |
| `날씨 정보 가져오기 실패!`            | 발표시각이 아직 안 올라온 경우   | 자동 처리되지만, base\_date/base\_time 로직 확인 |
| 로딩만 되고 안뜸                     | Chrome 위치 권한 차단됨         | 확장 권한 허용 또는 위치 수동 설정                  |





