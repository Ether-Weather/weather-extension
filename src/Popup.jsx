import React, { useEffect, useState } from 'react';

function dfsXyConv(lat, lon) {
  const RE = 6371.00877, GRID = 5.0, SLAT1 = 30.0, SLAT2 = 60.0;
  const OLON = 126.0, OLAT = 38.0, XO = 43, YO = 136;
  const DEGRAD = Math.PI / 180.0;
  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD, olon = OLON * DEGRAD, olat = OLAT * DEGRAD;
  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);
  const ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  const ro_ = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  const x = Math.floor(ro_ * Math.sin(theta) + XO + 0.5);
  const y = Math.floor(ro * Math.cos(theta) - ro_ * Math.cos(theta) + YO + 0.5);
  return { x, y };
}

function skyType(v) {
  return v === '1' ? '맑음' : v === '3' ? '구름 많음' : v === '4' ? '흐림' : '알 수 없음';
}
function ptyType(v) {
  return v === '0' ? '없음' : v === '1' ? '비' : v === '2' ? '비/눈' : v === '3' ? '눈' : '알 수 없음';
}

export default function Popup() {
  const [skyNow, setSkyNow] = useState("-");
  const [skyForecast, setSkyForecast] = useState("-");
  const [tmpNow, setTmpNow] = useState("-");
  const [tmpForecast, setTmpForecast] = useState("-");
  const [ptyNow, setPtyNow] = useState("-");
  const [popForecast, setPopForecast] = useState("-");
  const [weather, setWeather] = useState("");



  const [status, setStatus] = useState('위치 확인 중...');
  const [loading , setLoading] =useState (true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setStatus(`위치: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      const { x, y } = dfsXyConv(lat, lon);

            // 1) 날짜
      const now = new Date();
      const future = new Date(now);
      future.setHours(now.getHours() + 3);
      future.setMinutes(0);

      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      const base_date = `${yyyy}${mm}${dd}`;

      // 2) 실황 base_time: 00/30
      let ncst_hour = now.getHours();
      let ncst_min = now.getMinutes();
      if (ncst_min < 45 && ncst_min >= 15) { ncst_min = '00'; }
      else if (ncst_min < 15) { ncst_hour -= 1; ncst_min = '30'; }
      else { ncst_min = '30'; }
      const ncst_base_time = `${String(ncst_hour).padStart(2, '0')}${ncst_min}`;

      // 3) 초단기 base_time: 10분 단위
      let fcst_hour = now.getHours();
      let fcst_min = now.getMinutes();
      let fcst_min_fixed = Math.floor(fcst_min / 10) * 10;
      if (fcst_min_fixed === 60) {
        fcst_min_fixed = 0;
        fcst_hour += 1;
      }
      const fcst_base_time = `${String(fcst_hour).padStart(2, '0')}${String(fcst_min_fixed).padStart(2, '0')}`;

            // 현재 시
      const nowHour = now.getHours();

      // 안전한 발표 시각 표
      const announceHours = [2, 5, 8, 11, 14, 17, 20, 23];
      let vilage_hour = announceHours[0];
      for (let i = 0; i < announceHours.length; i++) {
        if (nowHour >= announceHours[i]) {
          vilage_hour = announceHours[i];
        }
      }

      // 새벽 예외처리: 0~2시는 어제 23시
      let vilage_base_date = base_date;
      if (nowHour < 2) {
        const yest = new Date(now);
        yest.setDate(now.getDate() - 1);
        const yyyy = yest.getFullYear();
        const mm = String(yest.getMonth() + 1).padStart(2, '0');
        const dd = String(yest.getDate()).padStart(2, '0');
        vilage_base_date = `${yyyy}${mm}${dd}`;
        vilage_hour = 23;
      }

      if (announceHours.includes(nowHour)) {
        const idx = announceHours.indexOf(nowHour);
        if (idx === 0) {
          const yest = new Date(now);
          yest.setDate(now.getDate() - 1);
          const yyyy = yest.getFullYear();
          const mm = String(yest.getMonth() + 1).padStart(2, '0');
          const dd = String(yest.getDate()).padStart(2, '0');
          vilage_base_date = `${yyyy}${mm}${dd}`;
          vilage_hour = 23;
        } else {
          // 나머지는 이전 발표시각
          vilage_hour = announceHours[idx - 1];
        }
      }

      const vilage_base_time = `${String(vilage_hour).padStart(2, '0')}00`;


      // 5) URL 구성 (좌표는 너의 x,y 사용)
      
      const serviceKey = import.meta.env.VITE_API_KEY;


      const ncstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst?serviceKey=${serviceKey}&numOfRows=10&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${ncst_base_time}&nx=${x}&ny=${y}`;      
      const fcstUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtFcst?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${base_date}&base_time=${fcst_base_time}&nx=${x}&ny=${y}`;      
      const vilageUrl = `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?serviceKey=${serviceKey}&numOfRows=100&pageNo=1&dataType=JSON&base_date=${vilage_base_date}&base_time=${vilage_base_time}&nx=${x}&ny=${y}`;

      
      
      console.log("💡 최종 호출 URL:", ncstUrl);
      console.log("💡 최종 호출 URL:", fcstUrl);
      console.log("💡 최종 호출 URL:",vilageUrl)


      try {
        const [ncstRes, fcstRes, vilageRes] = await Promise.all([
          fetch(ncstUrl).then(res => res.json()),
          fetch(fcstUrl).then(res => res.json()),
          fetch(vilageUrl).then(res => res.json()),
        ]);
      
        const ncstItems = ncstRes.response.body.items.item;  // 실황
        const fcstItems = fcstRes.response.body.items.item;  // 초단기
        const vilageItems = vilageRes?.response?.body?.items?.item || []  // 단기
        

      

        // 단기예보 base_date 안전 계산

// URL 만들기도 OK

        // 실황
        const skyNcst = ncstItems.find(i => i.category === "SKY")?.obsrValue ?? "-"; //하늘 상태
        const ptyNcst = ncstItems.find(i => i.category === "PTY")?.obsrValue ?? "-"; // 강수형태
        const tmpNcst = ncstItems.find(i => i.category === "TMP")?.obsrValue ?? "-"; // 온도
        const rehNcst = ncstItems.find(i => i.category === "REH")?.obsrValue ?? "-"; //습도
        const wsdNcst = ncstItems.find(i => i.category === "WSD")?.obsrValue ?? "-"; // 풍속


      
        // 예보 pop 을 찾는 로직
        const futureDate = `${future.getFullYear()}${String(future.getMonth() + 1).padStart(2, '0')}${String(future.getDate()).padStart(2, '0')}`;
        const futureHHMM = `${String(future.getHours()).padStart(2, '0')}00`;
        const futureDateTime = `${futureDate}${futureHHMM}`;


        const nextTime = fcstItems
          .filter(i => i.category === "PTY" && `${i.fcstDate}${i.fcstTime}` >= futureDateTime)
          .map(i => `${i.fcstDate}${i.fcstTime}`)
          .sort()[0]?.slice(-4);  // 시간만 추출
      
          const skyFcst = fcstItems.find(i => i.category === "SKY" && `${i.fcstDate}${i.fcstTime}` >= futureDateTime)?.fcstValue ?? "-";
          const ptyFcst = fcstItems.find(i => i.category === "PTY" && `${i.fcstDate}${i.fcstTime}` >= futureDateTime)?.fcstValue ?? "-";
          const tmpFcst = fcstItems.find(i => i.category === "T1H" && `${i.fcstDate}${i.fcstTime}` >= futureDateTime)?.fcstValue ?? "-";
        // 예보: POP

        //const nextPopItem = popItems.find(i => i.fcstTime >= futureHHMM) || popItems.slice(-1)[0];  // pop 예보중 지금 시각 보다 크거나 같은 fcstTime 을 찾으라

        const popItems = vilageItems.filter(i => i.category === "POP");
        console.log("🔥 POP 후보:", popItems);
        
        popItems.sort((a, b) => `${a.fcstDate}${a.fcstTime}`.localeCompare(`${b.fcstDate}${b.fcstTime}`));
       

        const targetPopItem = [...popItems].reverse().find(
          i => `${i.fcstDate}${i.fcstTime}` <= futureDateTime
        ) || popItems[0];

        const popFcst = targetPopItem?.fcstValue ?? "-"; //강수 확률 단기
        const popTime = targetPopItem?.fcstTime ?? "-";
        const popTimeLabel = `${popTime.slice(0, 2)}:${popTime.slice(2, 4)}`;
        

        console.log("강수확률 :", popFcst);
      
        setWeather(
          `🌤️ 현재 상태\n` +
          `- 하늘: ${skyType(skyFcst)}\n` +
          `- 강수형태: ${ptyType(ptyNcst)}\n` +
          `- 기온: ${tmpFcst}°C\n` +
          `- 풍속: ${wsdNcst} m/s\n` +
          `- 습도: ${rehNcst}%\n\n` +'\n\n\n'+
          `🌈 예보 (3시간 후)\n` +
          `- 강수확률: ${popFcst}% (예보시각: ${popTimeLabel})`
        );
        
      
      } catch (err) {
        console.error(err);
        setWeather("날씨 정보 가져오기 실패!");
      };
      
    }, () => {
      setStatus('위치 접근 거부됨');
    });
  }, []);

  return (
    <div style={{ padding: '1rem', minWidth: '250px'}}>
      <h2>내 위치 날씨</h2>
      <p>{status}</p>
      <p>{weather}</p>
    </div>
  );
}


// 
