function AirQualityAlerts({ data }) {
  const alerts = [];

  if (data.aqi > 150) {
    alerts.push({
      type: "danger",
      title: "High AQI Alert",
      message: "Air quality is currently unhealthy."
    });
  } else if (data.aqi > 100) {
    alerts.push({
      type: "warning",
      title: "Elevated AQI",
      message: "Air quality may affect sensitive groups."
    });
  } else {
    alerts.push({
      type: "good",
      title: "Air Quality Stable",
      message: "Current AQI is within the monitored range."
    });
  }

  if (data.pm25 > 60) {
    alerts.push({
      type: "warning",
      title: "PM2.5 Elevated",
      message: "Fine particulate matter levels are elevated."
    });
  }

  if (data.pm10 > 100) {
    alerts.push({
      type: "warning",
      title: "PM10 Elevated",
      message: "Coarse particulate matter levels are elevated."
    });
  }

  return (
    <section id="alerts" className="alerts-section">

      <div className="section-heading">
        <div>
          <p className="section-label">MONITORING</p>
          <h2>⚠️ Air Quality Alerts</h2>
        </div>

        <span className="alert-count">
          {alerts.length} Alert{alerts.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="alerts-list">

        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`alert-card ${alert.type}`}
          >

            <div className="alert-icon">
              {alert.type === "danger"
                ? "🚨"
                : alert.type === "warning"
                ? "⚠️"
                : "✅"}
            </div>

            <div>
              <h3>{alert.title}</h3>
              <p>{alert.message}</p>
            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

export default AirQualityAlerts;