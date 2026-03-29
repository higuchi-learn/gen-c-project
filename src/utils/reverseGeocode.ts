// 都道府県コード（muniCdの先頭2桁）→ 都道府県名の対応表
const PREFECTURE_MAP: Record<string, string> = {
  '01': '北海道',
  '02': '青森県',
  '03': '岩手県',
  '04': '宮城県',
  '05': '秋田県',
  '06': '山形県',
  '07': '福島県',
  '08': '茨城県',
  '09': '栃木県',
  '10': '群馬県',
  '11': '埼玉県',
  '12': '千葉県',
  '13': '東京都',
  '14': '神奈川県',
  '15': '新潟県',
  '16': '富山県',
  '17': '石川県',
  '18': '福井県',
  '19': '山梨県',
  '20': '長野県',
  '21': '岐阜県',
  '22': '静岡県',
  '23': '愛知県',
  '24': '三重県',
  '25': '滋賀県',
  '26': '京都府',
  '27': '大阪府',
  '28': '兵庫県',
  '29': '奈良県',
  '30': '和歌山県',
  '31': '鳥取県',
  '32': '島根県',
  '33': '岡山県',
  '34': '広島県',
  '35': '山口県',
  '36': '徳島県',
  '37': '香川県',
  '38': '愛媛県',
  '39': '高知県',
  '40': '福岡県',
  '41': '佐賀県',
  '42': '長崎県',
  '43': '熊本県',
  '44': '大分県',
  '45': '宮崎県',
  '46': '鹿児島県',
  '47': '沖縄県',
};

// 国土地理院 逆ジオコーディング API のレスポンス型
type GsiResponse = {
  results?: {
    muniCd: string; // 市区町村コード（先頭2桁が都道府県コード）
    lv01Nm: string; // 市区町村名
  };
};

// 緯度経度から住所文字列（都道府県 + 市区町村）を取得する

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    // APIリクエストを送信してレスポンスを取得
    const res = await fetch(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lng}`,
    );
    // レスポンスをJSONとしてパースして型アサーション
    const data = (await res.json()) as GsiResponse;

    // 取得失敗時は null を返す
    if (!data.results) return null;
    // レスポンスから市区町村コードと市区町村名を分割代入
    const { muniCd, lv01Nm } = data.results;
    // 都道府県コードから都道府県名を取得
    const prefecture = PREFECTURE_MAP[muniCd.slice(0, 2)];
    // 市区町村名と結合して返す
    return prefecture ? prefecture + lv01Nm : lv01Nm;
  } catch {
    return null;
  }
}
