import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "23.81";
  const lon = searchParams.get("lon") || "90.41";
  const city = searchParams.get("city") || "Dhaka";

  try {
    // Open-Meteo free API (no key needed)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error("Weather API failed");
    const data = await res.json();

    const codeMap: Record<number, { label: string; icon: string }> = {
      0: { label: "Clear Sky", icon: "\u2600" }, 1: { label: "Mainly Clear", icon: "\u2600" },
      2: { label: "Partly Cloudy", icon: "\u26c5" }, 3: { label: "Overcast", icon: "\u2601" },
      45: { label: "Foggy", icon: "\u2601" }, 48: { label: "Rime Fog", icon: "\u2601" },
      51: { label: "Light Drizzle", icon: "\ud83c\udf27" }, 53: { label: "Drizzle", icon: "\ud83c\udf27" },
      55: { label: "Dense Drizzle", icon: "\ud83c\udf27" }, 61: { label: "Slight Rain", icon: "\ud83c\udf27" },
      63: { label: "Moderate Rain", icon: "\ud83c\udf27" }, 65: { label: "Heavy Rain", icon: "\ud83c\udf27" },
      71: { label: "Slight Snow", icon: "\u2744" }, 73: { label: "Moderate Snow", icon: "\u2744" },
      75: { label: "Heavy Snow", icon: "\u2744" }, 80: { label: "Showers", icon: "\ud83c\udf26" },
      81: { label: "Moderate Showers", icon: "\ud83c\udf26" }, 82: { label: "Violent Showers", icon: "\u26c8" },
      95: { label: "Thunderstorm", icon: "\u26c8" }, 96: { label: "Hail Storm", icon: "\u26c8" },
      99: { label: "Severe Hail", icon: "\u26c8" },
    };
    const getW = (code: number) => codeMap[code] || { label: "Unknown", icon: "?" };
    const c = data.current;
    const cw = getW(c.weather_code);
    const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
    const forecast = data.daily.time.map((d: string, i: number) => {
      const dw = getW(data.daily.weather_code[i]);
      return { day: days[new Date(d + "T00:00:00").getDay()], icon: dw.icon, high: Math.round(data.daily.temperature_2m_max[i]), low: Math.round(data.daily.temperature_2m_min[i]) };
    });

    return NextResponse.json({
      city,
      lat: parseFloat(lat),
      temp: Math.round(c.temperature_2m),
      feelsLike: Math.round(c.apparent_temperature),
      humidity: c.relative_humidity_2m,
      wind: Math.round(c.wind_speed_10m),
      uv: Math.round(c.uv_index || 0),
      desc: cw.label,
      icon: cw.icon,
      forecast,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
