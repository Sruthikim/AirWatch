function PollutionOverview({ data }) {
  const pollutants = [
    {
      name: "PM2.5",
      value: data.pm25,
      unit: "µg/m³"
    },
    {
      name: "PM10",
      value: data.pm10,
      unit: "µg/m³"
    },
    {
      name: "NO₂",
      value: data.no2,
      unit: "µg/m³"
    },
    {
      name: "SO₂",
      value: data.so2,
      unit: "µg/m³"
    }
  ];

  const getStatus = (value) => {
    if (value <= 40) return "Low";
    if (value <= 80) return "Moderate";
    return "High";
  };

  return (
    <section className="pollution-overview">

      <div className="section-heading">
        <div>
          <p className="section-label">
            POLLUTANT MONITORING
          </p>

          <h2>Pollution Overview</h2>
        </div>
      </div>

      <div className="pollution-grid">

        {pollutants.map((pollutant) => (
          <div
            className="pollution-item"
            key={pollutant.name}
          >

            <div className="pollution-item-top">
              <span>{pollutant.name}</span>

              <span
                className={`pollution-status ${getStatus(
                  pollutant.value
                ).toLowerCase()}`}
              >
                {getStatus(pollutant.value)}
              </span>
            </div>

            <div className="pollution-value">
              {pollutant.value}
              <small>{pollutant.unit}</small>
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default PollutionOverview;