const cityTrendData = {
  Chennai: {
    aqi: [
      { day: "Mon", value: 72 },
      { day: "Tue", value: 78 },
      { day: "Wed", value: 75 },
      { day: "Thu", value: 88 },
      { day: "Fri", value: 80 },
      { day: "Sat", value: 85 },
      { day: "Sun", value: 82 }
    ],

    pollutants: [
      { day: "Mon", pm25: 32, pm10: 58, no2: 20, so2: 10 },
      { day: "Tue", pm25: 35, pm10: 61, no2: 21, so2: 10 },
      { day: "Wed", pm25: 34, pm10: 60, no2: 22, so2: 11 },
      { day: "Thu", pm25: 40, pm10: 68, no2: 24, so2: 12 },
      { day: "Fri", pm25: 38, pm10: 64, no2: 22, so2: 11 },
      { day: "Sat", pm25: 41, pm10: 69, no2: 25, so2: 13 },
      { day: "Sun", pm25: 38, pm10: 64, no2: 22, so2: 11 }
    ]
  },

  Delhi: {
    aqi: [
      { day: "Mon", value: 132 },
      { day: "Tue", value: 145 },
      { day: "Wed", value: 151 },
      { day: "Thu", value: 160 },
      { day: "Fri", value: 148 },
      { day: "Sat", value: 162 },
      { day: "Sun", value: 156 }
    ],

    pollutants: [
      { day: "Mon", pm25: 78, pm10: 125, no2: 38, so2: 16 },
      { day: "Tue", pm25: 84, pm10: 136, no2: 41, so2: 17 },
      { day: "Wed", pm25: 88, pm10: 142, no2: 43, so2: 18 },
      { day: "Thu", pm25: 94, pm10: 151, no2: 46, so2: 19 },
      { day: "Fri", pm25: 89, pm10: 145, no2: 44, so2: 18 },
      { day: "Sat", pm25: 96, pm10: 153, no2: 45, so2: 19 },
      { day: "Sun", pm25: 91, pm10: 148, no2: 44, so2: 18 }
    ]
  },

  Mumbai: {
    aqi: [
      { day: "Mon", value: 88 },
      { day: "Tue", value: 92 },
      { day: "Wed", value: 90 },
      { day: "Thu", value: 101 },
      { day: "Fri", value: 96 },
      { day: "Sat", value: 99 },
      { day: "Sun", value: 97 }
    ],

    pollutants: [
      { day: "Mon", pm25: 40, pm10: 70, no2: 24, so2: 10 },
      { day: "Tue", pm25: 42, pm10: 73, no2: 26, so2: 11 },
      { day: "Wed", pm25: 44, pm10: 75, no2: 27, so2: 12 },
      { day: "Thu", pm25: 47, pm10: 81, no2: 29, so2: 13 },
      { day: "Fri", pm25: 45, pm10: 78, no2: 28, so2: 12 },
      { day: "Sat", pm25: 46, pm10: 80, no2: 29, so2: 12 },
      { day: "Sun", pm25: 45, pm10: 78, no2: 28, so2: 12 }
    ]
  },

  Kolkata: {
    aqi: [
      { day: "Mon", value: 108 },
      { day: "Tue", value: 115 },
      { day: "Wed", value: 119 },
      { day: "Thu", value: 126 },
      { day: "Fri", value: 123 },
      { day: "Sat", value: 128 },
      { day: "Sun", value: 121 }
    ],

    pollutants: [
      { day: "Mon", pm25: 57, pm10: 96, no2: 32, so2: 14 },
      { day: "Tue", pm25: 60, pm10: 101, no2: 34, so2: 15 },
      { day: "Wed", pm25: 62, pm10: 104, no2: 35, so2: 15 },
      { day: "Thu", pm25: 65, pm10: 109, no2: 37, so2: 16 },
      { day: "Fri", pm25: 64, pm10: 107, no2: 36, so2: 15 },
      { day: "Sat", pm25: 66, pm10: 110, no2: 38, so2: 16 },
      { day: "Sun", pm25: 63, pm10: 105, no2: 35, so2: 15 }
    ]
  },

  Bangalore: {
    aqi: [
      { day: "Mon", value: 60 },
      { day: "Tue", value: 65 },
      { day: "Wed", value: 63 },
      { day: "Thu", value: 71 },
      { day: "Fri", value: 67 },
      { day: "Sat", value: 70 },
      { day: "Sun", value: 68 }
    ],

    pollutants: [
      { day: "Mon", pm25: 26, pm10: 48, no2: 17, so2: 8 },
      { day: "Tue", pm25: 28, pm10: 50, no2: 18, so2: 8 },
      { day: "Wed", pm25: 27, pm10: 49, no2: 18, so2: 9 },
      { day: "Thu", pm25: 31, pm10: 54, no2: 20, so2: 9 },
      { day: "Fri", pm25: 29, pm10: 52, no2: 19, so2: 9 },
      { day: "Sat", pm25: 30, pm10: 53, no2: 20, so2: 9 },
      { day: "Sun", pm25: 29, pm10: 52, no2: 19, so2: 9 }
    ]
  }
};

export default cityTrendData;