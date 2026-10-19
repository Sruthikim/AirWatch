function AQICard({ title, value, unit, description }) {
  const getAQIStatus = (aqi) => {
    if (aqi <= 50) {
      return {
        label: "Good",
        className: "aqi-good"
      };
    }

    if (aqi <= 100) {
      return {
        label: "Moderate",
        className: "aqi-moderate"
      };
    }

    if (aqi <= 150) {
      return {
        label: "Unhealthy for Sensitive Groups",
        className: "aqi-sensitive"
      };
    }

    return {
      label: "Unhealthy",
      className: "aqi-unhealthy"
    };
  };

  const status =
    title === "AQI"
      ? getAQIStatus(Number(value))
      : null;

  return (
    <div className={`card ${status ? status.className : ""}`}>

      <h3>{title}</h3>

      <div className="value">
        {value}
      </div>

      <p>{unit}</p>

      <span className="card-description">
        {description}
      </span>

      {status && (
        <div className="aqi-status">
          {status.label}
        </div>
      )}

    </div>
  );
}

export default AQICard;